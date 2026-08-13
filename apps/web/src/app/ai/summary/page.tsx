'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Stethoscope, AlertTriangle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AiSummaryPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('careflow_ai_result');
    if (raw) {
      setData(JSON.parse(raw));
    }
  }, []);

  const ai = data?.aiAnalysis || {
    intent: 'find_doctor',
    recommendedSpecialty: 'Cardiology',
    recommendedServiceType: 'CONSULTATION',
    suggestedAction: 'Schedule an urgent cardiology consultation and ECG cardiac screening.',
    urgency: 'urgent',
    summary: 'Reported symptoms indicate chest discomfort requiring cardiovascular evaluation.',
    keySymptoms: ['Chest discomfort', 'Palpitations'],
    disclaimer: 'Informational guidance only. CareFlow AI does not diagnose conditions.',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page Title */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 font-semibold text-xs border border-teal-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            AI Intent Analysis Complete
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Care Guidance Summary</h1>
        </div>

        <span
          className={`px-3 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider ${
            ai.urgency === 'urgent' || ai.urgency === 'emergency'
              ? 'bg-rose-100 text-rose-700 border border-rose-200'
              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
          }`}
        >
          Urgency: {ai.urgency}
        </span>
      </div>

      {/* Structured AI Analysis Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Clinical Summary</h3>
          <p className="text-slate-800 text-base font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            "{ai.summary}"
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-brand-50/60 border border-brand-100">
            <span className="text-xs font-semibold text-brand-700 block mb-1">Recommended Specialty</span>
            <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
              <Stethoscope className="w-5 h-5 text-brand-600" />
              {ai.recommendedSpecialty}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-100">
            <span className="text-xs font-semibold text-teal-700 block mb-1">Suggested Care Action</span>
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              {ai.suggestedAction}
            </div>
          </div>
        </div>

        {/* Extracted Key Symptoms */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Extracted Key Symptoms</h4>
          <div className="flex flex-wrap gap-2">
            {ai.keySymptoms?.map((sym: string, i: number) => (
              <span key={i} className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                {sym}
              </span>
            ))}
          </div>
        </div>

        {/* Safety Disclaimer */}
        <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <span>{ai.disclaimer}</span>
        </div>
      </div>

      {/* Action CTA to View Recommended Providers */}
      <div className="flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-brand-700 to-purple-800 text-white shadow-md">
        <div>
          <h3 className="font-bold text-lg">Ready to find top providers?</h3>
          <p className="text-slate-200 text-xs mt-0.5">
            Discover verified {ai.recommendedSpecialty} providers with immediate availability.
          </p>
        </div>
        <Link
          href="/recommendations"
          className="px-5 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-md transition-all shrink-0"
        >
          View Recommendations <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
