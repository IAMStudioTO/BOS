export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black flex items-center justify-center px-6">
      <div className="max-w-3xl w-full text-center">
        <h1 className="text-4xl font-bold mb-6">
          Diagnosi Strutturale del Brand
        </h1>

        <p className="text-lg text-gray-600 mb-10">
          Scopri il livello di maturità del tuo sistema comunicativo e
          quantifica la perdita potenziale legata a inefficienze strutturali.
        </p>

        <a
          href="/diagnosi"
          className="inline-block bg-black text-white px-8 py-4 rounded-xl text-lg font-medium hover:opacity-80 transition"
        >
          Inizia Diagnosi Gratuita
        </a>

        <p className="text-sm text-gray-400 mt-6">
          Analisi strutturata • Benchmark settoriali • Report PDF personalizzato
        </p>
      </div>
    </main>
  );
}
