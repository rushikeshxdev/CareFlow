import Link from 'next/link';
import { Heart, Activity, Brain, Bone, Stethoscope, Baby, Shield, Eye, Droplet, Sun, Pill, Sparkles, ArrowRight } from 'lucide-react';

export function SpecialitiesSection() {
  const specialties = [
    { name: 'Heart Care', slug: 'Cardiology', icon: Heart, desc: 'Cardiology & Heart Health' },
    { name: 'Kidney Care', slug: 'Nephrology', icon: Droplet, desc: 'Kidney & Renal Evaluation' },
    { name: 'Lung Care', slug: 'Pulmonology', icon: Activity, desc: 'Respiratory & Pulmonology' },
    { name: 'Musculoskeletal Care', slug: 'Orthopedics', icon: Bone, desc: 'Orthopedics & Joint Care' },
    { name: 'Neuro Care', slug: 'Neurology', icon: Brain, desc: 'Brain & Nervous System' },
    { name: 'ENT Care', slug: 'ENT', icon: Stethoscope, desc: 'Ear, Nose & Throat' },
    { name: 'Gynae & IVF', slug: 'Gynecology', icon: Sun, desc: 'Women\'s Health & IVF' },
    { name: 'Elderly Care', slug: 'Geriatrics', icon: Shield, desc: 'Geriatric & Home Nursing' },
    { name: 'Pediatric Care', slug: 'Pediatrics', icon: Baby, desc: 'Child & Newborn Care' },
    { name: 'Skin Care', slug: 'Dermatology', icon: Eye, desc: 'Dermatology & Skin' },
    { name: 'Diet & Nutrition', slug: 'Nutrition', icon: Pill, desc: 'Clinical Nutrition & Diet' },
    { name: 'General Medicine', slug: 'General Medicine', icon: Sparkles, desc: 'Primary & Internal Care' },
  ];

  return (
    <section className="my-16 space-y-8">
      {/* Section Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-xs font-extrabold tracking-widest uppercase text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
          OUR SPECIALITIES
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
          We offer treatment across 30+ specialties
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Our select panel of doctors is one of the country's most experienced and highest-rated.
        </p>
      </div>

      {/* 12 Circular Specialties Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
        {specialties.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="group p-5 rounded-3xl bg-purple-50/50 hover:bg-white border border-purple-100/60 hover:border-purple-300 shadow-sm hover:shadow-xl transition-all text-center flex flex-col items-center justify-between space-y-4"
            >
              {/* Circular Icon Badge */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-700/20 group-hover:scale-110 transition-transform">
                <Icon className="w-8 h-8" />
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">{item.name}</h3>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{item.desc}</p>
              </div>

              {/* Pill Action Button */}
              <Link
                href={`/recommendations?specialty=${encodeURIComponent(item.slug)}`}
                className="w-full py-1.5 rounded-full bg-white group-hover:bg-purple-700 text-purple-700 group-hover:text-white border border-purple-200 group-hover:border-purple-700 font-bold text-[11px] transition-all flex items-center justify-center gap-1 shadow-xs"
              >
                Book now <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
