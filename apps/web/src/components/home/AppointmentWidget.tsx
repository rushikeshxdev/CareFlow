'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, User, Phone, Mail, MapPin, Stethoscope, ArrowRight } from 'lucide-react';

export function AppointmentWidget() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [specialty, setSpecialty] = useState('Cardiology');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/recommendations?specialty=${encodeURIComponent(specialty)}&city=${encodeURIComponent(city)}`);
  };

  return (
    <section className="my-16">
      <div className="rounded-3xl bg-white border border-slate-200/80 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Image Arch */}
        <div className="lg:col-span-5 relative bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-950 p-8 flex items-center justify-center min-h-[300px]">
          <div className="w-full max-w-xs aspect-[3/4] rounded-[40px] rounded-tl-[100px] overflow-hidden shadow-2xl border-2 border-white/20">
            <img
              src="https://images.unsplash.com/photo-1594824813571-2b533411efa0?auto=format&fit=crop&w=800&q=80"
              alt="Schedule appointment doctor visual"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right Column: Quick Booking Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 space-y-6">
          <div>
            <span className="text-xs font-extrabold tracking-widest uppercase text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
              EASY BOOKING
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Let's Schedule Your Appointment
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select your required care and check instant slot availability with zero double-booking protection.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Patient Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-900 outline-none focus:border-purple-600 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Mobile Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="Enter 10-digit mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-900 outline-none focus:border-purple-600 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Email ID</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-900 outline-none focus:border-purple-600 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">City</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. New York"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-900 outline-none focus:border-purple-600 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Select Care / Specialty</label>
              <div className="relative">
                <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white outline-none focus:border-purple-600 transition-all appearance-none"
                >
                  <option value="Cardiology">Cardiology (Heart Care)</option>
                  <option value="General Medicine">General Medicine & GP</option>
                  <option value="Neurology">Neurology (Brain Care)</option>
                  <option value="Orthopedics">Orthopedics (Joint & Bone)</option>
                  <option value="Pulmonology">Pulmonology (Lung Care)</option>
                  <option value="Pediatrics">Pediatrics (Child Care)</option>
                  <option value="Dermatology">Dermatology (Skin Care)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-lg shadow-purple-700/20 transition-all flex items-center justify-center gap-2"
            >
              Find Available Slots <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
