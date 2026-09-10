import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Send, ArrowRight, ShieldCheck, Award, HeartPulse } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-[#163861] text-blue-100 w-full border-t border-blue-900 pt-20 pb-12 mt-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Newsletter Subscription Top CTA Card */}
        <div className="bg-white rounded-3xl p-8 md:p-10 border border-blue-100 mb-16 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 text-slate-900">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-[#4D9B2A] rounded-full text-xs font-bold mb-3 border border-green-200">
              <span className="w-2 h-2 rounded-full bg-[#4D9B2A] animate-pulse"></span>
              HEALTH CARE BULLETIN
            </div>
            <h3 className="font-headline text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2">
              Stay Informed with Clinical Insights
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Subscribe to receive verified health tips, hospital announcements, and specialist consultation updates.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full lg:w-auto flex-1 max-w-md flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#275B99] transition-all"
              required
            />
            <button
              type="submit"
              className="bg-[#4D9B2A] hover:bg-[#3F8222] text-white font-bold px-6 py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 shrink-0 active:scale-95"
            >
              <span>{subscribed ? 'Subscribed!' : 'Subscribe'}</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-blue-800/60">
          {/* Column 1: Brand & Overview */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="inline-block bg-white p-2.5 px-4 rounded-2xl shadow-sm">
              <img
                src="/prana_logo.png"
                alt="PRANA Healthcare Services"
                className="h-12 w-auto object-contain"
              />
            </Link>

            <p className="text-blue-200 text-sm leading-relaxed max-w-md">
              Pioneering the future of patient-centric healthcare through precision diagnostics, integrated systems, and clinical board supervision. ISO 9001 certified healthcare institution.
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-white bg-blue-900/80 px-3 py-1.5 rounded-xl border border-blue-800/60">
                <ShieldCheck className="w-4 h-4 text-[#4D9B2A]" />
                <span>ISO Certified</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-white bg-blue-900/80 px-3 py-1.5 rounded-xl border border-blue-800/60">
                <Award className="w-4 h-4 text-[#4D9B2A]" />
                <span>Gold Standard</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-white bg-blue-900/80 px-3 py-1.5 rounded-xl border border-blue-800/60">
                <HeartPulse className="w-4 h-4 text-[#4D9B2A]" />
                <span>24/7 Care</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="font-headline text-white font-bold text-base tracking-wide border-b border-blue-800/80 pb-3">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm font-medium text-blue-200">
              <li>
                <Link to="/about" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#4D9B2A]" /> About Us
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#4D9B2A]" /> Doctor Directory
                </Link>
              </li>
              <li>
                <Link to="/hospitals" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#4D9B2A]" /> Hospitals
                </Link>
              </li>
              <li>
                <Link to="/departments" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#4D9B2A]" /> Clinical Departments
                </Link>
              </li>
              <li>
                <Link to="/insurance" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#4D9B2A]" /> Insurance Plans
                </Link>
              </li>
              <li>
                <Link to="/packages" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#4D9B2A]" /> Health Packages
                </Link>
              </li>
              <li>
                <Link to="/book-appointment" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#4D9B2A]" /> Book Consultation
                </Link>
              </li>
              <li>
                <Link to="/doctor-login" className="text-white hover:text-green-300 font-semibold transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#4D9B2A]" /> Doctor Portal
                </Link>
              </li>
              <li>
                <Link to="/patient-login" className="text-white hover:text-green-300 font-semibold transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#4D9B2A]" /> Patient Portal
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-white hover:text-green-300 font-semibold transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#4D9B2A]" /> Staff / Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Medical Specialties */}
          <div className="space-y-4">
            <h4 className="font-headline text-white font-bold text-base tracking-wide border-b border-blue-800/80 pb-3">
              Specialties
            </h4>
            <ul className="space-y-2.5 text-sm font-medium text-blue-200">
              <li>
                <Link to="/doctors?department=Cardiology" className="hover:text-white transition-colors">
                  Cardiology
                </Link>
              </li>
              <li>
                <Link to="/doctors?department=Neurology" className="hover:text-white transition-colors">
                  Neurology
                </Link>
              </li>
              <li>
                <Link to="/doctors?department=Pediatrics" className="hover:text-white transition-colors">
                  Pediatrics
                </Link>
              </li>
              <li>
                <Link to="/doctors?department=Orthopedics" className="hover:text-white transition-colors">
                  Orthopedics
                </Link>
              </li>
              <li>
                <Link to="/doctors?department=General%20Medicine" className="hover:text-white transition-colors">
                  General Medicine
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="space-y-4">
            <h4 className="font-headline text-white font-bold text-base tracking-wide border-b border-blue-800/80 pb-3">
              Contact & Emergency
            </h4>
            <div className="space-y-3 text-sm text-blue-200">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-[#4D9B2A] shrink-0 mt-0.5" />
                <span className="leading-snug">
                  Medical Plaza District, Suite 400, Clinical Ave, Citywest
                </span>
              </div>
              <div className="flex gap-3 items-center">
                <Phone className="w-5 h-5 text-[#4D9B2A] shrink-0" />
                <a href="tel:7095777377" className="hover:text-green-300 transition-colors font-bold text-white">
                  7095777377
                </a>
              </div>
              <div className="flex gap-3 items-center">
                <Mail className="w-5 h-5 text-[#4D9B2A] shrink-0" />
                <a href="mailto:care@pranahealthcareservices.com" className="hover:text-white transition-colors">
                  care@pranahealthcareservices.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-blue-300">
          <div>
            © 2026 Prana Health Network. All rights reserved.
          </div>
          
          <div className="flex items-center gap-6 text-blue-200 font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">HIPAA Compliance</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;