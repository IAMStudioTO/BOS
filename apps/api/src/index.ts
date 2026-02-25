import express from "express";
import cors from "cors";
import { z } from "zod";
import pg from "pg";

const app = express();

/**
 * CORS
 */
const CORS_ORIGINS = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isAllowedOrigin(origin?: string) {
  if (!origin) return true;
  if (CORS_ORIGINS.length === 0) return true;
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
const ADMIN_API_KEY = (process.env.ADMIN_API_KEY || "").trim();

/**
 * DATABASE
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
    res.status(500).json({ ok: false, error: "ADMIN_API_KEY not configured" });
    return true;
  }

  if (key !== ADMIN_API_KEY) {
    res.status(403).json({ ok: false, error: "Forbidden" });
    return true;
  }

  return false;
}

/**
 * SCHEMA
 */
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

  if (a.riconoscibilita === "bassa") score -= 15;
  if (a.logo === "grafico") score -= 10;
  if (a.sistema_visivo === "no") score -= 15;
  if (a.coerenza_touchpoint === "disordinato") score -= 15;
  if (a.tono_voce === "no") score -= 10;
  if (a.attrito === "crea") score -= 15;

  score = Math.max(0, score);

  const livello =
    score >= 85
      ? "Strutturato"
      : score >= 70
      ? "In consolidamento"
      : score >= 50
      ? "Fragile"
      : "Critico";

  return { score, livello, perdita_mensile: 0 };
}

/**
 * HEALTH
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
 */
app.post("/diagnostic", async (req, res) => {
  try {
    const input = DiagnosticSchema.parse(req.body);

    const request_id = `req_${Date.now()}_${Math.random()
      .toString(16)
      .slice(2)}`;

    const { score, livello, perdita_mensile } =
      scoreAndPriorities(input);

    const raw_answers = input.rawAnswers ?? null;

    await pool.query(
      `
      INSERT INTO leads 
      (request_id, email, settore, sito_url, score, livello, perdita_mensile, raw_answers)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
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
    if (err?.name === "ZodError") {
      return res.status(400).json({ ok: false, error: "Invalid payload" });
    }
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * ADMIN JSON (NON MODIFICATO)
 */
app.get("/admin/leads", async (req, res) => {
  if (requireAdmin(req, res)) return;

  const { rows } = await pool.query(
    `SELECT id, request_id, email, settore, sito_url, score, livello, perdita_mensile, raw_answers, created_at
     FROM leads
     ORDER BY created_at DESC
     LIMIT 500`
  );

  res.json(rows);
});

/**
 * ADMIN DELETE (NON MODIFICATO)
 */
app.delete("/admin/leads/:id", async (req, res) => {
  if (requireAdmin(req, res)) return;

  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ ok: false });
  }

  const r = await pool.query(
    `DELETE FROM leads WHERE id = $1`,
    [id]
  );

  res.json({ ok: true, deleted: r.rowCount || 0 });
});

/**
 * ADMIN CSV (OTTIMIZZATO OUTPUT)
 */
app.get("/admin/leads.csv", async (req, res) => {
  if (requireAdmin(req, res)) return;

  const { rows } = await pool.query(
    `SELECT id, request_id, email, settore, sito_url, score, livello, perdita_mensile, raw_answers, created_at
     FROM leads
     ORDER BY created_at DESC
     LIMIT 500`
  );

  const baseHeader = [
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

  const rawKeys = new Set<string>();
  rows.forEach((r: any) => {
    if (r.raw_answers && typeof r.raw_answers === "object") {
      Object.keys(r.raw_answers).forEach((k) =>
        rawKeys.add(k)
      );
    }
  });

  const header = [...baseHeader, ...Array.from(rawKeys).sort()];

  const escapeCsv = (v: any) => {
    const s = String(v ?? "");
    const out = s.replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${out}"` : out;
  };

  const lines = [];
  lines.push(header.join(","));

  rows.forEach((r: any) => {
    const base = {
      id: r.id,
      request_id: r.request_id,
      email: r.email,
      settore: r.settore,
      sito_url: r.sito_url ?? "",
      score: r.score,
      livello: r.livello,
      perdita_mensile: r.perdita_mensile,
      created_at:
        r.created_at instanceof Date
          ? r.created_at.toISOString()
          : r.created_at,
    };

    const row = header.map((k) => {
      if (k in base) return escapeCsv(base[k as keyof typeof base]);
      return escapeCsv(
        r.raw_answers?.[k] ?? ""
      );
    });

    lines.push(row.join(","));
  });

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="bos-leads.csv"'
  );
  res.send(lines.join("\n"));
});

ensureDb()
  .then(() => console.log("[bos-api] DB ready"))
  .catch((e) => console.error("[bos-api] DB init failed", e));

app.listen(PORT, () => {
  console.log(`[bos-api] listening on :${PORT}`);
});
