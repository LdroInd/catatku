import pg from "pg";

const { Pool } = pg;

let pool;

// Support both DATABASE_URL (for Neon/production) and individual vars (for local)
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
} else {
  pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME || "ku_apps",
    user: process.env.DB_USER || "postgres",
    password: String(process.env.DB_PASSWORD || ""),
  });
}

export function getDB() {
  return pool;
}

export async function query(text, params) {
  const result = await pool.query(text, params);
  return result.rows;
}
