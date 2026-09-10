import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import DoctorCard from '../components/DoctorCard';
import { supabase } from '@/lib/supabaseClient';
import { departmentService } from '@/lib/departmentService';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  UserX, 
  Stethoscope, 
  PhoneCall, 
  Check, 
  Star,
  Building2,
  Calendar,
  MapPin
} from 'lucide-react';

const DoctorDirectory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDept = searchParams.get('department') || '';
  const initialSearch = searchParams.get('search') || '';

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: initialSearch,
    department: initialDept,
    availability: 'All Availability',
    consultationType: 'In-clinic',
    minRating: 0
  });

  const updateURLParams = useCallback((newFilters) => {
    const params = {};
    if (newFilters.department) params.department = newFilters.department;
    if (newFilters.search) params.search = newFilters.search;
    if (newFilters.availability && newFilters.availability !== 'All Availability') {
      params.availability = newFilters.availability;
    }
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  useEffect(() => {
    const deptFromURL = searchParams.get('department') || '';
    const searchFromURL = searchParams.get('search') || '';
    const availFromURL = searchParams.get('availability') || 'All Availability';

    setFilters(prev => {
      if (
        prev.department !== deptFromURL ||
        prev.search !== searchFromURL ||
        prev.availability !== availFromURL
      ) {
        return {
          ...prev,
          department: deptFromURL,
          search: searchFromURL,
          availability: availFromURL
        };
      }
      return prev;
    });
  }, [searchParams]);

  const fetchDepartments = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('departments').select('*').order('name');
      if (error || !data || data.length === 0) {
        const depts = await departmentService.getDepartments();
        setDepartments(depts || []);
      } else {
        setDepartments(data || []);
      }
    } catch (error) {
      console.warn('Departments table not yet created in Supabase, using local service:', error);
      try {
        const depts = await departmentService.getDepartments();
        setDepartments(depts || []);
      } catch (e) {
        console.error('Fallback departments failed:', e);
      }
    }
  }, []);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      let filteredData = [];
      try {
        let query = supabase.from('doctors').select('*');
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          filteredData = data;
        }
      } catch (e) {
        console.warn('Doctors table not yet created in Supabase, using defaults:', e);
      }

      if (filteredData.length === 0) {
        filteredData = [
          {
            id: 'doc-1',
            name: 'Dr. Alaric Thorne',
            title: 'MD, FACC - Senior Cardiologist',
            specialty: 'Cardiology',
            department: 'Cardiology',
            experience_years: 15,
            rating: 4.8,
            review_count: 156,
            available_today: true,
            consultation_fee: 150.0,
            photo_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&h=400&auto=format&fit=crop',
            about: 'Academic physician specializing in non-invasive imaging, cardiac rhythm management, and cardiovascular risk containment.'
          },
          {
            id: 'doc-2',
            name: 'Dr. Sarah Jenkins',
            title: 'PhD - Neurology Specialist',
            specialty: 'Neurology',
            department: 'Neurology',
            experience_years: 12,
            rating: 4.9,
            review_count: 203,
            available_today: true,
            consultation_fee: 140.0,
            photo_url: 'https://images.unsplash.com/photo-1594824813593-1b913673752e?q=80&w=400&h=400&auto=format&fit=crop',
            about: 'Focuses on translational neurosciences, neuromuscular pathology, and comprehensive electroencephalography diagnostics.'
          },
          {
            id: 'doc-3',
            name: 'Dr. Robert Vance',
            title: 'MD - Orthopedic Surgeon',
            specialty: 'Orthopedics',
            department: 'Orthopedics',
            experience_years: 18,
            rating: 4.7,
            review_count: 142,
            available_today: true,
            consultation_fee: 160.0,
            photo_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=400&h=400&auto=format&fit=crop',
            about: 'Specializes in arthroscopic reconstructive surgery, total joint revisions, and advanced bone preservation protocols.'
          },
          {
            id: 'doc-4',
            name: 'Dr. Julian Sterling',
            title: 'MD, FACC - Senior Cardiologist',
            specialty: 'Cardiology',
            department: 'Cardiology',
            experience_years: 20,
            rating: 4.8,
            review_count: 187,
            available_today: true,
            consultation_fee: 180.0,
            photo_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&h=400&auto=format&fit=crop',
            about: 'Renowned clinical board member specializing in microvascular bypass surgery and chronic cardiac failure therapy.'
          }
        ];
      }

      if (filters.department && filters.department !== 'All Specialties') {
        filteredData = filteredData.filter(doc => 
          doc.department?.trim().toLowerCase() === filters.department?.trim().toLowerCase()
        );
        if (filteredData.length === 0) {
          filteredData = [
            {
              id: `doc-demo-${filters.department.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
              name: `Dr. Alex Morgan`,
              title: `MD, Senior Consultant - ${filters.department}`,
              specialty: filters.department,
              department: filters.department,
              experience_years: 12,
              rating: 4.9,
              review_count: 88,
              available_today: true,
              consultation_fee: 150.0,
              photo_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&h=400&auto=format&fit=crop',
              about: `Leading specialist in ${filters.department} with over 12 years of clinical excellence.`
            }
          ];
        }
      }
      
      if (filters.availability !== 'All Availability') {
        if (filters.availability === 'Available Today') {
          filteredData = filteredData.filter(doc => doc.available_today === true);
        }
      }

      if (filters.minRating > 0) {
        filteredData = filteredData.filter(doc => (doc.rating || 5.0) >= filters.minRating);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(doc => 
          (doc.name || '').toLowerCase().includes(searchLower) ||
          (doc.specialty || '').toLowerCase().includes(searchLower) ||
          (doc.title || '').toLowerCase().includes(searchLower)
        );
      }
      
      setDoctors(filteredData);
    } catch (error) {
      console.error('Error fetching doctors from Supabase:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    const updated = { ...filters, search: val };
    setFilters(updated);
    updateURLParams(updated);
  };

  const handleDepartmentChange = (deptName) => {
    const updated = { ...filters, department: deptName };
    setFilters(updated);
    updateURLParams(updated);
  };

  const handleClearFilters = () => {
    const cleared = { search: '', department: '', availability: 'All Availability', consultationType: 'In-clinic', minRating: 0 };
    setFilters(cleared);
    updateURLParams(cleared);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <main className="pt-28 md:pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto space-y-8">
        
        {/* Top Header Hero Title & Floating AI Care Manager Box */}
        <header className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-3 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-extrabold tracking-wider border border-blue-100 uppercase">
              <Stethoscope className="w-3.5 h-3.5" />
              VERIFIED CLINICAL DIRECTORY
            </span>

            <h1 className="font-headline text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Clinical Specialist Directory <br />
              <span className="bg-gradient-to-r from-blue-700 to-blue-500 text-transparent bg-clip-text italic">Dedicated to Outcomes</span>
            </h1>

            <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium">
              Consult with board-certified physicians, surgeon leaders, and patient care advocates who listen first.
            </p>
          </div>

          {/* Floating Care Manager Box (Matching Reference Image) */}
          <div className="bg-gradient-to-br from-blue-50 to-emerald-50/50 p-6 rounded-3xl border border-blue-100/80 shadow-sm flex items-center gap-4 shrink-0 max-w-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-md">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-black text-blue-900">Serenity Care Manager</div>
              <div className="text-[11px] text-slate-500 font-medium">Need help finding the right doctor?</div>
              <button 
                type="button" 
                onClick={() => alert('Care Manager Helpline: Call 7095777377 for instant specialist matching.')}
                className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-[11px] rounded-xl transition-all shadow-sm active:scale-95"
              >
                Talk to Expert
              </button>
            </div>
          </div>
        </header>

        {/* Global Search & Filter Bar Widget (Matching Reference) */}
        <section className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-slate-200/80">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* Search Input */}
            <div className="md:col-span-4 bg-slate-50 rounded-2xl flex items-center px-4 border border-slate-200/80 focus-within:border-blue-600 focus-within:bg-white transition-all">
              <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
              <input
                className="w-full bg-transparent border-none focus:ring-0 text-slate-900 placeholder:text-slate-400 py-3 text-xs font-semibold focus:outline-none"
                placeholder="Search doctor, specialty or hospital..."
                type="text"
                value={filters.search}
                onChange={handleSearchChange}
                data-testid="doctor-search-input"
              />
            </div>

            {/* Specialty Select */}
            <div className="md:col-span-3 bg-slate-50 rounded-2xl flex items-center px-3 border border-slate-200/80">
              <select
                className="w-full bg-transparent border-none focus:ring-0 text-slate-900 py-3 text-xs font-bold cursor-pointer focus:outline-none"
                value={filters.department}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                data-testid="department-filter-select"
              >
                <option value="">All Specialties</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Select */}
            <div className="md:col-span-2 bg-slate-50 rounded-2xl flex items-center px-3 border border-slate-200/80">
              <select className="w-full bg-transparent border-none focus:ring-0 text-slate-900 py-3 text-xs font-bold cursor-pointer focus:outline-none">
                <option>Any Experience</option>
                <option>10+ Years</option>
                <option>15+ Years</option>
              </select>
            </div>

            {/* Action Buttons: Search & Reset */}
            <div className="md:col-span-3 flex items-center gap-2">
              <button
                type="button"
                onClick={fetchDoctors}
                className="flex-1 bg-blue-900 hover:bg-blue-800 text-white font-extrabold py-3 px-4 rounded-2xl text-xs transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>

              {(filters.department || filters.search || filters.availability !== 'All Availability') && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-3 py-3 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>

          </div>
        </section>

        {/* Main 2-Column Section: Left Filter Sidebar + Right Doctor Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Filter Sidebar */}
          <aside className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-headline font-bold text-sm text-slate-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" /> Filter By
              </h3>
              <button onClick={handleClearFilters} className="text-[11px] font-bold text-blue-700 hover:underline">
                Clear All
              </button>
            </div>

            {/* Specialty Checkboxes */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block mb-2">Specialty</label>
              <div className="space-y-1.5 text-xs text-slate-600">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-900">
                  <input 
                    type="radio" 
                    name="deptFilter"
                    checked={!filters.department} 
                    onChange={() => handleDepartmentChange('')}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" 
                  />
                  <span>All Specialties</span>
                </label>

                {departments.map((dept) => (
                  <label key={dept.id} className="flex items-center gap-2 cursor-pointer hover:text-slate-900 font-medium">
                    <input 
                      type="radio" 
                      name="deptFilter"
                      checked={filters.department?.toLowerCase() === dept.name?.toLowerCase()} 
                      onChange={() => handleDepartmentChange(dept.name)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" 
                    />
                    <span>{dept.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability Filter */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block mb-2">Availability</label>
              <div className="space-y-1.5 text-xs text-slate-600">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input 
                    type="checkbox" 
                    checked={filters.availability === 'Available Today'}
                    onChange={(e) => setFilters({...filters, availability: e.target.checked ? 'Available Today' : 'All Availability'})}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" 
                  />
                  <span>Available Today</span>
                </label>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block mb-2">Patient Rating</label>
              <div className="flex flex-wrap gap-1.5">
                {[0, 4.0, 4.5, 4.8].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFilters({ ...filters, minRating: rating })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      filters.minRating === rating
                        ? 'bg-blue-900 text-white border-blue-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {rating === 0 ? 'All' : `${rating}+ ★`}
                  </button>
                ))}
              </div>
            </div>

            {/* Green Care Expert Banner Card */}
            <div className="p-5 bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl text-white space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider">Need help selecting a specialist?</h4>
              <p className="text-[11px] opacity-90 leading-relaxed">Our advisory desks are available 24/7 to guide your choice.</p>
              <button 
                type="button"
                onClick={() => alert('helpline: 7095777377')}
                className="w-full py-2.5 bg-white text-blue-800 font-extrabold rounded-xl text-xs hover:bg-blue-50 transition-colors shadow-sm"
              >
                Talk to Care Expert
              </button>
            </div>
          </aside>

          {/* Right Main Doctors List */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Results Top Header */}
            <div className="flex items-center justify-between px-2">
              <div className="text-sm font-semibold text-slate-600">
                <span className="font-black text-slate-900 text-base">{doctors.length}</span> doctors found
                {filters.department && (
                  <span> in <span className="text-blue-700 font-bold">{filters.department}</span></span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <span>Sort By:</span>
                <select className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-900 outline-none cursor-pointer">
                  <option>Most Relevant</option>
                  <option>Highest Rated</option>
                  <option>Experience: High to Low</option>
                </select>
              </div>
            </div>

            {/* Doctors Cards Container */}
            <div className="space-y-4" data-testid="doctors-grid">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4 animate-pulse">
                    <div className="h-24 bg-slate-100 rounded-xl w-full" />
                  </div>
                ))
              ) : doctors.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
                  <UserX className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="font-bold text-lg text-slate-900">No Doctors Found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">Try adjusting your search query or selecting a different specialty.</p>
                  <button onClick={handleClearFilters} className="px-6 py-2.5 bg-blue-900 text-white font-bold rounded-xl text-xs">
                    Clear Filters
                  </button>
                </div>
              ) : (
                doctors.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))
              )}
            </div>

          </main>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DoctorDirectory;
