import { Quote, Star } from 'lucide-react';

export function Testimonials() {
  const reviews = [
    {
      quote: "We took services for my wife in May. The doctor was professional and took time to understand our case. Excellent follow-ups!",
      author: "ARUN GUPTA",
      role: "Verified Patient",
      rating: 5,
    },
    {
      quote: "Holding the appointment slot gave us 10 minutes to confirm without worrying about losing the time slot to anyone else. Great UI!",
      author: "SARAH JENKINS",
      role: "Patient Care Journey",
      rating: 5,
    },
    {
      quote: "CareFlow AI recommended Cardiology for my chest tightness and immediately matched me with Dr. Aris Thorne. Smooth experience!",
      author: "MICHAEL REEDS",
      role: "Verified Patient",
      rating: 5,
    },
  ];

  return (
    <section className="my-16 space-y-8">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-xs font-extrabold tracking-widest uppercase text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
          HAPPY STORIES
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
          You Will Love The Way We Care For You
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((r, i) => (
          <div
            key={i}
            className="p-8 rounded-3xl bg-blue-50/70 border border-blue-100/80 shadow-sm hover:shadow-xl transition-all space-y-6 flex flex-col justify-between relative"
          >
            <Quote className="w-8 h-8 text-purple-400 opacity-40 absolute top-6 right-6" />

            <div className="space-y-4">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(r.rating)].map((_, idx) => (
                  <Star key={idx} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed italic">
                "{r.quote}"
              </p>
            </div>

            <div className="pt-4 border-t border-blue-200/50">
              <h4 className="font-extrabold text-slate-900 text-xs tracking-wider uppercase">{r.author}</h4>
              <span className="text-[10px] text-purple-700 font-semibold">{r.role}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
