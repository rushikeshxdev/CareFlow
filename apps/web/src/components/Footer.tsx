import { HeartPulse, ShieldAlert } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <HeartPulse className="w-5 h-5 text-teal-400" />
              CareFlow
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              AI-powered healthcare discovery, provider search, and seamless appointment booking platform.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Discovery</h4>
            <ul className="space-y-2 text-sm">
              <li>Doctors & Specialists</li>
              <li>Hospitals & Clinics</li>
              <li>Diagnostic Labs</li>
              <li>Home Care Services</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>AI Health Assistant</li>
              <li>Care Journey Manager</li>
              <li>Provider Availability API</li>
              <li>Developer Documentation</li>
            </ul>
          </div>
          <div>
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
                <ShieldAlert className="w-4 h-4" />
                Informational Disclaimer
              </div>
              CareFlow AI provides informational guidance only and does not diagnose conditions or issue clinical prescriptions.
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-xs text-center text-slate-500">
          © {new Date().getFullYear()} CareFlow Healthcare Platform. Built for portfolio & candidate application evaluation.
        </div>
      </div>
    </footer>
  );
}
