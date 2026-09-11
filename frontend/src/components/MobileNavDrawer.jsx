import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  X, ChevronDown, ChevronRight, Phone, Clock, MapPin, Stethoscope, User, Calendar, Info, Home, Building2, 
  ShieldCheck, Activity, Layers, Microscope, HeartPulse, Ambulance, Pill, Syringe, Eye, Sparkles, ArrowRight
} from 'lucide-react';

const DRAWER_ICON_MAP = {
  Stethoscope, Building2, ShieldCheck, Activity, Microscope, Phone,
  HeartPulse, Ambulance, Pill, Syringe, Eye, Sparkles
};

const renderDrawerServiceIcon = (iconName) => {
  const IconComp = DRAWER_ICON_MAP[iconName];
  if (IconComp) {
    return <IconComp className="w-4 h-4 text-[#275B99]" />;
  }
  return <span className="material-symbols-outlined text-sm text-[#275B99]">{iconName || 'medical_services'}</span>;
};

const MobileNavDrawer = ({ isOpen, onClose, departments = [], services = [], user, onNavigate }) => {
  const [showServices, setShowServices] = useState(false);
  const location = useLocation();

  if (!isOpen) return null;

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const activeServices = services.filter(s => s.is_active !== false);

  return (
    <div className="fixed inset-0 z-50 xl:hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in-up"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto custom-scrollbar">
        {/* Header with Enlarged Logo */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <Link to="/" onClick={onClose} className="flex items-center gap-2 group py-1">
            <img
              src="/prana_logo.png"
              alt="PRANA Healthcare Services"
              className="h-14 sm:h-16 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>
          <button 
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Emergency Helpline Banner */}
        <div className="bg-emerald-50/80 p-3.5 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#4D9B2A] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#4D9B2A] uppercase tracking-wider">24/7 Helpline & Trauma</div>
              <a href="tel:7095777377" className="text-xs font-black text-slate-900 hover:underline">
                7095777377
              </a>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-[#4D9B2A]/15 text-[#3b7820] px-2 py-0.5 rounded-full">
            Instant
          </span>
        </div>

        {/* Navigation Items */}
        <div className="p-4 space-y-1 flex-1">
          <Link
            to="/"
            onClick={onClose}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              isActive('/') 
                ? 'bg-blue-50 text-[#275B99] font-bold shadow-xs' 
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Home className="w-4 h-4 text-[#275B99]" />
            <span>Home</span>
          </Link>

          <Link
            to="/doctors"
            onClick={onClose}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              isActive('/doctors') 
                ? 'bg-blue-50 text-[#275B99] font-bold shadow-xs' 
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-[#275B99]" />
            <span>Doctors</span>
          </Link>

          <Link
            to="/hospitals"
            onClick={onClose}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              isActive('/hospitals') 
                ? 'bg-blue-50 text-[#275B99] font-bold shadow-xs' 
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-4 h-4 text-[#275B99]" />
            <span>Hospitals</span>
          </Link>

          <Link
            to="/departments"
            onClick={onClose}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              isActive('/departments') 
                ? 'bg-blue-50 text-[#275B99] font-bold shadow-xs' 
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4 text-[#275B99]" />
            <span>Departments</span>
          </Link>

          {/* Dynamic Services Accordion */}
          <div className="rounded-xl overflow-hidden">
            <button
              onClick={() => setShowServices(!showServices)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                showServices || location.pathname.startsWith('/services') || location.hash === '#services'
                  ? 'bg-blue-50/70 text-[#275B99]'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] text-[#275B99]">medical_services</span>
                <span>Services ({activeServices.length})</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showServices ? 'rotate-180 text-[#275B99]' : 'text-slate-400'}`} />
            </button>

            {showServices && (
              <div className="ml-3 pl-3 border-l-2 border-blue-200/80 my-1 space-y-1 py-1">
                {/* Core Services */}
                <div className="px-2 py-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Core Solutions
                </div>
                {activeServices.map((service) => (
                  <Link
                    key={service.id}
                    to={service.path || '/#services'}
                    onClick={onClose}
                    className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-[#275B99] hover:bg-blue-50/60 transition-all"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {renderDrawerServiceIcon(service.icon)}
                      <span className="truncate">{service.title}</span>
                    </div>
                    {service.badge && (
                      <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-[#4D9B2A] border border-emerald-200 shrink-0">
                        {service.badge}
                      </span>
                    )}
                  </Link>
                ))}

                {/* Specialties quick links */}
                {departments.length > 0 && (
                  <>
                    <div className="px-2 pt-2 py-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100 mt-1">
                      Clinical Specialties
                    </div>
                    {departments.slice(0, 6).map((dept) => (
                      <Link
                        key={dept.id || dept.name}
                        to={`/doctors?department=${encodeURIComponent(dept.name)}`}
                        onClick={onClose}
                        className="flex items-center justify-between px-2.5 py-1 rounded-lg text-xs text-slate-600 hover:text-[#275B99] hover:bg-blue-50/40 transition-all"
                      >
                        <span>{dept.name}</span>
                        <ChevronRight className="w-3 h-3 text-slate-300" />
                      </Link>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          <Link
            to="/insurance"
            onClick={onClose}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              isActive('/insurance') 
                ? 'bg-blue-50 text-[#275B99] font-bold shadow-xs' 
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#275B99]" />
            <span>Insurance</span>
          </Link>

          <Link
            to="/packages"
            onClick={onClose}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              isActive('/packages') 
                ? 'bg-blue-50 text-[#275B99] font-bold shadow-xs' 
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-4 h-4 text-[#275B99]" />
            <span>Packages</span>
          </Link>

          <Link
            to="/about"
            onClick={onClose}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              isActive('/about') 
                ? 'bg-blue-50 text-[#275B99] font-bold shadow-xs' 
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Info className="w-4 h-4 text-[#275B99]" />
            <span>About Us</span>
          </Link>

          <Link
            to="/book-appointment"
            onClick={onClose}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              isActive('/book-appointment') 
                ? 'bg-blue-50 text-[#275B99] font-bold shadow-xs' 
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#275B99]" />
            <span>Book Appointment</span>
          </Link>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-2.5">
          <button
            onClick={() => {
              onClose();
              onNavigate('/book-appointment');
            }}
            className="w-full bg-gradient-to-r from-[#275B99] to-[#1E4B82] hover:from-[#1F4B80] text-white py-3 px-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Consultation</span>
          </button>

          {!user ? (
            <button
              onClick={() => {
                onClose();
                onNavigate('/patient-login');
              }}
              className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer shadow-xs"
            >
              <User className="w-3.5 h-3.5 text-[#275B99]" />
              <span>Patient Portal / Login</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onNavigate('/patient-dashboard');
              }}
              className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <User className="w-3.5 h-3.5" />
              <span>My Patient Dashboard</span>
            </button>
          )}
          
          <div className="flex items-center justify-center gap-4 pt-1 text-[11px] font-semibold text-slate-500">
            <button
              onClick={() => {
                onClose();
                onNavigate('/doctor-login');
              }}
              className="hover:text-[#275B99] transition-colors cursor-pointer"
            >
              Doctor Portal
            </button>
            <span>•</span>
            <button
              onClick={() => {
                onClose();
                onNavigate('/admin/login');
              }}
              className="hover:text-[#275B99] transition-colors cursor-pointer"
            >
              Admin Portal
            </button>
          </div>
          
          <div className="text-center text-[10px] font-medium text-slate-400">
            Open Mon-Sun: 24 Hours Emergency Care
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNavDrawer;

