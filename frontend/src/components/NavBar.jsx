import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ChevronDown, ChevronRight, Phone, Clock, Menu, ShieldAlert, User, Calendar,
  Stethoscope, Building2, ShieldCheck, Activity, Microscope, HeartPulse, Ambulance, Pill, Syringe, Eye, Sparkles,
  ArrowRight, CheckCircle2, Sparkle
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { departmentService, DEFAULT_DEPARTMENTS } from '@/lib/departmentService';
import { serviceService, DEFAULT_SERVICES } from '@/lib/serviceService';
import MobileNavDrawer from './MobileNavDrawer';

const ICON_MAP = {
  Stethoscope, Building2, ShieldCheck, Activity, Microscope, Phone,
  HeartPulse, Ambulance, Pill, Syringe, Eye, Sparkles
};

const renderNavServiceIcon = (iconName) => {
  const IconComp = ICON_MAP[iconName];
  if (IconComp) {
    return <IconComp className="w-5 h-5" />;
  }
  return <span className="material-symbols-outlined text-[20px]">{iconName || 'medical_services'}</span>;
};

const NavBar = () => {
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownTimeoutRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const servs = await serviceService.getServices();
        if (servs && servs.length > 0) {
          setServices(servs);
        }
      } catch (err) {
        console.warn('Error fetching services in NavBar:', err);
      }

      try {
        const depts = await departmentService.getDepartments();
        if (depts && depts.length > 0) {
          setDepartments(depts);
        }
      } catch (err) {
        console.warn('Error fetching departments in NavBar:', err);
      }
    };

    fetchAllData();

    const handleServicesUpdate = () => {
      fetchAllData();
    };

    window.addEventListener('services_updated', handleServicesUpdate);
    window.addEventListener('storage', handleServicesUpdate);

    // Check session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      window.removeEventListener('services_updated', handleServicesUpdate);
      window.removeEventListener('storage', handleServicesUpdate);
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 180);
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const activeServices = services.filter(s => s.is_active !== false);
  const totalCount = activeServices.length + (departments.length > 0 ? departments.length : 9);

  return (
    <>
      <header className="fixed top-0 w-full z-50 transition-all duration-300">
        {/* Top Emergency & Helpline Info Bar */}
        <div className="bg-[#275B99] text-white text-xs py-2 px-4 sm:px-6 lg:px-12 transition-all border-b border-blue-600/40 hidden sm:block">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-6">
              <a 
                href="tel:7095777377" 
                className="flex items-center gap-1.5 hover:text-emerald-200 transition-colors group"
              >
                <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                  <Phone className="w-3 h-3 text-white" />
                </div>
                <span className="font-semibold text-blue-100">24/7 Helpline:</span>
                <span className="font-extrabold text-white tracking-wide">7095777377</span>
              </a>

              <div className="hidden md:flex items-center gap-2 text-blue-100">
                <Clock className="w-3.5 h-3.5 text-blue-200" />
                <span>Mon - Sun: 24 Hours Emergency & Ambulance Dispatch</span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-3 text-blue-100 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white font-medium">Network Hospitals Active</span>
              </span>
              <span className="text-blue-300">•</span>
              <span className="text-blue-100">Instant Cashless Pre-Auth</span>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <nav className={`w-full transition-all duration-300 border-b ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-md border-slate-200/80 h-18 md:h-20' 
            : 'bg-white/95 backdrop-blur-md border-slate-100 h-22 lg:h-24'
        }`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12 h-full">
            
            {/* Brand Logo - Enlarged, Prominent & Centered Vertically */}
            <div className="flex items-center shrink-0">
              <Link to="/" className="flex items-center gap-3 group py-1">
                <img
                  src="/prana_logo.png"
                  alt="PRANA Healthcare Services"
                  className={`w-auto object-contain transition-all duration-300 group-hover:scale-105 drop-shadow-xs ${
                    isScrolled 
                      ? 'h-14 sm:h-16 md:h-18' 
                      : 'h-16 sm:h-18 md:h-20 lg:h-22'
                  }`}
                />
              </Link>
            </div>

            {/* Desktop Navigation Links - Clean, Spaced, Neatly Aligned */}
            <div className="hidden xl:flex items-center justify-center gap-1 xl:gap-1.5 2xl:gap-3 h-full">
              <Link
                to="/"
                className={`font-semibold text-sm px-3 py-2 rounded-xl transition-all duration-200 ${
                  isActive('/') 
                    ? 'text-[#275B99] font-bold bg-blue-50/90 shadow-xs' 
                    : 'text-slate-700 hover:text-[#275B99] hover:bg-slate-50'
                }`}
              >
                <span>Home</span>
              </Link>

              <Link
                to="/doctors"
                className={`font-semibold text-sm px-3 py-2 rounded-xl transition-all duration-200 ${
                  isActive('/doctors') 
                    ? 'text-[#275B99] font-bold bg-blue-50/90 shadow-xs' 
                    : 'text-slate-700 hover:text-[#275B99] hover:bg-slate-50'
                }`}
              >
                <span>Doctors</span>
              </Link>

              <Link
                to="/hospitals"
                className={`font-semibold text-sm px-3 py-2 rounded-xl transition-all duration-200 ${
                  isActive('/hospitals') 
                    ? 'text-[#275B99] font-bold bg-blue-50/90 shadow-xs' 
                    : 'text-slate-700 hover:text-[#275B99] hover:bg-slate-50'
                }`}
              >
                <span>Hospitals</span>
              </Link>

              <Link
                to="/departments"
                className={`font-semibold text-sm px-3 py-2 rounded-xl transition-all duration-200 ${
                  isActive('/departments') 
                    ? 'text-[#275B99] font-bold bg-blue-50/90 shadow-xs' 
                    : 'text-slate-700 hover:text-[#275B99] hover:bg-slate-50'
                }`}
              >
                <span>Departments</span>
              </Link>

              {/* Services Dropdown - Structured 2-Column Mega Menu */}
              <div 
                className="relative h-full flex items-center"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button 
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
                    isDropdownOpen || location.pathname.startsWith('/services') || location.hash === '#services'
                      ? 'text-[#275B99] font-bold bg-blue-50/90 shadow-xs' 
                      : 'text-slate-700 hover:text-[#275B99] hover:bg-slate-50'
                  }`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span>Services</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-[#275B99]' : 'text-slate-400'}`} />
                </button>

                {/* Dropdown Container with Hover Bridge */}
                <div 
                  className={`absolute top-[88%] left-1/2 -translate-x-1/2 pt-2.5 transition-all duration-200 z-50 origin-top ${
                    isDropdownOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
                  }`}
                >
                  <div className="w-[660px] lg:w-[720px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden ring-1 ring-black/5">
                    {/* Top Banner Header */}
                    <div className="p-3.5 px-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#4D9B2A] animate-pulse" />
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Healthcare Services & Clinical Care</span>
                      </div>
                      <span className="bg-[#275B99]/10 text-[#275B99] border border-[#275B99]/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        {activeServices.length} Network Services
                      </span>
                    </div>

                    {/* 2-Column Mega Layout */}
                    <div className="grid grid-cols-12 divide-x divide-slate-100 max-h-[420px]">
                      {/* Left Column: Core Solutions (6 items) */}
                      <div className="col-span-7 p-3 space-y-1 overflow-y-auto custom-scrollbar">
                        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                          <span>Primary Care & Services</span>
                          <span className="text-[10px] text-[#275B99] font-semibold">Core Solutions</span>
                        </div>
                        {activeServices.map((service) => (
                          <Link
                            key={service.id}
                            to={service.path || '/#services'}
                            className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-50/70 transition-all group/item border border-transparent hover:border-blue-100/60"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#275B99] flex items-center justify-center shrink-0 group-hover/item:bg-[#275B99] group-hover/item:text-white transition-all shadow-xs">
                              {renderNavServiceIcon(service.icon)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-bold text-slate-800 group-hover/item:text-[#275B99] transition-colors truncate">
                                  {service.title}
                                </span>
                                {service.badge && (
                                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-[#4D9B2A] border border-emerald-200 shrink-0">
                                    {service.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {service.subtitle || service.description || 'Comprehensive clinical healthcare service'}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>

                      {/* Right Column: Clinical Specialties (Departments) */}
                      <div className="col-span-5 p-3 bg-slate-50/50 flex flex-col justify-between overflow-y-auto custom-scrollbar">
                        <div className="space-y-1">
                          <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            <span>Clinical Specialties</span>
                            <span className="text-[10px] text-emerald-600 font-semibold">Departments</span>
                          </div>
                          <div className="grid grid-cols-1 gap-1">
                            {departments.slice(0, 9).map((dept) => (
                              <Link
                                key={dept.id || dept.name}
                                to={`/doctors?department=${encodeURIComponent(dept.name)}`}
                                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-[#275B99] hover:bg-white hover:shadow-xs transition-all group/dept"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <span className="truncate group-hover/dept:translate-x-0.5 transition-transform">
                                  {dept.name}
                                </span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/dept:text-[#275B99] group-hover/dept:translate-x-0.5 transition-all shrink-0" />
                              </Link>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 mt-2 border-t border-slate-200/60">
                          <Link
                            to="/departments"
                            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#275B99] hover:bg-blue-50/80 transition-all"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <span>View All Departments</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Footer Quick Action Bar */}
                    <div className="p-3 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between px-5">
                      <Link 
                        to="/#services"
                        className="text-xs font-bold text-slate-700 hover:text-[#275B99] flex items-center gap-1.5 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span>Explore Full Healthcare Directory</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#275B99]" />
                      </Link>
                      <Link
                        to="/book-appointment"
                        className="text-[11px] font-bold text-[#4D9B2A] hover:underline flex items-center gap-1"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span>Book Instant Appointment →</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                to="/insurance"
                className={`font-semibold text-sm px-3 py-2 rounded-xl transition-all duration-200 ${
                  isActive('/insurance') 
                    ? 'text-[#275B99] font-bold bg-blue-50/90 shadow-xs' 
                    : 'text-slate-700 hover:text-[#275B99] hover:bg-slate-50'
                }`}
              >
                <span>Insurance</span>
              </Link>

              <Link
                to="/packages"
                className={`font-semibold text-sm px-3 py-2 rounded-xl transition-all duration-200 ${
                  isActive('/packages') 
                    ? 'text-[#275B99] font-bold bg-blue-50/90 shadow-xs' 
                    : 'text-slate-700 hover:text-[#275B99] hover:bg-slate-50'
                }`}
              >
                <span>Packages</span>
              </Link>

              <Link
                to="/about"
                className={`font-semibold text-sm px-3 py-2 rounded-xl transition-all duration-200 ${
                  isActive('/about') 
                    ? 'text-[#275B99] font-bold bg-blue-50/90 shadow-xs' 
                    : 'text-slate-700 hover:text-[#275B99] hover:bg-slate-50'
                }`}
              >
                <span>About</span>
              </Link>

              <Link
                to="/book-appointment"
                className={`font-semibold text-sm px-3 py-2 rounded-xl transition-all duration-200 ${
                  isActive('/book-appointment') 
                    ? 'text-[#275B99] font-bold bg-blue-50/90 shadow-xs' 
                    : 'text-slate-700 hover:text-[#275B99] hover:bg-slate-50'
                }`}
              >
                <span>Book Appointment</span>
              </Link>
            </div>

            {/* Right Action Buttons & Mobile Hamburger Toggle */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {!user ? (
                <div className="hidden sm:flex items-center gap-2 sm:gap-2.5">
                  <button 
                    onClick={() => navigate('/book-appointment')}
                    className="bg-gradient-to-r from-[#275B99] to-[#1E4B82] hover:from-[#1F4B80] hover:to-[#163861] text-white px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all shadow-md shadow-blue-900/15 hover:shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-blue-100" />
                    <span>Book Consultation</span>
                  </button>
                  <button 
                    onClick={() => navigate('/patient-login')}
                    className="hidden lg:flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-[#275B99] hover:bg-blue-50 transition-all border border-slate-200 shadow-xs cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Patient Portal</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/patient-dashboard')}
                  className="hidden sm:flex bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2.5 rounded-xl font-bold text-xs items-center gap-1.5 hover:bg-emerald-100 transition-all shadow-xs cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>My Dashboard</span>
                </button>
              )}

              {/* Mobile / Tablet Hamburger Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="xl:hidden p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-[#275B99] transition-colors flex items-center justify-center cursor-pointer border border-slate-200/80 shadow-xs"
                aria-label="Open navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

          </div>
        </nav>
      </header>

      {/* Slide-out Mobile Navigation Drawer */}
      <MobileNavDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        departments={departments}
        services={activeServices}
        user={user}
        onNavigate={(path) => navigate(path)}
      />
    </>
  );
};

export default NavBar;