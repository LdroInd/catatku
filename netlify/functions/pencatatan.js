import { query } from "./db.js";
import { verifyToken, unauthorized, corsHeaders } from "./auth-middleware.js";

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(), body: "" };
  }

  const user = verifyToken(event);
  if (!user) return unauthorized();

  const headers = { "Content-Type": "application/json", ...corsHeaders() };

  try {
    // GET - List pencatatan headers with details
    if (event.httpMethod === "GET") {
      const params = event.queryStringParameters || {};

      // Filter based on user role
      let pencatatanHeaders;
      if (user.role === "KU Desa") {
        pencatatanHeaders = await query(
          `SELECT ph.*, d.nama_desa as nama_entitas,
            uc.nama as created_by_nama, uu.nama as updated_by_nama
           FROM pencatatan_header ph
           LEFT JOIN desa d ON ph.desa_id = d.id
           LEFT JOIN users uc ON ph.created_by = uc.id
           LEFT JOIN users uu ON ph.last_updated_by = uu.id
           WHERE ph.desa_id = $1
           ORDER BY ph.tahun DESC, ph.bulan DESC`,
          [user.desa_id]
        );
      } else if (user.role === "KU Kelompok") {
        pencatatanHeaders = await query(
          `SELECT ph.*, k.nama_kelompok as nama_entitas,
            uc.nama as created_by_nama, uu.nama as updated_by_nama
           FROM pencatatan_header ph
           LEFT JOIN kelompok k ON ph.kelompok_id = k.id
           LEFT JOIN users uc ON ph.created_by = uc.id
           LEFT JOIN users uu ON ph.last_updated_by = uu.id
           WHERE ph.kelompok_id = $1
           ORDER BY ph.tahun DESC, ph.bulan DESC`,
          [user.kelompok_id]
        );
      } else {
        pencatatanHeaders = await query(
          `SELECT ph.*, 
            COALESCE(d.nama_desa, k.nama_kelompok) as nama_entitas,
            uc.nama as created_by_nama, uu.nama as updated_by_nama
           FROM pencatatan_header ph
           LEFT JOIN desa d ON ph.desa_id = d.id
           LEFT JOIN kelompok k ON ph.kelompok_id = k.id
           LEFT JOIN users uc ON ph.created_by = uc.id
           LEFT JOIN users uu ON ph.last_updated_by = uu.id
           ORDER BY ph.tahun DESC, ph.bulan DESC`
        );
      }

      // If header_id is specified, get details for that header
      if (params.header_id) {
        const details = await query(
          `SELECT pd.*, 
            uc.nama as created_by_nama,
            uu.nama as updated_by_nama
           FROM pencatatan_detail pd
           LEFT JOIN users uc ON pd.created_by = uc.id
           LEFT JOIN users uu ON pd.last_updated_by = uu.id
           WHERE pd.header_id = $1
           ORDER BY pd.tanggal ASC, pd.id ASC`,
          [params.header_id]
        );

        // Calculate beginning balance from previous months
        // Find the selected header's bulan and tahun
        const selectedHeader = pencatatanHeaders.find(h => h.id === Number(params.header_id));
        let beginning_balance = 0;

        if (selectedHeader) {
          // Get all details from previous months (same entity)
          let prevBalanceResult;
          if (selectedHeader.desa_id) {
            prevBalanceResult = await query(
              `SELECT 
                COALESCE(SUM(CASE WHEN pd.jenis = 'pemasukan' THEN pd.nominal ELSE 0 END), 0) as total_masuk,
                COALESCE(SUM(CASE WHEN pd.jenis = 'pengeluaran' THEN pd.nominal ELSE 0 END), 0) as total_keluar
               FROM pencatatan_detail pd
               JOIN pencatatan_header ph ON pd.header_id = ph.id
               WHERE ph.desa_id = $1
                 AND (ph.tahun < $2 OR (ph.tahun = $2 AND ph.bulan < $3))`,
              [selectedHeader.desa_id, selectedHeader.tahun, selectedHeader.bulan]
            );
          } else if (selectedHeader.kelompok_id) {
            prevBalanceResult = await query(
              `SELECT 
                COALESCE(SUM(CASE WHEN pd.jenis = 'pemasukan' THEN pd.nominal ELSE 0 END), 0) as total_masuk,
                COALESCE(SUM(CASE WHEN pd.jenis = 'pengeluaran' THEN pd.nominal ELSE 0 END), 0) as total_keluar
               FROM pencatatan_detail pd
               JOIN pencatatan_header ph ON pd.header_id = ph.id
               WHERE ph.kelompok_id = $1
                 AND (ph.tahun < $2 OR (ph.tahun = $2 AND ph.bulan < $3))`,
              [selectedHeader.kelompok_id, selectedHeader.tahun, selectedHeader.bulan]
            );
          }

          if (prevBalanceResult && prevBalanceResult.length > 0) {
            beginning_balance = Number(prevBalanceResult[0].total_masuk) - Number(prevBalanceResult[0].total_keluar);
          }
        }

        return { statusCode: 200, headers, body: JSON.stringify({ headers: pencatatanHeaders, details, beginning_balance }) };
      }

      return { statusCode: 200, headers, body: JSON.stringify({ headers: pencatatanHeaders }) };
    }

    // POST - Create header or detail
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body);

      if (body.type === "header") {
        const { bulan, tahun } = body;
        let desa_id = null;
        let kelompok_id = null;

        if (user.role === "KU Desa") {
          desa_id = user.desa_id;
        } else if (user.role === "KU Kelompok") {
          kelompok_id = user.kelompok_id;
        }

        // Cek duplikasi bulan & tahun yang sama untuk entitas yang sama
        let existing;
        if (desa_id) {
          existing = await query(
            `SELECT id FROM pencatatan_header WHERE bulan=$1 AND tahun=$2 AND desa_id=$3`,
            [bulan, tahun, desa_id]
          );
        } else if (kelompok_id) {
          existing = await query(
            `SELECT id FROM pencatatan_header WHERE bulan=$1 AND tahun=$2 AND kelompok_id=$3`,
            [bulan, tahun, kelompok_id]
          );
        }

        if (existing && existing.length > 0) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: "Pencatatan untuk bulan dan tahun ini sudah ada. Tidak boleh menambah bulan yang sama di tahun yang sama." }),
          };
        }

        const result = await query(
          `INSERT INTO pencatatan_header (bulan, tahun, desa_id, kelompok_id, created_by)
           VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [bulan, tahun, desa_id, kelompok_id, user.id]
        );
        return { statusCode: 201, headers, body: JSON.stringify({ id: result[0].id, message: "Header pencatatan berhasil dibuat" }) };
      }

      if (body.type === "detail") {
        const { header_id, nama, jenis, nominal, tanggal } = body;
        const result = await query(
          `INSERT INTO pencatatan_detail (header_id, nama, jenis, nominal, tanggal, created_by)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [header_id, nama, jenis, nominal, tanggal, user.id]
        );
        return { statusCode: 201, headers, body: JSON.stringify({ id: result[0].id, message: "Detail pencatatan berhasil ditambahkan" }) };
      }

      return { statusCode: 400, headers, body: JSON.stringify({ error: "Type harus 'header' atau 'detail'" }) };
    }

    // PUT - Update header or detail
    if (event.httpMethod === "PUT") {
      const body = JSON.parse(event.body);

      if (body.type === "header") {
        const { id, bulan, tahun } = body;
        await query(
          `UPDATE pencatatan_header SET bulan=$1, tahun=$2, last_updated_by=$3, last_updated_date=NOW() WHERE id=$4`,
          [bulan, tahun, user.id, id]
        );
        return { statusCode: 200, headers, body: JSON.stringify({ message: "Header berhasil diupdate" }) };
      }

      if (body.type === "detail") {
        const { id, nama, jenis, nominal, tanggal } = body;
        await query(
          `UPDATE pencatatan_detail SET nama=$1, jenis=$2, nominal=$3, tanggal=$4, last_updated_by=$5, last_updated_date=NOW() WHERE id=$6`,
          [nama, jenis, nominal, tanggal, user.id, id]
        );
        return { statusCode: 200, headers, body: JSON.stringify({ message: "Detail berhasil diupdate" }) };
      }

      return { statusCode: 400, headers, body: JSON.stringify({ error: "Type harus 'header' atau 'detail'" }) };
    }

    // DELETE - Delete header or detail
    if (event.httpMethod === "DELETE") {
      const body = JSON.parse(event.body);

      if (body.type === "header") {
        await query(`DELETE FROM pencatatan_detail WHERE header_id=$1`, [body.id]);
        await query(`DELETE FROM pencatatan_header WHERE id=$1`, [body.id]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: "Header dan detail berhasil dihapus" }) };
      }

      if (body.type === "detail") {
        await query(`DELETE FROM pencatatan_detail WHERE id=$1`, [body.id]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: "Detail berhasil dihapus" }) };
      }

      return { statusCode: 400, headers, body: JSON.stringify({ error: "Type harus 'header' atau 'detail'" }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
