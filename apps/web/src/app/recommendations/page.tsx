'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Star, MapPin, Sparkles, Filter, ArrowRight, Search, Activity } from 'lucide-react';
import { apiClient, ProviderItem } from '@/lib/api';
import { sessionManager } from '@/lib/session';

function RecommendationsContent() {
  const searchParams = useSearchParams();
  const initialSpecialty = searchParams.get('specialty') || '';
  const initialType = searchParams.get('type') || '';
  const initialSearch = searchParams.get('search') || '';

  const [specialty, setSpecialty] = useState(initialSpecialty || 'Cardiology');
  const [providerType, setProviderType] = useState(initialType);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [cityFilter, setCityFilter] = useState('');
  
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if AI result exists in session to initialize search
  useEffect(() => {
    const aiResult = sessionManager.getAiResult();
    if (aiResult && aiResult.aiAnalysis?.recommendedSpecialty && !initialSpecialty) {
      setSpecialty(aiResult.aiAnalysis.recommendedSpecialty);
    }
  }, [initialSpecialty]);

  // Load providers from NestJS backend API
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const filterSearch = searchQuery || specialty;
    apiClient
      .getProviders({
        search: filterSearch,
        providerType: providerType as any,
        city: cityFilter || undefined,
        sortBy: 'score',
      })
      .then((data) => {
        if (isMounted) {
          setProviders(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.message || 'Failed to load providers.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [specialty, providerType, searchQuery, cityFilter]);

  const handleSelectProvider = (p: ProviderItem) => {
    sessionManager.setSelectedProvider(p);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 font-semibold text-xs border border-brand-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Matched for {specialty || 'Healthcare'}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Recommended Healthcare Providers</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Providers ranked deterministically by specialty match, rating, and immediate availability.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search provider name or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-900 outline-none w-48 sm:w-56"
            />
          </div>

          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="">All Specialties</option>
            <option value="Cardiology">Cardiology</option>
            <option value="General Medicine">General Medicine</option>
            <option value="Neurology">Neurology</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="Pulmonology">Pulmonology</option>
            <option value="Gynecology">Gynecology</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Dermatology">Dermatology</option>
          </select>

          <select
            value={providerType}
            onChange={(e) => setProviderType(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="">All Category Types</option>
            <option value="DOCTOR">Doctor / Specialist</option>
            <option value="HOSPITAL">Hospital</option>
            <option value="DIAGNOSTIC_CENTER">Diagnostic Center</option>
            <option value="HOME_CARE">Home Care</option>
          </select>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-12 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
          <Activity className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Querying & Ranking Providers...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold text-center">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && providers.length === 0 && (
        <div className="p-12 text-center space-y-4 bg-white rounded-2xl border border-slate-200">
          <Filter className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Providers Match Your Criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try broadening your search query or selecting a different specialty category.
          </p>
          <button
            onClick={() => {
              setSpecialty('');
              setSearchQuery('');
              setProviderType('');
            }}
            className="px-4 py-2 rounded-lg bg-brand-50 text-brand-700 font-bold text-xs border border-brand-200"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Scored Providers Grid */}
      {!loading && !error && providers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100 mb-1 inline-block">
                      {p.type}
                    </span>
                    <h3 className="font-bold text-slate-900 text-lg leading-snug">{p.name}</h3>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 font-bold text-xs border border-brand-200">
                      Score: {p.matchScore || 90}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">{p.bio}</p>

                <div className="space-y-2 text-xs text-slate-600 mb-6">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {p.address ? `${p.address}, ${p.city}` : p.city || 'New York, NY'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="font-semibold text-slate-900">{p.rating}</span>
                    <span>({p.reviewCount} reviews) • {p.experienceYears} yrs exp</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Fee</span>
                  <span className="font-bold text-slate-900 text-base">${p.consultationFee}</span>
                </div>

                <Link
                  href={`/providers/${p.id}`}
                  onClick={() => handleSelectProvider(p)}
                  className="px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-1"
                >
                  Select & View Availability <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RecommendationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-semibold">Loading recommendations...</div>}>
      <RecommendationsContent />
    </Suspense>
  );
}
