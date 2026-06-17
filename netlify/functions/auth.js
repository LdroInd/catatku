import { query } from "./db.js";
import md5 from "md5";
import jwt from "jsonwebtoken";
import { corsHeaders } from "./auth-middleware.js";

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(), body: "" };
  }

  const headers = { "Content-Type": "application/json", ...corsHeaders() };

  try {
    if (event.httpMethod === "POST") {
      const { username, password } = JSON.parse(event.body);
      const hashedPassword = md5(password);

      const users = await query(
        `SELECT u.id, u.username, u.nama, u.no_telp, u.role, u.desa_id, u.kelompok_id,
                d.nama_desa, k.nama_kelompok
         FROM users u
         LEFT JOIN desa d ON u.desa_id = d.id
         LEFT JOIN kelompok k ON u.kelompok_id = k.id
         WHERE u.username = $1 AND u.password = $2`,
        [username, hashedPassword]
      );

      if (users.length === 0) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: "Username atau password salah" }),
        };
      }

      const user = users[0];
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          nama: user.nama,
          role: user.role,
          desa_id: user.desa_id,
          kelompok_id: user.kelompok_id,
          nama_desa: user.nama_desa,
          nama_kelompok: user.nama_kelompok,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ token, user }),
      };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
