import Link from 'next/link';
import { Sparkles, ArrowRight, Bot } from 'lucide-react';

export function AiBanner() {
  return (
    <section className="my-12">
      <div className="relative rounded-3xl bg-gradient-to-r from-purple-800 via-indigo-900 to-purple-950 text-white p-8 sm:p-12 overflow-hidden shadow-2xl shadow-purple-950/20 border border-purple-700/30">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-teal-300 text-xs font-bold uppercase tracking-wider border border-white/15">
              <Sparkles className="w-3.5 h-3.5" />
              INTELLIGENT SYMPTOM ANALYSIS
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Find the answer to your health query instantly! <br />
              <span className="text-teal-300">Try CareFlow AI now.</span>
            </h2>

            <p className="text-purple-200 text-xs sm:text-sm leading-relaxed max-w-xl">
              Your intelligent Health Assistant, providing continuous care guidance, symptom intent extraction, and real-time specialty recommendations.
            </p>

            <div className="pt-2">
              <Link
                href="/ai"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-slate-100 text-purple-950 font-bold text-xs shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <Bot className="w-4 h-4 text-purple-700" />
                Ask CareFlow AI Now
                <ArrowRight className="w-4 h-4 text-purple-700" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 flex justify-center">
            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-teal-400 to-purple-500 p-1.5 shadow-2xl animate-pulse-slow">
              <div className="w-full h-full rounded-full bg-purple-950 flex flex-col items-center justify-center text-center p-4">
                <Bot className="w-12 h-12 text-teal-300 mb-2" />
                <span className="text-xs font-bold text-white">24/7 AI Assistant</span>
                <span className="text-[10px] text-purple-300">Instant Clinical Intent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
