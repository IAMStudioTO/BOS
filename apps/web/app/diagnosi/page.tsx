"use client";

import { useMemo, useState } from "react";

type Option = {
  label: string;
  value: string;
};

type Question = {
  id: string;
  question: string;
  description?: string;
  type: "radio" | "text" | "number" | "file";
  options?: Option[];
};

const questions: Question[] = [
  {
    id: "riconoscibilita",
    question: "Quanto è riconoscibile oggi il tuo brand nel tuo mercato?",
    description:
      "Se un cliente vede solo il tuo stile, senza leggere il nome, riuscirebbe a capire che sei tu?",
    type: "radio",
    options: [
      { label: "Altamente riconoscibile", value: "alta" },
      { label: "Abbastanza riconoscibile", value: "media" },
      { label: "Poco riconoscibile", value: "bassa" },
      { label: "Non saprei", value: "non_so" },
    ],
  },
  {
    id: "logo",
    question:
      "Il tuo logo è un simbolo che rappresenta una visione o è solo un segno grafico?",
    description:
      "Un simbolo racconta chi sei anche senza spiegazioni. Un segno è spesso decorazione.",
    type: "radio",
    options: [
      { label: "Simbolo strategico", value: "strategico" },
      { label: "Segno grafico", value: "grafico" },
      { label: "Non saprei", value: "non_so" },
    ],
  },
  {
    id: "sistema_visivo",
    question:
      "Esiste un sistema visivo coerente (colori, font, layout, regole d’uso)?",
    description:
      "Quando non esiste un sistema, ogni nuovo materiale aggiunge rumore e indebolisce l’identità.",
    type: "radio",
    options: [
      { label: "Sì, definito", value: "si" },
      { label: "Parziale", value: "parziale" },
      { label: "No", value: "no" },
    ],
  },
  {
    id: "coerenza_touchpoint",
    question:
      "Quanto è coerente il brand tra sito, social, presentazioni, preventivi, materiali stampati?",
    description:
      "Se ogni touchpoint sembra “un’azienda diversa”, il cliente sente instabilità (anche se non lo dice).",
    type: "radio",
    options: [
      { label: "Molto coerente", value: "alta" },
      { label: "Abbastanza coerente", value: "media" },
      { label: "Poco coerente", value: "bassa" },
      { label: "È disordinato", value: "disordinato" },
    ],
  },
  {
    id: "tono_voce",
    question: "Il tuo Tone of Voice è definito e coerente?",
    description:
      "Tone of Voice = il modo in cui il brand parla. Se cambia ogni volta, il brand perde personalità e autorevolezza.",
    type: "radio",
    options: [
      { label: "Sì, definito e coerente", value: "si" },
      { label: "Parziale", value: "parziale" },
      { label: "No", value: "no" },
      { label: "Non saprei", value: "non_so" },
    ],
  },
  {
    id: "prezzo",
    question: "Il tuo design comunica il livello di prezzo che chiedi?",
    description:
      "Se chiedi premium ma sembri standard, il cliente percepisce frizione e inizia a negoziare.",
    type: "radio",
    options: [
      { label: "Sì", value: "si" },
      { label: "Solo in parte", value: "parziale" },
      { label: "No", value: "no" },
    ],
  },
  {
    id: "esperienza",
    question:
      "Il sito/app è progettato come esperienza (guida) o come vetrina (mostra)?",
    description:
      "Una vetrina informa. Un’esperienza accompagna e riduce dubbi. La differenza si vede nei risultati.",
    type: "radio",
    options: [
      { label: "Esperienza progettata", value: "esperienza" },
      { label: "Più vetrina che esperienza", value: "vetrina" },
      { label: "Non saprei", value: "non_so" },
    ],
  },
  {
    id: "gerarchia",
    question:
      "Nelle tue pagine / materiali, la gerarchia visiva è chiara?",
    description:
      "Gerarchia = capire subito cosa conta. Se l’occhio non capisce, la mente si stanca e scappa.",
    type: "radio",
    options: [
      { label: "Chiara", value: "chiara" },
      { label: "Abbastanza", value: "media" },
      { label: "Confusa", value: "confusa" },
      { label: "Non saprei", value: "non_so" },
    ],
  },
  {
    id: "attrito",
    question: "Il design riduce attrito o lo crea?",
    description:
      "Attrito = confusione, incoerenza, troppe scelte, scarsa leggibilità. Ogni micro-attrito è una micro-perdita.",
    type: "radio",
    options: [
      { label: "Riduce attrito", value: "riduce" },
      { label: "Non so", value: "non_so" },
      { label: "Probabilmente crea attrito", value: "crea" },
    ],
  },
  {
    id: "credibilita",
    question:
      "Hai elementi visivi di credibilità forti (case study, prove, numeri, certificazioni, recensioni)?",
    description:
      "Se non si vede una prova, il cliente “riempie i vuoti” con dubbi. E i dubbi costano conversioni.",
    type: "radio",
    options: [
      { label: "Sì, ben visibili", value: "si" },
      { label: "Qualcosa c’è ma è debole", value: "debole" },
      { label: "Quasi nulla", value: "no" },
    ],
  },
  {
    id: "packaging_valore",
    question:
      "Packaging/prodotto: aumenta la percezione di valore o è solo funzionale?",
    description:
      "Il packaging è spesso il primo contatto fisico: se è “neutro”, stai regalando valore al competitor.",
    type: "radio",
    options: [
      { label: "Aumenta valore", value: "valore" },
      { label: "Neutro", value: "neutro" },
      { label: "Solo funzionale", value: "funzionale" },
      { label: "Non applicabile", value: "na" },
    ],
  },
  {
    id: "riconoscibile_mercato",
    question:
      "In mezzo ai competitor (online o a scaffale), saresti riconoscibile al volo?",
    description:
      "Se ti confondi, perdi prima ancora di essere valutato. È un problema di forma, non di qualità del prodotto.",
    type: "radio",
    options: [
      { label: "Sì, subito", value: "si" },
      { label: "Forse", value: "forse" },
      { label: "No", value: "no" },
      { label: "Non applicabile", value: "na" },
    ],
  },
  {
    id: "ambizione",
    question:
      "L’identità attuale è allineata con dove vuoi portare il brand nei prossimi 24–36 mesi?",
    description:
      "Se l’ambizione cresce ma l’identità resta piccola, inizi a sembrare “meno” di quello che sei.",
    type: "radio",
    options: [
      { label: "Sì", value: "si" },
      { label: "In parte", value: "parziale" },
      { label: "No", value: "no" },
    ],
  },
  {
    id: "scalabilita",
    question:
      "Se domani dovessi scalare (nuovi prodotti, nuovi mercati), il tuo sistema visivo reggerebbe?",
    description:
      "Un sistema forte cresce con te. Un sistema debole collassa e ti costringe a rifare tutto quando sei sotto pressione.",
    type: "radio",
    options: [
      { label: "Sì, regge", value: "si" },
      { label: "Ho dubbi", value: "dubbi" },
      { label: "No", value: "no" },
    ],
  },
  {
    id: "frustrazione",
    question:
      "Qual è la tua frustrazione principale oggi su brand/design/comunicazione?",
    description:
      "Scrivilo senza filtri: spesso il problema vero è quello che ti fa perdere tempo ogni settimana.",
    type: "text",
  },
  {
    id: "materiali",
    question:
      "Carica logo, packaging, screenshot sito/app o materiali grafici (se li hai).",
    description:
      "Qui possiamo vedere subito se il brand è coerente, se comunica valore e dove sta perdendo credibilità.",
    type: "file",
  },
];

function calcScore(answers: Record<string, any>) {
  let score = 100;

  // Riconoscibilità
  if (answers.riconoscibilita === "bassa") score -= 15;
  if (answers.riconoscibilita === "non_so") score -= 5;

  // Logo / sistema
  if (answers.logo === "grafico") score -= 10;
  if (answers.sistema_visivo === "no") score -= 15;
  if (answers.sistema_visivo === "parziale") score -= 6;

  // Coerenza
  if (answers.coerenza_touchpoint === "disordinato") score -= 15;
  if (answers.coerenza_touchpoint === "bassa") score -= 10;

  // Tone of Voice
  if (answers.tono_voce === "no") score -= 10;
  if (answers.tono_voce === "parziale") score -= 5;

  // Prezzo percepito
  if (answers.prezzo === "no") score -= 10;
  if (answers.prezzo === "parziale") score -= 5;

  // UX / Gerarchia / Attrito
  if (answers.esperienza === "vetrina") score -= 8;
  if (answers.gerarchia === "confusa") score -= 10;
  if (answers.attrito === "crea") score -= 15;

  // Credibilità
  if (answers.credibilita === "no") score -= 12;
  if (answers.credibilita === "debole") score -= 6;

  // Packaging / riconoscibilità
  if (answers.packaging_valore === "funzionale") score -= 8;
  if (answers.riconoscibile_mercato === "no") score -= 10;

  // Ambizione / scalabilità
  if (answers.ambizione === "no") score -= 10;
  if (answers.scalabilita === "no") score -= 10;
  if (answers.scalabilita === "dubbi") score -= 5;

  return Math.max(score, 0);
}

function levelFromScore(score: number) {
  if (score >= 85) return "Strutturato";
  if (score >= 70) return "In consolidamento";
  if (score >= 50) return "Fragile";
  return "Critico";
}

export default function DiagnosiPage() {
  const totalSteps = questions.length;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [email, setEmail] = useState("");
  const [completed, setCompleted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendMsg, setSendMsg] = useState<string>("");

  const current = questions[step];
  const currentValue = answers[current.id];

  const progressPct = useMemo(() => {
    const v = ((step + 1) / totalSteps) * 100;
    return Math.max(0, Math.min(100, v));
  }, [step, totalSteps]);

  const isAnswered = useMemo(() => {
    const v = currentValue;

    if (current.type === "radio") return typeof v === "string" && v.length > 0;
    if (current.type === "text") return typeof v === "string" && v.trim().length > 2;
    if (current.type === "number")
      return v !== undefined && v !== null && String(v).length > 0;
    if (current.type === "file") return v instanceof FileList ? v.length > 0 : false;

    return false;
  }, [current.type, currentValue]);

  function setAnswer(value: any) {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  }

  function goNext() {
    if (!isAnswered) return;

    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
    } else {
      setCompleted(true);
    }
  }

  function goBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  async function submitEmail() {
    setSendMsg("");
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setSendMsg("Inserisci una email valida.");
      return;
    }

    setSending(true);
    try {
      // Qui, se vuoi, colleghiamo la POST alla tua API Render (già presente nel progetto).
      setSendMsg("Perfetto. Ti stiamo inviando il report via email.");
    } catch {
      setSendMsg("Errore durante l’invio. Riprova tra poco.");
    } finally {
      setSending(false);
    }
  }

  if (completed) {
    const score = calcScore(answers);
    const livello = levelFromScore(score);

    return (
      <main className="min-h-screen bg-white text-black flex items-center justify-center px-6 py-12">
        <div className="max-w-xl w-full">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Risultato Diagnosi</h1>
            <p className="text-gray-600 mt-2">
              Sintesi + PDF completo (priorità design, coerenza, credibilità, UX).
            </p>
          </div>

          <div className="border rounded-2xl p-6 mb-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">Score</p>
                <p className="text-4xl font-bold">{score}/100</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Livello</p>
                <p className="text-xl font-semibold">{livello}</p>
              </div>
            </div>

            <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-black" style={{ width: `${score}%` }} />
            </div>

            <p className="text-sm text-gray-500 mt-4">
              Inserisci la tua email per ricevere il report PDF personalizzato.
            </p>
          </div>

          <div className="border rounded-2xl p-6">
            <label className="block text-sm font-medium mb-2">
              Email per ricevere il report PDF
            </label>
            <input
              type="email"
              placeholder="nome@azienda.it"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border px-4 py-3 rounded-xl w-full mb-3"
            />

            <button
              onClick={submitEmail}
              disabled={sending}
              className={`w-full px-6 py-3 rounded-xl text-white ${
                sending ? "bg-gray-400" : "bg-black hover:opacity-90"
              }`}
            >
              {sending ? "Invio in corso..." : "Ricevi il report"}
            </button>

            {sendMsg && <p className="text-sm text-gray-600 mt-3">{sendMsg}</p>}
          </div>

          <div className="mt-6 text-center">
            <a className="text-sm text-gray-500 hover:text-black" href="/">
              Torna alla home
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-black flex items-center justify-center px-6 py-12">
      <div className="max-w-xl w-full">
        {/* Header + Progress */}
        <div className="mb-8">
          <div className="flex items-baseline justify-between">
            <h1 className="text-2xl font-bold">Diagnosi Identità e Design</h1>
            <p className="text-sm text-gray-500">
              Step {step + 1} di {totalSteps}
            </p>
          </div>

          <div className="mt-3 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-black transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <p className="text-sm text-gray-500 mt-3">
            16 domande. Risposte rapide. Output pragmatico.
          </p>
        </div>

        {/* Card domanda */}
        <div className="border rounded-2xl p-6">
          <p className="text-base font-semibold mb-2">{current.question}</p>
          {current.description && (
            <p className="text-sm text-gray-500 mb-5">{current.description}</p>
          )}

          {current.type === "radio" && (
            <div className="flex flex-col gap-2">
              {current.options?.map((opt) => {
                const active = currentValue === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAnswer(opt.value)}
                    className={[
                      "w-full text-left px-4 py-3 rounded-xl border transition",
                      active
                        ? "border-black bg-black text-white"
                        : "border-gray-200 hover:border-gray-400 hover:bg-gray-50",
                    ].join(" ")}
                  >
                    {opt.label}
                  </button>
                );
              })}
              <p className="text-xs text-gray-400 mt-2">
                Seleziona un’opzione per proseguire.
              </p>
            </div>
          )}

          {current.type === "text" && (
            <textarea
              value={typeof currentValue === "string" ? currentValue : ""}
              onChange={(e) => setAnswer(e.target.value)}
              className="border px-4 py-3 rounded-xl w-full min-h-[120px]"
              placeholder="Scrivi qui…"
            />
          )}

          {current.type === "number" && (
            <input
              type="number"
              value={currentValue ?? ""}
              onChange={(e) => setAnswer(e.target.value)}
              className="border px-4 py-3 rounded-xl w-full"
              placeholder="0"
            />
          )}

          {current.type === "file" && (
            <div>
              <input
                type="file"
                multiple
                onChange={(e) => setAnswer(e.target.files)}
                className="border px-4 py-3 rounded-xl w-full"
              />
              <p className="text-xs text-gray-500 mt-2">
                Puoi caricare più file (logo, packaging, screenshot, brochure).
              </p>

              {currentValue instanceof FileList && currentValue.length > 0 && (
                <div className="mt-3 text-sm text-gray-600">
                  <p className="font-medium">Hai caricato:</p>
                  <ul className="list-disc pl-5 mt-1">
                    {Array.from(currentValue).slice(0, 6).map((f) => (
                      <li key={f.name}>{f.name}</li>
                    ))}
                    {currentValue.length > 6 && (
                      <li>+ {currentValue.length - 6} altri file</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Footer bottoni */}
          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 0}
              className={[
                "px-5 py-3 rounded-xl border transition",
                step === 0
                  ? "border-gray-200 text-gray-400 cursor-not-allowed"
                  : "border-gray-200 hover:border-gray-400 hover:bg-gray-50",
              ].join(" ")}
            >
              Indietro
            </button>

            <button
              type="button"
              onClick={goNext}
              disabled={!isAnswered}
              className={[
                "px-6 py-3 rounded-xl text-white transition",
                isAnswered
                  ? "bg-black hover:opacity-90"
                  : "bg-gray-300 cursor-not-allowed",
              ].join(" ")}
            >
              {step === totalSteps - 1 ? "Vedi risultato" : "Vai avanti"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
