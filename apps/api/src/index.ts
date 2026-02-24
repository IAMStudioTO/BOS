import express from "express";
import cors from "cors";
import { z } from "zod";
import { chromium } from "playwright";
import { Resend } from "resend";
import { Pool } from "pg";
import { renderReportHtml, type PdfData } from "./pdfTemplate.js";

const app = express();

const allowedOrigins = [
  "https://bos-delta.vercel.app",
  "https://www.bos-delta.vercel.app",
];

// ===== CORS GUARD =====
app.use((req, res, next) => {
  const origin = req.headers.origin as string | undefined;

  if (!origin) return next();

  if (!allowedOrigins.includes(origin)) {
    return res.status(403).json({ ok: false, error: "CORS forbidden" });
  }

  return next();
});

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.options("*", cors({ origin: allowedOrigins }));

app.use(express.json({ limit: "2mb" }));

// ===== ENV =====
const PORT = Number(process.env.PORT || 8080);
const DATABASE_URL = process.env.DATABASE_URL || "";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM = process.env.RESEND_FROM || "";
const SEND_DELAY_MS = Number(process.env.SEND_DELAY_MS || 180000);

// ===== POSTGRES =====
if (!DATABASE_URL) {
  console.error("DATABASE_URL missing");
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Create table if not exists
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      request_id TEXT NOT NULL,
      email TEXT NOT NULL,
      settore TEXT,
      sito_url TEXT,
      score INTEGER,
      livello TEXT,
      perdita_mensile INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log("[bos-api] DB ready");
}

initDb().catch((err) => {
  console.error("DB init failed:", err);
});

// ===== RESEND =====
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// ===== HEALTH =====
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "bos-api", ts: new Date().toISOString() });
});

// ===== SCHEMA =====
const DiagnosticSchema = z.object({
  email: z.string().email(),
  sitoUrl: z.string().optional().or(z.literal("")),
  settore: z.string().min(2),
  ticketMedio: z.number().nonnegative(),
  leadMese: z.number().nonnegative(),
  convRate: z.union([z.number().min(0).max(100), z.literal(null)]),
  rawAnswers: z.record(z.any()).optional(),
});

// ===== SCORING =====
function scoreAndPriorities(input: z.infer<typeof DiagnosticSchema>) {
  const a = (input.rawAnswers || {}) as Record<string, any>;

  let score = 100;

  if (a.specializzazione === "no") score -= 10;
  if (a.sitoComunicaSpec === "no") score -= 10;
  if (a.proof === "nessuno") score -= 15;
  if (a.processo === "no") score -= 10;
  if (a.materiale === "no") score -= 10;
  if (a.kpi === "no") score -= 10;
  if (a.decisioni === "intuitive") score -= 10;
  if (a.decisionMaker === "non_chiaro") score -= 5;
  if (a.convRate === "non_so") score -= 5;

  score = Math.max(0, score);

  const livello =
    score >= 80
      ? "Strutturato"
      : score >= 60
      ? "In consolidamento"
      : score >= 40
      ? "Fragile"
      : "Critico";

  const conv = input.convRate === null ? 10 : input.convRate;
  const fatturatoMensile =
    input.ticketMedio * input.leadMese * (conv / 100);
  const perditaStimataMensileEuro = Math.round(
    fatturatoMensile * 0.2
  );

  return { score, livello, perditaStimataMensileEuro };
}

// ===== PDF =====
async function htmlToPdfBuffer(html: string) {
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

async function sendPdfEmail(
  to: string,
  pdf: Buffer,
  requestId: string
) {
  if (!resend) throw new Error("RESEND_API_KEY missing");
  if (!RESEND_FROM) throw new Error("RESEND_FROM missing");

  await resend.emails.send({
    from: RESEND_FROM,
    to: [to],
    subject: "Report Diagnosi Strutturale (PDF)",
    text: `In allegato trovi il tuo report.\nRequest ID: ${requestId}`,
    attachments: [
      {
        filename: `report-${requestId}.pdf`,
        content: pdf.toString("base64"),
      },
    ],
  });
}

// ===== ROUTE =====
app.post("/diagnostic", async (req, res) => {
  const parsed = DiagnosticSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: "Invalid payload",
    });
  }

  const requestId = `req_${Date.now()}`;

  const { score, livello, perditaStimataMensileEuro } =
    scoreAndPriorities(parsed.data);

  // Save to DB immediately
  await pool.query(
    `
    INSERT INTO leads
    (request_id, email, settore, sito_url, score, livello, perdita_mensile)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    `,
    [
      requestId,
      parsed.data.email,
      parsed.data.settore,
      parsed.data.sitoUrl || "",
      score,
      livello,
      perditaStimataMensileEuro,
    ]
  );

  res.json({ ok: true, requestId, score, livello });

  setTimeout(async () => {
    try {
      const html = renderReportHtml({
        requestId,
        email: parsed.data.email,
        sitoUrl: parsed.data.sitoUrl || "",
        settore: parsed.data.settore,
        score,
        livello,
        perditaStimataMensileEuro,
        priorita: [],
        createdAtISO: new Date().toISOString(),
      });

      const pdf = await htmlToPdfBuffer(html);
      await sendPdfEmail(parsed.data.email, pdf, requestId);

      console.log("[bos-api] sent pdf:", requestId);
    } catch (err) {
      console.error("PDF/email failed:", err);
    }
  }, SEND_DELAY_MS);
});

// ===== ADMIN ROUTE =====
app.get("/admin/leads", async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT * FROM leads ORDER BY created_at DESC LIMIT 50`
  );
  res.json(rows);
});

app.listen(PORT, () => {
  console.log(`[bos-api] listening on :${PORT}`);
});

