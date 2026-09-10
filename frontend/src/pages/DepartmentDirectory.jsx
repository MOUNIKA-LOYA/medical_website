import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Building2, 
  Stethoscope, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  PhoneCall, 
  ChevronRight,
  ShieldCheck,
  Activity,
  HeartPulse
} from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { departmentService, DEFAULT_DEPARTMENTS } from '../lib/departmentService';
import { supabase } from '../lib/supabaseClient';

const DEPARTMENT_CARE_TAGS = {
  Cardiology: ['Angioplasty', 'Echocardiography', 'Cardiac Rehab', 'ECG Monitoring'],
  Neurology: ['Stroke Care', 'Epilepsy Clinic', 'Brain Mapping', 'Spine Disorders'],
  Orthopedics: ['Joint Replacement', 'Arthroscopy', 'Trauma Surgery', 'Sports Rehab'],
  Pediatrics: ['Neonatal ICU', 'Vaccination', 'Growth Tracking', 'Pediatric Care'],
  Gastroenterology: ['Endoscopy', 'Liver Wellness', 'Colonoscopy', 'Digestive Health'],
  Dermatology: ['Clinical Skincare', 'Laser Therapy', 'Allergy Testing', 'Cosmetic Care'],
  Oncology: ['Immunotherapy', 'Chemotherapy', 'Surgical Oncology', 'Tumor Board'],
  ENT: ['Audiometry', 'Microsurgery', 'Sinus Relief', 'Throat Care'],
  'General Medicine': ['Preventive Health', 'Metabolic Care', 'Infection Control', 'Chronic Disease']
};

const DepartmentDirectory = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [departments, setDepartments] = useState([]);
  const [doctorsCountMap, setDoctorsCountMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [selectedFilter, setSelectedFilter] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch departments
        const depts = await departmentService.getDepartments();
        setDepartments(depts && depts.length > 0 ? depts : DEFAULT_DEPARTMENTS);

        // Fetch doctors to count per department
        try {
          const { data: docs } = await supabase.from('doctors').select('department, specialty');
          if (docs && docs.length > 0) {
            const counts = {};
            docs.forEach(doc => {
              const deptName = doc.department || doc.specialty;
              if (deptName) {
                const key = deptName.trim().toLowerCase();
                counts[key] = (counts[key] || 0) + 1;
              }
            });
            setDoctorsCountMap(counts);
          }
        } catch (e) {
          console.warn('Doctors count query fallback:', e);
        }
      } catch (err) {
        console.error('Failed to load departments:', err);
        setDepartments(DEFAULT_DEPARTMENTS);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredDepartments = useMemo(() => {
    return departments.filter((dept) => {
      const nameMatch = (dept.name || '').toLowerCase().includes(search.toLowerCase());
      const descMatch = (dept.description || '').toLowerCase().includes(search.toLowerCase());
      const matchesSearch = nameMatch || descMatch;

      if (!matchesSearch) return false;

      if (selectedFilter === 'All') return true;
      if (selectedFilter === 'Surgical') {
        return ['Cardiology', 'Orthopedics', 'ENT', 'Oncology'].includes(dept.name);
      }
      if (selectedFilter === 'Medical') {
        return ['Neurology', 'General Medicine', 'Gastroenterology', 'Dermatology', 'Pediatrics'].includes(dept.name);
      }
      return true;
    });
  }, [departments, search, selectedFilter]);

  const getDoctorCount = (deptName) => {
    if (!deptName) return '3+ Specialists';
    const count = doctorsCountMap[deptName.trim().toLowerCase()];
    if (count) {
      return `${count} Doctor${count > 1 ? 's' : ''} Available`;
    }
    return 'Specialists Available';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <NavBar />

        {/* Hero Header Section */}
        <section className="relative pt-32 pb-20 bg-slate-900 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ACCREDITED MEDICAL SPECIALTIES</span>
            </div>

            <h1 className="font-headline text-4xl md:text-6xl font-black tracking-tight mb-4 leading-tight">
              Clinical <span className="bg-gradient-to-r from-blue-400 to-blue-200 text-transparent bg-clip-text">Departments</span>
            </h1>

            <p className="text-slate-300 text-base md:text-lg max-w-2xl font-medium leading-relaxed">
              Discover our multi-disciplinary specialties equipped with world-class medical technology, senior consultants, and evidence-based treatment programs.
            </p>

            {/* Quick Metrics Bar */}
            <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4D9B2A]" />
                <span className="font-bold text-white">{departments.length || 9} Medical Wings</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4D9B2A]" />
                <span className="font-bold text-white">500+ Board Specialists</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4D9B2A]" />
                <span className="font-bold text-white">24/7 Priority Emergency Support</span>
              </div>
            </div>
          </div>
        </section>

        {/* Search & Filter Bar */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 -mt-8 relative z-20 mb-12">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search Box */}
              <div className="relative w-full md:flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search department by name or treatment (e.g., Cardiology, Surgery)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#275B99] focus:bg-white transition-all"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                {['All', 'Medical', 'Surgical'].map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      selectedFilter === filter
                        ? 'bg-[#275B99] text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {filter === 'All' ? 'All Specialties' : `${filter} Care`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Department Grid */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-headline text-2xl font-black text-slate-900">
                Specialized Clinical Wings
              </h2>
              <p className="text-slate-500 text-xs font-medium mt-1">
                Showing {filteredDepartments.length} department{filteredDepartments.length === 1 ? '' : 's'} available for patient consultation.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="animate-spin w-8 h-8 border-4 border-[#275B99] border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-slate-500 font-medium text-sm">Loading specialized departments...</p>
            </div>
          ) : filteredDepartments.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm max-w-md mx-auto">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-headline text-lg font-bold text-slate-900 mb-1">No Departments Found</h3>
              <p className="text-slate-500 text-xs mb-4">No clinical wings match your search criteria. Try a different search term.</p>
              <button
                onClick={() => { setSearch(''); setSelectedFilter('All'); }}
                className="px-5 py-2.5 bg-[#275B99] text-white rounded-xl text-xs font-bold hover:bg-[#1F4B80] transition-all"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDepartments.map((dept) => {
                const tags = DEPARTMENT_CARE_TAGS[dept.name] || ['Consultation', 'Diagnostics', 'Specialist Care'];
                const docCountText = getDoctorCount(dept.name);

                return (
                  <div
                    key={dept.id || dept.name}
                    className="group bg-white rounded-3xl p-7 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Top Header Row */}
                      <div className="flex items-center justify-between">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#275B99] flex items-center justify-center font-bold group-hover:bg-[#275B99] group-hover:text-white transition-all shadow-sm">
                          <span className="material-symbols-outlined text-2xl">
                            {dept.icon || 'medical_services'}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-[#4D9B2A] bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                          {docCountText}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="font-headline font-bold text-xl text-slate-900 group-hover:text-[#275B99] transition-colors">
                          {dept.name}
                        </h3>
                        <p className="text-slate-600 text-xs leading-relaxed mt-2 line-clamp-2">
                          {dept.description || 'Specialized diagnostic procedures, personalized therapeutics, and expert care programs.'}
                        </p>
                      </div>

                      {/* Care Focus / Procedure Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-semibold border border-slate-100"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Links Row */}
                    <div className="pt-5 mt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2">
                      <Link
                        to={`/doctors?department=${encodeURIComponent(dept.name)}`}
                        className="w-full sm:flex-1 py-2.5 bg-slate-50 hover:bg-blue-50 text-[#275B99] rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 border border-slate-200/60"
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>View Doctors</span>
                      </Link>

                      <Link
                        to={`/book-appointment?dept=${encodeURIComponent(dept.name)}`}
                        className="w-full sm:flex-1 py-2.5 bg-[#275B99] hover:bg-[#1F4B80] text-white rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book Visit</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Help & Emergency Banner */}
          <div className="mt-16 bg-gradient-to-r from-[#275B99] to-[#1F4B80] rounded-3xl p-8 md:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <span className="text-xs font-bold text-green-300 uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full">
                Clinical Board Guidance
              </span>
              <h3 className="font-headline text-2xl md:text-3xl font-black text-white">
                Unsure which department you need?
              </h3>
              <p className="text-blue-100 text-xs md:text-sm">
                Book a primary consultation in General Medicine or speak directly with our 24/7 clinical helpline triage coordinator.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
              <a
                href="tel:7095777377"
                className="w-full sm:w-auto px-6 py-3.5 bg-white text-[#275B99] hover:bg-blue-50 rounded-2xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-[#4D9B2A]" />
                <span>Call 7095777377</span>
              </a>

              <Link
                to="/book-appointment?dept=General%20Medicine"
                className="w-full sm:w-auto px-6 py-3.5 bg-[#4D9B2A] hover:bg-[#3F8222] text-white rounded-2xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>General Medicine Consult</span>
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default DepartmentDirectory;
