import { query } from "./db.js";
import md5 from "md5";
import { verifyToken, unauthorized, corsHeaders } from "./auth-middleware.js";

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(), body: "" };
  }

  const user = verifyToken(event);
  if (!user) return unauthorized();

  // Only KUadmin can access user management
  if (user.role !== "KUadmin") {
    return {
      statusCode: 403,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
      body: JSON.stringify({ error: "Akses ditolak. Hanya KUadmin yang bisa mengakses menu ini." }),
    };
  }

  const headers = { "Content-Type": "application/json", ...corsHeaders() };

  try {
    // GET - List all users
    if (event.httpMethod === "GET") {
      const users = await query(
        `SELECT u.id, u.username, u.nama, u.no_telp, u.role, u.desa_id, u.kelompok_id,
                d.nama_desa, k.nama_kelompok
         FROM users u
         LEFT JOIN desa d ON u.desa_id = d.id
         LEFT JOIN kelompok k ON u.kelompok_id = k.id
         ORDER BY u.id DESC`
      );
      return { statusCode: 200, headers, body: JSON.stringify(users) };
    }

    // POST - Create user
    if (event.httpMethod === "POST") {
      const { username, nama, desa_id, kelompok_id, password, no_telp, role } = JSON.parse(event.body);
      const hashedPassword = md5(password);

      const result = await query(
        `INSERT INTO users (username, nama, desa_id, kelompok_id, password, no_telp, role)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [username, nama, desa_id, kelompok_id || null, hashedPassword, no_telp, role]
      );
      return { statusCode: 201, headers, body: JSON.stringify({ id: result[0].id, message: "User berhasil ditambahkan" }) };
    }

    // PUT - Update user
    if (event.httpMethod === "PUT") {
      const { id, username, nama, desa_id, kelompok_id, password, no_telp, role } = JSON.parse(event.body);

      if (password) {
        const hashedPassword = md5(password);
        await query(
          `UPDATE users SET username=$1, nama=$2, desa_id=$3, kelompok_id=$4, password=$5, no_telp=$6, role=$7 WHERE id=$8`,
          [username, nama, desa_id, kelompok_id || null, hashedPassword, no_telp, role, id]
        );
      } else {
        await query(
          `UPDATE users SET username=$1, nama=$2, desa_id=$3, kelompok_id=$4, no_telp=$5, role=$6 WHERE id=$7`,
          [username, nama, desa_id, kelompok_id || null, no_telp, role, id]
        );
      }
      return { statusCode: 200, headers, body: JSON.stringify({ message: "User berhasil diupdate" }) };
    }

    // DELETE - Delete user
    if (event.httpMethod === "DELETE") {
      const { id } = JSON.parse(event.body);
      await query(`DELETE FROM users WHERE id=$1`, [id]);
      return { statusCode: 200, headers, body: JSON.stringify({ message: "User berhasil dihapus" }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
