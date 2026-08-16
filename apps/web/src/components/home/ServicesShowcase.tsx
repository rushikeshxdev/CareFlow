'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export function ServicesShowcase() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      title: 'Accurate Diagnosis & Customised Plans',
      bullets: [
        'Multispecialty Doctor Panel Consultation.',
        'Specialist Consultations - Online And At Clinic.',
        '24x7 Instant GP Doctor Consultation.',
        'Diagnostic Test Bookings – At Home Or Nearby Centers.',
      ],
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
      cta: '/recommendations?type=DOCTOR',
    },
    {
      title: 'Hospital Like Treatment At Home',
      bullets: [
        'ICU Setup & 24x7 Qualified Home Nursing.',
        'Post-Surgical Monitoring & Rehabilitation.',
        'Intravenous Medication & Oxygen Support.',
        'Daily Follow-up by Senior Medical Specialists.',
      ],
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
      cta: '/recommendations?type=HOME_CARE',
    },
    {
      title: 'Affordable Surgery & Post-Surgery Care',
      bullets: [
        'Fixed Price Packages & Complete Cost Transparency.',
        'Dedicated Care Manager Assistance Throughout Stay.',
        'Insurance Claim & Cashless Hospitalization Support.',
        'Post-Discharge Rehabilitation & Home Visits.',
      ],
      image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80',
      cta: '/recommendations?type=HOSPITAL',
    },
  ];

  return (
    <section className="my-16 space-y-8">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-xs font-extrabold tracking-widest uppercase text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
          OUR SERVICES
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
          Complete Care From Diagnosis To Recovery
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Envision a future where quality healthcare is a right, not a privilege.
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap justify-center border-b border-slate-200 gap-2 sm:gap-8 pb-3">
        {tabs.map((t, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`pb-2 px-3 text-xs sm:text-sm font-bold transition-all border-b-2 ${
              activeTab === idx
                ? 'border-purple-700 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {t.title}
          </button>
        ))}
      </div>

      {/* Tab Content Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-purple-50/40 rounded-3xl p-6 sm:p-10 border border-purple-100">
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-md aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-white">
            <img
              src={tabs[activeTab].image}
              alt={tabs[activeTab].title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <h3 className="text-xl font-bold text-slate-900">{tabs[activeTab].title}</h3>

          <ul className="space-y-3">
            {tabs[activeTab].bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <div className="pt-2 flex items-center gap-4">
            <Link
              href={tabs[activeTab].cta}
              className="px-6 py-2.5 rounded-full bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              Book Now <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/recommendations"
              className="px-6 py-2.5 rounded-full bg-white hover:bg-slate-100 text-purple-700 font-bold text-xs border border-purple-200 transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
