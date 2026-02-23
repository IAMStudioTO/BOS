"use client";

import { useState } from "react";

export default function Diagnosi() {
  const [ticket, setTicket] = useState("");
  const [clientiMese, setClientiMese] = useState("");

  return (
    <main className="min-h-screen bg-white text-black px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          Diagnosi Strutturale – Step 1
        </h1>

        <div className="space-y-6">
          <div>
            <label className="block mb-2 font-medium">
              Ticket medio (€)
            </label>
            <input
              type="number"
              value={ticket}
              onChange={(e) => setTicket(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
              placeholder="Es. 5000"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Nuovi clienti medi al mese
            </label>
            <input
              type="number"
              value={clientiMese}
              onChange={(e) => setClientiMese(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
              placeholder="Es. 8"
            />
          </div>

          <button className="bg-black text-white px-6 py-3 rounded-lg">
            Continua
          </button>
        </div>
      </div>
    </main>
  );
}
