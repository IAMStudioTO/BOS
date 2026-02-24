"use client";

import { useMemo, useState } from "react";

type QType = "text" | "textarea" | "select" | "url" | "number";

type Question = {
  id: string; // chiave salvata in rawAnswers
  title: string;
  micro: string;
  type: QType;
  placeholder?: string;
  options?: { value: string; label: string }[];
  optional?: boolean;
};

function classNames(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidUrlLoose(url: string) {
  const u = url.trim();
  if (!u) return false;
  try {
    const parsed = new URL(u);
    return Boolean(parsed.protocol && parsed.host);
  } catch {
    return false;
  }
}

export default function DiagnosiPage() {
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "https://bos-v6cz.onrender.com";

  const questions: Question[] = useMemo(
    () => [
      {
        id: "percezione_attuale",
        type: "textarea",
        title: "1) In una frase: oggi come pensi che il mercato percepisca il tuo brand?",
        micro:
          "Questa risposta è il punto di partenza: spesso la distanza tra “come ci vediamo” e “come ci vedono” è il vero costo invisibile.",
        placeholder: "Es: “Siamo premium ma non si vede” / “Siamo solidi ma sembriamo piccoli” / “Siamo confusi”…",
      },

      {
        id: "oggi_scelto_per",
        type: "select",
        title: "2) Oggi sei scelto per la tua identità o per comodità?",
        micro:
          "Se un cliente ti sceglie ma non saprebbe spiegare perché, il design non sta proteggendo il tuo posizionamento.",
        options: [
          { value: "identita_forte", label: "Identità forte" },
          { value: "relazione", label: "Relazione personale" },
          { value: "prezzo", label: "Prezzo" },
          { value: "non_so", label: "Non lo so con certezza" },
        ],
      },

      {
        id: "logo_significato",
        type: "select",
        title: "3) Il tuo logo è un simbolo che rappresenta una visione o è solo un segno grafico?",
        micro:
          "Un simbolo racconta chi sei. Un segno riempie uno spazio. La differenza si vede in 3 secondi.",
        options: [
          { value: "simbolo", label: "È un simbolo con significato chiaro" },
          { value: "ibrido", label: "È a metà: qualcosa comunica, ma non è forte" },
          { value: "segno", label: "È più un segno grafico che una visione" },
          { value: "non_so", label: "Non lo so / non ci ho mai pensato" },
        ],
      },

      {
        id: "sistema_visivo",
        type: "select",
        title: "4) Il tuo brand ha un sistema visivo coerente o è cresciuto “nel tempo”?",
        micro:
          "Quando non esiste un sistema, ogni nuovo materiale indebolisce l’identità invece di rafforzarla.",
        options: [
          { value: "strutturato", label: "Sistema strutturato" },
          { value: "parziale", label: "Parziale" },
          { value: "spontaneo", label: "Evoluzione spontanea" },
          { value: "inesistente", label: "Non esiste un sistema" },
        ],
      },

      {
        id: "due_diligence_30s",
        type: "select",
        title: "5) Se un investitore guardasse il tuo brand per 30 secondi, lo percepirebbe all’altezza della tua ambizione?",
        micro:
          "Il design è la prima due diligence visiva: prima di numeri e pitch, passa l’impatto.",
        options: [
          { value: "si", label: "Sì" },
          { value: "in_parte", label: "In parte" },
          { value: "no", label: "No" },
        ],
      },

      {
        id: "anni_ultimo_refresh",
        type: "number",
        title: "6) Da quanti anni non evolvi la tua identità visiva?",
        micro:
          "Il mercato evolve ogni giorno. Se il tuo brand è fermo, sta già arretrando (anche se fattura).",
        placeholder: "Es: 0, 2, 5, 10…",
      },

      {
        id: "link_sito",
        type: "url",
        title: "7) Link al tuo sito / e-commerce / landing principale",
        micro:
          "Qui valutiamo gerarchia visiva, coerenza, qualità percepita e frizioni (confusione = abbandono).",
        placeholder: "https://…",
      },

      {
        id: "link_prodotto",
        type: "url",
        title: "8) Link al prodotto/servizio principale (pagina più importante)",
        micro:
          "Valutiamo come il design difende il valore: se il prodotto è buono ma “non sembra”, perdi margine.",
        placeholder: "https://…",
        optional: true,
      },

      {
        id: "link_packaging",
        type: "url",
        title: "9) Link a packaging / catalogo / gallery (anche Drive/Notion va bene)",
        micro:
          "L’identità non è ciò che pensi di avere. È ciò che si vede. E ciò che si vede vende (o sconta).",
        placeholder: "https://…",
        optional: true,
      },

      {
        id: "ux_intento",
        type: "select",
        title: "10) Il tuo sito/app è progettato come esperienza o come vetrina?",
        micro:
          "Una vetrina mostra. Un’esperienza guida, convince e trasforma (senza stressare l’utente).",
        options: [
          { value: "esperienza", label: "Esperienza progettata" },
          { value: "vetrina", label: "Vetrina estetica" },
          { value: "non_so", label: "Non saprei" },
        ],
      },

      {
        id: "ux_guida",
        type: "select",
        title: "11) Il percorso visivo guida l’utente o lo lascia decidere da solo?",
        micro:
          "Se l’utente deve capire da solo, stai già perdendo attenzione e fiducia.",
        options: [
          { value: "chiara", label: "Guida chiara" },
          { value: "parziale", label: "Parzialmente" },
          { value: "dispersivo", label: "È dispersivo" },
        ],
      },

      {
        id: "attrito_design",
        type: "select",
        title: "12) Il tuo design riduce attrito o lo crea?",
        micro:
          "Attrito = confusione, incoerenza, troppi stili, scarsa gerarchia. Ogni secondo di confusione è un passo verso l’abbandono.",
        options: [
          { value: "riduce", label: "Riduce attrito" },
          { value: "non_so", label: "Non so" },
          { value: "crea", label: "Probabilmente crea attrito" },
        ],
      },

      {
        id: "prezzo_coerente",
        type: "select",
        title: "13) Il tuo brand comunica il livello di prezzo che chiedi?",
        micro:
          "Se chiedi premium ma sembri standard, il cliente percepisce disallineamento e ti porta a trattare.",
        options: [
          { value: "si", label: "Sì" },
          { value: "in_parte", label: "Solo in parte" },
          { value: "no", label: "No" },
        ],
      },

      {
        id: "giustificare_prezzo",
        type: "select",
        title: "14) Ti è mai capitato di sentirti costretto a giustificare il prezzo?",
        micro:
          "Quando il design è forte, il prezzo si difende da solo. Quando è debole, il CEO diventa venditore.",
        options: [
          { value: "spesso", label: "Spesso" },
          { value: "a_volte", label: "A volte" },
          { value: "raramente", label: "Raramente" },
          { value: "mai", label: "Mai" },
        ],
      },

      {
        id: "sembriamo_piccoli",
        type: "select",
        title: "15) Ti è mai capitato di pensare: “Sembriamo più piccoli di quello che siamo”?",
        micro:
          "Molte aziende crescono economicamente ma restano visivamente piccole. E il mercato le tratta così.",
        options: [
          { value: "si", label: "Sì" },
          { value: "a_volte", label: "A volte" },
          { value: "no", label: "No" },
        ],
      },

      {
        id: "packaging_valore",
        type: "select",
        title: "16) Il tuo packaging aumenta la percezione di valore o protegge solo il prodotto?",
        micro:
          "Il packaging è spesso il primo contatto fisico con il brand. È un momento decisivo (e silenzioso).",
        options: [
          { value: "aumenta", label: "Aumenta valore" },
          { value: "neutro", label: "Neutro" },
          { value: "funzionale", label: "Solo funzionale" },
        ],
      },

      {
        id: "riconoscibile_competitor",
        type: "select",
        title: "17) Il tuo prodotto è riconoscibile a scaffale o online in mezzo ai competitor?",
        micro:
          "Se ti confondi, perdi prima ancora di essere scelto. Il design serve a NON essere intercambiabili.",
        options: [
          { value: "si", label: "Sì" },
          { value: "parziale", label: "Parzialmente" },
          { value: "no", label: "No" },
        ],
      },

      {
        id: "allineamento_3anni",
        type: "select",
        title: "18) L’identità attuale è allineata con dove vuoi portare il brand nei prossimi 3 anni?",
        micro:
          "L’ambizione senza struttura visiva è fragile: quando provi a scalare, l’identità cede.",
        options: [
          { value: "si", label: "Sì" },
          { value: "in_parte", label: "In parte" },
          { value: "no", label: "No" },
        ],
      },

      {
        id: "scalabilita_internazionale",
        type: "select",
        title: "19) Se dovessi scalare o entrare in un mercato internazionale, il tuo sistema visivo reggerebbe?",
        micro:
          "Un’identità forte è progettata per crescere. Una debole collassa sotto pressione (rebranding forzato).",
        options: [
          { value: "si", label: "Sì" },
          { value: "dubito", label: "Dubito" },
          { value: "no", label: "No" },
        ],
      },

      {
        id: "frase_12_mesi",
        type: "textarea",
        title: "20) Se nulla cambiasse nei prossimi 12 mesi, cosa accadrebbe al tuo brand?",
        micro:
          "La stagnazione non è neutrale: è regressione lenta. Questa risposta ci dice quanto è urgente intervenire.",
        placeholder: "Scrivi in modo diretto (anche 2 righe).",
      },
    ],
    []
  );

  const totalSteps = questions.length + 1; // +1 = email step
  const [step, setStep] = useState(0); // 0..questions.length (last = email)
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [doneMsg, setDoneMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const currentQ = step < questions.length ? questions[step] : null;
  const progress = Math.round(((step + 1) / totalSteps) * 100);

  function setAnswer(id: string, value: any) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function canGoNext() {
    if (!currentQ) return false;
    const v = answers[currentQ.id];

    if (currentQ.optional) return true;

    if (currentQ.type === "select") return typeof v === "string" && v.length > 0;
    if (currentQ.type === "number") return v !== undefined && v !== null && String(v).trim() !== "";
    if (currentQ.type === "url") return typeof v === "string" && isValidUrlLoose(v);
    if (currentQ.type === "text" || currentQ.type === "textarea")
      return typeof v === "string" && v.trim().length >= 2;

    return false;
  }

  function next() {
    if (step < questions.length && !canGoNext()) return;
    setErrMsg(null);
    setStep((s) => Math.min(s + 1, questions.length));
  }

  function back() {
    setErrMsg(null);
    setStep((s) => Math.max(0, s - 1));
  }

  async function submit() {
    setErrMsg(null);

    if (!isValidEmail(email)) {
      setErrMsg("Inserisci una email valida.");
      return;
    }

    setSubmitting(true);
    try {
      // payload MINIMO richiesto dall’API
      // - settore: non lo chiediamo qui (puoi aggiungerlo dopo), per ora mettiamo “N/D”
      // - ticketMedio/leadMese: 0 (modalità raccolta)
      const payload = {
        email: email.trim(),
        sitoUrl: String(answers.link_sito || "").trim(),
        settore: "N/D",
        ticketMedio: 0,
        leadMese: 0,
        convRate: null,
        rawAnswers: answers,
      };

      const res = await fetch(`${API_BASE}/diagnostic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrMsg(data?.error || "Errore invio. Riprova.");
        return;
      }

      setDoneMsg(
        "Analisi avviata. Riceverai il report il prima possibile."
      );
    } catch (e: any) {
      setErrMsg(e?.message || "Errore rete. Riprova.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-black flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-3xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {step < questions.length ? (
                <>
                  Domanda <b>{step + 1}</b> / <b>{questions.length}</b>
                </>
              ) : (
                <>
                  Ultimo step <b>(email)</b>
                </>
              )}
            </p>

            <p className="text-sm text-gray-500">{progress}%</p>
          </div>

          <div className="mt-3 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-black"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {doneMsg ? (
          <div className="border border-gray-200 rounded-2xl p-8">
            <h1 className="text-2xl font-bold">Perfetto.</h1>
            <p className="text-gray-700 mt-3">{doneMsg}</p>
            <p className="text-gray-500 mt-4 text-sm">
              Stiamo incrociando i dati con linee guida professionali di branding & design e con pattern competitivi di settore.
            </p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-2xl p-8">
            {step < questions.length && currentQ ? (
              <>
                <h1 className="text-2xl font-bold leading-snug">
                  {currentQ.title}
                </h1>
                <p className="text-gray-600 mt-3">{currentQ.micro}</p>

                <div className="mt-8">
                  {currentQ.type === "select" && currentQ.options ? (
                    <div className="grid gap-3">
                      {currentQ.options.map((opt) => {
                        const selected = answers[currentQ.id] === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setAnswer(currentQ.id, opt.value)}
                            className={classNames(
                              "text-left w-full rounded-xl border px-4 py-3 transition",
                              selected
                                ? "border-black bg-black text-white"
                                : "border-gray-200 hover:bg-gray-50"
                            )}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  ) : currentQ.type === "number" ? (
                    <input
                      key={currentQ.id}
                      type="number"
                      inputMode="numeric"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3"
                      placeholder={currentQ.placeholder || ""}
                      value={answers[currentQ.id] ?? ""}
                      onChange={(e) => setAnswer(currentQ.id, e.target.value)}
                    />
                  ) : currentQ.type === "url" ? (
                    <div className="grid gap-2">
                      <input
                        key={currentQ.id}
                        type="url"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3"
                        placeholder={currentQ.placeholder || "https://…"}
                        value={answers[currentQ.id] ?? ""}
                        onChange={(e) => setAnswer(currentQ.id, e.target.value)}
                      />
                      <p className="text-xs text-gray-500">
                        Inserisci un link completo (con https://)
                        {currentQ.optional ? " — opzionale" : ""}.
                      </p>
                    </div>
                  ) : currentQ.type === "textarea" ? (
                    <textarea
                      key={currentQ.id}
                      className="w-full min-h-[140px] border border-gray-200 rounded-xl px-4 py-3"
                      placeholder={currentQ.placeholder || ""}
                      value={answers[currentQ.id] ?? ""}
                      onChange={(e) => setAnswer(currentQ.id, e.target.value)}
                    />
                  ) : (
                    <input
                      key={currentQ.id}
                      type="text"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3"
                      placeholder={currentQ.placeholder || ""}
                      value={answers[currentQ.id] ?? ""}
                      onChange={(e) => setAnswer(currentQ.id, e.target.value)}
                    />
                  )}
                </div>

                {errMsg && (
                  <div className="mt-6 border border-red-200 bg-red-50 text-red-800 rounded-xl px-4 py-3">
                    {errMsg}
                  </div>
                )}

                <div className="mt-10 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={back}
                    disabled={step === 0}
                    className="rounded-xl border border-gray-200 px-5 py-3 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Indietro
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!canGoNext()) {
                        setErrMsg(
                          currentQ.type === "url"
                            ? "Inserisci un link valido (con https://)."
                            : "Completa la risposta per proseguire."
                        );
                        return;
                      }
                      next();
                    }}
                    className={classNames(
                      "rounded-xl px-6 py-3 font-medium transition",
                      canGoNext()
                        ? "bg-black text-white hover:opacity-90"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    )}
                  >
                    Avanti
                  </button>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold">Ricevi il report via email</h1>
                <p className="text-gray-600 mt-3">
                  Avviamo l’analisi incrociando le tue risposte con linee guida professionali di branding & design e pattern competitivi di settore.
                  Riceverai criticità, priorità e spunti concreti.
                </p>

                <div className="mt-8">
                  <label className="text-sm text-gray-600">Email</label>
                  <input
                    type="email"
                    className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3"
                    placeholder="nome@azienda.it"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {errMsg && (
                  <div className="mt-6 border border-red-200 bg-red-50 text-red-800 rounded-xl px-4 py-3">
                    {errMsg}
                  </div>
                )}

                <div className="mt-10 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={back}
                    className="rounded-xl border border-gray-200 px-5 py-3 hover:bg-gray-50"
                  >
                    Indietro
                  </button>

                  <button
                    type="button"
                    onClick={submit}
                    disabled={submitting}
                    className="rounded-xl bg-black text-white px-6 py-3 font-medium hover:opacity-90 disabled:opacity-60"
                  >
                    {submitting ? "Invio..." : "Avvia analisi"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        <p className="text-xs text-gray-400 mt-6">
          Nota: in questa fase raccogliamo dati per l’analisi. Il report completo verrà inviato appena disponibile.
        </p>
      </div>
    </main>
  );
}
