'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, MapPin, Sparkles, Filter, CheckCircle, ArrowRight } from 'lucide-react';

export default function RecommendationsPage() {
  const [specialty, setSpecialty] = useState('Cardiology');
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem('careflow_ai_result');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.aiAnalysis?.recommendedSpecialty) {
        setSpecialty(parsed.aiAnalysis.recommendedSpecialty);
      }
    }

    // Fetch providers from backend API
    fetch(`http://localhost:3001/providers?search=${encodeURIComponent(specialty)}`)
      .then((res) => res.json())
      .then((data) => {
        setProviders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        // Mock fallback providers
        setProviders([
          { id: '1', name: 'Dr. Aris Thorne', type: 'DOCTOR', bio: 'Senior Cardiologist with 14 years clinical experience.', city: 'New York, NY', rating: 4.9, reviewCount: 128, consultationFee: 150, matchScore: 96 },
          { id: '2', name: 'MetroHealth Medical Center', type: 'HOSPITAL', bio: 'Tier-1 multi-specialty research & trauma hospital.', city: 'New York, NY', rating: 4.8, reviewCount: 520, consultationFee: 200, matchScore: 92 },
          { id: '3', name: 'Apex Diagnostic & Imaging Hub', type: 'DIAGNOSTIC_CENTER', bio: 'Advanced 3T MRI & automated blood lab.', city: 'New York, NY', rating: 4.8, reviewCount: 290, consultationFee: 90, matchScore: 89 },
        ]);
        setLoading(false);
      });
  }, [specialty]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 font-semibold text-xs border border-brand-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Matched for {specialty}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Recommended Providers</h1>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="Cardiology">Cardiology</option>
            <option value="General Medicine">General Medicine</option>
            <option value="Neurology">Neurology</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="Pulmonology">Pulmonology</option>
          </select>
        </div>
      </div>

      {/* Scored Providers Grid */}
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
                  <h3 className="font-bold text-slate-900 text-lg">{p.name}</h3>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 font-bold text-xs border border-brand-200">
                    Match {p.matchScore || 95}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">{p.bio}</p>

              <div className="space-y-2 text-xs text-slate-600 mb-6">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {p.city}
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-semibold text-slate-900">{p.rating}</span>
                  <span>({p.reviewCount} reviews)</span>
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
                className="px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-1"
              >
                View Availability <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
