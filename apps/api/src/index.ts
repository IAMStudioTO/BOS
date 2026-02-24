import express from "express";
import cors from "cors";
import { z } from "zod";
import pg from "pg";

const app = express();

/**
 * CORS: consenti SOLO i domini del frontend
 * Imposta su Render:
 * CORS_ORIGINS="https://bos-delta.vercel.app,https://bos-delta-xxx.vercel.app"
 */
const CORS_ORIGINS = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isAllowedOrigin(origin?: string) {
  if (!origin) return true; // curl/server-to-server
  if (CORS_ORIGINS.length === 0) return true; // fallback (non consigliato in prod)
  return CORS_ORIGINS.includes(origin);
}

app.use(
  cors({
    origin(origin, cb) {
      if (isAllowedOrigin(origin || undefined)) return cb(null, true);
      return cb(new Error("CORS blocked"), false);
    },
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-admin-key"],
  })
);

app.options("*", cors());
app.use(express.json({ limit: "4mb" }));

const PORT = Number(process.env.PORT || 8080);

/**
 * Admin key per endpoint /admin/*
 * (su Render) ADMIN_API_KEY=...
 */
const ADMIN_API_KEY = (process.env.ADMIN_API_KEY || "").trim();

/**
 * DB (Render Postgres)
 */
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
});

async function ensureDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      request_id TEXT NOT NULL,
      email TEXT NOT NULL,
      settore TEXT NOT NULL,
      sito_url TEXT,
      score INT NOT NULL,
      livello TEXT NOT NULL,
      perdita_mensile INT NOT NULL DEFAULT 0,
      raw_answers JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    ALTER TABLE leads
    ADD COLUMN IF NOT EXISTS raw_answers JSONB;
  `);
}

function requireAdmin(req: express.Request, res: express.Response) {
  const key = (req.header("x-admin-key") || "").trim();
  if (!ADMIN_API_KEY) {
    return res
      .status(500)
      .json({ ok: false, error: "ADMIN_API_KEY not configured" });
  }
  if (key !== ADMIN_API_KEY) {
    return res.status(403).json({ ok: false, error: "Forbidden" });
  }
  return null;
}

const DiagnosticSchema = z.object({
  email: z.string().email(),
  sitoUrl: z.string().optional().or(z.literal("")),
  settore: z.string().min(2),
  ticketMedio: z.number().nonnegative(),
  leadMese: z.number().nonnegative(),
  convRate: z.union([z.number().min(0).max(100), z.literal(null)]),
  rawAnswers: z.record(z.any()).optional(),
});

function scoreAndPriorities(input: z.infer<typeof DiagnosticSchema>) {
  const a = (input.rawAnswers || {}) as Record<string, any>;

  let score = 100;

  // MVP scoring (puoi evolverlo)
  if (a.riconoscibilita === "bassa") score -= 15;
  if (a.logo === "grafico") score -= 10;
  if (a.sistema_visivo === "no") score -= 15;
  if (a.coerenza_touchpoint === "disordinato") score -= 15;
  if (a.tono_voce === "no") score -= 10;
  if (a.prezzo === "no") score -= 10;
  if (a.gerarchia === "confusa") score -= 10;
  if (a.attrito === "crea") score -= 15;
  if (a.credibilita === "no") score -= 12;
  if (a.packaging_valore === "funzionale") score -= 8;
  if (a.riconoscibile_mercato === "no") score -= 10;
  if (a.ambizione === "no") score -= 10;
  if (a.scalabilita === "no") score -= 10;

  score = Math.max(0, score);

  const livello =
    score >= 85
      ? "Strutturato"
      : score >= 70
      ? "In consolidamento"
      : score >= 50
      ? "Fragile"
      : "Critico";

  const perdita_mensile = 0;

  return { score, livello, perdita_mensile };
}

/**
 * HEALTH (con versione deploy)
 */
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "bos-api",
    ts: new Date().toISOString(),
    version: process.env.RENDER_GIT_COMMIT || process.env.GIT_COMMIT || "unknown",
  });
});

/**
 * DIAGNOSTIC
 * ✅ salva lead + raw answers
 * ✅ NO PDF / NO EMAIL
 */
app.post("/diagnostic", async (req, res) => {
  try {
    // --- DEBUG LOGS (chiave del problema) ---
    const body = req.body || {};
    const bodyKeys = Object.keys(body);
    const ra = body?.rawAnswers;
    const rawAnswersType = Array.isArray(ra) ? "array" : typeof ra;
    const rawAnswersKeys =
      ra && typeof ra === "object" && !Array.isArray(ra) ? Object.keys(ra) : [];

    console.log("[bos-api] /diagnostic received keys:", bodyKeys);
    console.log("[bos-api] /diagnostic rawAnswers type:", rawAnswersType);
    console.log("[bos-api] /diagnostic rawAnswers keys:", rawAnswersKeys);

    const input = DiagnosticSchema.parse(body);

    const parsedRa = input.rawAnswers || {};
    console.log(
      "[bos-api] /diagnostic parsed rawAnswers keys:",
      Object.keys(parsedRa)
    );
    // --- END DEBUG LOGS ---

    const request_id = `req_${Date.now()}_${Math.random()
      .toString(16)
      .slice(2)}`;

    const { score, livello, perdita_mensile } = scoreAndPriorities(input);
    const raw_answers = input.rawAnswers ? input.rawAnswers : null;

    await pool.query(
      `
      INSERT INTO leads (request_id, email, settore, sito_url, score, livello, perdita_mensile, raw_answers)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        request_id,
        input.email,
        input.settore,
        input.sitoUrl || null,
        score,
        livello,
        perdita_mensile,
        raw_answers,
      ]
    );

    return res.json({
      ok: true,
      requestId: request_id,
      message: "Analisi avviata. Riceverai il report il prima possibile.",
    });
  } catch (err: any) {
    console.error("[bos-api] diagnostic failed", err?.message || err);
    if (err?.name === "ZodError") {
      return res.status(400).json({ ok: false, error: "Invalid payload" });
    }
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * ADMIN: JSON leads
 */
app.get("/admin/leads", async (req, res) => {
  const forbidden = requireAdmin(req, res);
  if (forbidden) return;

  const { rows } = await pool.query(
    `SELECT id, request_id, email, settore, sito_url, score, livello, perdita_mensile, raw_answers, created_at
     FROM leads
     ORDER BY created_at DESC
     LIMIT 500`
  );
  res.json(rows);
});

/**
 * ADMIN: CSV export
 */
app.get("/admin/leads.csv", async (req, res) => {
  const forbidden = requireAdmin(req, res);
  if (forbidden) return;

  const { rows } = await pool.query(
    `SELECT id, request_id, email, settore, sito_url, score, livello, perdita_mensile, raw_answers, created_at
     FROM leads
     ORDER BY created_at DESC
     LIMIT 500`
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
    "raw_answers",
    "created_at",
  ];

  const escapeCsv = (v: any) => {
    const s = String(v ?? "");
    const needs = /[",\n]/.test(s);
    const out = s.replace(/"/g, '""');
    return needs ? `"${out}"` : out;
  };

  const lines = [header.join(",")].concat(
    rows.map((r: any) =>
      header
        .map((k) =>
          k === "raw_answers"
            ? escapeCsv(r[k] ? JSON.stringify(r[k]) : "")
            : escapeCsv(r[k])
        )
        .join(",")
    )
  );

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="bos-leads.csv"');
  res.send(lines.join("\n"));
});

/**
 * ADMIN: DELETE lead by id
 */
app.delete("/admin/leads/:id", async (req, res) => {
  const forbidden = requireAdmin(req, res);
  if (forbidden) return;

  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ ok: false, error: "Invalid id" });
  }

  const result = await pool.query(`DELETE FROM leads WHERE id = $1`, [id]);
  return res.json({ ok: true, deleted: result.rowCount || 0 });
});

ensureDb()
  .then(() => console.log("[bos-api] DB ready"))
  .catch((e) => console.error("[bos-api] DB init failed", e));

app.listen(PORT, () => {
  console.log(`[bos-api] listening on :${PORT}`);
});
