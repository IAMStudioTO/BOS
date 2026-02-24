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

const ADMIN_PASS_STORAGE_KEY = "bos_admin_pass_v1";

function formatDate(v: string) {
  try {
    return new Date(v).toLocaleString();
  } catch {
    return v;
  }
}

export default function AdminPage() {
  const [pass, setPass] = useState("");
  const [savedPass, setSavedPass] = useState<string>("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    const p = localStorage.getItem(ADMIN_PASS_STORAGE_KEY) || "";
    setSavedPass(p);
  }, []);

  const authHeaders = useMemo(() => {
    const p = (savedPass || "").trim();
    return p ? { "x-admin-pass": p } : {};
  }, [savedPass]);

  async function loadLeads() {
    setLoading(true);
    setErr("");

    try {
      // cache-busting: query param
      const url = `/api/admin/leads?t=${Date.now()}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          ...authHeaders,
        },
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setErr(data?.error || "Errore caricamento lead");
        setLeads([]);
      } else {
        setLeads(Array.isArray(data) ? data : []);
      }
    } catch (e: any) {
      setErr(e?.message || "Errore rete");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!savedPass) return;

    loadLeads();

    // auto-refresh ogni 10s
    const t = setInterval(() => {
      loadLeads();
    }, 10000);

    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedPass]);

  function onSavePass() {
    const p = pass.trim();
    localStorage.setItem(ADMIN_PASS_STORAGE_KEY, p);
    setSavedPass(p);
    setPass("");
  }

  function onLogout() {
    localStorage.removeItem(ADMIN_PASS_STORAGE_KEY);
    setSavedPass("");
    setLeads([]);
    setErr("");
  }

  return (
    <main className="min-h-screen bg-white text-black px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin — Lead</h1>
            <p className="text-gray-600 mt-2">
              Vista lead + risposte. Aggiornamento automatico ogni 10 secondi.
            </p>
          </div>

          {savedPass ? (
            <div className="flex items-center gap-2">
              <button
                onClick={loadLeads}
                className="px-4 py-2 rounded-lg bg-black text-white hover:opacity-90"
              >
                Aggiorna
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-lg border border-black/20 hover:bg-black/5"
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>

        {!savedPass ? (
          <section className="border border-black/10 rounded-xl p-6 max-w-xl">
            <h2 className="text-xl font-semibold mb-2">Accesso Admin</h2>
            <p className="text-gray-600 mb-4">
              Inserisci la password admin per visualizzare i lead.
            </p>

            <div className="flex gap-2">
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="Admin password"
                className="flex-1 px-4 py-3 rounded-lg border border-black/15 outline-none focus:ring-2 focus:ring-black/20"
              />
              <button
                onClick={onSavePass}
                className="px-4 py-3 rounded-lg bg-black text-white hover:opacity-90"
              >
                Entra
              </button>
            </div>
          </section>
        ) : (
          <section className="space-y-4">
            {err ? (
              <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700">
                {err}
              </div>
            ) : null}

            <div className="text-sm text-gray-600">
              {loading ? "Caricamento..." : `Lead: ${leads.length}`}
            </div>

            <div className="grid gap-4">
              {leads.map((l) => (
                <div
                  key={l.id}
                  className="border border-black/10 rounded-xl p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-semibold">
                      #{l.id} — {l.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(l.created_at)}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Settore:</span>{" "}
                      <span className="font-medium">{l.settore}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Sito:</span>{" "}
                      {l.sito_url ? (
                        <a
                          className="font-medium underline"
                          href={l.sito_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {l.sito_url}
                        </a>
                      ) : (
                        <span className="font-medium">—</span>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-500">Score:</span>{" "}
                      <span className="font-medium">{l.score}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Livello:</span>{" "}
                      <span className="font-medium">{l.livello}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm font-semibold mb-2">
                      Risposte (raw)
                    </div>

                    {l.raw_answers ? (
                      <pre className="text-xs bg-black/5 border border-black/10 rounded-lg p-3 overflow-auto">
{JSON.stringify(l.raw_answers, null, 2)}
                      </pre>
                    ) : (
                      <div className="text-sm text-gray-500">Nessuna risposta salvata.</div>
                    )}
                  </div>
                </div>
              ))}

              {leads.length === 0 && !loading ? (
                <div className="text-gray-600">
                  Nessun lead da mostrare.
                </div>
              ) : null}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
