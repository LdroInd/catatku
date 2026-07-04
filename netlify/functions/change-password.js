import { query } from "./db.js";
import md5 from "md5";
import { verifyToken, unauthorized, corsHeaders } from "./auth-middleware.js";

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(), body: "" };
  }

  const user = verifyToken(event);
  if (!user) return unauthorized();

  const headers = { "Content-Type": "application/json", ...corsHeaders() };

  try {
    if (event.httpMethod === "POST") {
      const { old_password, new_password } = JSON.parse(event.body);

      // Verify old password
      const hashedOld = md5(old_password);
      const users = await query(
        `SELECT id FROM users WHERE id = $1 AND password = $2`,
        [user.id, hashedOld]
      );

      if (users.length === 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Password lama salah" }),
        };
      }

      // Update password
      const hashedNew = md5(new_password);
      await query(
        `UPDATE users SET password = $1 WHERE id = $2`,
        [hashedNew, user.id]
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "Password berhasil diubah" }),
      };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
