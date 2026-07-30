export default function ETFPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">ETF & PAC</h1>
        <p className="text-slate-400 text-sm mt-1">Piani di accumulo su ETF</p>
      </div>
      <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-8 text-center">
        <p className="text-4xl mb-3">📊</p>
        <p className="text-white font-medium">Nessun piano PAC</p>
        <p className="text-slate-500 text-sm mt-1">Crea il tuo primo piano di accumulo</p>
        <button className="mt-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition">
          + Nuovo PAC
        </button>
      </div>
    </div>
  );
}
