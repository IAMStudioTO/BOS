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
    description: "Un simbolo racconta chi sei. Un segno riempie uno spazio.",
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
      "Esiste un sistema visivo coerente (colori, font, layout, regole)?",
    description:
      "Quando non esiste un sistema, ogni nuovo materiale indebolisce l’identità invece di rafforzarla.",
    type: "radio",
    options: [
      { label: "Sì, definito", value: "si" },
      { label: "Parziale", value: "parziale" },
      { label: "No", value: "no" },
    ],
  },
  {
    id: "prezzo",
    question: "Il tuo brand comunica il livello di prezzo che chiedi?",
    description:
      "Se chiedi premium ma sembri standard, il cliente percepisce disallineamento.",
    type: "radio",
    options: [
      { label: "Sì", value: "si" },
      { label: "In parte", value: "parziale" },
      { label: "No", value: "no" },
    ],
  },
  {
    id: "esperienza",
    question:
      "Il tuo sito/app è progettato come esperienza o come semplice vetrina?",
    description: "Una vetrina mostra. Un’esperienza guida e convince.",
    type: "radio",
    options: [
      { label: "Esperienza progettata", value: "esperienza" },
      { label: "Vetrina", value: "vetrina" },
      { label: "Non saprei", value: "non_so" },
    ],
  },
  {
    id: "attrito",
    question: "Il tuo design riduce attrito o lo crea?",
    description: "Ogni secondo di confusione è un passo verso l’abbandono.",
    type: "radio",
    options: [
      { label: "Riduce attrito", value: "riduce" },
      { label: "Non so", value: "non_so" },
      { label: "Probabilmente crea attrito", value: "crea" },
    ],
  },
  {
    id: "ambizione",
    question:
      "L’identità attuale è allineata con dove vuoi portare il brand nei prossimi 3 anni?",
    description: "L’ambizione senza struttura visiva è fragile.",
    type: "radio",
    options: [
      { label: "Sì", value: "si" },
      { label: "In parte", value: "parziale" },
      { label: "No", value: "no" },
    ],
  },
  {
    id: "materiali",
    question:
      "Carica logo, packaging, screenshot sito/app o materiali grafici.",
    description: "L’identità non è ciò che pensi di avere. È ciò che si vede.",
    type: "file",
  },
];

function calcScore(answers: Record<string, any>) {
  let score = 100;

  if (answers.riconoscibilita === "bassa") score -= 15;
  if (answers.logo === "grafico") score -= 10;
  if (answers.sistema_visivo === "no") score -= 15;
  if (answers.prezzo === "no") score -= 10;
  if (answers.attrito === "crea") score -= 15;
  if (answers.ambizione === "no") score -= 10;

  return Math.max(score, 0);
}

function levelFromScore(score: number) {
  if (score >= 80) return "Strutturato";
  if (score >= 60) return "In consolidamento";
  if (score >= 40) return "Fragile";
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
    // progress “percepito”: step attuale incluso
    const v = ((step + 1) / totalSteps) * 100;
    return Math.max(0, Math.min(100, v));
  }, [step, totalSteps]);

  const isAnswered = useMemo(() => {
    if (!current) return false;
    const v = currentValue;

    if (current.type === "radio") return typeof v === "string" && v.length > 0;
    if (current.type === "text") return typeof v === "string" && v.trim().length > 1;
    if (current.type === "number") return v !== undefined && v !== null && String(v).length > 0;
    if (current.type === "file") return v instanceof FileList ? v.length > 0 : false;

    return false;
  }, [current, currentValue]);

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

    // MVP: qui puoi chiamare la tua API /diagnostic (Render) come già fai nel progetto reale.
    // In questa versione lasciamo solo UX (invio “simulato”) per non rompere la tua integrazione.
    setSending(true);
    try {
      // Se vuoi attaccarlo davvero: fai fetch al tuo endpoint API.
      // await fetch("...", { method: "POST", ... });

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
              Report sintetico + PDF completo via email.
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
              <div
                className="h-full bg-black"
                style={{ width: `${score}%` }}
              />
            </div>

            <p className="text-sm text-gray-500 mt-4">
              Ricevi il PDF con priorità di intervento e raccomandazioni design.
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

            {sendMsg && (
              <p className="text-sm text-gray-600 mt-3">{sendMsg}</p>
            )}
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
            Risposte rapide. Output pragmatico. 2 minuti.
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
            <input
              type="text"
              value={typeof currentValue === "string" ? currentValue : ""}
              onChange={(e) => setAnswer(e.target.value)}
              className="border px-4 py-3 rounded-xl w-full"
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
