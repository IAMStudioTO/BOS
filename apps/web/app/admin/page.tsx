"use client";

import { useEffect, useMemo, useState } from "react";

type Lead = {
  id: number;
  request_id: string;
  email: string;
  settore: string | null;
  sito_url: string | null;
  score: number | null;
  livello: string | null;
  perdita_mensile: number | null;
  raw_answers: Record<string, any> | null;
  created_at: string;
};

type QA = {
  key: string;
  label: string;
  type: "text" | "choice" | "url" | "number";
};

const ORDERED_QA: QA[] = [
  {
    key: "percezione_attuale",
    label:
      "1) Se oggi dovessi spiegare a un investitore perché il tuo brand è diverso, cosa diresti?",
    type: "text",
  },
  {
    key: "oggi_scelto_per",
    label: "2) Oggi i tuoi clienti ti scelgono principalmente per:",
    type: "choice",
  },
  {
    key: "differenziazione_percepita",
    label: "3) Ti senti realmente diverso dai tuoi competitor visivamente?",
    type: "choice",
  },
  {
    key: "logo_visione",
    label: "4) Il tuo logo rappresenta una visione o è solo un segno grafico?",
    type: "choice",
  },
  {
    key: "sistema_visivo",
    label: "5) Esiste un sistema visivo strutturato (colori, font, regole, griglie)?",
    type: "choice",
  },
  {
    key: "percezione_investitore",
    label: "6) Se un investitore vedesse il tuo brand per 30 secondi, lo percepirebbe solido?",
    type: "choice",
  },
  {
    key: "anni_identita",
    label: "7) Da quanti anni non evolvi la tua identità visiva?",
    type: "number",
  },
  {
    key: "link_sito",
    label: "8) Link sito principale",
    type: "url",
  },
  {
    key: "link_prodotto",
    label: "9) Link prodotto/servizio chiave",
    type: "url",
  },
  {
    key: "link_packaging",
    label: "10) Link packaging / pagina prodotto (se presente)",
    type: "url",
  },
  {
    key: "sito_esperienza",
    label: "11) Il tuo sito/app è progettato come esperienza o come vetrina?",
    type: "choice",
  },
  {
    key: "percorso_visivo",
    label: "12) Il percorso visivo guida l’utente?",
    type: "choice",
  },
  {
    key: "attrito_design",
    label: "13) Il tuo design riduce attrito o lo crea?",
    type: "choice",
  },
  {
    key: "prezzo_allineato",
    label: "14) Il brand comunica il livello di prezzo che chiedi?",
    type: "choice",
  },
  {
    key: "giustificazione_prezzo",
    label: "15) Ti capita di dover giustificare il prezzo?",
    type: "choice",
  },
  {
    key: "percezione_dimensione",
    label: "16) Ti senti visivamente più piccolo di quanto sei realmente?",
    type: "choice",
  },
  {
    key: "riconoscibilita",
    label: "17) Il tuo prodotto è riconoscibile tra i competitor?",
    type: "choice",
  },
  {
    key: "allineamento_futuro",
    label: "18) L’identità attuale è allineata con dove vuoi andare nei prossimi 3 anni?",
    type: "choice",
  },
  {
    key: "scalabilita_internazionale",
    label: "19) Il sistema visivo reggerebbe una crescita internazionale?",
    type: "choice",
  },
  {
    key: "costo_identita",
    label: "20) Quanto ti costa ogni mese avere un’identità non pienamente strutturata?",
    type: "choice",
  },
  {
    key: "scenario_12_mesi",
    label: "21) Se nulla cambiasse nei prossimi 12 mesi, cosa accadrebbe al tuo brand?",
    type: "text",
  },
  {
    key: "pronto_intervenire",
    label: "22) Se emergesse che il design limita crescita e percezione, saresti pronto a intervenire?",
    type: "choice",
  },
];

function formatValue(v: any): string {
  if (v === null || v === undefined) return "";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function isValidHttpUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/admin/leads", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok || data?.ok === false) {
          setError(data?.error || "Errore caricamento lead");
          setLeads([]);
          return;
        }

        setLeads(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e?.message || "Errore imprevisto");
        setLeads([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const total = leads.length;

  return (
    <main className="min-h-screen bg-white text-black px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold">Admin — Leads</h1>
            <p className="text-sm text-gray-500 mt-2">
              Totale: <span className="font-medium text-black">{total}</span>
            </p>
          </div>

          <a
            href="/api/admin/leads-csv"
            className="inline-flex items-center justify-center rounded-xl bg-black text-white px-5 py-3 text-sm font-medium hover:opacity-90 transition"
          >
            Scarica CSV
          </a>
        </div>

        {loading && (
          <div className="text-gray-600">Caricamento…</div>
        )}

        {error && (
          <div className="border border-red-200 bg-red-50 text-red-800 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {!loading && !error && leads.length === 0 && (
          <div className="text-gray-600">Nessun lead trovato.</div>
        )}

        <div className="space-y-6">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      </div>
    </main>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const raw = lead.raw_answers || {};

  const orderedAnswers = useMemo(() => {
    return ORDERED_QA.map((q) => {
      const value = raw[q.key];
      return { ...q, value };
    });
  }, [raw]);

  const knownKeys = useMemo(() => new Set(ORDERED_QA.map((q) => q.key)), []);
  const extraKeys = useMemo(() => {
    const keys = Object.keys(raw || {});
    return keys.filter((k) => !knownKeys.has(k)).sort();
  }, [raw, knownKeys]);

  return (
    <section className="border rounded-2xl p-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="text-lg font-semibold">{lead.email}</div>
          <div className="text-sm text-gray-500 mt-1">
            ID: {lead.id} • Request: <span className="font-mono">{lead.request_id}</span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {lead.settore ? `Settore: ${lead.settore}` : "Settore: —"} •{" "}
            {lead.sito_url ? (
              <a
                className="underline"
                href={lead.sito_url}
                target="_blank"
                rel="noreferrer"
              >
                Sito
              </a>
            ) : (
              "Sito: —"
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <div className="rounded-xl border px-4 py-2">
            <div className="text-xs text-gray-500">Score</div>
            <div className="text-lg font-semibold">{lead.score ?? "—"}</div>
          </div>
          <div className="rounded-xl border px-4 py-2">
            <div className="text-xs text-gray-500">Livello</div>
            <div className="text-lg font-semibold">{lead.livello ?? "—"}</div>
          </div>
        </div>
      </div>

      <div className="mt-5 text-xs text-gray-500">
        Creato: {new Date(lead.created_at).toLocaleString()}
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-3">Risposte (schema attuale)</h3>

        <div className="space-y-3">
          {orderedAnswers.map((q) => {
            const v = q.value;
            const txt = formatValue(v);

            if (!txt) {
              return (
                <div key={q.key} className="border rounded-xl p-3 bg-gray-50">
                  <div className="text-sm font-medium">{q.label}</div>
                  <div className="text-sm text-gray-400 mt-1">—</div>
                </div>
              );
            }

            // URL clickable
            if (q.type === "url" && typeof v === "string" && isValidHttpUrl(v)) {
              return (
                <div key={q.key} className="border rounded-xl p-3">
                  <div className="text-sm font-medium">{q.label}</div>
                  <a
                    href={v}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-700 underline break-all mt-1 inline-block"
                  >
                    {v}
                  </a>
                </div>
              );
            }

            return (
              <div key={q.key} className="border rounded-xl p-3">
                <div className="text-sm font-medium">{q.label}</div>
                <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-words">
                  {txt}
                </div>
              </div>
            );
          })}
        </div>

        {extraKeys.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">
              Risposte extra (lead vecchi / chiavi non mappate)
            </h3>
            <div className="space-y-2">
              {extraKeys.map((k) => (
                <div key={k} className="border rounded-xl p-3 bg-gray-50">
                  <div className="text-sm font-medium">{k}</div>
                  <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-words">
                    {formatValue(raw[k]) || "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
