'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Calendar, User, ArrowRight, AlertCircle, Clock, MapPin, Lock } from 'lucide-react';
import { apiClient, ProviderItem } from '@/lib/api';
import { sessionManager } from '@/lib/session';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';

export default function BookingPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  
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

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent('/book')}`);
      return;
    }

    setLoading(true);
    setError(null);
    setIsConflict(false);

    try {
      const appointment = await apiClient.createAppointment({
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
      if (err?.status === 401) {
        router.push(`/login?redirect=${encodeURIComponent('/book')}`);
      } else if (err?.status === 409 || err?.message?.includes('booked') || err?.message?.includes('held')) {
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
            <span className="text-[11px] font-bold text-slate-700 mt-1 block">
              Fee: ${provider.consultationFee || 150}
            </span>
          </div>
        </div>
      )}

      {!isAuthLoading && !user && (
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Authentication Required</h4>
              <p className="text-xs text-amber-700">Please sign in or register to finalize your appointment booking.</p>
            </div>
          </div>
          <Link
            href={`/login?redirect=${encodeURIComponent('/book')}`}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shrink-0 transition-all"
          >
            Sign In to Book
          </Link>
        </div>
      )}

      {/* Conflict State Error Card */}
      {isConflict ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-3">
          <div className="flex items-center gap-2 font-bold text-rose-800">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <span>Slot Unavailable</span>
          </div>
          <p className="text-xs text-rose-700">
            This appointment slot has already been taken by another patient or your 10-minute hold reservation expired.
          </p>
          <button
            onClick={() => router.push(`/providers/${provider?.id}`)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            Choose Another Available Slot
          </button>
        </div>
      ) : (
        /* Booking Confirmation Form */
        <form onSubmit={handleConfirmBooking} className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          {error && !isConflict && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Consultation Mode
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'IN_PERSON', label: 'In-Person' },
                { id: 'VIDEO_CONSULT', label: 'Video Call' },
                { id: 'HOME_VISIT', label: 'Home Visit' },
              ].map((mode) => (
                <button
                  type="button"
                  key={mode.id}
                  onClick={() => setType(mode.id as any)}
                  className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all ${
                    type === mode.id
                      ? 'border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
              Reason for Visit / Symptoms
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Briefly describe your symptoms or concern..."
              required
              className="w-full p-4 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Protected by two-layer Redis hold and PostgreSQL atomic transaction.</span>
          </div>

          <button
            type="submit"
            disabled={loading || !user}
            className="w-full py-4 rounded-xl bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Confirming Booking...</span>
            ) : !user ? (
              <span>Sign In Required to Confirm</span>
            ) : (
              <>
                Confirm & Book Appointment <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
