import Link from 'next/link';

export default function MyCarePage() {
  return (
    <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">My Active Care Journeys</h1>
      <p className="text-xs text-slate-500">Scaffolded module for tracking active patient care pathways and prescriptions.</p>
      <Link href="/care" className="inline-block px-5 py-2.5 rounded-xl bg-brand-700 text-white text-xs font-bold">
        View Current Care Journey
      </Link>
    </div>
  );
}
