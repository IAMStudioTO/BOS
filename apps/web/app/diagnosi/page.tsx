"use client";

import { useState } from "react";

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
      "Un simbolo racconta chi sei. Un segno riempie uno spazio.",
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
    question:
      "Il tuo brand comunica il livello di prezzo che chiedi?",
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
    description:
      "Una vetrina mostra. Un’esperienza guida e convince.",
    type: "radio",
    options: [
      { label: "Esperienza progettata", value: "esperienza" },
      { label: "Vetrina", value: "vetrina" },
      { label: "Non saprei", value: "non_so" },
    ],
  },
  {
    id: "attrito",
    question:
      "Il tuo design riduce attrito o lo crea?",
    description:
      "Ogni secondo di confusione è un passo verso l’abbandono.",
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
    description:
      "L’ambizione senza struttura visiva è fragile.",
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
    description:
      "L’identità non è ciò che pensi di avere. È ciò che si vede.",
    type: "file",
  },
];

export default function DiagnosiPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [email, setEmail] = useState("");
  const [completed, setCompleted] = useState(false);

  const current = questions[step];

  const handleAnswer = (value: any) => {
    setAnswers({ ...answers, [current.id]: value });
  };

  const next = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setCompleted(true);
    }
  };

  const calculateScore = () => {
    let score = 100;

    if (answers.riconoscibilita === "bassa") score -= 15;
    if (answers.logo === "grafico") score -= 10;
    if (answers.sistema_visivo === "no") score -= 15;
    if (answers.prezzo === "no") score -= 10;
    if (answers.attrito === "crea") score -= 15;
    if (answers.ambizione === "no") score -= 10;

    return Math.max(score, 0);
  };

  if (completed) {
    const score = calculateScore();

    return (
      <main className="min-h-screen bg-white text-black flex items-center justify-center px-6">
        <div className="max-w-xl text-center">
          <h1 className="text-3xl font-bold mb-6">
            Risultato Diagnosi
          </h1>

          <p className="text-xl mb-4">
            Score: {score}/100
          </p>

          <input
            type="email"
            placeholder="Inserisci la tua email per ricevere il report"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border px-4 py-2 rounded w-full mb-4"
          />

          <button className="bg-black text-white px-6 py-3 rounded">
            Ricevi Report
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-black flex items-center justify-center px-6">
      <div className="max-w-xl w-full">
        <h1 className="text-2xl font-bold mb-6">
          Diagnosi Identità e Design
        </h1>

        <div className="mb-4">
          <p className="font-medium mb-2">{current.question}</p>
          {current.description && (
            <p className="text-sm text-gray-500 mb-4">
              {current.description}
            </p>
          )}
        </div>

        {current.type === "radio" &&
          current.options?.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleAnswer(opt.value)}
              className="block w-full border px-4 py-2 mb-2 rounded hover:bg-gray-100"
            >
              {opt.label}
            </button>
          ))}

        {current.type === "text" && (
          <input
            type="text"
            onChange={(e) => handleAnswer(e.target.value)}
            className="border px-4 py-2 rounded w-full"
          />
        )}

        {current.type === "number" && (
          <input
            type="number"
            onChange={(e) => handleAnswer(e.target.value)}
            className="border px-4 py-2 rounded w-full"
          />
        )}

        {current.type === "file" && (
          <input
            type="file"
            onChange={(e) => handleAnswer(e.target.files)}
            className="border px-4 py-2 rounded w-full"
          />
        )}

        <button
          onClick={next}
          className="mt-6 bg-black text-white px-6 py-3 rounded"
        >
          Continua
        </button>
      </div>
    </main>
  );
}
