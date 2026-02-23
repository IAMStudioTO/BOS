"use client";

import { useMemo, useState } from "react";

type Answers = {
  settore: string;
  sitoUrl: string;
  ticketMedio: string;
  leadMese: string;
  convRate: string;
  valueProp: string;
  specializzazione: string;
  sitoComunicaSpec: string;
  proof: string;
  processo: string;
  materiale: string;
  kpi: string;
  decisioni: string;
  decisionMaker: string;
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

export default function Diagnosi() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initial);
  const [email, setEmail] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [touched, setTouched] = useState(false);

  const steps = useMemo(
    () => [
      "settore",
      "ticketMedio",
      "leadMese",
      "convRate",
      "valueProp",
      "specializzazione",
      "sitoComunicaSpec",
      "proof",
      "processo",
      "materiale",
      "kpi",
      "decisioni",
      "decisionMaker",
    ],
    []
  );

  const totalSteps = steps.length;
  const currentKey = steps[step] as keyof Answers;
  const isLast = step === totalSteps - 1;

  const canGoNext = answers[currentKey] !== "";

  function next() {
    setTouched(true);
    if (!canGoNext) return;
    setTouched(false);
    if (!isLast) setStep(step + 1);
  }

  function prev() {
    if (step > 0) setStep(step - 1);
  }

  /* =====================
     SCORING ENGINE
  ====================== */

  const score = (() => {
    let s = 100;
    if (answers.specializzazione === "no") s -= 10;
    if (answers.proof === "nessuno") s -= 15;
    if (answers.processo === "no") s -= 10;
    if (answers.kpi === "no") s -= 10;
    if (answers.decisioni === "intuitive") s -= 10;
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
    return Math.round(ticket * lead * conv * 0.2);
  })();

  /* ===================== */

  const showEmailGate = isLast && !unlocked;
  const showResult = unlocked;

  return (
    <main className="min-h-screen bg-white text-black px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Diagnosi Strutturale</h1>

        {!showEmailGate && !showResult && (
          <div className="border rounded-2xl p-6 space-y-4">
            <label className="block font-medium">
              {currentKey}
            </label>

            <input
              className="w-full border rounded-lg px-4 py-3"
              value={answers[currentKey]}
              onChange={(e) =>
                setAnswers({ ...answers, [currentKey]: e.target.value })
              }
            />

            {touched && !canGoNext && (
              <p className="text-sm text-red-600">
                Compila il campo per continuare.
              </p>
            )}

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
                {isLast ? "Calcola risultato" : "Avanti"}
              </button>
            </div>
          </div>
        )}

        {showEmailGate && (
          <div className="border rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold">
              Ricevi il report completo
            </h2>

            <input
              type="email"
              placeholder="Inserisci la tua email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-4 py-3"
            />

            <button
              onClick={() => {
                if (email.includes("@")) {
                  setUnlocked(true);
                }
              }}
              className="w-full bg-black text-white py-3 rounded-lg"
            >
              Sblocca risultato
            </button>

            <p className="text-xs text-gray-400">
              Riceverai anche il report PDF personalizzato.
            </p>
          </div>
        )}

        {showResult && (
          <div className="mt-10 border rounded-2xl p-6">
            <h3 className="text-2xl font-bold mb-4">Risultato</h3>

            <div className="mb-4">
              <div className="text-sm text-gray-500">Score</div>
              <div className="text-4xl font-bold">{score}/100</div>
              <div>Livello: {livello}</div>
            </div>

            <div>
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
