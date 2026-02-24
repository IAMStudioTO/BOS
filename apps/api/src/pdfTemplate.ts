export type PdfData = {
  requestId: string;
  email: string;
  sitoUrl?: string;
  settore: string;
  score: number;
  livello: string;
  perditaStimataMensileEuro: number;
  priorita: string[];
  createdAtISO: string;
};

function esc(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderReportHtml(d: PdfData) {
  const data = new Date(d.createdAtISO).toLocaleString("it-IT");

  const prioritaLis =
    d.priorita.length > 0
      ? d.priorita.map((p) => `<li>${esc(p)}</li>`).join("")
      : `<li>Nessuna priorità critica rilevata.</li>`;

  return `<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; }
    .h1 { font-size: 18px; font-weight: bold; }
    .h2 { font-size: 14px; font-weight: bold; margin-top: 20px; }
    .card { border: 1px solid #ddd; padding: 12px; margin-top: 8px; }
  </style>
</head>
<body>

<div class="h1">Report Diagnosi Strutturale</div>

<p><b>Settore:</b> ${esc(d.settore)}</p>
<p><b>Data:</b> ${esc(data)}</p>
<p><b>Request ID:</b> ${esc(d.requestId)}</p>

<div class="h2">Score</div>
<div class="card">
  <p><b>${d.score}/100</b> — ${esc(d.livello)}</p>
</div>

<div class="h2">Perdita stimata / mese</div>
<div class="card">
  <p><b>€ ${d.perditaStimataMensileEuro.toLocaleString("it-IT")}</b></p>
</div>

<div class="h2">Priorità operative</div>
<div class="card">
  <ul>
    ${prioritaLis}
  </ul>
</div>

</body>
</html>`;
}
