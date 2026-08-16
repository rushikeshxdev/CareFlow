import { PhoneCall, Activity, Percent, Clock } from 'lucide-react';

export function WhyCareflow() {
  const features = [
    {
      title: 'Anywhere, Anytime Healthcare',
      desc: 'Easily access a wide network of healthcare providers and services, ensuring care is always within reach.',
      icon: PhoneCall,
      color: 'from-purple-600 to-indigo-700',
    },
    {
      title: 'Health Monitoring Made Simple',
      desc: 'Our technology keeps a close eye on your care journey, alerting your doctor if you need urgent care.',
      icon: Activity,
      color: 'from-teal-500 to-emerald-600',
    },
    {
      title: 'Save Money On Treatment',
      desc: 'We make sure you get the best care at lower costs, saving you up to 40% on consultation and diagnostic fees.',
      icon: Percent,
      color: 'from-indigo-600 to-purple-800',
    },
    {
      title: 'Less Time In Hospitals',
      desc: 'With CareFlow, you can get a lot of your care at home. This means fewer hospital visits, up to 80% less.',
      icon: Clock,
      color: 'from-cyan-500 to-teal-600',
    },
  ];

  return (
    <section className="my-16 space-y-8">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-xs font-extrabold tracking-widest uppercase text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
          WHY CAREFLOW CARE?
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
          Transforming Healthcare For You
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl transition-all space-y-4 text-center flex flex-col items-center justify-between"
            >
              <div className={`w-14 h-14 rounded-full bg-gradient-to-tr ${f.color} flex items-center justify-center text-white shadow-md`}>
                <Icon className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-base">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
