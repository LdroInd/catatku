import { query } from "./db.js";
import { verifyToken, unauthorized, corsHeaders } from "./auth-middleware.js";

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(), body: "" };
  }

  const user = verifyToken(event);
  if (!user) return unauthorized();

  // Only KUadmin can manage desa
  if (user.role !== "KUadmin") {
    return {
      statusCode: 403,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
      body: JSON.stringify({ error: "Akses ditolak. Hanya KUadmin yang bisa mengakses menu ini." }),
    };
  }

  const headers = { "Content-Type": "application/json", ...corsHeaders() };

  try {
    // GET - List all desa
    if (event.httpMethod === "GET") {
      const desa = await query(`SELECT * FROM desa ORDER BY nama_desa ASC`);
      return { statusCode: 200, headers, body: JSON.stringify(desa) };
    }

    // POST - Create desa
    if (event.httpMethod === "POST") {
      const { nama_desa } = JSON.parse(event.body);
      const result = await query(
        `INSERT INTO desa (nama_desa) VALUES ($1) RETURNING id`,
        [nama_desa]
      );
      return { statusCode: 201, headers, body: JSON.stringify({ id: result[0].id, message: "Desa berhasil ditambahkan" }) };
    }

    // PUT - Update desa
    if (event.httpMethod === "PUT") {
      const { id, nama_desa } = JSON.parse(event.body);
      await query(`UPDATE desa SET nama_desa=$1 WHERE id=$2`, [nama_desa, id]);
      return { statusCode: 200, headers, body: JSON.stringify({ message: "Desa berhasil diupdate" }) };
    }

    // DELETE - Delete desa
    if (event.httpMethod === "DELETE") {
      const { id } = JSON.parse(event.body);
      await query(`DELETE FROM desa WHERE id=$1`, [id]);
      return { statusCode: 200, headers, body: JSON.stringify({ message: "Desa berhasil dihapus" }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
