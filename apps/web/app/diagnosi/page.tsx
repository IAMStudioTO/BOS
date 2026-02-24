"use client";

import { useMemo, useState } from "react";

type Option = { label: string; value: string };
type Question = {
  id: string;
  question: string;
  description?: string;
  type: "radio" | "text" | "file";
  options?: Option[];
  placeholder?: string;
  required?: boolean;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://bos-v6cz.onrender.com";

const questions: Question[] = [
  {
    id: "sitoUrl",
    question: "Sito o link principale (anche Instagram / marketplace)",
    description:
      "Ci serve per leggere credibilità, chiarezza e coerenza tra touchpoint.",
    type: "text",
  },
  {
    id: "settore",
    question: "Settore / categoria",
    description:
      "Serve per confrontare il tuo brand con pattern e competitor del settore.",
    type: "text",
    required: true,
  },
  {
    id: "riconoscibilita",
    question: "Quanto è riconoscibile oggi il tuo brand?",
    description:
      "Se togliessimo il logo, sarebbe comunque identificabile?",
    type: "radio",
    required: true,
    options: [
      { label: "Molto", value: "alta" },
      { label: "Abbastanza", value: "media" },
      { label: "Poco", value: "bassa" },
    ],
  },
  {
    id: "logo",
    question: "Il logo comunica identità o è solo un segno grafico?",
    description:
      "Un logo forte sostiene posizionamento e prezzo.",
    type: "radio",
    required: true,
    options: [
      { label: "Comunica identità", value: "identita" },
      { label: "Solo segno grafico", value: "grafico" },
      { label: "Non saprei", value: "non_so" },
    ],
  },
  {
    id: "dolore",
    question: "Qual è oggi il problema più costoso lato immagine o design?",
    description:
      "Qui vogliamo il punto che ti fa perdere vendite o autorevolezza.",
    type: "text",
    required: true,
  },
];

export default function DiagnosiPage() {
  const totalSteps = questions.length;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [gate, setGate] = useState(false);

  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [doneMsg, setDoneMsg] = useState("");

  const current = questions[step];
  const currentValue = answers[current.id];

  const progressPct = useMemo(() => {
    return ((step + 1) / totalSteps) * 100;
  }, [step]);

  function setAnswer(value: any) {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  }

  function goNext() {
    if (step < totalSteps - 1) setStep((s) => s + 1);
    else setGate(true);
  }

  function goBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  async function submitEmail() {
    setDoneMsg("");

    if (!email.includes("@")) {
      setDoneMsg("Inserisci una email valida.");
      return;
    }

    if (!consent) {
      setDoneMsg(
        "Devi confermare il consenso al trattamento dei dati per proseguire."
      );
      return;
    }

    setSending(true);

    try {
      await fetch(`${API_BASE}/diagnostic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          sitoUrl: answers.sitoUrl || "",
          settore: answers.settore || "Non specificato",
          ticketMedio: 0,
          leadMese: 0,
          convRate: null,
          rawAnswers: answers,
        }),
      });

      setDoneMsg(
        "Analisi avviata. Riceverai il report il prima possibile."
      );
    } catch {
      setDoneMsg("Errore durante l’invio. Riprova.");
    } finally {
      setSending(false);
    }
  }

  if (gate) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="max-w-xl w-full border rounded-2xl p-8">
          <h1 className="text-2xl font-bold mb-4">
            Ricevi il report completo via email
          </h1>

          <input
            type="email"
            placeholder="nome@azienda.it"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border px-4 py-3 rounded-xl w-full mb-4"
          />

          <div className="flex items-start gap-3 mb-6">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <label className="text-sm text-gray-600 leading-6">
              Confermo il consenso al trattamento dei dati ai fini
              dell’analisi e della consegna del report.
            </label>
          </div>

          <button
            onClick={submitEmail}
            disabled={sending}
            className="w-full bg-black text-white px-6 py-3 rounded-xl"
          >
            {sending ? "Invio..." : "Avvia analisi"}
          </button>

          {doneMsg && (
            <div className="mt-4 text-sm text-gray-700">
              {doneMsg}
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-xl w-full border rounded-2xl p-8">
        <div className="mb-6">
          <div className="text-sm text-gray-500">
            Step {step + 1} di {totalSteps}
          </div>
          <div className="h-2 bg-gray-100 rounded-full mt-2">
            <div
              className="h-2 bg-black rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <p className="font-semibold mb-2">{current.question}</p>
        <p className="text-sm text-gray-500 mb-6">
          {current.description}
        </p>

        {current.type === "radio" &&
          current.options?.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setAnswer(opt.value)}
              className={`w-full text-left border px-4 py-3 rounded-xl mb-2 ${
                currentValue === opt.value
                  ? "bg-black text-white"
                  : ""
              }`}
            >
              {opt.label}
            </button>
          ))}

        {current.type === "text" && (
          <input
            value={currentValue || ""}
            onChange={(e) => setAnswer(e.target.value)}
            className="border px-4 py-3 rounded-xl w-full"
          />
        )}

        <div className="flex justify-between mt-8">
          <button onClick={goBack}>Indietro</button>
          <button onClick={goNext}>Avanti</button>
        </div>
      </div>
    </main>
  );
}
