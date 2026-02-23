"use client";

import { useMemo, useState } from "react";

type Answers = {
  settore: string;
  sitoUrl: string;
  ticketMedio: string;
  leadMese: string;
  convRate: string;
  valueProp: string;
  specializzazione: "si" | "parziale" | "no" | "";
  sitoComunicaSpec: "si" | "parziale" | "no" | "";
  proof: "casi_studio" | "testimonianze" | "nessuno" | "";
  processo: "si" | "no" | "";
  materiale: "si" | "no" | "variabile" | "";
  kpi: "si" | "no" | "";
  decisioni: "pianificate" | "reattive" | "intuitive" | "";
  decisionMaker: "uno" | "piu" | "non_chiaro" | "";
};

const initial: Answers = {
  settore: "",
  sitoUrl: "",
  ticketMedio: "",
  leadMese: "",
  convRate: "",
  valueProp: "",
  specializzazione: "",
  sitoComunicaSpec: "",
  proof: "",
  processo: "",
  materiale: "",
  kpi: "",
  decisioni: "",
  decisionMaker: "",
};

function isValidUrl(s: string) {
  if (!s) return true;
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function Diagnosi() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initial);
  const [touched, setTouched] = useState(false);

  const steps = useMemo(
    () => [
      { key: "settore", title: "Settore" },
      { key: "sitoUrl", title: "Sito (opzionale)" },
      { key: "ticketMedio", title: "Ticket medio (€)" },
      { key: "leadMese", title: "Lead medi al mese" },
      { key: "convRate", title: "Conversione lead → cliente (%)" },
      { key: "valueProp", title: "Perché scegliere voi?" },
      { key: "specializzazione", title: "Specializzazione" },
      { key: "sitoComunicaSpec", title: "Sito comunica specializzazione?" },
      { key: "proof", title: "Prove di risultato" },
      { key: "processo", title: "Processo esplicitato" },
      { key: "materiale", title: "Materiali standardizzati" },
      { key: "kpi", title: "KPI monitorati mensilmente?" },
      { key: "decisioni", title: "Tipo di decisioni" },
      { key: "decisionMaker", title: "Decision maker" },
    ],
    []
  );

  const totalSteps = steps.length;
  const currentKey = steps[step].key as keyof Answers;

  const canGoNext = useMemo(() => {
    const k = currentKey;

    if (k === "settore") return answers.settore.trim().length >= 2;
    if (k === "sitoUrl") return isValidUrl(answers.sitoUrl);
    if (k === "ticketMedio") return Number(answers.ticketMedio) > 0;
    if (k === "leadMese") return answers.leadMese !== "";
    if (k === "convRate")
      return (
        answers.convRate === "non_so" ||
        (answers.convRate !== "" &&
          Number(answers.convRate) >= 0 &&
          Number(answers.convRate) <= 100)
      );
    if (k === "valueProp") return answers.valueProp.trim().length >= 10;
    return answers[k] !== "";
  }, [answers, currentKey]);

  const progress = Math.round(((step + 1) / totalSteps) * 100);

  function next() {
    setTouched(true);
    if (!canGoNext) return;
    setTouched(false);
    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  }

  function prev() {
    if (step > 0) setStep(step - 1);
  }

  const isLast = step === totalSteps - 1;

  /* =========================
     SCORING ENGINE
  ========================== */

  const score = (() => {
    let s = 100;

    if (answers.specializzazione === "no") s -= 10;
    if (answers.sitoComunicaSpec === "no") s -= 10;
    if (answers.proof === "nessuno") s -= 15;
    if (answers.processo === "no") s -= 10;
    if (answers.materiale === "no") s -= 10;
    if (answers.kpi === "no") s -= 10;
    if (answers.decisioni === "intuitive") s -= 10;
    if (answers.decisionMaker === "non_chiaro") s -= 5;
    if (answers.convRate === "non_so") s -= 5;

    return Math.max(0, s);
  })();

  const livello =
    score >= 80
      ? "Strutturato"
      : score >= 60
      ? "In consolidamento"
      : score >= 40
      ? "Fragile"
      : "Critico";

  const perditaStimata = (() => {
    const ticket = Number(answers.ticketMedio || 0);
    const lead = Number(answers.leadMese || 0);
    const conv =
      answers.convRate && answers.convRate !== "non_so"
        ? Number(answers.convRate) / 100
        : 0.1;

    const fatturato = ticket * lead * conv;
    return Math.round(fatturato * 0.2);
  })();

  const showResult = isLast && canGoNext;

  /* ========================= */

  return (
    <main className="min-h-screen bg-white text-black px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Diagnosi Strutturale</h1>
        <p className="text-gray-600 mb-6">
          Output: score, livello evolutivo, perdita stimata, priorità operative.
        </p>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Step {step + 1} / {totalSteps}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full">
            <div
              className="h-2 bg-black rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="border rounded-2xl p-6 space-y-4">

          {/* INPUT DINAMICO */}
          <div>
            <label className="block font-medium mb-2">
              {steps[step].title}
            </label>

            <input
              className="w-full border rounded-lg px-4 py-3"
              value={(answers as any)[currentKey]}
              onChange={(e) =>
                setAnswers({ ...answers, [currentKey]: e.target.value })
              }
              placeholder="Inserisci valore"
            />

            {touched && !canGoNext && (
              <p className="text-sm text-red-600 mt-2">
                Compila correttamente il campo.
              </p>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={prev}
              disabled={step === 0}
              className="px-4 py-2 border rounded-lg disabled:opacity-40"
            >
              Indietro
            </button>

            <button
              onClick={next}
              className="px-5 py-3 bg-black text-white rounded-lg"
            >
              {isLast ? "Completa" : "Avanti"}
            </button>
          </div>
        </div>

        {showResult && (
          <div className="mt-10 border rounded-2xl p-6">
            <h3 className="text-2xl font-bold mb-4">Risultato</h3>

            <div className="mb-6">
              <div className="text-sm text-gray-500">Score</div>
              <div className="text-4xl font-bold">{score}/100</div>
              <div className="text-lg mt-1">Livello: {livello}</div>
            </div>

            <div className="mb-6">
              <div className="text-sm text-gray-500">
                Perdita potenziale stimata / mese
              </div>
              <div className="text-2xl font-semibold">
                € {perditaStimata.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
