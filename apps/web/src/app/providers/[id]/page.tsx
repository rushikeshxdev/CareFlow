'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, MapPin, Calendar, Clock, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ProviderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [holding, setHolding] = useState(false);

  // Mock slot dataset for interactive booking demo
  const slots = [
    { id: 'slot-1', time: '9:00 AM Today', status: 'AVAILABLE' },
    { id: 'slot-2', time: '11:00 AM Today', status: 'AVAILABLE' },
    { id: 'slot-3', time: '2:00 PM Tomorrow', status: 'AVAILABLE' },
    { id: 'slot-4', time: '4:00 PM Tomorrow', status: 'HELD' },
  ];

  const handleHoldAndProceed = async () => {
    if (!selectedSlot) return;
    setHolding(true);

    try {
      await fetch('http://localhost:3001/appointments/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: selectedSlot,
          patientId: 'demo-patient-sarah-jenkins',
        }),
      });
    } catch {
      // Ignore fallback errors in demo
    }

    sessionStorage.setItem('careflow_selected_slot', selectedSlot);
    sessionStorage.setItem('careflow_provider_id', params.id);
    router.push('/book');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Provider Hero Header */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-3xl shrink-0">
            👨‍⚕️
          </div>
          <div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100 uppercase tracking-wider mb-2 inline-block">
              Senior Cardiologist
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900">Dr. Aris Thorne</h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
              Senior Cardiologist with 14 years of clinical experience in interventional cardiology and cardiac health risk assessment.
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-600 mt-4">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-slate-400" />
                New York, NY
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-bold text-slate-900">4.9</span> (128 reviews)
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[160px]">
          <span className="text-xs text-slate-500 block">Consultation Fee</span>
          <span className="text-2xl font-extrabold text-slate-900">$150</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">30-minute session</span>
        </div>
      </div>

      {/* Interactive Availability Slot Picker */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-700" />
            Select an Available Appointment Slot
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Slots are locked in real-time using Redis temporary hold to prevent double-booking.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {slots.map((s) => {
            const isSelected = selectedSlot === s.id;
            const isAvailable = s.status === 'AVAILABLE';

            return (
              <button
                key={s.id}
                disabled={!isAvailable}
                onClick={() => setSelectedSlot(s.id)}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-28 ${
                  !isAvailable
                    ? 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed'
                    : isSelected
                    ? 'bg-brand-50 border-brand-600 ring-2 ring-brand-600/20 shadow-md'
                    : 'bg-white border-slate-200 hover:border-brand-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Clock className={`w-4 h-4 ${isSelected ? 'text-brand-700' : 'text-slate-400'}`} />
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
                <span className="font-bold text-slate-900 text-sm">{s.time}</span>
              </button>
            );
          })}
        </div>

        {/* Hold & Continue Action */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {selectedSlot ? 'Slot selected. Click to hold for 10 minutes.' : 'Please select a slot above.'}
          </span>
          <button
            disabled={!selectedSlot || holding}
            onClick={handleHoldAndProceed}
            className="px-6 py-3 rounded-xl bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
          >
            {holding ? 'Holding Slot...' : 'Hold Slot & Proceed to Booking'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
