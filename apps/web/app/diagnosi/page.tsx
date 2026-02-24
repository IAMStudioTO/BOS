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

/**
 * 15–20 domande: business-oriented, design-first, con microdescrizione.
 * Nota: upload file per ora SOLO selezione (non upload reale), ma salviamo i nomi dentro rawAnswers.
 */
const questions: Question[] = [
  {
    id: "sitoUrl",
    question: "Sito o link principale (anche Instagram / marketplace)",
    description:
      "Ci serve per leggere credibilità, chiarezza e coerenza tra touchpoint. Anche un link va benissimo.",
    type: "text",
    placeholder: "https://…",
    required: false,
  },
  {
    id: "settore",
    question: "Settore / categoria",
    description:
      "Serve per contestualizzare il livello di fiducia richiesto dal mercato e il tipo di estetica attesa.",
    type: "text",
    placeholder: "Es. Food, Industria, Tech, Retail…",
    required: true,
  },

  {
    id: "riconoscibilita",
    question: "Quanto è riconoscibile oggi il tuo brand nel tuo mercato?",
    description:
      "Se vedessi un tuo contenuto senza logo, capiresti subito che siete voi? Se no, state pagando in attenzione e fiducia.",
    type: "radio",
    required: true,
    options: [
      { label: "Molto riconoscibile", value: "alta" },
      { label: "Abbastanza", value: "media" },
      { label: "Poco", value: "bassa" },
      { label: "Non saprei", value: "non_so" },
    ],
  },
  {
    id: "logo",
    question: "Il logo oggi comunica identità o è solo un segno grafico?",
    description:
      "Un logo efficace porta con sé significato e posizionamento. Un segno “carino” spesso non regge quando il brand cresce.",
    type: "radio",
    required: true,
    options: [
      { label: "Comunica identità/posizionamento", value: "strategico" },
      { label: "È più un segno grafico", value: "grafico" },
      { label: "Non saprei", value: "non_so" },
    ],
  },
  {
    id: "sistema_visivo",
    question: "Esiste un sistema visivo (colori, font, layout, regole d’uso)?",
    description:
      "Senza sistema, ogni nuovo materiale crea incoerenza. E l’incoerenza fa sembrare l’azienda più piccola/fragile.",
    type: "radio",
    required: true,
    options: [
      { label: "Sì, definito e rispettato", value: "si" },
      { label: "Parziale / non sempre rispettato", value: "parziale" },
      { label: "No", value: "no" },
    ],
  },
  {
    id: "coerenza_touchpoint",
    question:
      "Quanto è coerente il brand tra sito, social, preventivi, presentazioni, materiali stampati?",
    description:
      "Se ogni touchpoint sembra un’azienda diversa, il cliente percepisce instabilità e abbassa la fiducia.",
    type: "radio",
    required: true,
    options: [
      { label: "Molto coerente", value: "alta" },
      { label: "Abbastanza", value: "media" },
      { label: "Poco", value: "bassa" },
      { label: "Disordinato / incoerente", value: "disordinato" },
    ],
  },
  {
    id: "tono_voce",
    question: "Tone of Voice definito e coerente?",
    description:
      "Tone of Voice = come il brand parla (tono, parole, stile). Se cambia spesso, il brand perde personalità e autorevolezza.",
    type: "radio",
    required: true,
    options: [
      { label: "Sì", value: "si" },
      { label: "Parziale", value: "parziale" },
      { label: "No", value: "no" },
      { label: "Non saprei", value: "non_so" },
    ],
  },
  {
    id: "premium",
    question: "Il design comunica il livello di prezzo/qualità che chiedi?",
    description:
      "Se chiedi premium ma sembri standard, il cliente negozia: non perché è cattivo, ma perché il design non sostiene la promessa.",
    type: "radio",
    required: true,
    options: [
      { label: "Sì, comunica premium", value: "si" },
      { label: "In parte", value: "parziale" },
      { label: "No", value: "no" },
    ],
  },
  {
    id: "ux_guidata",
    question: "Sito/app: è una guida che riduce dubbi o una vetrina che mostra?",
    description:
      "Una guida porta il cliente a capire e decidere. Una vetrina informa, ma spesso non converte.",
    type: "radio",
    required: true,
    options: [
      { label: "Guida (esperienza progettata)", value: "guida" },
      { label: "Più vetrina che guida", value: "vetrina" },
      { label: "Non saprei", value: "non_so" },
    ],
  },
  {
    id: "gerarchia",
    question: "Gerarchia visiva chiara nei materiali e sul sito?",
    description:
      "Gerarchia = capire subito cosa conta. Se l’occhio non capisce, la mente si affatica e abbandona.",
    type: "radio",
    required: true,
    options: [
      { label: "Chiara", value: "chiara" },
      { label: "Abbastanza", value: "media" },
      { label: "Confusa", value: "confusa" },
      { label: "Non saprei", value: "non_so" },
    ],
  },
  {
    id: "credibilita",
    question:
      "Hai prove di credibilità forti e visibili (case study, numeri, certificazioni, recensioni)?",
    description:
      "Se non si vede una prova, il cliente riempie i vuoti con dubbi. E i dubbi rallentano o bloccano la decisione.",
    type: "radio",
    required: true,
    options: [
      { label: "Sì, ben visibili", value: "si" },
      { label: "Ci sono ma sono deboli", value: "debole" },
      { label: "Quasi nulla", value: "no" },
    ],
  },
  {
    id: "distinzione",
    question: "Rispetto ai competitor, sembri diverso o sembri uguale?",
    description:
      "Se sembri uguale, il cliente sceglie sul prezzo. Se sembri diverso (bene), scegli sul valore.",
    type: "radio",
    required: true,
    options: [
      { label: "Chiaramente diverso", value: "diverso" },
      { label: "Un po’ diverso", value: "parziale" },
      { label: "Molto simile / indistinguibile", value: "uguale" },
      { label: "Non saprei", value: "non_so" },
    ],
  },
  {
    id: "packaging",
    question:
      "Se avete packaging/prodotto fisico: aumenta percezione di valore o è solo funzionale?",
    description:
      "Il packaging è spesso il primo contatto “fisico”: se è neutro, state regalando valore al competitor.",
    type: "radio",
    required: true,
    options: [
      { label: "Aumenta valore", value: "valore" },
      { label: "Neutro", value: "neutro" },
      { label: "Solo funzionale", value: "funzionale" },
      { label: "Non applicabile", value: "na" },
    ],
  },
  {
    id: "scalabilita",
    question:
      "Se domani scalate (nuovi prodotti/mercati), il sistema visivo regge o collassa?",
    description:
      "Un sistema forte cresce con voi. Un sistema debole costringe a rifare tutto quando siete sotto pressione.",
    type: "radio",
    required: true,
    options: [
      { label: "Regge", value: "si" },
      { label: "Ho dubbi", value: "dubbi" },
      { label: "Collassa / non regge", value: "no" },
    ],
  },
  {
    id: "dolore",
    question: "Qual è il problema più costoso oggi (in tempo, vendite o reputazione)?",
    description:
      "Qui vogliamo la verità operativa: cosa vi fa perdere tempo ogni settimana o vi indebolisce nelle trattative.",
    type: "text",
    required: true,
    placeholder:
      "Es. materiali incoerenti, sito poco credibile, packaging debole, preventivi brutti…",
  },
  {
    id: "obiettivo",
    question: "Se potessi sistemare UNA cosa nei prossimi 90 giorni, quale sarebbe?",
    description:
      "Questo ci dice la priorità reale. Nel report ti diamo un percorso pratico per arrivarci senza caos.",
    type: "text",
    required: true,
    placeholder: "Es. rifare identità, migliorare sito, creare packaging premium…",
  },
  {
    id: "materiali",
    question: "Carica logo / packaging / screenshot sito / materiali (facoltativo)",
    description:
      "Per ora raccogliamo i nomi dei file. Nello step successivo abilitiamo upload reale su storage.",
    type: "file",
    required: false,
  },
];

export default function DiagnosiPage() {
  const totalSteps = questions.length;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [gate, setGate] = useState(false);

  // ultima pagina: SOLO email + messaggio
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [doneMsg, setDoneMsg] = useState("");

  const current = questions[step];
  const currentValue = answers[current.id];

  const progressPct = useMemo(() => {
    const v = ((step + 1) / totalSteps) * 100;
    return Math.max(0, Math.min(100, v));
  }, [step, totalSteps]);

  const isAnswered = useMemo(() => {
    if (!current.required) return true;

    const v = currentValue;
    if (current.type === "radio") return typeof v === "string" && v.length > 0;
    if (current.type === "text") return typeof v === "string" && v.trim().length > 1;
    if (current.type === "file") return true; // file facoltativo o richiesto: per ora non blocchiamo
    return false;
  }, [current.required, current.type, currentValue]);

  function setAnswer(value: any) {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  }

  function goNext() {
    if (!isAnswered) return;
    if (step < totalSteps - 1) setStep((s) => s + 1);
    else setGate(true);
  }

  function goBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  function toNumberSafe(v: any, fallback: number) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  async function submitEmail() {
    setDoneMsg("");
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setDoneMsg("Inserisci una email valida.");
      return;
    }

    setSending(true);

    // Prepara rawAnswers senza file binari
    const rawAnswers: Record<string, any> = { ...answers };

    if (rawAnswers.materiali instanceof FileList) {
      rawAnswers.materiali = Array.from(rawAnswers.materiali).map((f) => f.name);
    }

    // Payload richiesto da API (minimo per passare schema)
    // Non chiediamo questi campi nel form: li mettiamo neutri in raccolta
    const payload = {
      email: trimmed,
      sitoUrl: String(answers.sitoUrl || ""),
      settore: String(answers.settore || "Non specificato"),
      ticketMedio: 0,
      leadMese: 0,
      convRate: null as null,
      rawAnswers,
    };

    try {
      const r = await fetch(`${API_BASE}/diagnostic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!r.ok) {
        const txt = await r.text();
        throw new Error(txt || "Request failed");
      }

      // ✅ Non mostriamo nessun risultato: solo messaggio
      setDoneMsg("Analisi avviata. Riceverai il report il prima possibile.");
    } catch {
      setDoneMsg("Errore durante l’invio. Riprova tra poco.");
    } finally {
      setSending(false);
    }
  }

  // ULTIMA PAGINA: SOLO EMAIL
  if (gate) {
    return (
      <main className="min-h-screen bg-white text-black flex items-center justify-center px-6 py-12">
        <div className="max-w-xl w-full">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Ricevi il report completo via email</h1>
            <p className="text-gray-600 mt-2 leading-7">
              Ti invieremo un’analisi professionale con criticità, priorità e azioni concrete di design.
            </p>
          </div>

          <div className="border rounded-2xl p-6">
            <label className="block text-sm font-medium mb-2">
              Email
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
              {sending ? "Invio in corso..." : "Avvia analisi"}
            </button>

            {doneMsg && (
              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-700">{doneMsg}</p>
              </div>
            )}

            <p className="text-xs text-gray-400 mt-4">
              Nessuno spam. Useremo la tua email solo per gestire l’invio del report.
            </p>
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

  // FORM
  return (
    <main className="min-h-screen bg-white text-black flex items-center justify-center px-6 py-12">
      <div className="max-w-xl w-full">
        {/* Header + Progress */}
        <div className="mb-8">
          <div className="flex items-baseline justify-between gap-3">
            <h1 className="text-2xl font-bold">Diagnosi Design & Brand</h1>
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
            Domande mirate. Output pragmatico. Nessun “quiz”.
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
              {current.required && (
                <p className="text-xs text-gray-400 mt-2">
                  Seleziona un’opzione per proseguire.
                </p>
              )}
            </div>
          )}

          {current.type === "text" && (
            <input
              value={typeof currentValue === "string" ? currentValue : ""}
              onChange={(e) => setAnswer(e.target.value)}
              className="border px-4 py-3 rounded-xl w-full"
              placeholder={current.placeholder || "Scrivi qui…"}
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
                Puoi selezionare più file (logo, packaging, screenshot, brochure).
              </p>

              {currentValue instanceof FileList && currentValue.length > 0 && (
                <div className="mt-3 text-sm text-gray-600">
                  <p className="font-medium">Selezionati:</p>
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

          {/* Footer */}
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
              {step === totalSteps - 1 ? "Continua" : "Vai avanti"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
