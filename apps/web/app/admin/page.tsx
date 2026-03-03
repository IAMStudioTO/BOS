"use client";

import { useEffect, useMemo, useState } from "react";

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

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function safeString(v: any) {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);

  const [password, setPassword] = useState<string>("");
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [expandedId, setExpandedId] = useState<number | null>(null);

  async function fetchLeads() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/leads", {
        method: "GET",
        cache: "no-store",
      });

      if (res.status === 401) {
        // Non autenticato: mostriamo login
        setAuthed(false);
        setLeads([]);
        return;
      }

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }

      const data = (await res.json()) as Lead[];
      setLeads(Array.isArray(data) ? data : []);
      setAuthed(true);
    } catch (e: any) {
      setError(e?.message || "Errore nel caricamento lead");
    } finally {
      setLoading(false);
    }
  }

  async function login() {
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // passiamo la password nel body, così evitiamo problemi di header speciali
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Password errata");
      }

      setAuthed(true);
      setPassword("");
      await fetchLeads();
    } catch (e: any) {
      setLoginError(e?.message || "Password errata");
    } finally {
      setLoginLoading(false);
    }
  }

  async function deleteLead(id: number) {
    const ok = confirm("Vuoi davvero eliminare questo lead? Questa azione è irreversibile.");
    if (!ok) return;

    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "DELETE",
        cache: "no-store",
      });

      if (res.status === 401) {
        setAuthed(false);
        setLeads([]);
        alert("Sessione scaduta. Rientra in admin.");
        return;
      }

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }

      // Rimuovi dal client subito (UX migliore)
      setLeads((prev) => prev.filter((l) => l.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (e: any) {
      alert(e?.message || "Errore eliminazione");
    }
  }

  function downloadCsv() {
    // Il cookie viene inviato automaticamente, nessuna password qui
    window.location.href = "/api/admin/leads-csv";
  }

  // Auto-check all’ingresso: se cookie valido → carica lead; altrimenti login.
  useEffect(() => {
    (async () => {
      setChecking(true);
      await fetchLeads();
      setChecking(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasLeads = leads && leads.length > 0;

  const expandedLead = useMemo(() => {
    if (!expandedId) return null;
    return leads.find((l) => l.id === expandedId) || null;
  }, [expandedId, leads]);

  // ---- UI: Login gate ----
  if (checking) {
    return (
      <main className="min-h-screen bg-white text-black flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <p className="text-sm text-gray-500">Caricamento admin…</p>
        </div>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="min-h-screen bg-white text-black flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold mb-2">Admin</h1>
          <p className="text-sm text-gray-600 mb-6">
            Inserisci la password per accedere ai lead e al CSV.
          </p>

          <div className="border border-gray-200 rounded-xl p-4">
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-black/20"
              placeholder="••••••••"
            />

            {loginError ? (
              <p className="text-sm text-red-600 mt-3">{loginError}</p>
            ) : null}

            <button
              onClick={login}
              disabled={!password.trim() || loginLoading}
              className="mt-4 w-full bg-black text-white rounded-lg px-4 py-2 font-medium disabled:opacity-50"
            >
              {loginLoading ? "Accesso…" : "Entra"}
            </button>

            <p className="text-xs text-gray-400 mt-3">
              Dopo l’accesso resterai autenticato (cookie) e non ti verrà più richiesta la password
              per scaricare CSV o eliminare.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ---- UI: Admin dashboard ----
  return (
    <main className="min-h-screen bg-white text-black px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Admin Leads</h1>
            <p className="text-sm text-gray-600">
              Visualizza lead, risposte e scarica CSV. (Autenticazione via cookie)
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchLeads}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50"
              disabled={loading}
            >
              {loading ? "Aggiorno…" : "Aggiorna"}
            </button>

            <button
              onClick={downloadCsv}
              className="bg-black text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              Scarica CSV
            </button>
          </div>
        </div>

        {error ? (
          <div className="border border-red-200 bg-red-50 text-red-700 rounded-xl p-4 mb-6">
            {error}
          </div>
        ) : null}

        {!hasLeads ? (
          <div className="border border-gray-200 rounded-xl p-6 text-sm text-gray-600">
            Nessun lead trovato.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista lead */}
            <div className="lg:col-span-1 border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <p className="text-sm font-medium">
                  Lead ({leads.length})
                </p>
              </div>

              <div className="divide-y divide-gray-200">
                {leads.map((l) => {
                  const isOpen = expandedId === l.id;
                  return (
                    <button
                      key={l.id}
                      onClick={() => setExpandedId(isOpen ? null : l.id)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${
                        isOpen ? "bg-gray-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{l.email}</p>
                          <p className="text-xs text-gray-500">
                            {l.settore} • {formatDate(l.created_at)}
                          </p>
                        </div>
                        <span className="text-xs border border-gray-300 rounded-full px-2 py-1">
                          {l.livello}
                        </span>
                      </div>

                      {l.sito_url ? (
                        <p className="text-xs text-gray-600 mt-2 truncate">
                          {l.sito_url}
                        </p>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dettaglio lead */}
            <div className="lg:col-span-2 border border-gray-200 rounded-xl p-5">
              {!expandedLead ? (
                <div className="text-sm text-gray-600">
                  Seleziona un lead a sinistra per vedere dettagli e risposte.
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">{expandedLead.email}</h2>
                      <p className="text-sm text-gray-600">
                        Settore: <span className="font-medium">{expandedLead.settore}</span>
                      </p>
                      {expandedLead.sito_url ? (
                        <p className="text-sm text-gray-600">
                          Sito:{" "}
                          <a
                            href={expandedLead.sito_url}
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                          >
                            {expandedLead.sito_url}
                          </a>
                        </p>
                      ) : null}
                      <p className="text-xs text-gray-500 mt-2">
                        Request ID: {expandedLead.request_id}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => deleteLead(expandedLead.id)}
                        className="border border-red-300 text-red-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-50"
                      >
                        Elimina
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-4">
                    <p className="text-sm font-medium mb-2">Risposte (raw_answers)</p>

                    {expandedLead.raw_answers ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(expandedLead.raw_answers).map(([k, v]) => (
                          <div
                            key={k}
                            className="border border-gray-200 rounded-lg p-3"
                          >
                            <p className="text-xs font-semibold text-gray-700 break-words">
                              {k}
                            </p>
                            <p className="text-sm text-gray-900 mt-1 break-words">
                              {safeString(v)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Nessuna risposta salvata.</p>
                    )}
                  </div>

                  <div className="border border-gray-200 rounded-xl p-4">
                    <p className="text-sm font-medium mb-2">Meta</p>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>Score: <span className="font-medium">{expandedLead.score}</span></p>
                      <p>Livello: <span className="font-medium">{expandedLead.livello}</span></p>
                      <p>Perdita mensile: <span className="font-medium">{expandedLead.perdita_mensile}</span></p>
                      <p>Creato: <span className="font-medium">{formatDate(expandedLead.created_at)}</span></p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
