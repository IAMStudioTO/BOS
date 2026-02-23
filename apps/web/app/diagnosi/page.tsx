"use client";

import { useMemo, useState } from "react";

type Answers = {
  settore: string;
  sitoUrl: string;
  ticketMedio: string;
  leadMese: string;
  convRate: string; // può essere "non_so" o numero
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
  if (!s) return true; // campo opzionale
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
      { key: "ticketMedio", title: "Ticket medio" },
      { key: "leadMese", title: "Lead/mese" },
      { key: "convRate", title: "Conversione (se nota)" },
      { key: "valueProp", title: "Perché voi?" },
      { key: "specializzazione", title: "Specializzazione" },
      { key: "sitoComunicaSpec", title: "Sito: comunica specializzazione?" },
      { key: "proof", title: "Prove (casi studio)" },
      { key: "processo", title: "Processo esplicitato" },
      { key: "materiale", title: "Materiali standard" },
      { key: "kpi", title: "KPI mensili" },
      { key: "decisioni", title: "Decisioni" },
      { key: "decisionMaker", title: "Decision maker" },
    ],
    []
  );

  // NB: sono 14 "step items" perché abbiamo 12 domande + 2 di contesto (settore, sito)
  const totalSteps = steps.length;

  const canGoNext = useMemo(() => {
    const k = steps[step]?.key as keyof Answers;

    // validazioni base
    if (k === "settore") return answers.settore.trim().length >= 2;
    if (k === "sitoUrl") return isValidUrl(answers.sitoUrl.trim());
    if (k === "ticketMedio") return Number(answers.ticketMedio) > 0;
    if (k === "leadMese") return Number(answers.leadMese) >= 0 && answers.leadMese !== "";
    if (k === "convRate")
      return (
        answers.convRate === "non_so" ||
        (answers.convRate !== "" && Number(answers.convRate) >= 0 && Number(answers.convRate) <= 100)
      );
    if (k === "valueProp") return answers.valueProp.trim().length >= 10;
    if (k === "specializzazione") return answers.specializzazione !== "";
    if (k === "sitoComunicaSpec") return answers.sitoComunicaSpec !== "";
    if (k === "proof") return answers.proof !== "";
    if (k === "processo") return answers.processo !== "";
    if (k === "materiale") return answers.materiale !== "";
    if (k === "kpi") return answers.kpi !== "";
    if (k === "decisioni") return answers.decisioni !== "";
    if (k === "decisionMaker") return answers.decisionMaker !== "";

    return false;
  }, [answers, step, steps]);

  const progress = Math.round(((step + 1) / totalSteps) * 100);

  function next() {
    setTouched(true);
    if (!canGoNext) return;
    setTouched(false);
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  }

  function prev() {
    setTouched(false);
    setStep((s) => Math.max(s - 1, 0));
  }

  const isLast = step === totalSteps - 1;

  const currentKey = steps[step]?.key as keyof Answers;

  // Placeholder risultato immediato (lo renderemo reale nel prossimo step con scoring)
  const showResult = false;

  return (
    <main className="min-h-screen bg-white text-black px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Diagnosi Strutturale</h1>
          <p className="text-gray-600 mt-2">
            10–12 domande essenziali. Output: score + priorità + report PDF via email.
          </p>

          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>
                Step {step + 1} / {totalSteps}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-2 bg-black" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">{steps[step].title}</h2>

          {/* RENDER CAMPO PER STEP */}
          {currentKey === "settore" && (
            <div>
              <label className="block mb-2 font-medium">Settore (es. impiantistica, meccanica B2B, SaaS)</label>
              <input
                value={answers.settore}
                onChange={(e) => setAnswers({ ...answers, settore: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
                placeholder="Inserisci settore"
              />
              {touched && !canGoNext && (
                <p className="text-sm text-red-600 mt-2">Inserisci un settore valido.</p>
              )}
            </div>
          )}

          {currentKey === "sitoUrl" && (
            <div>
              <label className="block mb-2 font-medium">Sito (opzionale)</label>
              <input
                value={answers.sitoUrl}
                onChange={(e) => setAnswers({ ...answers, sitoUrl: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
                placeholder="https://..."
              />
              {touched && !canGoNext && (
                <p className="text-sm text-red-600 mt-2">URL non valido (usa https://...).</p>
              )}
              <p className="text-sm text-gray-500 mt-2">Serve per tentare il logo (favicon) e contestualizzare.</p>
            </div>
          )}

          {currentKey === "ticketMedio" && (
            <div>
              <label className="block mb-2 font-medium">Ticket medio (€)</label>
              <input
                type="number"
                value={answers.ticketMedio}
                onChange={(e) => setAnswers({ ...answers, ticketMedio: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
                placeholder="Es. 5000"
              />
              {touched && !canGoNext && (
                <p className="text-sm text-red-600 mt-2">Inserisci un numero maggiore di 0.</p>
              )}
            </div>
          )}

          {currentKey === "leadMese" && (
            <div>
              <label className="block mb-2 font-medium">Lead medi al mese</label>
              <input
                type="number"
                value={answers.leadMese}
                onChange={(e) => setAnswers({ ...answers, leadMese: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
                placeholder="Es. 10"
              />
              {touched && !canGoNext && (
                <p className="text-sm text-red-600 mt-2">Inserisci un numero (anche 0 se non tracciati).</p>
              )}
            </div>
          )}

          {currentKey === "convRate" && (
            <div className="space-y-3">
              <label className="block mb-2 font-medium">Tasso di conversione lead → cliente</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={answers.convRate === "non_so" ? "" : answers.convRate}
                  onChange={(e) => setAnswers({ ...answers, convRate: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-3"
                  placeholder="Es. 12 (in %)"
                  disabled={answers.convRate === "non_so"}
                />
                <button
                  type="button"
                  onClick={() =>
                    setAnswers({
                      ...answers,
                      convRate: answers.convRate === "non_so" ? "" : "non_so",
                    })
                  }
                  className="border border-gray-300 rounded-lg px-4 py-3"
                >
                  {answers.convRate === "non_so" ? "Lo so" : "Non lo so"}
                </button>
              </div>
              {touched && !canGoNext && (
                <p className="text-sm text-red-600 mt-2">Inserisci una % tra 0 e 100 oppure seleziona “Non lo so”.</p>
              )}
            </div>
          )}

          {currentKey === "valueProp" && (
            <div>
              <label className="block mb-2 font-medium">In 1 frase: perché un cliente dovrebbe scegliere voi?</label>
              <textarea
                value={answers.valueProp}
                onChange={(e) => setAnswers({ ...answers, valueProp: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 min-h-28"
                placeholder="Es. Installiamo impianti fotovoltaici industriali con tempi certi e garanzia completa..."
              />
              {touched && !canGoNext && (
                <p className="text-sm text-red-600 mt-2">Scrivi almeno 10 caratteri (frase completa).</p>
              )}
            </div>
          )}

          {currentKey === "specializzazione" && (
            <RadioBlock
              label="Siete specializzati in un segmento preciso?"
              value={answers.specializzazione}
              onChange={(v) => setAnswers({ ...answers, specializzazione: v as any })}
              options={[
                { value: "si", label: "Sì" },
                { value: "parziale", label: "Parzialmente" },
                { value: "no", label: "No" },
              ]}
              error={touched && !canGoNext ? "Seleziona una risposta." : ""}
            />
          )}

          {currentKey === "sitoComunicaSpec" && (
            <RadioBlock
              label="Il sito comunica chiaramente questa specializzazione?"
              value={answers.sitoComunicaSpec}
              onChange={(v) => setAnswers({ ...answers, sitoComunicaSpec: v as any })}
              options={[
                { value: "si", label: "Sì" },
                { value: "parziale", label: "Parzialmente" },
                { value: "no", label: "No" },
              ]}
              error={touched && !canGoNext ? "Seleziona una risposta." : ""}
            />
          )}

          {currentKey === "proof" && (
            <RadioBlock
              label="Avete prove di risultato (case study / testimonial)?"
              value={answers.proof}
              onChange={(v) => setAnswers({ ...answers, proof: v as any })}
              options={[
                { value: "casi_studio", label: "Case study dettagliati" },
                { value: "testimonianze", label: "Solo testimonianze" },
                { value: "nessuno", label: "Nessuno" },
              ]}
              error={touched && !canGoNext ? "Seleziona una risposta." : ""}
            />
          )}

          {currentKey === "processo" && (
            <RadioBlock
              label="Avete un processo di lavoro esplicitato (step, modalità, tempi)?"
              value={answers.processo}
              onChange={(v) => setAnswers({ ...answers, processo: v as any })}
              options={[
                { value: "si", label: "Sì" },
                { value: "no", label: "No" },
              ]}
              error={touched && !canGoNext ? "Seleziona una risposta." : ""}
            />
          )}

          {currentKey === "materiale" && (
            <RadioBlock
              label="Il materiale commerciale è standardizzato?"
              value={answers.materiale}
              onChange={(v) => setAnswers({ ...answers, materiale: v as any })}
              options={[
                { value: "si", label: "Sì" },
                { value: "no", label: "No" },
                { value: "variabile", label: "Ogni volta diverso" },
              ]}
              error={touched && !canGoNext ? "Seleziona una risposta." : ""}
            />
          )}

          {currentKey === "kpi" && (
            <RadioBlock
              label="Monitorate KPI commerciali mensilmente?"
              value={answers.kpi}
              onChange={(v) => setAnswers({ ...answers, kpi: v as any })}
              options={[
                { value: "si", label: "Sì" },
                { value: "no", label: "No" },
              ]}
              error={touched && !canGoNext ? "Seleziona una risposta." : ""}
            />
          )}

          {currentKey === "decisioni" && (
            <RadioBlock
              label="Le decisioni strategiche sono:"
              value={answers.decisioni}
              onChange={(v) => setAnswers({ ...answers, decisioni: v as any })}
              options={[
                { value: "pianificate", label: "Pianificate" },
                { value: "reattive", label: "Reattive" },
                { value: "intuitive", label: "Intuitive" },
              ]}
              error={touched && !canGoNext ? "Seleziona una risposta." : ""}
            />
          )}

          {currentKey === "decisionMaker" && (
            <RadioBlock
              label="Chi prende le decisioni?"
              value={answers.decisionMaker}
              onChange={(v) => setAnswers({ ...answers, decisionMaker: v as any })}
              options={[
                { value: "uno", label: "Una persona" },
                { value: "piu", label: "Più persone" },
                { value: "non_chiaro", label: "Non è chiaro" },
              ]}
              error={touched && !canGoNext ? "Seleziona una risposta." : ""}
            />
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={prev}
              disabled={step === 0}
              className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-40"
            >
              Indietro
            </button>

            <button
              type="button"
              onClick={next}
              className="px-5 py-3 rounded-lg bg-black text-white"
            >
              {isLast ? "Completa" : "Avanti"}
            </button>
          </div>
        </div>

        {showResult && (
          <div className="mt-10 border border-gray-200 rounded-2xl p-6">
            <h3 className="text-xl font-semibold">Risultato (placeholder)</h3>
            <pre className="text-sm text-gray-700 mt-4 overflow-auto">
              {JSON.stringify(answers, null, 2)}
            </pre>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-8">
          Dati usati per generare un report PDF personalizzato. Nessuna condivisione con terzi.
        </p>
      </div>
    </main>
  );
}

function RadioBlock(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  error?: string;
}) {
  return (
    <div>
      <div className="block mb-3 font-medium">{props.label}</div>
      <div className="space-y-2">
        {props.options.map((o) => (
          <label
            key={o.value}
            className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer ${
              props.value === o.value ? "border-black" : "border-gray-300"
            }`}
          >
            <input
              type="radio"
              name={props.label}
              value={o.value}
              checked={props.value === o.value}
              onChange={() => props.onChange(o.value)}
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      {props.error ? <p className="text-sm text-red-600 mt-2">{props.error}</p> : null}
    </div>
  );
}
