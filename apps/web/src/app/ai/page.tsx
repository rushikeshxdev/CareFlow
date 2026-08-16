'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ShieldAlert, ArrowRight, Activity, Bot } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { sessionManager } from '@/lib/session';

export default function AiAssistantPage() {
  const router = useRouter();
  const [concern, setConcern] = useState('');
  const [location, setLocation] = useState('New York');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concern.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.analyzeConcern({ concern, location });
      sessionManager.setAiResult(data);
      router.push('/ai/summary');
    } catch (err: any) {
      setError(err?.message || 'Unable to reach CareFlow AI service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-100 text-purple-800 font-extrabold text-xs tracking-wider uppercase border border-purple-200">
          <Bot className="w-4 h-4 text-purple-700" />
          CURE AI HEALTH ASSISTANT
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Describe Your Health Concern
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          Describe what you are experiencing in natural language. CareFlow AI will extract intent, triage symptoms, and match you with top-ranked medical specialists.
        </p>
      </div>

      {/* Medical Safety Disclaimer Alert */}
      <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900 shadow-sm">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold text-amber-950 block mb-0.5">Informational Guidance Only</span>
          CareFlow AI is an informational decision-support tool. It does not provide medical diagnoses or replace emergency care. If you are experiencing a severe emergency, contact emergency medical services immediately.
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold">
          {error}
        </div>
      )}

      {/* Concern Form */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xl space-y-6">
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-2">
            What symptoms or health concerns are you experiencing?
          </label>
          <textarea
            rows={5}
            value={concern}
            onChange={(e) => setConcern(e.target.value)}
            placeholder="Example: I have severe chest tightness, shortness of breath, and mild dizziness after climbing stairs..."
            className="w-full p-4 rounded-2xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all outline-none resize-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">City / Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. New York, Chicago"
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 outline-none focus:border-purple-600"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Care Mode</label>
            <select className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 outline-none bg-white focus:border-purple-600">
              <option>In-Person Visit</option>
              <option>Video Tele-Consultation</option>
              <option>Home Care Visit</option>
            </select>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 block mb-2">Sample Patient Prompts (One-Click Test):</span>
          <div className="flex flex-wrap gap-2">
            {[
              'I have severe chest tightness and shortness of breath.',
              'Severe headache behind eyes with mild fever for 2 days.',
              'Persistent dry cough and tightness in chest.',
              'Need full executive blood panel checkup and general doctor.',
            ].map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setConcern(sample)}
                className="px-3.5 py-2 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-semibold border border-purple-200/60 transition-colors text-left"
              >
                "{sample}"
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !concern.trim()}
          className="w-full py-4 rounded-full bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-xl shadow-purple-700/20 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 animate-spin" /> Extracting Intent with CareFlow AI...
            </div>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-teal-300" />
              Analyze Symptoms with CareFlow AI <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
