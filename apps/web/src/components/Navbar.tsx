import Link from 'next/link';
import { HeartPulse, Search, Sparkles, User, Calendar } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-teal-600 flex items-center justify-center text-white shadow-md shadow-brand-700/20 group-hover:scale-105 transition-transform">
            <HeartPulse className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-brand-700 via-purple-700 to-teal-600 bg-clip-text text-transparent">
            CareFlow
          </span>
        </Link>

        {/* Primary Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600 text-sm">
          <Link href="/" className="hover:text-brand-700 transition-colors flex items-center gap-1.5">
            <Search className="w-4 h-4 text-teal-600" />
            Discover Providers
          </Link>
          <Link href="/ai" className="hover:text-brand-700 transition-colors flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-600" />
            AI Health Assistant
          </Link>
          <Link href="/services" className="hover:text-brand-700 transition-colors">
            Services
          </Link>
          <Link href="/care" className="hover:text-brand-700 transition-colors">
            Care Journey
          </Link>
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/bookings"
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            title="My Appointments"
          >
            <Calendar className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-700 hover:bg-brand-800 rounded-lg shadow-sm transition-all"
          >
            <User className="w-4 h-4" />
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}
