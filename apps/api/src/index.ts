import express from "express";
import cors from "cors";
import { z } from "zod";
import { chromium } from "playwright";
import { Resend } from "resend";
import { renderReportHtml, type PdfData } from "./pdfTemplate.js";

const app = express();

const allowedOrigins = [
  "https://bos-delta.vercel.app",
  "https://www.bos-delta.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS not allowed"), false);
    }
  })
);

app.use(express.json({ limit: "2mb" }));

const PORT = Number(process.env.PORT || 8080);

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM = process.env.RESEND_FROM || "";
const SEND_DELAY_MS = Number(process.env.SEND_DELAY_MS || 180000);

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "bos-api", ts: new Date().toISOString() });
});

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

  const priorita: string[] = [];

  if (a.proof === "nessuno")
    priorita.push("Costruire case study documentati.");
  if (a.processo === "no")
    priorita.push("Formalizzare processo operativo con step chiari.");
  if (a.kpi === "no")
    priorita.push("Implementare KPI mensili (lead, conversione, ticket).");
  if (a.specializzazione === "no")
    priorita.push("Definire segmento prioritario e proposta di valore.");

  const conv = input.convRate === null ? 10 : input.convRate;

  const fatturatoMensile =
    input.ticketMedio * input.leadMese * (conv / 100);

  const perditaStimataMensileEuro = Math.round(
    fatturatoMensile * 0.2
  );

  return { score, livello, priorita, perditaStimataMensileEuro };
}

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
      margin: {
        top: "18mm",
        right: "16mm",
        bottom: "18mm",
        left: "16mm"
      }
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

app.post("/diagnostic", (req, res) => {
  const parsed = DiagnosticSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: "Invalid payload",
      details: parsed.error.flatten(),
    });
  }

  const requestId = `req_${Date.now()}_${Math.random()
    .toString(16)
    .slice(2)}`;

  res.json({ ok: true, requestId });

  setTimeout(async () => {
    try {
      const {
        score,
        livello,
        priorita,
        perditaStimataMensileEuro,
      } = scoreAndPriorities(parsed.data);

      const pdfData: PdfData = {
        requestId,
        email: parsed.data.email,
        sitoUrl: parsed.data.sitoUrl || "",
        settore: parsed.data.settore,
        score,
        livello,
        perditaStimataMensileEuro,
        priorita,
        createdAtISO: new Date().toISOString(),
      };

      const html = renderReportHtml(pdfData);
      const pdf = await htmlToPdfBuffer(html);

      await sendPdfEmail(
        parsed.data.email,
        pdf,
        requestId
      );

      console.log(
        `[bos-api] sent pdf to ${parsed.data.email} (${requestId})`
      );
    } catch (err: any) {
      console.error(
        `[bos-api] pdf/email failed (${requestId})`,
        err?.message || err
      );
    }
  }, SEND_DELAY_MS);
});

app.listen(PORT, () => {
  console.log(`[bos-api] listening on :${PORT}`);
});
