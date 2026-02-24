"use client";

import { useState } from "react";

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

function formatDate(date: string) {
  try {
    return new Date(date).toLocaleString();
  } catch {
    return date;
  }
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const API_BASE = "/api/admin";

  const getHeaders = (): HeadersInit => {
    const headers: Record<string, string> = {};
    if (password) {
      headers["x-admin-pass"] = password;
    }
    return headers;
  };

  async function loadLeads() {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/leads?t=${Date.now()}`, {
        method: "GET",
        headers: getHeaders(),
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Errore caricamento lead");
        setLeads([]);
        return;
      }

      setLeads(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || "Errore rete");
    } finally {
      setLoading(false);
    }
  }

  async function deleteLead(id: number) {
    if (!confirm(`Eliminare definitivamente il lead ID ${id}?`)) return;

    setDeletingId(id);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/leads?id=${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Errore eliminazione");
        return;
      }

      await loadLeads();
    } catch (err: any) {
      setError(err?.message || "Errore rete");
    } finally {
      setDeletingId(null);
    }
  }

  async function downloadCSV() {
    try {
      const res = await fetch(`${API_BASE}/leads-csv?t=${Date.now()}`, {
        headers: getHeaders(),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d?.error || "Download CSV non autorizzato");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bos-leads.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err?.message || "Errore download CSV");
    }
  }

  return (
    <main className="min-h-screen bg-white text-black px-6 py-10">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          Admin — Lead BOS
        </h1>

        <div className="flex gap-3 mb-6">
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-80"
          />

          <button
            onClick={loadLeads}
            className="bg-black text-white rounded-lg px-4 py-2 hover:opacity-90"
          >
            {loading ? "Caricamento..." : "Entra"}
          </button>

          <button
            onClick={downloadCSV}
            className="border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50"
          >
            Scarica CSV
          </button>
        </div>

        {error && (
          <div className="border border-red-200 bg-red-50 text-red-800 rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <div className="overflow-x-auto border border-gray-200 rounded-2xl">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Settore</th>
                <th className="px-4 py-3 text-left">Sito</th>
                <th className="px-4 py-3 text-left">Score</th>
                <th className="px-4 py-3 text-left">Livello</th>
                <th className="px-4 py-3 text-left">Creato</th>
                <th className="px-4 py-3 text-left">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t border-gray-200 align-top">
                  <td className="px-4 py-3 font-mono">{lead.id}</td>
                  <td className="px-4 py-3">{lead.email}</td>
                  <td className="px-4 py-3">{lead.settore}</td>
                  <td className="px-4 py-3">
                    {lead.sito_url ? (
                      <a
                        href={lead.sito_url}
                        target="_blank"
                        className="underline"
                      >
                        Apri
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">{lead.score}</td>
                  <td className="px-4 py-3">{lead.livello}</td>
                  <td className="px-4 py-3">
                    {formatDate(lead.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteLead(lead.id)}
                      disabled={deletingId === lead.id}
                      className="border border-red-300 text-red-700 rounded-lg px-3 py-2 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === lead.id ? "Elimino..." : "Elimina"}
                    </button>
                  </td>
                </tr>
              ))}

              {leads.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-gray-500">
                    Nessun lead trovato.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">
            Dettaglio risposte
          </h2>

          {leads.map((lead) => (
            <details
              key={`detail-${lead.id}`}
              className="border border-gray-200 rounded-2xl p-4 mb-4"
            >
              <summary className="cursor-pointer font-medium">
                ID {lead.id} — {lead.email}
              </summary>

              <pre className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 overflow-x-auto text-xs">
                {JSON.stringify(lead.raw_answers, null, 2)}
              </pre>
            </details>
          ))}
        </div>

      </div>
    </main>
  );
}
