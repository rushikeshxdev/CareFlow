'use client';

import Link from 'next/link';
import { HeartPulse, Search, Sparkles, User, Calendar, LogOut, Activity } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export function Navbar() {
  const { user, isLoading, logout } = useAuth();

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
          <Link href="/care" className="hover:text-brand-700 transition-colors">
            Care Journey
          </Link>
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="w-8 h-8 flex items-center justify-center text-slate-400">
              <Activity className="w-4 h-4 animate-spin" />
            </div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/care"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-brand-700 text-white flex items-center justify-center text-[10px] font-black">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span>{user.name.split(' ')[0]}</span>
              </Link>
              <button
                onClick={() => logout()}
                className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-700 hover:bg-brand-800 rounded-lg shadow-sm transition-all"
            >
              <User className="w-4 h-4" />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
