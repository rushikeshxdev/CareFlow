'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is CareFlow?',
      a: 'CareFlow is an AI-assisted healthcare SaaS platform designed for finding top doctors, holding appointment slots in real-time, preventing double-booking, and managing continuous care journeys.',
    },
    {
      q: 'How Does CareFlow Work?',
      a: 'CareFlow allows patients to describe symptoms in plain text or search for specialists directly. Our system ranks providers deterministically based on rating, specialty match, and immediate slot availability.',
    },
    {
      q: 'How Does Slot Protection Prevent Double-Booking?',
      a: 'When you select an available time slot, CareFlow places a temporary 10-minute lock using Redis. This ensures no other patient can book that exact slot while you complete your booking.',
    },
    {
      q: 'How Can I Get Answers to My Health Queries on CareFlow AI?',
      a: 'Navigate to the AI Health Assistant page, enter your symptoms or health queries, and CareFlow AI will extract clinical intent, urgency level, and suggest the right medical specialty.',
    },
    {
      q: 'Is My Health Data Secure with CareFlow?',
      a: 'Yes, all appointment details, patient records, and care timeline events are securely encrypted and handled with industry-standard privacy protocols.',
    },
  ];

  return (
    <section className="my-16 space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <span className="text-xs font-extrabold tracking-widest uppercase text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
          FAQ
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full p-5 text-left font-bold text-slate-900 text-xs sm:text-sm flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-purple-600 shrink-0" />
                  {faq.q}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-purple-600' : ''}`} />
              </button>

              {isOpen && (
                <div className="p-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-purple-50/20">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
