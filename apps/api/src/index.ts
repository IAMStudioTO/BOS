import express from "express";
import cors from "cors";
import { z } from "zod";
import { Pool } from "pg";

const app = express();
app.use(express.json({ limit: "2mb" }));

/* =========================
   ENV
========================= */

const PORT = Number(process.env.PORT || 8080);
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "";

const ALLOWED_ORIGINS = [
  "https://bos-delta.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-admin-key"],
  })
);

app.options("*", cors());

/* =========================
   DATABASE
========================= */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect()
  .then(() => console.log("[bos-api] DB ready"))
  .catch((err) => console.error("[bos-api] DB error:", err));

/* =========================
   UTILS
========================= */

function requireAdminKey(req: express.Request, res: express.Response) {
  const key = req.header("x-admin-key");
  if (!key || key !== ADMIN_API_KEY) {
    res.status(403).json({ ok: false, error: "Forbidden" });
    return false;
  }
  return true;
}

/* =========================
   HEALTH
========================= */

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "bos-api",
    ts: new Date().toISOString(),
  });
});

/* =========================
   ADMIN JSON LEADS
========================= */

app.get("/admin/leads", async (req, res) => {
  if (!requireAdminKey(req, res)) return;

  try {
    const { rows } = await pool.query(
      `SELECT * FROM leads ORDER BY created_at DESC`
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "DB error" });
  }
});

/* =========================
   ADMIN CSV EXPORT
========================= */

app.get("/admin/leads.csv", async (req, res) => {
  if (!requireAdminKey(req, res)) return;

  try {
    const { rows } = await pool.query(
      `SELECT * FROM leads ORDER BY created_at DESC`
    );

    const header = [
      "id",
      "request_id",
      "email",
      "settore",
      "sito_url",
      "score",
      "livello",
      "perdita_mensile",
      "created_at",
    ];

    const csvRows = rows.map((r) =>
      [
        r.id,
        r.request_id,
        r.email,
        r.settore,
        r.sito_url,
        r.score,
        r.livello,
        r.perdita_mensile,
        r.created_at
          ? new Date(r.created_at).toISOString()
          : "",
      ]
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );

    const csv = [header.join(","), ...csvRows].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="bos-leads.csv"'
    );

    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "CSV generation failed" });
  }
});

/* =========================
   START
========================= */

app.listen(PORT, () => {
  console.log(`[bos-api] listening on :${PORT}`);
});
