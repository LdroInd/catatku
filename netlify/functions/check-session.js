import { verifyToken, verifySession, unauthorized, sessionExpired, corsHeaders } from "./auth-middleware.js";

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(), body: "" };
  }

  const headers = { "Content-Type": "application/json", ...corsHeaders() };

  const user = verifyToken(event);
  if (!user) return unauthorized();

  const isValid = await verifySession(user);
  if (!isValid) return sessionExpired();

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ valid: true }),
  };
};
