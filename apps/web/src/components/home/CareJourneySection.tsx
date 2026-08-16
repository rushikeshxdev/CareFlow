import Link from 'next/link';
import { Activity, Stethoscope, ClipboardList, CheckCircle2, ArrowRight } from 'lucide-react';

export function CareJourneySection() {
  const steps = [
    { title: '1. AI Assessment', desc: 'Symptom intent extraction & specialty triage', icon: Activity, color: 'bg-teal-500 text-white' },
    { title: '2. Consultation', desc: '2-tier slot holding & doctor booking', icon: Stethoscope, color: 'bg-purple-600 text-white' },
    { title: '3. Treatment Plan', desc: 'Digital prescriptions & diagnostic scheduling', icon: ClipboardList, color: 'bg-indigo-600 text-white' },
    { title: '4. Follow-up Care', desc: 'Longitudinal milestone tracking & notifications', icon: CheckCircle2, color: 'bg-teal-600 text-white' },
  ];

  return (
    <section className="my-16 p-8 sm:p-12 rounded-3xl bg-slate-900 text-white relative overflow-hidden shadow-2xl">
      <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="space-y-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-extrabold tracking-widest uppercase text-teal-400 bg-teal-950 px-3 py-1 rounded-full border border-teal-800">
              CORE PLATFORM DIFFERENTIATOR
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Your Longitudinal Care Journey
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              CareFlow tracks your care from initial AI symptom assessment to recovery follow-ups.
            </p>
          </div>
          <Link
            href="/my-care"
            className="px-5 py-2.5 rounded-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all shadow-md"
          >
            View My Journey <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4-Step Timeline Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-4">
                <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center font-bold text-sm shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{s.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
