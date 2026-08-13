export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Patient Profile</h1>
      <p className="text-xs text-slate-500">Scaffolded patient profile and health metadata manager.</p>

      <div className="space-y-3 pt-4 border-t border-slate-100 text-sm">
        <div><span className="font-semibold text-slate-500">Name:</span> Sarah Jenkins</div>
        <div><span className="font-semibold text-slate-500">Email:</span> sarah.jenkins@example.com</div>
        <div><span className="font-semibold text-slate-500">Allergies:</span> Penicillin</div>
        <div><span className="font-semibold text-slate-500">Existing Conditions:</span> Mild Asthma</div>
      </div>
    </div>
  );
}
