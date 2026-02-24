export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-6xl px-6 py-14">
        {/* HERO */}
        <header className="space-y-7">
          <div className="inline-flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700">
              Diagnosi Design & Brand System
            </span>
            <span className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700">
              Business oriented
            </span>
            <span className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700">
              Report via email
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Scopri dove il tuo brand sta{" "}
            <span className="underline decoration-2 underline-offset-4">
              perdendo fiducia e valore percepito
            </span>{" "}
            <span className="block text-gray-500 font-semibold mt-2">
              (anche se il prodotto è ottimo).
            </span>
          </h1>

          <p className="text-lg text-gray-600 max-w-3xl leading-8">
            Rispondi a domande mirate: incrociamo le informazioni con{" "}
            <span className="font-medium text-black">
              linee guida professionali di branding, visual identity, UX/UI e
              packaging
            </span>
            . Valutiamo coerenza, credibilità, chiarezza, percezione premium e
            qualità del sistema visivo.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl">
            <div className="rounded-2xl border border-gray-200 p-5">
              <p className="text-sm font-semibold">Cosa facciamo</p>
              <p className="text-sm text-gray-600 mt-2 leading-7">
                Analizziamo identità, materiali commerciali, sito/app e
                touchpoint. Individuiamo dove si rompe la percezione e dove si
                crea attrito.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 p-5">
              <p className="text-sm font-semibold">Confronto di settore</p>
              <p className="text-sm text-gray-600 mt-2 leading-7">
                Confrontiamo il tuo impianto visivo con{" "}
                <span className="font-medium text-black">
                  pattern e competitor evidenti del settore
                </span>{" "}
                per capire se ti distingui o ti confondi.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 p-5">
              <p className="text-sm font-semibold">Output che serve</p>
              <p className="text-sm text-gray-600 mt-2 leading-7">
                Ricevi via email un report sintetico con{" "}
                <span className="font-medium text-black">
                  criticità, priorità e azioni concrete di design
                </span>{" "}
                (non teoria, non marketing).
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href="/diagnosi"
              className="inline-flex items-center justify-center rounded-xl bg-black px-8 py-4 text-white text-lg font-medium hover:opacity-90 transition"
            >
              Avvia Diagnosi Gratuita
            </a>

            <div className="rounded-xl border border-gray-200 px-6 py-4 text-sm text-gray-700">
              <div className="font-semibold">⏱️ 6–10 minuti</div>
              <div className="text-gray-600 mt-1">
                Report via email il prima possibile
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 max-w-3xl leading-6">
            Nota: questa diagnosi serve a capire se esiste un problema di
            identità/sistema e quanto pesa. Se emerge un gap importante, ti
            proponiamo un percorso di design (brand, visual identity, UX/UI,
            packaging) con priorità chiare.
          </p>
        </header>

        {/* SEZIONE "PERCHÉ È IMPORTANTE" */}
        <section className="mt-14">
          <div className="rounded-2xl border border-gray-200 p-7">
            <h2 className="text-xl font-bold">Perché questa diagnosi è utile</h2>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6">
                <p className="font-semibold">Il rischio invisibile</p>
                <p className="text-gray-600 mt-2 leading-7">
                  Se l’identità è incoerente o “debole”, il CEO paga due volte:
                  <span className="font-medium text-black">
                    {" "}
                    lead più lenti, trattative più dure, prezzo sempre sotto
                    pressione
                  </span>
                  .
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6">
                <p className="font-semibold">Il vantaggio reale</p>
                <p className="text-gray-600 mt-2 leading-7">
                  Un sistema di design solido aumenta percezione premium,
                  riduce attrito, accelera decisioni e rende scalabile la
                  comunicazione senza caos.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a
                href="/diagnosi"
                className="inline-flex items-center justify-center rounded-xl bg-black px-8 py-4 text-white font-medium hover:opacity-90 transition"
              >
                Inizia ora
              </a>
              <p className="text-sm text-gray-600 self-center">
                Ti chiediamo solo ciò che serve per una lettura seria e utile.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
