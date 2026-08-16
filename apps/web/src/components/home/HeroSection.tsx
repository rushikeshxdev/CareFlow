'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, ShieldCheck, Star, Calendar, ArrowRight } from 'lucide-react';

export function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/recommendations?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/recommendations');
    }
  };

  return (
    <section className="relative overflow-hidden pt-6 pb-12 sm:pb-16">
      {/* Background Soft Organic Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Curer Dual-Tone Headline & Search */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200 text-purple-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            AI-POWERED HEALTHCARE GUIDE
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            <span className="text-purple-700">Your</span>{' '}
            <span className="text-teal-600">Trusted Health Guide</span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl font-medium">
            Simplifying Healthcare For You! Find top doctors, book instant slots, manage longitudinal care, and get answers — anytime & anywhere.
          </p>

          {/* Floating Search Widget */}
          <form
            onSubmit={handleSearchSubmit}
            className="p-2 sm:p-3 rounded-full bg-white border border-slate-200 shadow-xl shadow-purple-900/5 flex flex-col sm:flex-row items-center gap-2 max-w-xl transition-all focus-within:border-purple-500"
          >
            <div className="flex items-center gap-3 px-4 py-2 w-full">
              <Search className="w-5 h-5 text-purple-600 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search doctor name, specialty, or condition..."
                className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-bold text-xs shadow-md shrink-0 transition-all flex items-center justify-center gap-1.5"
            >
              Find Care <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Trust Badges */}
          <div className="pt-4 flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Verified Specialist Panel</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>Zero Double-Booking Guarantee</span>
            </div>
          </div>
        </div>

        {/* Right Column: Organic Arch Visual Composition */}
        <div className="lg:col-span-5 relative flex justify-center">
          {/* Organic Curved Image Arch Container */}
          <div className="relative w-full max-w-sm sm:max-w-md aspect-[4/5] rounded-[50px] rounded-tl-[120px] rounded-br-[120px] bg-gradient-to-br from-purple-600 to-teal-500 p-2 shadow-2xl overflow-hidden">
            <div className="w-full h-full rounded-[42px] rounded-tl-[112px] rounded-br-[112px] bg-slate-900 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80"
                alt="Doctor consultation visual"
                className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-teal-300">Live Status</span>
                <p className="text-sm font-bold">24x7 Specialist Panel Active</p>
              </div>
            </div>
          </div>

          {/* Floating Healthcare Card Badge 1 */}
          <div className="absolute -top-4 -left-4 sm:left-0 p-4 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-100 shadow-xl flex items-center gap-3 animate-bounce-slow">
            <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-black text-sm">
              98%
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-900">Satisfaction Score</p>
              <p className="text-[10px] text-slate-500">Based on 1,200+ bookings</p>
            </div>
          </div>

          {/* Floating Healthcare Card Badge 2 */}
          <div className="absolute -bottom-4 -right-2 sm:right-0 p-4 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-100 shadow-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-lg">
              ⭐
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-900">4.9 / 5.0 Rating</p>
              <p className="text-[10px] text-slate-500">Super-Specialty Doctors</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
