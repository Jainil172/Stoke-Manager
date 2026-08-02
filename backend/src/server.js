require("dotenv").config({ quiet: true });
const app = require("./app");
const { pool, ensureDatabase } = require("./config/db");

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await ensureDatabase();
    await pool.query("SELECT 1");
    console.log("[StockFlow] MySQL connected — database is ready");

    app.listen(PORT, () => {
      console.log(`[StockFlow] API server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("[StockFlow] Startup failed:", error.message);
    process.exit(1);
  }
}

start();
