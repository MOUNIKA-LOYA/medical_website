import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, Video, MapPin, CalendarCheck, ArrowRight, Award } from 'lucide-react';

const DoctorCard = ({ doctor }) => {
  if (!doctor) return null;

  // Resolve Doctor Name safely
  // If doctor.name is missing, null, empty, or mistakenly set to department/specialty (e.g. "Dermatology")
  const isNameInvalid = 
    !doctor.name || 
    typeof doctor.name !== 'string' || 
    doctor.name.trim() === '' || 
    doctor.name.trim().toLowerCase() === (doctor.specialty || '').trim().toLowerCase() ||
    doctor.name.trim().toLowerCase() === (doctor.department || '').trim().toLowerCase() ||
    doctor.name.trim().toLowerCase() === 'dermatology';

  const doctorDisplayName = isNameInvalid ? 'Doctor Name Not Available' : doctor.name;
  const doctorSpecialty = doctor.title || doctor.specialty || doctor.department || 'Healthcare Specialist';

  const hospitalName = doctor.hospital_name || doctor.schedule_details?.hospital_name || 'Prana Main Medical Center';
  const locationAddress = doctor.location_address || doctor.schedule_details?.location_address || 'Medical District';
  const consultationFee = Number(doctor.consultation_fee) || 500;
  const discountedFee = Math.round(consultationFee * 0.9);

  return (
    <div
      className="group bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col md:flex-row items-stretch justify-between gap-6"
      data-testid={`doctor-card-${doctor.id}`}
    >
      {/* Left Column: Doctor Image + Rating + Availability Badge */}
      <div className="md:w-56 shrink-0 flex flex-col items-center">
        <div className="relative w-full aspect-square max-w-[220px] rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
          <img
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            src={
              doctor.photo_url ||
              'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&h=400&auto=format&fit=crop'
            }
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&h=400&auto=format&fit=crop';
            }}
            alt={doctorDisplayName}
          />

          {/* Top-Left Rating Pill */}
          <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm border border-slate-100 text-xs font-bold text-slate-800">
            <Star className="w-3.5 h-3.5 text-[#4D9B2A] fill-[#4D9B2A]" />
            <span>{doctor.rating || '4.9'}</span>
          </div>

          {/* Bottom Green Availability Pill */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 text-center">
            {doctor.available_today ? (
              <span className="block py-1 px-2.5 bg-green-50 text-[#4D9B2A] border border-green-200 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm">
                Available Today
              </span>
            ) : (
              <span className="block py-1 px-2.5 bg-[#275B99] text-white rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-sm">
                Available Tomorrow
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Middle Column: Doctor Details & Specialty */}
      <div className="flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              {/* Doctor Name */}
              <h3 className="text-xl font-headline font-black text-slate-900 group-hover:text-[#275B99] transition-colors">
                {doctorDisplayName}
              </h3>
              
              {/* Specialty separately below the name */}
              <p className="text-[#275B99] font-extrabold text-xs tracking-wide uppercase mt-0.5">
                {doctorSpecialty}
              </p>
            </div>
          </div>

          {/* Qualification, Experience, Department, Hospital */}
          <div className="mt-3 text-xs text-slate-500 space-y-1 font-medium">
            <p>
              <strong className="text-slate-700">
                {doctor.experience_years ? `${doctor.experience_years}+ Years Experience` : 'Experienced Specialist'}
              </strong>
              {' '}• MBBS, MS, MD ({doctor.department || doctor.specialty || 'General Care'})
            </p>
            <p className="text-slate-600 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#275B99] shrink-0" />
              <span>{hospitalName}{locationAddress ? ` • ${locationAddress}` : ''}</span>
            </p>
          </div>

          {/* Specialty Treatment Tags */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {[
              (doctor.specialty || doctor.department || 'Specialist Care'),
              'Consultation',
              'Diagnostic Evaluation'
            ].map((tag, idx) => (
              <span key={idx} className="px-2.5 py-1 bg-blue-50 text-[#275B99] rounded-lg text-[11px] font-bold">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Consultation Types & Fee */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-[#275B99]" /> In-Clinic
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <Video className="w-3.5 h-3.5 text-[#275B99]" /> Video Consultation
            </span>
          </div>

          <div className="text-slate-900 font-extrabold text-sm flex items-center gap-1.5">
            <span className="text-slate-400 line-through text-xs font-normal">₹{consultationFee}</span>
            <span className="text-blue-700 font-black">₹{discountedFee}</span>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">10% OFF</span>
          </div>
        </div>
      </div>

      {/* Right Column: Insurance Badge & Action Buttons */}
      <div className="md:w-52 shrink-0 flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 space-y-4">
        <div className="text-right space-y-1 w-full">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-[#4D9B2A] border border-green-200 rounded-full text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#4D9B2A]" />
            <span>Insurance Accepted</span>
          </div>

          <div className="flex items-center justify-end gap-1 text-[11px] text-[#4D9B2A] font-bold pt-1">
            <span>★★★★★</span>
            <span className="text-slate-500 font-normal">({doctor.review_count || '120'} Reviews)</span>
          </div>
        </div>

        <div className="w-full space-y-2">
          <Link
            to={`/book-appointment/${doctor.id}`}
            className="w-full bg-[#275B99] hover:bg-[#1F4B80] text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 text-center active:scale-95"
            data-testid={`book-now-btn-${doctor.id}`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Book Consultation</span>
          </Link>

          <Link
            to={`/book-appointment/${doctor.id}`}
            className="w-full py-2 text-center block text-xs font-bold text-[#275B99] hover:underline"
          >
            View Profile & Schedule
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
