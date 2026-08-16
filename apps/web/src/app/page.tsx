'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, MapPin, ArrowRight, Activity } from 'lucide-react';
import { apiClient, ProviderItem } from '@/lib/api';
import { HeroSection } from '@/components/home/HeroSection';
import { AiBanner } from '@/components/home/AiBanner';
import { SpecialitiesSection } from '@/components/home/SpecialitiesSection';
import { WhyCareflow } from '@/components/home/WhyCareflow';
import { ServicesShowcase } from '@/components/home/ServicesShowcase';
import { AppointmentWidget } from '@/components/home/AppointmentWidget';
import { CareJourneySection } from '@/components/home/CareJourneySection';
import { FaqSection } from '@/components/home/FaqSection';
import { Testimonials } from '@/components/home/Testimonials';

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
        // Fallback gracefully
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Cure AI Banner */}
      <AiBanner />

      {/* 3. Circular Specialities Grid */}
      <SpecialitiesSection />

      {/* 4. Top Rated Providers Section */}
      <section className="my-16 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-extrabold tracking-widest uppercase text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
              VERIFIED PANEL
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Top Rated Providers
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Providers ranked deterministically by specialty match, review score, and live availability.
            </p>
          </div>
          <Link
            href="/recommendations"
            className="text-xs font-extrabold text-purple-700 hover:text-purple-900 flex items-center gap-1.5 shrink-0"
          >
            View All Providers <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-2 bg-white rounded-3xl border border-slate-200">
            <Activity className="w-6 h-6 text-purple-600 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-600">Loading top rated providers...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProviders.map((provider) => {
              const primarySpecialty = provider.specialties?.[0]?.specialty?.name || provider.type;
              const avatar = provider.type === 'HOSPITAL' ? '🏥' : provider.type === 'DIAGNOSTIC_CENTER' ? '🔬' : provider.type === 'HOME_CARE' ? '🏡' : '👨‍⚕️';

              return (
                <div
                  key={provider.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-2xl border border-purple-100">
                          {avatar}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base">{provider.name}</h3>
                          <p className="text-xs font-medium text-teal-600">{primarySpecialty}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-bold text-xs border border-purple-200">
                        Score: {provider.matchScore || 95}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 mb-6">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {provider.city ? `${provider.city}, ${provider.state || 'NY'}` : 'New York, NY'}
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
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Consultation Fee</span>
                      <p className="font-bold text-slate-900 text-base">${provider.consultationFee}</p>
                    </div>
                    <Link
                      href={`/providers/${provider.id}`}
                      className="px-4 py-2 rounded-full bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1"
                    >
                      Book Slot <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. Why CareFlow Care */}
      <WhyCareflow />

      {/* 6. Services Showcase */}
      <ServicesShowcase />

      {/* 7. Appointment Widget */}
      <AppointmentWidget />

      {/* 8. Care Journey Section */}
      <CareJourneySection />

      {/* 9. FAQ Accordion */}
      <FaqSection />

      {/* 10. Testimonials */}
      <Testimonials />
    </div>
  );
}
