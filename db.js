import pkg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Always load .env from project root, no matter where code runs
dotenv.config({ path: path.resolve(__dirname, "./.env") });

const { Pool } = pkg;

let poolConfig;

if (process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  };
} else {
  poolConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
  };
}


const pool = new Pool(poolConfig);

// Optional: test connection on startup
(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Connected to PostgreSQL");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
})();

export default pool;
