import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ChevronDown, ChevronRight, Phone, Clock, Menu, ShieldAlert, User, Calendar,
  Stethoscope, Building2, ShieldCheck, Activity, Microscope, HeartPulse, Ambulance, Pill, Syringe, Eye, Sparkles
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { departmentService } from '@/lib/departmentService';
import { serviceService } from '@/lib/serviceService';
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
  const [services, setServices] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const servs = await serviceService.getServices();
        setServices(servs || []);
      } catch (err) {
        console.warn('Error fetching services in NavBar:', err);
      }

      try {
        const depts = await departmentService.getDepartments();
        setDepartments(depts || []);
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

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="fixed top-0 w-full z-50 transition-all duration-300">
        {/* Top Emergency & Info Bar */}
        <div className="bg-[#275B99] text-white text-xs py-2 px-6 md:px-12 transition-all border-b border-blue-600 hidden sm:block">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-6">
              <a 
                href="tel:7095777377" 
                className="flex items-center gap-1.5 hover:text-green-200 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-white" />
                <span className="font-semibold text-blue-100">24/7 Helpline:</span>
                <span className="font-bold text-white tracking-wide">7095777377</span>
              </a>

              <div className="hidden md:flex items-center gap-1.5 text-blue-100">
                <Clock className="w-3.5 h-3.5 text-white" />
                <span>Mon - Sun: 24 Hours Emergency Care</span>
              </div>
            </div>


          </div>
        </div>

        {/* Main Navbar */}
        <nav className={`w-full transition-all duration-300 border-b ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-slate-200/80 h-16 md:h-20' 
            : 'bg-white/90 backdrop-blur-md border-slate-100 h-20'
        }`}>
          <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-12 h-full">
            
            {/* Brand Logo */}
            <div className="md:flex-1 flex md:justify-start">
              <Link to="/" className="flex items-center gap-2.5 group">
                <img
                  src="/prana_logo.png"
                  alt="PRANA Healthcare Services"
                  className="h-12 md:h-16 w-auto object-contain transition-transform group-hover:scale-105"
                />
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8 h-full">
              <Link
                to="/"
                className={`font-semibold text-sm transition-all relative py-2 ${
                  isActive('/') 
                    ? 'text-[#275B99] font-bold' 
                    : 'text-[#111827] hover:text-[#275B99]'
                }`}
              >
                <span>Home</span>
                {isActive('/') && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#275B99] rounded-full animate-fade-in-up" />
                )}
              </Link>

              <Link
                to="/doctors"
                className={`font-semibold text-sm transition-all relative py-2 ${
                  isActive('/doctors') 
                    ? 'text-[#275B99] font-bold' 
                    : 'text-[#111827] hover:text-[#275B99]'
                }`}
              >
                <span>Doctors</span>
                {isActive('/doctors') && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#275B99] rounded-full animate-fade-in-up" />
                )}
              </Link>

              <Link
                to="/hospitals"
                className={`font-semibold text-sm transition-all relative py-2 ${
                  isActive('/hospitals') || location.pathname.startsWith('/hospitals')
                    ? 'text-[#275B99] font-bold' 
                    : 'text-[#111827] hover:text-[#275B99]'
                }`}
              >
                <span>Hospitals</span>
                {(isActive('/hospitals') || location.pathname.startsWith('/hospitals')) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#275B99] rounded-full animate-fade-in-up" />
                )}
              </Link>

              <Link
                to="/departments"
                className={`font-semibold text-sm transition-all relative py-2 ${
                  isActive('/departments') || location.pathname.startsWith('/departments')
                    ? 'text-[#275B99] font-bold' 
                    : 'text-[#111827] hover:text-[#275B99]'
                }`}
              >
                <span>Departments</span>
                {(isActive('/departments') || location.pathname.startsWith('/departments')) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#275B99] rounded-full animate-fade-in-up" />
                )}
              </Link>

              <Link
                to="/insurance"
                className={`font-semibold text-sm transition-all relative py-2 ${
                  isActive('/insurance') || location.pathname.startsWith('/insurance')
                    ? 'text-[#275B99] font-bold' 
                    : 'text-[#111827] hover:text-[#275B99]'
                }`}
              >
                <span>Insurance</span>
                {(isActive('/insurance') || location.pathname.startsWith('/insurance')) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#275B99] rounded-full animate-fade-in-up" />
                )}
              </Link>

              <Link
                to="/packages"
                className={`font-semibold text-sm transition-all relative py-2 ${
                  isActive('/packages') || location.pathname.startsWith('/packages')
                    ? 'text-[#275B99] font-bold' 
                    : 'text-[#111827] hover:text-[#275B99]'
                }`}
              >
                <span>Packages</span>
                {(isActive('/packages') || location.pathname.startsWith('/packages')) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#275B99] rounded-full animate-fade-in-up" />
                )}
              </Link>

              {/* Services Dropdown */}
              <div 
                className="relative h-full flex items-center group"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button className="flex items-center gap-1.5 text-[#111827] group-hover:text-[#275B99] font-semibold text-sm transition-colors h-full">
                  <span>Services</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-[#275B99]' : ''}`} />
                </button>

                {/* Modern Dropdown Menu */}
                <div className={`absolute top-[85%] left-1/2 -translate-x-1/2 w-88 md:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden transition-all duration-200 origin-top ${
                  isDropdownOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
                }`}>
                  <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between px-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Healthcare Services</span>
                    <span className="bg-blue-50 text-[#275B99] border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {services.filter(s => s.is_active !== false).length} Available
                    </span>
                  </div>

                  <div className="max-h-[380px] overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {services.filter(s => s.is_active !== false).length === 0 ? (
                      <div className="p-4 text-center text-slate-400 text-xs italic">Loading services...</div>
                    ) : (
                      services
                        .filter(s => s.is_active !== false)
                        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                        .map((service) => (
                          <Link
                            key={service.id}
                            to={service.path || '/#services'}
                            className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-50/60 transition-colors group/item"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#275B99] flex items-center justify-center shrink-0 group-hover/item:bg-[#275B99] group-hover/item:text-white transition-all shadow-sm">
                              {renderNavServiceIcon(service.icon)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-sm font-semibold text-slate-800 group-hover/item:text-[#275B99] transition-colors truncate">
                                  {service.title}
                                </span>
                                {service.badge && (
                                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-[#4D9B2A] border border-emerald-200 shrink-0">
                                    {service.badge}
                                  </span>
                                )}
                                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/item:text-[#275B99] group-hover/item:translate-x-0.5 transition-all shrink-0 ml-0.5" />
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {service.subtitle || service.description || 'Comprehensive clinical healthcare service'}
                              </p>
                            </div>
                          </Link>
                        ))
                    )}
                  </div>

                  <Link 
                    to="/#services"
                    className="block p-3 bg-slate-50 hover:bg-blue-50 text-center text-xs font-bold text-slate-700 hover:text-[#275B99] transition-all border-t border-slate-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Explore All Healthcare Services
                  </Link>
                </div>
              </div>

              <Link
                to="/about"
                className={`font-semibold text-sm transition-all relative py-2 ${
                  isActive('/about') 
                    ? 'text-[#275B99] font-bold' 
                    : 'text-[#111827] hover:text-[#275B99]'
                }`}
              >
                <span>About</span>
                {isActive('/about') && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#275B99] rounded-full animate-fade-in-up" />
                )}
              </Link>

              <Link
                to="/book-appointment"
                className={`font-semibold text-sm transition-all relative py-2 ${
                  isActive('/book-appointment') 
                    ? 'text-[#275B99] font-bold' 
                    : 'text-[#111827] hover:text-[#275B99]'
                }`}
              >
                <span>Book Appointment</span>
                {isActive('/book-appointment') && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#275B99] rounded-full animate-fade-in-up" />
                )}
              </Link>
            </div>

            {/* Right Action & Mobile Toggle */}
            <div className="md:flex-1 flex justify-end items-center gap-3">
              {!user ? (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => navigate('/book-appointment')}
                    className="bg-[#275B99] hover:bg-[#1F4B80] text-white px-5 py-2.5 rounded-2xl font-bold text-xs transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center gap-2"
                  >
                    <Calendar className="w-3.5 h-3.5 text-white" />
                    <span>Book Consultation</span>
                  </button>
                  <button 
                    onClick={() => navigate('/patient-login')}
                    className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold text-slate-700 hover:text-[#275B99] hover:bg-blue-50 transition-all border border-slate-200"
                  >
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Patient Portal</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/patient-dashboard')}
                  className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-100 transition-all"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>My Dashboard</span>
                </button>
              )}

              {/* Mobile Hamburger Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Open mobile menu"
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
        services={services}
        user={user}
        onNavigate={(path) => navigate(path)}
      />
    </>
  );
};

export default NavBar;