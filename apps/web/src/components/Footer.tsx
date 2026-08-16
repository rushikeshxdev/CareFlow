import Link from 'next/link';
import { HeartPulse, ShieldAlert, Send } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-16 bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950 text-white rounded-t-3xl sm:rounded-t-[40px] pt-12 sm:pt-16 pb-8 border-t border-purple-900/50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-teal-400 flex items-center justify-center text-white shadow-lg">
                <HeartPulse className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">CareFlow</span>
            </div>
            <p className="text-xs text-purple-200/80 leading-relaxed max-w-sm">
              Simplifying Healthcare For You! Find the best care, manage your care journey, and get intelligent health answers anytime & anywhere.
            </p>
            <div className="text-[11px] text-purple-300/60 font-semibold">
              © {new Date().getFullYear()} CareFlow Health Inc. All rights reserved.
            </div>
          </div>

          {/* For Patients */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-300">For Patients</h4>
            <ul className="space-y-2 text-xs text-purple-100/70 font-medium">
              <li><Link href="/recommendations?type=DOCTOR" className="hover:text-teal-300 transition-colors">Find Doctors</Link></li>
              <li><Link href="/recommendations?type=HOSPITAL" className="hover:text-teal-300 transition-colors">Book Hospital Slots</Link></li>
              <li><Link href="/recommendations?type=DIAGNOSTIC_CENTER" className="hover:text-teal-300 transition-colors">Diagnostic Tests</Link></li>
              <li><Link href="/ai" className="hover:text-teal-300 transition-colors">Cure AI Health Assistant</Link></li>
              <li><Link href="/my-care" className="hover:text-teal-300 transition-colors">Patient Care Journey</Link></li>
            </ul>
          </div>

          {/* Our Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-300">Our Company</h4>
            <ul className="space-y-2 text-xs text-purple-100/70 font-medium">
              <li><a href="#" className="hover:text-teal-300 transition-colors">About CareFlow</a></li>
              <li><a href="#" className="hover:text-teal-300 transition-colors">Careers & Team</a></li>
              <li><a href="#" className="hover:text-teal-300 transition-colors">Doctor Panel Join</a></li>
              <li><a href="#" className="hover:text-teal-300 transition-colors">Help & Contact</a></li>
            </ul>
          </div>

          {/* Newsletter Subscription Bar */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-300">Stay Updated</h4>
            <p className="text-xs text-purple-200/80">Subscribe to receive health tips and system updates.</p>
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full pl-4 pr-24 py-2.5 rounded-full bg-white/10 border border-white/20 text-xs text-white placeholder-purple-300/50 outline-none focus:border-teal-400 transition-all"
              />
              <button className="absolute right-1 top-1 bottom-1 px-4 rounded-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer & Footer Legal */}
        <div className="pt-8 border-t border-purple-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-purple-200/60">
          <div className="flex items-center gap-2 bg-purple-900/40 px-3.5 py-1.5 rounded-full border border-purple-800/50 text-[11px]">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>CareFlow AI provides guidance for informational purposes only. Consult a licensed doctor for emergency medical care.</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
