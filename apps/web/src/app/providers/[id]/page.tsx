'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, MapPin, Calendar, Clock, ArrowRight, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiClient, ProviderItem, AvailabilitySlotItem } from '@/lib/api';
import { sessionManager } from '@/lib/session';

export default function ProviderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [provider, setProvider] = useState<ProviderItem | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlotItem[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [holding, setHolding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [holdSuccessMessage, setHoldSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      apiClient.getProvider(params.id),
      apiClient.getAvailability(params.id),
    ])
      .then(([provData, slotData]) => {
        if (isMounted) {
          setProvider(provData);
          setSlots(Array.isArray(slotData) ? slotData : provData.availabilitySlots || []);
          sessionManager.setSelectedProvider(provData);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.message || 'Failed to load provider availability details.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  const handleHoldAndProceed = async () => {
    if (!selectedSlot || !provider) return;
    setHolding(true);
    setError(null);

    const chosenSlot = slots.find((s) => s.id === selectedSlot);
    const slotTimeFormatted = chosenSlot
      ? new Date(chosenSlot.startTime).toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      : 'Selected Slot';

    try {
      const response = await apiClient.holdSlot({
        slotId: selectedSlot,
        patientId: 'demo-patient-sarah-jenkins',
      });

      sessionManager.setSelectedSlot(selectedSlot, slotTimeFormatted);
      sessionManager.setSelectedProvider(provider);
      setHoldSuccessMessage(response.message || 'Slot reserved for 10 minutes.');

      setTimeout(() => {
        router.push('/book');
      }, 600);
    } catch (err: any) {
      if (err?.status === 409 || err?.message?.includes('already') || err?.message?.includes('held')) {
        setError('That appointment slot is no longer available. Please select another time.');
      } else {
        setError(err?.message || 'We couldn\'t hold this slot. Please try again.');
      }

      // Refresh slots state
      apiClient.getAvailability(params.id).then((freshSlots) => {
        setSlots(freshSlots);
        setSelectedSlot(null);
      });
    } finally {
      setHolding(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center space-y-3 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <Activity className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-700">Loading Provider Availability & Profile...</p>
      </div>
    );
  }

  if (error && !provider) {
    return (
      <div className="max-w-xl mx-auto p-8 rounded-3xl bg-rose-50 border border-rose-200 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
        <h2 className="text-lg font-bold text-rose-950">Provider Not Found</h2>
        <p className="text-xs text-rose-800">{error}</p>
        <button
          onClick={() => router.push('/recommendations')}
          className="px-4 py-2 rounded-xl bg-rose-700 text-white font-bold text-xs shadow-md"
        >
          Back to Provider Discovery
        </button>
      </div>
    );
  }

  const primarySpecialty = provider?.specialties?.[0]?.specialty?.name || 'Healthcare Provider';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Provider Hero Header */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-3xl shrink-0">
            {provider?.type === 'HOSPITAL' ? '🏥' : provider?.type === 'DIAGNOSTIC_CENTER' ? '🔬' : provider?.type === 'HOME_CARE' ? '🏡' : '👨‍⚕️'}
          </div>
          <div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100 uppercase tracking-wider mb-2 inline-block">
              {primarySpecialty}
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900">{provider?.name}</h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
              {provider?.bio || `Experienced ${primarySpecialty} provider delivering patient-centered medical care.`}
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-600 mt-4">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-slate-400" />
                {provider?.address ? `${provider.address}, ${provider.city}` : provider?.city || 'New York, NY'}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-bold text-slate-900">{provider?.rating}</span> ({provider?.reviewCount} reviews)
              </div>
              <div>• {provider?.experienceYears} years experience</div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[160px]">
          <span className="text-xs text-slate-500 block">Consultation Fee</span>
          <span className="text-2xl font-extrabold text-slate-900">${provider?.consultationFee}</span>
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
            Slots are reserved in real-time with a 10-minute temporary hold to prevent double-booking.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {holdSuccessMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            {holdSuccessMessage}
          </div>
        )}

        {slots.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
            No availability slots currently published for this provider.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {slots.map((s) => {
              const isSelected = selectedSlot === s.id;
              const isAvailable = s.status === 'AVAILABLE';

              const startTimeFormatted = new Date(s.startTime).toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              });

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
                  <span className="font-bold text-slate-900 text-xs leading-snug">{startTimeFormatted}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Hold & Continue Action */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-500">
            {selectedSlot
              ? 'Slot selected. Click to hold for 10 minutes.'
              : 'Please select an available slot above.'}
          </span>
          <button
            disabled={!selectedSlot || holding}
            onClick={handleHoldAndProceed}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            {holding ? 'Reserving Temporary Hold...' : 'Hold Slot & Proceed to Booking'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
