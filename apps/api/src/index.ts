import express from "express";
import cors from "cors";
import { z } from "zod";

const app = express();

// CORS: in V1 lasciamo aperto; dopo mettiamo dominio Vercel
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = Number(process.env.PORT || 8080);

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "bos-api", ts: new Date().toISOString() });
});

// Schema payload base (poi lo estendiamo con tutte le risposte)
const DiagnosticSchema = z.object({
  email: z.string().email(),
  sitoUrl: z.string().url().optional().or(z.literal("")),
  settore: z.string().min(2),
  ticketMedio: z.number().nonnegative(),
  leadMese: z.number().nonnegative(),
  convRate: z.union([z.number().min(0).max(100), z.literal(null)]), // null = "non lo so"
  // placeholder per il resto
  rawAnswers: z.record(z.any()).optional()
});

app.post("/diagnostic", (req, res) => {
  const parsed = DiagnosticSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: "Invalid payload",
      details: parsed.error.flatten()
    });
  }

  // V1: rispondiamo subito con request_id (poi: job PDF + email)
  const requestId = `req_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  return res.json({
    ok: true,
    requestId,
    received: parsed.data
  });
});

app.listen(PORT, () => {
  console.log(`[bos-api] listening on :${PORT}`);
});
