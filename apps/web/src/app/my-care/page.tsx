'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { apiClient, CareJourneyItem, CareEventItem } from '@/lib/api';
import {
  Activity,
  Stethoscope,
  TestTube2,
  Brain,
  Pill,
  CalendarCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export default function MyCarePage() {
  const { user, accessToken, isLoading: authLoading } = useAuth();
  const isAuthenticated = Boolean(user || accessToken);
  const [journeys, setJourneys] = useState<CareJourneyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJourneys = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getCareJourneys();
      setJourneys(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load your care journeys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchJourneys();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'AI_ASSESSMENT':
        return Brain;
      case 'CONSULTATION':
        return Stethoscope;
      case 'DIAGNOSTIC_TEST':
        return TestTube2;
      case 'PRESCRIPTION':
        return Pill;
      case 'FOLLOW_UP':
        return Activity;
      default:
        return CalendarCheck;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {status}
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-semibold text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-semibold text-xs">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs">
            {status}
          </span>
        );
    }
  };

  // Auth Protection Check
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center mx-auto shadow-sm">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-900">Patient Authentication Required</h1>
          <p className="text-xs text-slate-500">
            Please log in to your CareFlow patient account to view your active care journeys and medical milestones.
          </p>
        </div>
        <div className="flex gap-3 justify-center pt-2">
          <Link
            href="/login"
            className="px-6 py-2.5 rounded-xl bg-teal-700 text-white text-xs font-bold shadow-md hover:bg-teal-800 transition"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-1 rounded-md border border-teal-200 mb-2 inline-block">
            Longitudinal Patient Portal
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">My Active Care Journeys</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time PostgreSQL care journey tracking, consultations, and medical events for{' '}
            <span className="font-semibold text-slate-700">{user?.name || user?.email}</span>.
          </p>
        </div>

        <Link
          href="/providers"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition"
        >
          Book Consultation <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-12 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Fetching your active care journeys from CareFlow DB...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-8 rounded-3xl bg-red-50 border border-red-200 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
          <div>
            <h3 className="text-sm font-bold text-red-900">Unable to load Care Journeys</h3>
            <p className="text-xs text-red-700 mt-1">{error}</p>
          </div>
          <button
            onClick={fetchJourneys}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && journeys.length === 0 && (
        <div className="p-12 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center mx-auto">
            <Activity className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-slate-900">No Active Care Journeys</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              You do not have any care journeys yet. You can start a care journey by consulting our AI Care Assistant or directly booking a doctor consultation.
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <Link
              href="/ai"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
            >
              Talk to CareFlow AI
            </Link>
            <Link
              href="/providers"
              className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition"
            >
              Search Doctors & Clinics
            </Link>
          </div>
        </div>
      )}

      {/* Journeys List */}
      {!loading && !error && journeys.length > 0 && (
        <div className="space-y-8">
          {journeys.map((journey) => (
            <div key={journey.id} className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
              {/* Care Journey Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-slate-900">{journey.title}</h2>
                    {getStatusBadge(journey.status)}
                  </div>
                  {journey.description && (
                    <p className="text-xs text-slate-500 mt-1">{journey.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 font-medium block">Started on</span>
                  <span className="text-xs font-semibold text-slate-700">
                    {new Date(journey.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Timeline Milestones */}
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Care Timeline Milestones ({journey.events?.length || 0})
                </h3>

                {(!journey.events || journey.events.length === 0) ? (
                  <p className="text-xs text-slate-400 italic">No events logged yet for this journey.</p>
                ) : (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-[19px] before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                    {journey.events.map((event: CareEventItem) => {
                      const EventIcon = getEventIcon(event.eventType);
                      const isAppointmentUpcoming =
                        event.status === 'CONFIRMED' &&
                        event.appointment?.slot?.startTime &&
                        new Date(event.appointment.slot.startTime) > new Date();

                      return (
                        <div key={event.id} className="relative flex items-start gap-4 z-10">
                          {/* Event Icon Node */}
                          <div className="w-10 h-10 rounded-full bg-teal-700 text-white flex items-center justify-center shadow-md shrink-0 border-2 border-white -ml-6">
                            <EventIcon className="w-5 h-5" />
                          </div>

                          {/* Event Details Card */}
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex-grow flex flex-wrap items-center justify-between gap-4">
                            <div className="space-y-1 max-w-lg">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-900 text-sm">{event.title}</h4>
                                {isAppointmentUpcoming && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                    <Clock className="w-3 h-3" /> Upcoming
                                  </span>
                                )}
                              </div>
                              {event.description && (
                                <p className="text-xs text-slate-600 leading-relaxed">{event.description}</p>
                              )}
                              <span className="text-[11px] text-slate-400 block pt-0.5">
                                {new Date(event.eventDate || event.createdAt).toLocaleString('en-US', {
                                  dateStyle: 'medium',
                                  timeStyle: 'short',
                                })}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              {getStatusBadge(event.status)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
