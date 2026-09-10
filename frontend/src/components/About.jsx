import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HospitalCard from './HospitalCard';
import { supabase } from '@/lib/supabaseClient';
import { 
  Users, 
  Target, 
  Eye, 
  MapPin, 
  Phone, 
  Mail, 
  Award,
  ShieldCheck,
  HeartPulse,
  ArrowRight,
  Stethoscope,
  Activity,
  Clock,
  Lock,
  Building2,
  CalendarCheck,
  CheckCircle2
} from 'lucide-react';

const DEFAULT_DOCTOR_AVATAR = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&h=400&auto=format&fit=crop";

const DEFAULT_LEADERS = [
  {
    id: "doc-101",
    name: "Dr. Rajesh Sharma",
    title: "Senior Consultant Interventional Cardiologist",
    specialty: "Cardiology",
    department: "Cardiology",
    experience_years: 18,
    about: "Specialized in complex coronary interventions, structural heart disease, and preventative cardiac health.",
    photo_url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&h=400&auto=format&fit=crop"
  },
  {
    id: "doc-102",
    name: "Dr. Ananya Reddy",
    title: "Chief Neurosurgeon & Spine Specialist",
    specialty: "Neurology",
    department: "Neurology",
    experience_years: 16,
    about: "Pioneer in minimally invasive neurosurgery and comprehensive spine rehabilitation protocols.",
    photo_url: "https://images.unsplash.com/photo-1594824813511-2856011c79e6?q=80&w=400&h=400&auto=format&fit=crop"
  },
  {
    id: "doc-103",
    name: "Dr. Vikram Joshi",
    title: "Senior Orthopedic & Joint Replacement Surgeon",
    specialty: "Orthopedics",
    department: "Orthopedics",
    experience_years: 15,
    about: "Expert in computer-navigated robotic joint replacements and advanced sports trauma management.",
    photo_url: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=400&h=400&auto=format&fit=crop"
  }
];

const About = () => {
  const [leaders, setLeaders] = useState(DEFAULT_LEADERS);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await supabase
          .from('doctors')
          .select('*')
          .order('rating', { ascending: false })
          .limit(3);

        if (data && data.length > 0) {
          setLeaders(data);
        } else {
          setLeaders(DEFAULT_LEADERS);
        }
      } catch (err) {
        console.error('Error fetching leadership doctors:', err);
        setLeaders(DEFAULT_LEADERS);
      }

      try {
        const { hospitalService } = await import('../lib/hospitalService');
        const hospList = await hospitalService.getHospitals();
        setHospitals(hospList);
      } catch (err) {
        console.error('Error fetching hospitals in About page:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const timeline = [
    { year: "1995", event: "Inauguration of our primary medical care center." },
    { year: "2005", event: "Awarded top state honors for patient safety." },
    { year: "2012", event: "Established our specialized cardiovascular institute." },
    { year: "2020", event: "Pioneered integrated digital portals for care tracking." },
    { year: "2024", event: "Completed integration of four regional health hubs." }
  ];

  const trustFeatures = [
    { icon: Stethoscope, title: 'Elite Clinical Faculty', desc: 'Consult with leading researchers and senior surgeons.' },
    { icon: Activity, title: 'Advanced Clinical Systems', desc: 'State-of-the-art robotic suites and high-fidelity testing.' },
    { icon: HeartPulse, title: 'Clinical Standards', desc: 'Over two decades of audited patient outcomes and safety.' },
    { icon: Clock, title: 'Priority Trauma Wings', desc: 'On-demand emergency care and trauma critical units.' },
    { icon: Lock, title: 'Encrypted Health Portals', desc: 'Securely view your records, reports, and history.' },
    { icon: Award, title: 'Outstanding Outcomes', desc: 'Highly rated clinical performance and recovery metrics.' }
  ];

  return (
    <div id="about-hospital" className="bg-slate-50">
      
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 1. Hero Banner Section                                      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white py-24 overflow-hidden border-b border-slate-800">
        <div className="absolute top-10 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold tracking-wider border border-emerald-500/20 uppercase">
                <Building2 className="w-4 h-4" />
                OUR HEALTHCARE LEGACY
              </span>

              <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                A Legacy of Healing & <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent italic">
                  Patient Dedication
                </span>
              </h1>

              <p className="text-slate-300 text-base md:text-lg leading-relaxed font-medium">
                Since 1995, Prana Health has grown from a single community center into an integrated care network, built on foundations of trust, dignity, and clinical excellence.
              </p>

              {/* Mission & Vision Cards */}
              <div className="grid sm:grid-cols-2 gap-4 pt-4">
                <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700/60 backdrop-blur-md">
                  <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-3">
                    <Target className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-base mb-1">Our Mission</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    To deliver clinical outcomes of the highest standard with precision, dignity, and care.
                  </p>
                </div>

                <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700/60 backdrop-blur-md">
                  <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-3">
                    <Eye className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-base mb-1">Our Vision</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    To set the benchmark for patient-centered care and medical innovation in every community.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-slate-800/80 relative">
                <img 
                  src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&h=800&auto=format&fit=crop" 
                  alt="Modern Hospital Architecture" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
              </div>

              {/* Years Experience Badge */}
              <div className="absolute -bottom-6 -left-6 bg-emerald-500 text-slate-950 p-6 rounded-3xl shadow-2xl z-20 max-w-xs animate-bounce-subtle">
                <div className="text-4xl font-black font-headline">29+</div>
                <div className="text-xs font-black uppercase tracking-wider">Years of Medical Leadership</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 2. Accreditations & Certifications Bar                      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-emerald-600" />
              <div>
                <div className="font-extrabold text-slate-900 text-sm">Gold Standard Care</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">JCI Accredited</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
              <div>
                <div className="font-extrabold text-slate-900 text-sm">ISO 9001 Certified</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quality Management</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <HeartPulse className="w-8 h-8 text-emerald-600" />
              <div>
                <div className="font-extrabold text-slate-900 text-sm">24/7 Trauma Response</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Level 1 Emergency</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 3. Leadership Section - Dynamic Doctors from Supabase       */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold tracking-wider mb-4 border border-emerald-100 uppercase">
              GOVERNANCE & EXCELLENCE
            </span>
            <h2 className="font-headline text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
              Clinical Board & Directors
            </h2>
            <p className="text-slate-500 text-base">
              Meet the board-certified specialists directing our therapeutic wings and clinical departments.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-3 text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto" />
                <p className="mt-3 text-xs text-slate-500 font-medium">Loading clinical directors...</p>
              </div>
            ) : (
              leaders.map((leader) => (
                <div 
                  key={leader.id} 
                  className="group bg-white rounded-[2.5rem] p-5 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 border border-slate-100 flex flex-col justify-between"
                  data-testid={`leadership-card-${leader.id}`}
                >
                  <div>
                    <div className="aspect-[4/5] rounded-[2rem] overflow-hidden mb-6 relative bg-slate-100">
                      <img 
                        src={leader.photo_url || DEFAULT_DOCTOR_AVATAR} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_DOCTOR_AVATAR;
                        }}
                        alt={leader.name || 'Clinical Specialist'} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                        <Link to={`/book-appointment/${leader.id}`} className="text-white text-xs font-bold flex items-center gap-1.5 hover:underline">
                          <Stethoscope className="w-4 h-4 text-emerald-400" />
                          <span>Book Consultation</span>
                        </Link>
                      </div>
                    </div>

                    <div className="px-3 pb-4">
                      <h3 className="text-xl font-headline font-black text-slate-900 mb-0.5">{leader.name || 'Doctor Name Not Available'}</h3>
                      <div className="text-emerald-600 font-bold text-xs mb-3 uppercase tracking-wider">{leader.title || leader.specialty || 'Senior Specialist'}</div>
                      <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                        {leader.about || `Senior specialist with ${leader.experience_years || 10}+ years of clinical experience in ${leader.department || 'medical care'}.`}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 4. Hospital Timeline                                        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold tracking-wider border border-blue-100 uppercase">
                MILESTONES & GROWTH
              </span>
              <h2 className="font-headline text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Milestones in <br /><span className="text-emerald-600 italic">Therapeutic Care</span>
              </h2>
              <p className="text-slate-500 text-base leading-relaxed">
                Our timeline mirrors the evolution of modern clinical practices, matching infrastructure growth with patient recovery.
              </p>
              <Link 
                to="/doctors" 
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-7 py-3.5 rounded-full font-bold text-xs shadow-md transition-all"
              >
                <span>Explore Doctors & Departments</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="lg:col-span-7 relative w-full">
              <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-slate-100 hidden md:block -translate-x-1/2" />
              
              <div className="space-y-8 relative z-10">
                {timeline.map((item, index) => (
                  <div key={index} className={`flex items-center gap-6 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    <div className="w-full md:w-1/2 text-right hidden md:block">
                      {index % 2 === 0 ? null : (
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm">
                          <div className="text-xl font-black text-emerald-600 mb-1">{item.year}</div>
                          <div className="text-slate-700 text-xs font-bold">{item.event}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="relative shrink-0">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 z-10 relative flex items-center justify-center text-white">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                    </div>
                    
                    <div className="w-full md:w-1/2">
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="text-xl font-black text-emerald-600 mb-1">{item.year}</div>
                        <div className="text-slate-700 text-xs font-bold">{item.event}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 5. Why Patients Trust Us Feature Grid                      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold tracking-wider mb-4 border border-emerald-100 uppercase">
              PATIENT CONFIDENCE
            </span>
            <h2 className="font-headline text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
              Why Patients Rely on Prana Health
            </h2>
            <p className="text-slate-500 text-base">
              Our core pillars focus on patient comfort, advanced diagnostics, and verified recovery standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trustFeatures.map((feat, i) => {
              const IconComp = feat.icon;
              return (
                <div key={i} className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="font-headline font-bold text-lg text-slate-900 mb-2">{feat.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 6. Hospital Locations & Map Integration                     */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-3xl mb-16">
            <span className="inline-block px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold tracking-wider mb-4 border border-emerald-500/20 uppercase">
              CAMPUS NETWORK
            </span>
            <h2 className="font-headline text-3xl md:text-5xl font-black mb-4 tracking-tight">
              Hospital Campuses & Branches
            </h2>
            <p className="text-slate-400 text-base">
              Visit any of our specialized hospital campuses equipped with 24/7 trauma emergency care.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {hospitals && hospitals.length > 0 ? (
              hospitals.map((loc, index) => (
                <HospitalCard key={loc.id || index} hospital={loc} />
              ))
            ) : (
              <p className="text-slate-400">Loading hospital campuses...</p>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 7. Call To Action Section                                  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center lg:text-left">
              <h2 className="font-headline text-3xl md:text-4xl font-black tracking-tight mb-3">
                Ready to Experience Healthcare Excellence?
              </h2>
              <p className="text-slate-100 text-sm md:text-base">
                Book a consultation with our senior specialists today or visit our emergency medical center.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 shrink-0">
              <Link
                to="/book-appointment"
                className="bg-white text-slate-950 hover:bg-slate-100 px-8 py-4 rounded-full font-black text-sm transition-all shadow-lg active:scale-95 flex items-center gap-2"
              >
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
                <span>Book Appointment</span>
              </Link>

              <Link
                to="/doctors"
                className="bg-slate-950/80 hover:bg-slate-950 text-white px-8 py-4 rounded-full font-bold text-sm border border-slate-700 transition-all flex items-center gap-2"
              >
                <span>Find Doctors</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
};

export default About;
