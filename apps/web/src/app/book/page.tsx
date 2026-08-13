'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Calendar, User, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

export default function BookingPage() {
  const router = useRouter();
  const [reason, setReason] = useState('Routine Cardiology Consultation & Symptoms Evaluation');
  const [type, setType] = useState('IN_PERSON');
  const [loading, setLoading] = useState(false);

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: 'demo-patient-sarah-jenkins',
          providerId: '1',
          slotId: 'slot-1',
          serviceId: 'general-consultation',
          type,
          reason,
        }),
      });

      const appointment = await res.json();
      sessionStorage.setItem('careflow_confirmed_appointment', JSON.stringify(appointment));
      router.push('/booking/confirmation');
    } catch {
      // Mock fallback confirmation
      sessionStorage.setItem(
        'careflow_confirmed_appointment',
        JSON.stringify({
          id: `apt-${Date.now()}`,
          patientName: 'Sarah Jenkins',
          providerName: 'Dr. Aris Thorne',
          time: '9:00 AM Today',
          fee: '$150',
          status: 'CONFIRMED',
        })
      );
      router.push('/booking/confirmation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-extrabold text-slate-900">Confirm Appointment Details</h1>
        <p className="text-xs text-slate-500">
          Your slot is currently <span className="font-bold text-amber-600">HELD</span> for 10 minutes.
        </p>
      </div>

      <form onSubmit={handleConfirmBooking} className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        {/* Patient Info Summary */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
              SJ
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Sarah Jenkins</h4>
              <span className="text-xs text-slate-500">sarah.jenkins@example.com</span>
            </div>
          </div>
          <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100">
            Verified Patient
          </span>
        </div>

        {/* Appointment Type Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">
            Appointment Mode
          </label>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'IN_PERSON', label: 'In-Person Visit', desc: 'At New York Medical Clinic' },
              { id: 'VIDEO_CONSULT', label: 'Video Tele-Consult', desc: 'Secure HD Video Call' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setType(m.id)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  type === m.id
                    ? 'bg-brand-50 border-brand-600 ring-2 ring-brand-600/20 shadow-sm'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="font-bold text-slate-900 text-sm">{m.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Reason for Visit */}
        <div>
          <label className="block text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">
            Reason for Visit / Symptoms
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none resize-none"
            required
          />
        </div>

        {/* Confirm Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          {loading ? 'Confirming Transaction...' : 'Confirm Appointment Booking'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
