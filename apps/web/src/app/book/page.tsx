'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Calendar, User, ArrowRight, AlertCircle, Clock, MapPin } from 'lucide-react';
import { apiClient, ProviderItem } from '@/lib/api';
import { sessionManager } from '@/lib/session';

export default function BookingPage() {
  const router = useRouter();
  const [provider, setProvider] = useState<ProviderItem | null>(null);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [slotTime, setSlotTime] = useState<string | null>(null);

  const [reason, setReason] = useState('Consultation & Medical Evaluation');
  const [type, setType] = useState<'IN_PERSON' | 'VIDEO_CONSULT' | 'HOME_VISIT'>('IN_PERSON');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConflict, setIsConflict] = useState(false);

  useEffect(() => {
    const sId = sessionManager.getSelectedSlotId();
    const sTime = sessionManager.getSelectedSlotTime();
    const prov = sessionManager.getSelectedProvider();

    if (!sId || !prov) {
      // If no slot is selected in session, redirect to provider search
      router.push('/recommendations');
      return;
    }

    setSlotId(sId);
    setSlotTime(sTime);
    setProvider(prov);
  }, [router]);

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotId || !provider || loading) return;

    setLoading(true);
    setError(null);
    setIsConflict(false);

    try {
      const appointment = await apiClient.createAppointment({
        patientId: 'demo-patient-sarah-jenkins',
        providerId: provider.id,
        slotId: slotId,
        serviceId: 'general-consultation',
        type: type,
        reason: reason,
      });

      sessionManager.setConfirmedAppointment(appointment);
      sessionManager.clearBookingSession();
      router.push('/booking/confirmation');
    } catch (err: any) {
      if (err?.status === 409 || err?.message?.includes('booked') || err?.message?.includes('held')) {
        setIsConflict(true);
        setError('That appointment slot is no longer available.');
      } else if (err?.message?.includes('expired')) {
        setError('Your slot hold expired. Please select another time.');
      } else {
        setError(err?.message || 'We couldn\'t complete your booking. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-extrabold text-slate-900">Confirm Appointment Details</h1>
        <p className="text-xs text-slate-500">
          Your slot is currently <span className="font-bold text-amber-600">HELD</span> for 10 minutes. Complete your booking below.
        </p>
      </div>

      {/* Selected Provider & Slot Summary Card */}
      {provider && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100 mb-1 inline-block">
              {provider.type}
            </span>
            <h3 className="font-bold text-slate-900 text-lg">{provider.name}</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {provider.city || 'New York, NY'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Scheduled Time</span>
            <span className="font-bold text-brand-700 text-sm flex items-center gap-1 justify-end">
              <Clock className="w-4 h-4" />
              {slotTime || 'Selected Slot'}
            </span>
            <span className="text-xs font-bold text-slate-900 block mt-1">${provider.consultationFee} Fee</span>
          </div>
        </div>
      )}

      {/* Conflict / Error Banner */}
      {error && (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
          <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            {error}
          </div>
          {isConflict && provider && (
            <button
              onClick={() => router.push(`/providers/${provider.id}`)}
              className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-sm transition-all"
            >
              View Other Available Times
            </button>
          )}
        </div>
      )}

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
              { id: 'IN_PERSON', label: 'In-Person Visit', desc: 'At Provider Facility' },
              { id: 'VIDEO_CONSULT', label: 'Video Tele-Consult', desc: 'Secure HD Video Call' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setType(m.id as any)}
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
          disabled={loading || isConflict}
          className="w-full py-4 rounded-xl bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          {loading ? 'Executing PostgreSQL Transaction...' : 'Confirm Appointment Booking'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
