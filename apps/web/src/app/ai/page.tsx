'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Send, ShieldAlert, ArrowRight, Activity, Stethoscope } from 'lucide-react';

export default function AiAssistantPage() {
  const router = useRouter();
  const [concern, setConcern] = useState('');
  const [location, setLocation] = useState('New York');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concern.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/ai/analyze-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concern, location }),
      });

      const data = await res.json();
      // Store in session storage for AI Summary & Recommendation pages
      sessionStorage.setItem('careflow_ai_result', JSON.stringify(data));
      router.push('/ai/summary');
    } catch {
      // Fallback redirect if backend is starting
      sessionStorage.setItem(
        'careflow_ai_result',
        JSON.stringify({
          aiAnalysis: {
            intent: 'find_doctor',
            recommendedSpecialty: 'Cardiology',
            recommendedServiceType: 'CONSULTATION',
            suggestedAction: 'Schedule an urgent cardiology consultation and ECG cardiac screening.',
            urgency: 'urgent',
            summary: concern,
            keySymptoms: ['Chest discomfort', 'Shortness of breath'],
            disclaimer: 'Informational guidance only. CareFlow AI does not diagnose conditions.',
          },
          recommendedProviders: [],
        })
      );
      router.push('/ai/summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 font-semibold text-xs border border-brand-200">
          <Sparkles className="w-4 h-4" />
          CareFlow AI Assistant
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Describe Your Health Concern</h1>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          Describe what you are experiencing in plain text. CareFlow AI will analyze your intent, extract key symptoms, and recommend the appropriate specialty.
        </p>
      </div>

      {/* Medical Safety Disclaimer Alert */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-950 block mb-0.5">Informational Guidance Only</span>
          CareFlow AI is an informational decision-support tool. It does not provide medical diagnoses or replace emergency care. If you are experiencing a medical emergency, call emergency services immediately.
        </div>
      </div>

      {/* Concern Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            What symptoms or health concerns are you experiencing?
          </label>
          <textarea
            rows={5}
            value={concern}
            onChange={(e) => setConcern(e.target.value)}
            placeholder="Example: I've had a persistent dull headache behind my eyes for 2 days, accompanied by mild dizziness when standing up..."
            className="w-full p-4 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none resize-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">City / Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. New York, Chicago"
              className="w-full p-3 rounded-lg border border-slate-200 text-sm text-slate-900 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Mode</label>
            <select className="w-full p-3 rounded-lg border border-slate-200 text-sm text-slate-900 outline-none bg-white">
              <option>In-Person Visit</option>
              <option>Video Tele-Consultation</option>
              <option>Home Care Visit</option>
            </select>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div>
          <span className="text-xs font-semibold text-slate-500 block mb-2">Sample Concerns:</span>
          <div className="flex flex-wrap gap-2">
            {[
              'Chest tightness and racing heartbeat for past hour',
              'Severe lower back pain after lifting heavy box',
              'Persistent dry cough and tightness in chest',
              'Need full executive blood panel checkup',
            ].map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setConcern(sample)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-xs font-medium text-slate-600 transition-colors text-left"
              >
                "{sample}"
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !concern.trim()}
          className="w-full py-3.5 rounded-xl bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 animate-spin" /> Analyzing Symptoms...
            </div>
          ) : (
            <>
              Analyze Concern with AI <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
