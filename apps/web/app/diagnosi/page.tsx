"use client";

import { useMemo, useState } from "react";

type Option = { label: string; value: string };
type Question = {
  id: string;
  question: string;
  description?: string;
  type: "radio" | "text" | "file";
  options?: Option[];
  required?: boolean;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://bos-v6cz.onrender.com";

const questions: Question[] = [
  {
    id: "sitoUrl",
    question: "Inserisci il link principale (sito / landing / e-commerce / IG)",
    description:
      "Analizziamo gerarchia visiva, credibilità, coerenza e qualità dell’esperienza.",
    type: "text",
    required: true,
  },
  {
    id: "settore",
    question: "Settore e fascia di mercato",
    description:
      "Serve per confrontare il tuo brand con competitor reali e benchmark di categoria.",
    type: "text",
    required: true,
  },
  {
    id: "logoUpload",
    question: "Carica il tuo logo (PNG / SVG / PDF)",
    description:
      "Il logo è il primo filtro di credibilità. Lo analizziamo in termini di struttura, coerenza e scalabilità.",
    type: "file",
    required: false,
  },
  {
    id: "packagingUpload",
    question: "Carica immagini del packaging o del prodotto (se presenti)",
    description:
      "Il packaging è percezione di valore. Anche una foto fatta col telefono va bene.",
    type: "file",
  },
  {
    id: "materialiUpload",
    question: "Carica presentazioni, brochure, cataloghi o screenshot social",
    description:
      "Servono per valutare coerenza e maturità del sistema visivo.",
    type: "file",
  },
  {
    id: "riconoscibilita",
    question: "Il tuo brand è immediatamente riconoscibile?",
    description:
      "Se togliessimo il logo, si capirebbe che siete voi?",
    type: "radio",
    required: true,
    options: [
      { label: "Sì, molto", value: "alta" },
      { label: "Abbastanza", value: "media" },
      { label: "No", value: "bassa" },
    ],
  },
  {
    id: "sistemaVisivo",
    question: "Esiste un sistema visivo strutturato (colori, font, regole)?",
    description:
      "Senza sistema, ogni nuovo materiale abbassa la percezione di solidità.",
    type: "radio",
    required: true,
    options: [
      { label: "Sì, definito e coerente", value: "si" },
      { label: "Parziale", value: "parziale" },
      { label: "No", value: "no" },
    ],
  },
  {
    id: "premium",
    question: "Il design supporta il prezzo che chiedi?",
    description:
      "Se chiedi premium ma sembri standard, il cliente negozia.",
    type: "radio",
    required: true,
    options: [
      { label: "Sì", value: "si" },
      { label: "In parte", value: "parziale" },
      { label: "No", value: "no" },
    ],
  },
  {
    id: "ux",
    question: "Il sito guida l’utente o mostra solo contenuti?",
    description:
      "UX significa progettare il percorso decisionale, non solo layout.",
    type: "radio",
    required: true,
    options: [
      { label: "Guida decisionale", value: "guida" },
      { label: "Più vetrina", value: "vetrina" },
      { label: "Non saprei", value: "non_so" },
    ],
  },
  {
    id: "coerenzaTouchpoint",
    question: "Sito, social, preventivi e materiali parlano la stessa lingua?",
    description:
      "Se ogni touchpoint sembra un’azienda diversa, la fiducia crolla.",
    type: "radio",
    required: true,
    options: [
      { label: "Molto coerenti", value: "alta" },
      { label: "Abbastanza", value: "media" },
      { label: "Incoerenti", value: "bassa" },
    ],
  },
  {
    id: "distinzione",
    question: "Rispetto ai competitor sembri diverso o intercambiabile?",
    description:
      "Se sembri uguale, il cliente sceglie sul prezzo.",
    type: "radio",
    required: true,
    options: [
      { label: "Molto diverso", value: "diverso" },
      { label: "Un po’ diverso", value: "parziale" },
      { label: "Uguale agli altri", value: "uguale" },
    ],
  },
  {
    id: "scalabilita",
    question: "Se l’azienda cresce, il sistema visivo regge?",
    description:
      "Un brand forte è scalabile. Uno debole si rompe quando serve forza.",
    type: "radio",
    required: true,
    options: [
      { label: "Sì", value: "si" },
      { label: "Ho dubbi", value: "dubbi" },
      { label: "No", value: "no" },
    ],
  },
  {
    id: "problema",
    question: "Qual è il problema più costoso lato design oggi?",
    description:
      "Vendite perse? Prezzi negoziati? Mancanza di credibilità?",
    type: "text",
    required: true,
  },
  {
    id: "obiettivo",
    question: "Se potessi sistemare una cosa nei prossimi 90 giorni, quale sarebbe?",
    description:
      "Questo ci dice la priorità reale di intervento.",
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

  const progressPct = useMemo(
    () => ((step + 1) / totalSteps) * 100,
    [step]
  );

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
    if (!email.includes("@")) {
      setDoneMsg("Inserisci una email valida.");
      return;
    }
    if (!consent) {
      setDoneMsg("Devi confermare il consenso per proseguire.");
      return;
    }

    setSending(true);

    await fetch(`${API_BASE}/diagnostic`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        sitoUrl: answers.sitoUrl || "",
        settore: answers.settore || "",
        ticketMedio: 0,
        leadMese: 0,
        convRate: null,
        rawAnswers: answers,
      }),
    });

    setDoneMsg(
      "Analisi avviata. Riceverai il report il prima possibile."
    );

    setSending(false);
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
              Confermo il consenso al trattamento dei dati ai fini dell’analisi.
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

        {current.type === "file" && (
          <input
            type="file"
            multiple
            onChange={(e) =>
              setAnswer(
                Array.from(e.target.files || []).map((f) => f.name)
              )
            }
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
