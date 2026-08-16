'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Sparkles, Stethoscope, Building2, TestTube2, Home, Star, ShieldCheck, MapPin, ArrowRight, Activity } from 'lucide-react';
import { apiClient, ProviderItem } from '@/lib/api';

export default function HomePage() {
  const [featuredProviders, setFeaturedProviders] = useState<ProviderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .getProviders({ sortBy: 'score' })
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setFeaturedProviders(data.slice(0, 3));
        }
      })
      .catch(() => {
        // Ignore fetch errors gracefully
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl bg-gradient-to-br from-brand-700 via-purple-900 to-slate-900 text-white p-8 sm:p-12 overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.25),transparent_50%)]" />
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-teal-300 text-xs font-semibold uppercase tracking-wider border border-white/15">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Assisted Care Discovery
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Find the Right Care. <br />
            <span className="bg-gradient-to-r from-teal-300 to-purple-200 bg-clip-text text-transparent">
              Book Confidently with AI.
            </span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Describe your symptoms or search providers directly. CareFlow matches you with top-rated doctors, hospitals, diagnostic labs, and home-care providers with real-time slot availability.
          </p>

          {/* AI Concern Callout Button */}
          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              href="/ai"
              className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-teal-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              Describe Symptoms with AI
            </Link>
            <Link
              href="/recommendations"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-md transition-all"
            >
              Browse All Providers
            </Link>
          </div>
        </div>
      </section>

      {/* Provider Type Discovery Cards */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Explore Care Categories</h2>
            <p className="text-slate-500 text-sm">Select a category to discover verified healthcare providers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Doctors & Specialists', icon: Stethoscope, color: 'from-brand-500 to-purple-600', count: '15 Verified Doctors', type: 'DOCTOR' },
            { title: 'Hospitals & Clinics', icon: Building2, color: 'from-blue-500 to-cyan-600', count: '5 Super-Specialty Centers', type: 'HOSPITAL' },
            { title: 'Diagnostic Labs', icon: TestTube2, color: 'from-teal-500 to-emerald-600', count: '5 Accredited Labs', type: 'DIAGNOSTIC_CENTER' },
            { title: 'Home Care Services', icon: Home, color: 'from-indigo-500 to-brand-600', count: '5 Home Care Agencies', type: 'HOME_CARE' },
          ].map((cat, i) => (
            <Link
              key={i}
              href={`/recommendations?type=${cat.type}`}
              className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-brand-500/40 hover:shadow-lg transition-all cursor-pointer block"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                <cat.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">{cat.title}</h3>
              <p className="text-xs text-slate-500 mb-4">{cat.count}</p>
              <div className="flex items-center gap-1 text-brand-700 font-semibold text-xs group-hover:gap-2 transition-all">
                Browse Providers <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Providers Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Top Rated Providers</h2>
            <p className="text-slate-500 text-sm">Ranked deterministically by specialty match, rating, and slot availability</p>
          </div>
          <Link href="/recommendations" className="text-sm font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-2 bg-white rounded-2xl border border-slate-200">
            <Activity className="w-6 h-6 text-brand-600 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-600">Loading top rated providers...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProviders.map((provider) => {
              const primarySpecialty = provider.specialties?.[0]?.specialty?.name || provider.type;
              const avatar = provider.type === 'HOSPITAL' ? '🏥' : provider.type === 'DIAGNOSTIC_CENTER' ? '🔬' : provider.type === 'HOME_CARE' ? '🏡' : '👨‍⚕️';

              return (
                <div key={provider.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl border border-slate-200">
                          {avatar}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base">{provider.name}</h3>
                          <p className="text-xs font-medium text-teal-700">{primarySpecialty}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 font-bold text-xs border border-brand-200">
                        Score: {provider.matchScore || 95}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 mb-6">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {provider.city ? `${provider.city}, ${provider.state}` : 'New York, NY'}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="font-semibold text-slate-900">{provider.rating}</span>
                        <span>({provider.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400">Consultation Fee</span>
                      <p className="font-bold text-slate-900 text-base">${provider.consultationFee}</p>
                    </div>
                    <Link
                      href={`/providers/${provider.id}`}
                      className="px-4 py-2 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold shadow-sm transition-all"
                    >
                      Book Slot
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Trust & Transparency Feature Banner */}
      <section className="p-8 rounded-2xl bg-slate-100 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-white shadow-sm border border-slate-200 text-brand-700">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Deterministic Ranking</h4>
            <p className="text-xs text-slate-500 mt-1">Explainable provider scoring based on specialty relevance, rating, and instant availability.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-white shadow-sm border border-slate-200 text-teal-600">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">AI Concern Extraction</h4>
            <p className="text-xs text-slate-500 mt-1">Describe symptoms in plain text; AI extracts intent and matches you with verified specialists.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-white shadow-sm border border-slate-200 text-purple-700">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Zero Double-Booking</h4>
            <p className="text-xs text-slate-500 mt-1">Redis temporary hold locking combined with PostgreSQL transactional state validation.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
