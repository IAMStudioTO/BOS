"use client";

import { useState } from "react";

type AnswerMap = Record<string, any>;

const questions = [
  // 1️⃣ DOMANDA APERTA STRATEGICA
  {
    key: "percezione_attuale",
    title:
      "Se oggi dovessi spiegare a un investitore perché il tuo brand è diverso, cosa diresti?",
    description:
      "Il modo in cui descrivi il tuo brand rivela spesso il divario tra identità percepita e identità reale.",
    type: "text",
  },

  // 2️⃣
  {
    key: "oggi_scelto_per",
    title: "Oggi i tuoi clienti ti scelgono principalmente per:",
    description:
      "Se non è chiaro perché vieni scelto, il design non sta guidando la percezione.",
    options: [
      { label: "Identità forte", value: "identita_forte" },
      { label: "Relazione personale", value: "relazione_personale" },
      { label: "Prezzo", value: "prezzo" },
      { label: "Non lo so con certezza", value: "non_lo_so" },
    ],
  },

  {
    key: "differenziazione_percepita",
    title: "Ti senti realmente diverso dai tuoi competitor visivamente?",
    description:
      "Se ti confondi, perdi prima ancora di essere valutato.",
    options: [
      { label: "Molto", value: "molto" },
      { label: "Abbastanza", value: "abbastanza" },
      { label: "Poco", value: "poco" },
      { label: "Per niente", value: "per_niente" },
    ],
  },

  {
    key: "logo_visione",
    title: "Il tuo logo rappresenta una visione o è solo un segno grafico?",
    description:
      "Un simbolo costruisce memoria. Un segno riempie spazio.",
    options: [
      { label: "Simbolo strategico", value: "simbolo_strategico" },
      { label: "Buon segno grafico", value: "buon_segno" },
      { label: "Solo grafica", value: "solo_grafica" },
      { label: "Non lo so", value: "non_lo_so" },
    ],
  },

  {
    key: "sistema_visivo",
    title:
      "Esiste un sistema visivo strutturato (colori, font, regole, griglie)?",
    description:
      "Senza sistema, ogni nuovo materiale indebolisce l’identità.",
    options: [
      { label: "Sistema strutturato", value: "sistema_strutturato" },
      { label: "Parziale", value: "parziale" },
      { label: "Evoluzione spontanea", value: "evoluzione_spontanea" },
      { label: "Non esiste un sistema", value: "non_esiste" },
    ],
  },

  {
    key: "percezione_investitore",
    title:
      "Se un investitore vedesse il tuo brand per 30 secondi, lo percepirebbe solido?",
    description: "Il design è la prima due diligence visiva.",
    options: [
      { label: "Sì", value: "si" },
      { label: "In parte", value: "in_parte" },
      { label: "No", value: "no" },
    ],
  },

  {
    key: "anni_identita",
    title: "Da quanti anni non evolvi la tua identità visiva?",
    description:
      "Il mercato evolve ogni giorno. Il tuo brand?",
    type: "number",
  },

  // LINK STRATEGICI
  {
    key: "link_sito",
    title: "Inserisci il link del tuo sito principale",
    description:
      "Se non hai un sito aggiornato, la tua identità digitale sta già perdendo terreno.",
    type: "url",
  },
  {
    key: "link_prodotto",
    title: "Link di un prodotto o servizio chiave",
    description:
      "Il prodotto è dove la promessa del brand diventa concreta.",
    type: "url",
  },
  {
    key: "link_packaging",
    title: "Link a pagina packaging o prodotto (se presente)",
    description:
      "Il packaging è spesso il primo contatto fisico con il brand.",
    type: "url",
  },

  // UX
  {
    key: "sito_esperienza",
    title: "Il tuo sito/app è progettato come esperienza o come vetrina?",
    description:
      "Una vetrina mostra. Un’esperienza guida e convince.",
    options: [
      { label: "Esperienza progettata", value: "esperienza" },
      { label: "Vetrina estetica", value: "vetrina" },
      { label: "Non saprei", value: "non_saprei" },
    ],
  },

  {
    key: "percorso_visivo",
    title: "Il percorso visivo guida l’utente?",
    description:
      "Se l’utente deve capire da solo, stai già perdendo attenzione.",
    options: [
      { label: "Guida chiara", value: "guida_chiara" },
      { label: "Parzialmente", value: "parziale" },
      { label: "È dispersivo", value: "dispersivo" },
    ],
  },

  {
    key: "attrito_design",
    title: "Il tuo design riduce attrito o lo crea?",
    description:
      "Ogni secondo di confusione è un passo verso l’abbandono.",
    options: [
      { label: "Riduce attrito", value: "riduce" },
      { label: "Non so", value: "non_so" },
      { label: "Probabilmente crea", value: "crea" },
    ],
  },

  // VALORE
  {
    key: "prezzo_allineato",
    title: "Il brand comunica il livello di prezzo che chiedi?",
    description:
      "Se chiedi premium ma sembri standard, c’è disallineamento.",
    options: [
      { label: "Sì", value: "si" },
      { label: "Solo in parte", value: "parzialmente" },
      { label: "No", value: "no" },
    ],
  },

  {
    key: "giustificazione_prezzo",
    title: "Ti capita di dover giustificare il prezzo?",
    description:
      "Quando il design è forte, il prezzo si difende da solo.",
    options: [
      { label: "Spesso", value: "spesso" },
      { label: "A volte", value: "a_volte" },
      { label: "Raramente", value: "raramente" },
      { label: "Mai", value: "mai" },
    ],
  },

  {
    key: "percezione_dimensione",
    title:
      "Ti senti visivamente più piccolo di quanto sei realmente?",
    description:
      "Molte aziende crescono economicamente ma restano visivamente piccole.",
    options: [
      { label: "Sì", value: "si" },
      { label: "A volte", value: "a_volte" },
      { label: "No", value: "no" },
    ],
  },

  {
    key: "riconoscibilita",
    title:
      "Il tuo prodotto è riconoscibile tra i competitor?",
    description:
      "Se ti confondi, perdi prima ancora di essere scelto.",
    options: [
      { label: "Molto", value: "molto" },
      { label: "Abbastanza", value: "abbastanza" },
      { label: "Poco", value: "poco" },
      { label: "No", value: "no" },
    ],
  },

  // FUTURO
  {
    key: "allineamento_futuro",
    title:
      "L’identità attuale è allineata con dove vuoi andare nei prossimi 3 anni?",
    description:
      "L’ambizione senza struttura visiva è fragile.",
    options: [
      { label: "Sì", value: "si" },
      { label: "In parte", value: "in_parte" },
      { label: "No", value: "no" },
    ],
  },

  {
    key: "scalabilita_internazionale",
    title:
      "Il sistema visivo reggerebbe una crescita internazionale?",
    description:
      "Un’identità forte è progettata per crescere.",
    options: [
      { label: "Sì", value: "si" },
      { label: "Dubito", value: "dubito" },
      { label: "No", value: "no" },
    ],
  },

  {
    key: "costo_identita",
    title:
      "Quanto ti costa ogni mese avere un’identità non pienamente strutturata?",
    description:
      "Il costo invisibile è spesso più alto di quello percepito.",
    options: [
      { label: "Non lo so", value: "non_lo_so" },
      { label: "Poco", value: "poco" },
      { label: "Abbastanza", value: "abbastanza" },
      { label: "Molto", value: "molto" },
    ],
  },

  {
    key: "scenario_12_mesi",
    title:
      "Se nulla cambiasse nei prossimi 12 mesi, cosa accadrebbe al tuo brand?",
    description:
      "La stagnazione non è neutrale. È regressione lenta.",
    type: "text",
  },

  {
    key: "pronto_intervenire",
    title:
      "Se emergesse che il design limita crescita e percezione, saresti pronto a intervenire?",
    description:
      "Un brand evolve solo quando qualcuno decide di farlo.",
    options: [
      { label: "Sì", value: "si" },
      { label: "Dipende", value: "dipende" },
      { label: "No", value: "no" },
    ],
  },
];

export default function DiagnosiPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const current = questions[step];
  const progress = Math.round((step / questions.length) * 100);

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setStep(questions.length);
    }
  };

  const handleSubmit = async () => {
    if (!email || !consent) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/diagnostic`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        sitoUrl: answers.link_sito || "",
        settore: "Non specificato",
        ticketMedio: 0,
        leadMese: 0,
        convRate: null,
        rawAnswers: answers,
      }),
    });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <h1 className="text-2xl font-semibold mb-6">
          Analisi avviata.
        </h1>
        <p className="text-gray-600">
          I dati verranno incrociati con linee guida professionali di branding design,
          benchmark di settore e analisi percettive.
          Riceverai il report completo via email il prima possibile.
        </p>
      </div>
    );
  }

  if (step === questions.length) {
    return (
      <div className="max-w-xl mx-auto py-20">
        <h1 className="text-2xl font-semibold mb-6">
          Ricevi l’analisi completa
        </h1>

        <input
          type="email"
          placeholder="Inserisci la tua email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-3 mb-4"
        />

        <label className="flex items-start gap-2 text-sm mb-6">
          <input
            type="checkbox"
            checked={consent}
            onChange={() => setConsent(!consent)}
          />
          Confermo di voler ricevere l’analisi e autorizzo il trattamento dei dati.
        </label>

        <button
          onClick={handleSubmit}
          className="w-full bg-black text-white p-3"
        >
          Avvia Analisi
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-20">
      <div className="w-full bg-gray-200 h-2 mb-8">
        <div
          className="bg-black h-2 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h1 className="text-xl font-semibold mb-4">
        {current.title}
      </h1>

      <p className="text-sm text-gray-500 mb-6">
        {current.description}
      </p>

      {current.options &&
        current.options.map((opt: any) => (
          <button
            key={opt.value}
            onClick={() =>
              setAnswers({ ...answers, [current.key]: opt.value })
            }
            className={`w-full border p-3 mb-3 text-left transition ${
              answers[current.key] === opt.value
                ? "bg-black text-white"
                : "hover:bg-gray-100"
            }`}
          >
            {opt.label}
          </button>
        ))}

      {current.type === "number" && (
        <input
          type="number"
          className="w-full border p-3 mb-4"
          value={answers[current.key] || ""}
          onChange={(e) =>
            setAnswers({ ...answers, [current.key]: e.target.value })
          }
        />
      )}

      {current.type === "url" && (
        <input
          type="url"
          className="w-full border p-3 mb-4"
          value={answers[current.key] || ""}
          onChange={(e) =>
            setAnswers({ ...answers, [current.key]: e.target.value })
          }
        />
      )}

      {current.type === "text" && (
        <textarea
          className="w-full border p-3 mb-4"
          value={answers[current.key] || ""}
          onChange={(e) =>
            setAnswers({ ...answers, [current.key]: e.target.value })
          }
        />
      )}

      <button
        onClick={handleNext}
        className="w-full bg-black text-white p-3 mt-4"
      >
        Continua
      </button>
    </div>
  );
}
