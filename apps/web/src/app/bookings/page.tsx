import Link from 'next/link';
import { Calendar, Clock, MapPin, CheckCircle2 } from 'lucide-react';

export default function BookingsListPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">My Appointments</h1>
        <p className="text-xs text-slate-500 mt-1">History of confirmed, held, and completed appointments</p>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-700 font-bold flex items-center justify-center text-xl">
            👨‍⚕️
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Dr. Aris Thorne</h3>
            <p className="text-xs font-semibold text-teal-700">Cardiology • 9:00 AM Today</p>
            <span className="text-xs text-slate-400">100 Medical Center Way, NY</span>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
          CONFIRMED
        </span>
      </div>
    </div>
  );
}
