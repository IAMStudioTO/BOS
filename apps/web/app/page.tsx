export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-black flex items-center justify-center px-6 py-16">
      <div className="max-w-4xl w-full text-center">
        {/* Badge */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <span className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700">
            Diagnosi professionale
          </span>
          <span className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700">
            Design-driven
          </span>
          <span className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700">
            Business oriented
          </span>
          <span className="rounded-full border border-black bg-black px-4 py-2 text-sm text-white">
            AI Analysis Engine
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          Diagnosi professionale di Brand, Design & UX
        </h1>

        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-8 mt-6">
          Rispondi a domande mirate: incrociamo le informazioni con{" "}
          <span className="font-medium text-black">
            linee guida professionali di branding, visual identity, UX/UI e
            packaging
          </span>
          .
        </p>

        {/* AI Highlight Box (evidenziato) */}
        <div className="mt-6 mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-gray-50 p-6 text-left">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-black">
                🔍 Analisi AI-driven
              </p>
              <p className="text-sm text-gray-700 mt-2 leading-7">
                Una <span className="font-medium text-black">AI</span> incrocia ciò che inserisci con{" "}
                <span className="font-medium text-black">
                  standard professionali di brand & design
                </span>
                , pattern di settore e{" "}
                <span className="font-medium text-black">
                  competitor evidenti
                </span>
                : l’obiettivo è identificare{" "}
                <span className="font-medium text-black">
                  incoerenze, fragilità percettive, punti di attrito e priorità di intervento
                </span>{" "}
                che impattano fiducia e conversione.
              </p>
            </div>

            <div className="shrink-0">
              <span className="inline-flex items-center rounded-xl border border-black bg-white px-3 py-2 text-xs font-semibold text-black">
                Report via email
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold text-black">Cosa misura</p>
              <p className="text-xs text-gray-600 mt-2 leading-6">
                Coerenza visiva, credibilità, chiarezza, percezione premium, attriti UX.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold text-black">Cosa ricevi</p>
              <p className="text-xs text-gray-600 mt-2 leading-6">
                Criticità + priorità + azioni concrete di design (non teoria).
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold text-black">Perché conta</p>
              <p className="text-xs text-gray-600 mt-2 leading-6">
                Riduce dubbi, migliora percezione e supporta prezzo/posizionamento.
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 max-w-2xl mx-auto mt-6">
          Non è un quiz. È una lettura strutturata del tuo ecosistema visivo e
          dell’esperienza che stai offrendo al mercato.
        </p>

        <div className="mt-10">
          <a
            href="/diagnosi"
            className="inline-block bg-black text-white px-8 py-4 rounded-2xl text-lg hover:opacity-90 transition"
          >
            Avvia la diagnosi
          </a>
        </div>
      </div>
    </main>
  );
}
