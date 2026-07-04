import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Load .env BEFORE anything else
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, ".env") });

// Debug: verify env loaded correctly
console.log("DB Config:", process.env.DATABASE_URL ? "Using DATABASE_URL" : `Using DB_HOST: ${process.env.DB_HOST}`);

import express from "express";

const app = express();
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Import handlers
const { handler: authHandler } = await import("./netlify/functions/auth.js");
const { handler: usersHandler } = await import("./netlify/functions/users.js");
const { handler: desaHandler } = await import("./netlify/functions/desa.js");
const { handler: kelompokHandler } = await import("./netlify/functions/kelompok.js");
const { handler: pencatatanHandler } = await import("./netlify/functions/pencatatan.js");
const { handler: changePasswordHandler } = await import("./netlify/functions/change-password.js");
const { handler: checkSessionHandler } = await import("./netlify/functions/check-session.js");

// Adapter: convert Express req to Netlify event format
function netlifyAdapter(handler) {
  return async (req, res) => {
    const event = {
      httpMethod: req.method,
      headers: req.headers,
      body: JSON.stringify(req.body),
      queryStringParameters: req.query,
    };

    try {
      const response = await handler(event);
      res.status(response.statusCode).set(response.headers || {}).send(response.body);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
}

// Routes
app.all("/api/auth", netlifyAdapter(authHandler));
app.all("/api/users", netlifyAdapter(usersHandler));
app.all("/api/desa", netlifyAdapter(desaHandler));
app.all("/api/kelompok", netlifyAdapter(kelompokHandler));
app.all("/api/pencatatan", netlifyAdapter(pencatatanHandler));
app.all("/api/change-password", netlifyAdapter(changePasswordHandler));
app.all("/api/check-session", netlifyAdapter(checkSessionHandler));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend server running at http://localhost:${PORT}`);
  console.log(`   API endpoints: http://localhost:${PORT}/api/...`);
});
