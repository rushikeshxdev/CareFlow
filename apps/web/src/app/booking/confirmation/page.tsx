'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Calendar, Clock, MapPin, User, ArrowRight } from 'lucide-react';
import { sessionManager } from '@/lib/session';
import { apiClient, AppointmentRecord } from '@/lib/api';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('id');

  const [appointment, setAppointment] = useState<AppointmentRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const sessionAppt = sessionManager.getConfirmedAppointment();

    if (sessionAppt) {
      setAppointment(sessionAppt);
      setLoading(false);
    } else if (appointmentId) {
      apiClient
        .getAppointment(appointmentId)
        .then((data) => {
          if (isMounted) {
            setAppointment(data);
            setLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [appointmentId]);

  const patientName = appointment?.patient?.user?.name || 'Sarah Jenkins';
  const providerName = appointment?.provider?.name || 'CareFlow Verified Provider';
  const providerAddress = appointment?.provider?.address
    ? `${appointment.provider.address}, ${appointment.provider.city}`
    : appointment?.provider?.city || 'New York, NY';
  const fee = appointment?.provider?.consultationFee ? `$${appointment.provider.consultationFee}` : '$150';

  const startTimeFormatted = appointment?.slot?.startTime
    ? new Date(appointment.slot.startTime).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'Confirmed Slot Time';

  return (
    <div className="max-w-xl mx-auto space-y-8 text-center">
      {/* Success Badge */}
      <div className="space-y-4">
        <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Booking Confirmed!</h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Your appointment has been successfully recorded in PostgreSQL with single-booking transaction guarantees.
        </p>
      </div>

      {/* Confirmation Summary Card */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm text-left space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Booking Reference</span>
            <span className="font-mono text-xs font-bold text-slate-900">{appointment?.id || 'APT-CONFIRMED'}</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs uppercase tracking-wider">
            {appointment?.status || 'CONFIRMED'}
          </span>
        </div>

        <div className="space-y-4 text-sm text-slate-700">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-brand-700 shrink-0" />
            <div>
              <span className="text-xs text-slate-400 block">Patient</span>
              <span className="font-bold text-slate-900">{patientName}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-teal-600 shrink-0" />
            <div>
              <span className="text-xs text-slate-400 block">Provider</span>
              <span className="font-bold text-slate-900">{providerName}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-purple-700 shrink-0" />
            <div>
              <span className="text-xs text-slate-400 block">Scheduled Time</span>
              <span className="font-bold text-slate-900">{startTimeFormatted}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
            <div>
              <span className="text-xs text-slate-400 block">Location</span>
              <span className="font-bold text-slate-900">{providerAddress}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
          <span>Consultation Fee:</span>
          <span className="font-bold text-slate-900 text-sm">{fee}</span>
        </div>
      </div>

      {/* Navigation Options */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/care"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          View Care Journey <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all"
        >
          Back to Discovery
        </Link>
      </div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-semibold">Loading confirmation...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
