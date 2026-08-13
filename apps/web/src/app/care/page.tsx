import Link from 'next/link';
import { Activity, Stethoscope, TestTube2, CheckCircle2, Clock, ArrowRight } from 'lucide-react';

export default function CareDashboardPage() {
  const events = [
    { title: 'Initial Cardiology Consultation', date: 'Today, 9:00 AM', status: 'CONFIRMED', icon: Stethoscope },
    { title: 'ECG & Cardiac Blood Panel', date: 'Tomorrow, 10:00 AM', status: 'RECOMMENDED', icon: TestTube2 },
    { title: 'Cardiology Follow-Up Review', date: 'In 7 Days', status: 'PENDING', icon: Activity },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100 mb-2 inline-block">
          Patient Care Journey
        </span>
        <h1 className="text-2xl font-bold text-slate-900">Active Care Process: Cardiovascular Assessment</h1>
        <p className="text-xs text-slate-500 mt-1">Lightweight patient care journey tracking consultation, diagnostics, and follow-up.</p>
      </div>

      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Care Milestones</h3>

        <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-200">
          {events.map((ev, i) => (
            <div key={i} className="relative flex items-start gap-4 z-10">
              <div className="w-10 h-10 rounded-full bg-brand-700 text-white flex items-center justify-center shadow-md shrink-0">
                <ev.icon className="w-5 h-5" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex-grow flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{ev.title}</h4>
                  <span className="text-xs text-slate-500 mt-0.5 block">{ev.date}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-brand-100 text-brand-700 font-bold text-xs">
                  {ev.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
