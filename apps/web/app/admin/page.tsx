"use client";

import React, { useEffect, useMemo, useState } from "react";

type Lead = {
  id: number;
  request_id: string;
  email: string;
  settore: string;
  sito_url: string | null;
  score: number;
  livello: string;
  perdita_mensile: number;
  raw_answers: Record<string, any> | null;
  created_at: string;
};

type Q = {
  key: string;
  title: string;
  help?: string;
};

const QUESTIONS: Q[] = [
  {
    key: "percezione_attuale",
    title: "1) Oggi, in una frase: cosa pensi che il tuo brand comunichi visivamente?",
    help: "Serve a capire se la percezione attuale è allineata con ciò che vuoi trasmettere (premium, artigianale, tech, industriale, ecc.).",
  },
  {
    key: "oggi_scelto_per",
    title: "2) Oggi sei scelto per la tua identità o per comodità?",
    help: "Se il cliente sceglie te ma non saprebbe spiegare perché, il design non sta facendo il suo lavoro.",
  },
  {
    key: "logo_significato",
    title: "3) Il tuo logo è un simbolo che rappresenta una visione o è solo un segno grafico?",
    help: "Un simbolo racconta chi sei. Un segno riempie uno spazio.",
  },
  {
    key: "sistema_visivo",
    title: "4) Il tuo brand ha un sistema visivo coerente o è cresciuto “nel tempo”?",
    help: "Quando non esiste un sistema, ogni nuovo materiale indebolisce l’identità invece di rafforzarla.",
  },
  {
    key: "due_diligence_30s",
    title: "5) Se un investitore guardasse il tuo brand per 30 secondi, lo percepirebbe all’altezza della tua ambizione?",
    help: "Il design è la prima due diligence visiva.",
  },
  {
    key: "anni_fermo",
    title: "6) Da quanti anni non evolvi la tua identità visiva?",
    help: "Il mercato evolve ogni giorno. Se il tuo brand è fermo, sta già arretrando.",
  },
  {
    key: "link_sito",
    title: "7) Link al sito/app (se esiste)",
    help: "Ci serve per analizzare gerarchia, credibilità, chiarezza e coerenza visiva.",
  },
  {
    key: "link_prodotto",
    title: "8) Link a un prodotto/servizio chiave (pagina o scheda)",
    help: "Serve a capire come il valore viene raccontato e “difeso” visivamente.",
  },
  {
    key: "link_packaging",
    title: "9) Link a packaging/foto prodotto (Drive/Notion/sito) se rilevante",
    help: "Il packaging spesso è il primo contatto fisico col brand: o alza il valore o lo ammazza.",
  },
  {
    key: "ux_vetrina_esperienza",
    title: "10) Il tuo sito/app è progettato come esperienza o come vetrina?",
    help: "Una vetrina mostra. Un’esperienza guida e convince.",
  },
  {
    key: "percorso_guidato",
    title: "11) Il percorso visivo guida l’utente o lo lascia decidere da solo?",
    help: "Se l’utente deve capire da solo, stai già perdendo attenzione.",
  },
  {
    key: "attrito_design",
    title: "12) Il tuo design riduce attrito o lo crea?",
    help: "Attrito = confusione, incoerenza, troppi stili, scarsa gerarchia. Ogni secondo di confusione è un passo verso l’abbandono.",
  },
  {
    key: "allineamento_prezzo",
    title: "13) Il tuo brand comunica il livello di prezzo che chiedi?",
    help: "Se chiedi premium ma sembri standard, il cliente percepisce disallineamento.",
  },
  {
    key: "giustificare_prezzo",
    title: "14) Ti capita di dover giustificare il prezzo?",
    help: "Quando il design è forte, il prezzo si difende da solo.",
  },
  {
    key: "sembriamo_piccoli",
    title: "15) Hai mai pensato: “Sembriamo più piccoli di quello che siamo”?",
    help: "Molte aziende crescono economicamente ma restano visivamente piccole.",
  },
  {
    key: "packaging_valore",
    title: "16) Il packaging aumenta la percezione di valore o protegge solo il prodotto?",
    help: "È un momento decisivo: può far scegliere te o un competitor.",
  },
  {
    key: "riconoscibile_mercato",
    title: "17) Il tuo prodotto è riconoscibile in mezzo ai competitor (scaffale/online)?",
    help: "Se ti confondi, perdi prima ancora di essere scelto.",
  },
  {
    key: "ambizione_3anni",
    title: "18) L’identità attuale è allineata con dove vuoi portare il brand nei prossimi 3 anni?",
    help: "L’ambizione senza struttura visiva è fragile.",
  },
  {
    key: "scalabilita_internazionale",
    title: "19) Se dovessi scalare o entrare in un mercato internazionale, il sistema visivo reggerebbe?",
    help: "Un’identità forte è progettata per crescere. Una debole collassa sotto pressione.",
  },
  {
    key: "se_nulla_cambia",
    title: "20) Se nulla cambiasse nei prossimi 12 mesi, cosa accadrebbe al tuo brand?",
    help: "La stagnazione non è neutrale: è regressione lenta.",
  },
];

function safe(v: any) {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

export default function AdminPage() {
  const [pass, setPass] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    const p = localStorage.getItem("bos_admin_pass") || "";
    if (p) {
      setPass(p);
      setAuthed(true);
    }
  }, []);

  const total = leads.length;

  async function fetchLeads(pw: string) {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/leads", {
        headers: { "x-admin-pass": pw },
        cache: "no-store",
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Fetch failed");
      setLeads(data);
    } catch (e: any) {
      setError(e?.message || "Errore");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }

  async function doLogin() {
    const pw = pass.trim();
    if (!pw) return;
    localStorage.setItem("bos_admin_pass", pw);
    setAuthed(true);
    await fetchLeads(pw);
  }

  async function doLogout() {
    localStorage.removeItem("bos_admin_pass");
    setAuthed(false);
    setLeads([]);
    setPass("");
    setError(null);
  }

  async function downloadCsv() {
    const pw = pass.trim();
    const r = await fetch("/api/admin/leads-csv", {
      headers: { "x-admin-pass": pw },
      cache: "no-store",
    });
    if (!r.ok) {
      const data = await r.json().catch(() => null);
      alert(data?.error || "Forbidden");
      return;
    }
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bos-leads.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function deleteLead(id: number) {
    const pw = pass.trim();
    if (!pw) return;

    const ok = confirm(`Vuoi cancellare definitivamente il lead #${id}?`);
    if (!ok) return;

    setBusyId(id);
    setError(null);
    try {
      const r = await fetch(`/api/admin/leads/${id}`, {
        method: "DELETE",
        headers: { "x-admin-pass": pw },
        cache: "no-store",
      });
      const data = await r.json().catch(() => null);
      if (!r.ok) throw new Error(data?.error || "Delete failed");
      setLeads((prev) => prev.filter((x) => x.id !== id));
    } catch (e: any) {
      setError(e?.message || "Errore cancellazione");
    } finally {
      setBusyId(null);
    }
  }

  const mapped = useMemo(() => {
    return leads.map((l) => {
      const a = l.raw_answers || {};
      const answers = QUESTIONS.map((q) => ({
        key: q.key,
        title: q.title,
        help: q.help,
        value: safe(a[q.key]),
      }));
      // extra keys non mappate
      const known = new Set(QUESTIONS.map((q) => q.key));
      const extras = Object.keys(a)
        .filter((k) => !known.has(k))
        .sort()
        .map((k) => ({ key: k, value: safe(a[k]) }));
      return { lead: l, answers, extras };
    });
  }, [leads]);

  useEffect(() => {
    if (authed && pass.trim()) fetchLeads(pass.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  if (!authed) {
    return (
      <main className="min-h-screen bg-white text-black flex items-center justify-center px-6">
        <div className="w-full max-w-md border rounded-2xl p-6">
          <h1 className="text-2xl font-bold mb-2">Admin</h1>
          <p className="text-sm text-gray-600 mb-6">
            Inserisci la password per visualizzare i lead e scaricare il CSV.
          </p>

          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            className="mt-2 w-full border rounded-xl px-4 py-3"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="••••••••"
          />

          <button
            onClick={doLogin}
            className="mt-4 w-full bg-black text-white rounded-xl py-3 font-medium hover:opacity-90"
          >
            Entra
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-black px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Lead</h1>
            <p className="text-sm text-gray-600">
              Totale: <span className="font-medium">{total}</span>
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={() => fetchLeads(pass.trim())}
              className="border rounded-xl px-4 py-2 hover:bg-gray-50"
              disabled={loading}
            >
              {loading ? "Aggiorno…" : "Aggiorna"}
            </button>

            <button
              onClick={downloadCsv}
              className="bg-black text-white rounded-xl px-4 py-2 font-medium hover:opacity-90"
            >
              Scarica CSV
            </button>

            <button
              onClick={doLogout}
              className="border rounded-xl px-4 py-2 hover:bg-gray-50"
            >
              Esci
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6 border border-red-200 bg-red-50 text-red-800 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-6">
          {mapped.map(({ lead, answers, extras }) => (
            <div key={lead.id} className="border rounded-2xl p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm text-gray-500">
                    #{lead.id} • {new Date(lead.created_at).toLocaleString()}
                  </div>
                  <div className="text-lg font-semibold">{lead.email}</div>
                  <div className="text-sm text-gray-600">
                    Settore: <span className="font-medium">{lead.settore}</span>
                    {lead.sito_url ? (
                      <>
                        {" "}
                        • Sito:{" "}
                        <a
                          className="underline"
                          href={lead.sito_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {lead.sito_url}
                        </a>
                      </>
                    ) : null}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Score: <span className="font-medium">{lead.score}</span> •
                    Livello: <span className="font-medium">{lead.livello}</span>
                  </div>
                </div>

                <button
                  onClick={() => deleteLead(lead.id)}
                  disabled={busyId === lead.id}
                  className="mt-2 sm:mt-0 border border-red-300 text-red-700 rounded-xl px-4 py-2 hover:bg-red-50 disabled:opacity-50"
                >
                  {busyId === lead.id ? "Elimino…" : "Elimina"}
                </button>
              </div>

              <div className="mt-6 grid gap-4">
                {answers.map((a) => (
                  <div key={`${lead.id}_${a.key}`} className="border rounded-xl p-4">
                    <div className="text-sm font-semibold">{a.title}</div>
                    {a.help ? (
                      <div className="text-xs text-gray-500 mt-1">{a.help}</div>
                    ) : null}
                    <div className="mt-2 text-sm whitespace-pre-wrap">
                      {a.value ? a.value : <span className="text-gray-400">—</span>}
                    </div>
                  </div>
                ))}

                {extras.length > 0 && (
                  <div className="border rounded-xl p-4 bg-gray-50">
                    <div className="text-sm font-semibold">
                      Risposte extra (chiavi non mappate)
                    </div>
                    <div className="mt-3 grid gap-2 text-sm">
                      {extras.map((x) => (
                        <div key={`${lead.id}_extra_${x.key}`}>
                          <span className="font-mono text-xs bg-white border rounded px-2 py-1 mr-2">
                            {x.key}
                          </span>
                          <span className="whitespace-pre-wrap">{x.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {!loading && mapped.length === 0 && (
            <div className="border rounded-2xl p-6 text-sm text-gray-600">
              Nessun lead trovato.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
