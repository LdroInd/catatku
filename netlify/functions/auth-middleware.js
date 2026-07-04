import jwt from "jsonwebtoken";
import { query } from "./db.js";

export function verifyToken(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
}

// Verify session is still valid (not logged in from another device)
export async function verifySession(user) {
  if (!user || !user.session_token) return false;
  const result = await query(
    `SELECT session_token FROM users WHERE id = $1`,
    [user.id]
  );
  if (result.length === 0) return false;
  return result[0].session_token === user.session_token;
}

export function unauthorized() {
  return {
    statusCode: 401,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({ error: "Unauthorized" }),
  };
}

export function sessionExpired() {
  return {
    statusCode: 401,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({ error: "SESSION_EXPIRED", message: "Akun ini sudah login di perangkat lain. Anda akan di-logout." }),
  };
}

export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  };
}
