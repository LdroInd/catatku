import { query } from "./db.js";
import { verifyToken, unauthorized, corsHeaders } from "./auth-middleware.js";

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(), body: "" };
  }

  const user = verifyToken(event);
  if (!user) return unauthorized();

  // Only KUadmin can manage kelompok
  if (user.role !== "KUadmin") {
    return {
      statusCode: 403,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
      body: JSON.stringify({ error: "Akses ditolak. Hanya KUadmin yang bisa mengakses menu ini." }),
    };
  }

  const headers = { "Content-Type": "application/json", ...corsHeaders() };

  try {
    // GET - List kelompok (optional filter by desa_id)
    if (event.httpMethod === "GET") {
      const params = event.queryStringParameters || {};
      let kelompok;

      if (params.desa_id) {
        kelompok = await query(
          `SELECT k.*, d.nama_desa 
           FROM kelompok k 
           JOIN desa d ON k.desa_id = d.id 
           WHERE k.desa_id = $1
           ORDER BY k.nama_kelompok ASC`,
          [params.desa_id]
        );
      } else {
        kelompok = await query(
          `SELECT k.*, d.nama_desa 
           FROM kelompok k 
           JOIN desa d ON k.desa_id = d.id 
           ORDER BY d.nama_desa, k.nama_kelompok ASC`
        );
      }
      return { statusCode: 200, headers, body: JSON.stringify(kelompok) };
    }

    // POST - Create kelompok
    if (event.httpMethod === "POST") {
      const { nama_kelompok, desa_id } = JSON.parse(event.body);
      const result = await query(
        `INSERT INTO kelompok (nama_kelompok, desa_id) VALUES ($1, $2) RETURNING id`,
        [nama_kelompok, desa_id]
      );
      return { statusCode: 201, headers, body: JSON.stringify({ id: result[0].id, message: "Kelompok berhasil ditambahkan" }) };
    }

    // PUT - Update kelompok
    if (event.httpMethod === "PUT") {
      const { id, nama_kelompok, desa_id } = JSON.parse(event.body);
      await query(
        `UPDATE kelompok SET nama_kelompok=$1, desa_id=$2 WHERE id=$3`,
        [nama_kelompok, desa_id, id]
      );
      return { statusCode: 200, headers, body: JSON.stringify({ message: "Kelompok berhasil diupdate" }) };
    }

    // DELETE - Delete kelompok
    if (event.httpMethod === "DELETE") {
      const { id } = JSON.parse(event.body);
      await query(`DELETE FROM kelompok WHERE id=$1`, [id]);
      return { statusCode: 200, headers, body: JSON.stringify({ message: "Kelompok berhasil dihapus" }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
