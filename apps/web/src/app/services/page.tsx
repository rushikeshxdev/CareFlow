import Link from 'next/link';
import { Stethoscope, TestTube2, Home, Activity, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ServicesPage() {
  const services = [
    { title: 'General & Specialist Consultation', desc: 'Primary health, fever, and specialist cardiac/neuro evaluation.', icon: Stethoscope, tag: 'CONSULTATION', price: '$80 - $190' },
    { title: 'ECG & Cardiac Screening', desc: '12-lead Electrocardiogram & blood panel diagnostic tests.', icon: TestTube2, tag: 'DIAGNOSTIC', price: '$120' },
    { title: 'Full Body Blood Panel', desc: 'Comprehensive lipid, endocrine, and metabolic blood test.', icon: Activity, tag: 'DIAGNOSTIC', price: '$150' },
    { title: 'Home Nursing Care', desc: '4-hour professional home nursing for post-op and geriatric care.', icon: Home, tag: 'HOME_NURSING', price: '$160' },
  ];

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Healthcare Services Catalog</h1>
        <p className="text-xs text-slate-500 mt-1">Discover consultation, diagnostic lab, and home care services</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((s, i) => (
          <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center">
                  <s.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-100 uppercase">
                  {s.tag}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-lg">{s.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{s.desc}</p>
            </div>

            <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">{s.price}</span>
              <Link href="/" className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1">
                Find Providers <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
