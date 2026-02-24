export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-black flex items-center justify-center px-6 py-16">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          Diagnosi professionale di Brand, Design & UX
        </h1>

        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-8 mt-6">
          Rispondi a domande mirate: incrociamo le informazioni con{" "}
          <span className="font-medium text-black">
            linee guida professionali di branding, visual identity, UX/UI e
            packaging
          </span>
          .{" "}
          <span className="font-medium text-black">
            Un motore AI analizza le risposte e le confronta con pattern di settore,
            competitor evidenti e benchmark progettuali
          </span>
          , per individuare incoerenze, punti di attrito, fragilità percettive e
          opportunità concrete di upgrade del design.
        </p>

        <p className="text-sm text-gray-500 max-w-2xl mx-auto mt-4">
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
