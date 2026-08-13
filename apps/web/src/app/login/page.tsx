'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeartPulse, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('sarah.jenkins@example.com');
  const [password, setPassword] = useState('password123');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/');
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-700 text-white mx-auto flex items-center justify-center shadow-md">
          <HeartPulse className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Sign in to CareFlow</h1>
        <p className="text-xs text-slate-500">Access your healthcare discovery & care journeys</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          Sign In <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
