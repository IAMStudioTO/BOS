"use client";

import { useEffect, useState } from "react";

type Lead = {
  id: number;
  request_id: string;
  email: string;
  settore: string;
  sito_url: string;
  score: number;
  livello: string;
  perdita_mensile: number;
  created_at: string;
};

export default function AdminPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/leads")
      .then((res) => res.json())
      .then((data) => {
        setLeads(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Errore caricamento lead");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10">Caricamento...</div>;
  if (error) return <div className="p-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-white text-black p-10">
      <h1 className="text-3xl font-bold mb-6">Admin Lead Room</h1>

      <a
        href="/api/admin/leads-csv"
        className="inline-block mb-6 bg-black text-white px-6 py-3 rounded-lg"
      >
        Scarica CSV
      </a>

      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Settore</th>
              <th className="p-2 border">Score</th>
              <th className="p-2 border">Livello</th>
              <th className="p-2 border">Perdita €</th>
              <th className="p-2 border">Data</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td className="p-2 border">{lead.email}</td>
                <td className="p-2 border">{lead.settore}</td>
                <td className="p-2 border">{lead.score}</td>
                <td className="p-2 border">{lead.livello}</td>
                <td className="p-2 border">{lead.perdita_mensile}</td>
                <td className="p-2 border">
                  {new Date(lead.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
