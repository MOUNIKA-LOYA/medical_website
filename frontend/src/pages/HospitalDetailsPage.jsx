import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Building2, MapPin, Phone, Mail, Globe, Star, Clock, 
  Stethoscope, TestTube, PackageCheck, MessageSquare, Image as ImageIcon,
  CheckCircle2, ArrowRight, Calendar, UserCheck, ShieldCheck, HeartPulse, Send, Check
} from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { hospitalService } from '../lib/hospitalService';

const HospitalDetailsPage = () => {
  const { id } = useParams();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [userTitle, setUserTitle] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  const loadHospitalData = async () => {
    setLoading(true);
    try {
      const data = await hospitalService.getHospitalById(id);
      setHospital(data);
    } catch (err) {
      console.error('Error fetching hospital detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadHospitalData();
    }
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    setSubmittingReview(true);
    setReviewMessage('');
    try {
      await hospitalService.submitReview(id, {
        user_name: userTitle.trim() || 'Verified Patient',
        rating: Number(reviewRating),
        review: reviewText.trim()
      });
      setReviewText('');
      setUserTitle('');
      setReviewMessage('Thank you! Your review has been submitted successfully.');
      loadHospitalData();
    } catch (err) {
      console.error('Failed to submit review:', err);
      setReviewMessage('Could not submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <NavBar />
        <div className="max-w-7xl mx-auto px-6 py-40 text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium text-sm">Loading hospital details from database...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <NavBar />
        <div className="max-w-7xl mx-auto px-6 py-40 text-center">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Hospital Not Found</h2>
          <p className="text-slate-500 text-sm mb-6">The requested hospital campus could not be loaded.</p>
          <Link to="/hospitals" className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs">
            Back to Hospitals Directory
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const rating = hospital.rating ? Number(hospital.rating).toFixed(1) : '4.9';
  const totalReviews = hospital.total_reviews || (hospital.reviews ? hospital.reviews.length : 0);

  const tabs = [
    { id: 'overview', label: 'Overview & Gallery', icon: Building2 },
    { id: 'departments', label: `Departments (${hospital.departments ? hospital.departments.length : 0})`, icon: Stethoscope },
    { id: 'doctors', label: `Doctors (${hospital.doctors ? hospital.doctors.length : 0})`, icon: UserCheck },
    { id: 'tests', label: `Diagnostic Tests (${hospital.diagnostic_tests ? hospital.diagnostic_tests.length : 0})`, icon: TestTube },
    { id: 'packages', label: `Packages (${hospital.diagnostic_packages ? hospital.diagnostic_packages.length : 0})`, icon: PackageCheck },
    { id: 'reviews', label: `Reviews (${totalReviews})`, icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <NavBar />

        {/* Hospital Hero Banner */}
        <section className="relative pt-28 pb-16 bg-slate-900 text-white overflow-hidden">
          {/* Background Image & Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={hospital.banner_url || hospital.image || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200&h=400&auto=format&fit=crop"}
              alt={hospital.hospital_name}
              className="w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
          </div>

          <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-6">
              <Link to="/hospitals" className="hover:text-blue-400 transition-colors">Hospitals</Link>
              <span>/</span>
              <span className="text-white font-semibold">{hospital.city} Campus</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              {/* Left Info Column */}
              <div className="space-y-4 max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  {hospital.logo_url && (
                    <img src={hospital.logo_url} alt="Logo" className="w-12 h-12 rounded-2xl bg-white p-1 object-cover shadow-md" />
                  )}

                  <span className="px-3.5 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider">
                    {hospital.hospital_code || 'SUPER-SPECIALTY'}
                  </span>

                  <div className="bg-slate-800/80 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 border border-slate-700">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-white">{rating}</span>
                    <span className="text-[10px] text-slate-400">({totalReviews} reviews)</span>
                  </div>

                  <div className="bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-full flex items-center gap-1.5 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>24/7 Urgent Trauma Care</span>
                  </div>
                </div>

                <h1 className="font-headline text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
                  {hospital.hospital_name}
                </h1>

                <p className="text-slate-300 text-sm md:text-base leading-relaxed font-normal">
                  {hospital.description}
                </p>

                {/* Contact Pills */}
                <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-300 font-medium">
                  <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/60">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span>{hospital.address}, {hospital.city}</span>
                  </div>

                  {hospital.phone && (
                    <a href={`tel:${hospital.phone}`} className="flex items-center gap-2 bg-slate-800/60 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/60 text-white transition-colors">
                      <Phone className="w-4 h-4 text-blue-400" />
                      <span>{hospital.phone}</span>
                    </a>
                  )}

                  {hospital.email && (
                    <a href={`mailto:${hospital.email}`} className="flex items-center gap-2 bg-slate-800/60 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/60 text-slate-300 transition-colors">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{hospital.email}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Right CTA Box */}
              <div className="shrink-0 space-y-3">
                <Link
                  to={`/book-appointment?hospitalId=${hospital.id}`}
                  className="w-full lg:w-auto py-3.5 px-8 bg-blue-700 hover:bg-blue-800 text-white font-black text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>Book Hospital Visit</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-[11px] text-center text-slate-400 font-medium">
                  Instant confirmation & priority check-in
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation Sticky Bar */}
        <section className="sticky top-16 z-30 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar py-3">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Tab Content Section */}
        <main className="max-w-7xl mx-auto px-6 md:px-12 py-12">

          {/* TAB 1: OVERVIEW & GALLERY */}
          {activeTab === 'overview' && (
            <div className="space-y-12">
              {/* Info Cards Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h4 className="font-headline font-bold text-slate-900 text-base">Working Hours</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {hospital.opening_time && hospital.closing_time
                      ? `Daily OPD: ${hospital.opening_time.slice(0, 5)} - ${hospital.closing_time.slice(0, 5)}`
                      : '24 Hours Open for Emergency & ICU Admissions'}
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="font-headline font-bold text-slate-900 text-base">Accreditation & Quality</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    NABH & JCI Certified Super-Specialty Healthcare Institution.
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <h4 className="font-headline font-bold text-slate-900 text-base">Emergency Hotline</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Direct Trauma Desk: <span className="font-bold text-slate-900">{hospital.phone || '7095777377'}</span>
                  </p>
                </div>
              </div>

              {/* Gallery Section */}
              <div className="space-y-4">
                <h3 className="font-headline font-black text-2xl text-slate-900">Hospital Photo Gallery</h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {hospital.images && hospital.images.length > 0 ? (
                    hospital.images.map((img) => (
                      <div key={img.id} className="group relative h-60 rounded-3xl overflow-hidden bg-slate-900 shadow-md">
                        <img
                          src={img.image_url}
                          alt="Hospital Facility"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex items-end">
                          <span className="text-xs font-bold text-white uppercase tracking-wider">{img.image_type || 'Facility'}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full bg-white rounded-3xl p-12 text-center text-slate-400 text-xs border border-slate-200">
                      No gallery images uploaded yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DEPARTMENTS */}
          {activeTab === 'departments' && (
            <div className="space-y-6">
              <h3 className="font-headline font-black text-2xl text-slate-900">Active Medical Departments</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {hospital.departments && hospital.departments.length > 0 ? (
                  hospital.departments.map((dept) => (
                    <div key={dept.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-start gap-4 hover:shadow-md transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold">
                        <Stethoscope className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-headline font-bold text-slate-900 text-lg">{dept.department_name}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{dept.description || 'Specialized clinical care and diagnostic treatment.'}</p>
                        <span className="inline-block pt-2 text-[11px] font-bold text-emerald-500 uppercase tracking-wider">
                          Status: Active
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full bg-white rounded-3xl p-12 text-center text-slate-400 text-xs border border-slate-200">
                    No departments listed for this hospital yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DOCTORS & AVAILABILITY */}
          {activeTab === 'doctors' && (
            <div className="space-y-6">
              <h3 className="font-headline font-black text-2xl text-slate-900">Attending Specialists & Availability</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {hospital.doctors && hospital.doctors.length > 0 ? (
                  hospital.doctors.map((doc) => (
                    <div key={doc.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
                      <div className="flex gap-4 items-start">
                        <img
                          src={doc.profile_image || doc.photo_url || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&h=400&auto=format&fit=crop"}
                          alt={doc.doctor_name || doc.name}
                          className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="space-y-1">
                          <h4 className="font-headline font-bold text-slate-900 text-lg">{doc.doctor_name || doc.name}</h4>
                          <p className="text-xs text-blue-700 font-semibold">{doc.qualification || doc.title}</p>
                          <p className="text-xs text-slate-500 font-medium">{doc.specialization || doc.specialty} • {doc.experience || doc.experience_years || 10}+ Yrs Experience</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-normal line-clamp-2">
                        {doc.about || 'Dedicated specialist providing comprehensive medical care and outpatient consultations.'}
                      </p>

                      {/* Availability Slots list */}
                      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/60 text-xs space-y-1.5">
                        <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">OPD Availability Schedule:</span>
                        {doc.availability && doc.availability.length > 0 ? (
                          doc.availability.map((slot) => (
                            <div key={slot.id} className="flex items-center justify-between text-slate-600 font-medium">
                              <span>{slot.day_of_week}</span>
                              <span className="font-bold text-slate-900">{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-400 italic text-[11px]">Mon - Fri: 09:00 AM - 02:00 PM</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Fee</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-slate-900 text-base">₹{Math.round((doc.consultation_fee || 150) * 0.9)}</span>
                            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">10% OFF</span>
                          </div>
                        </div>
                        <Link
                          to={`/book-appointment?doctorId=${doc.id}`}
                          className="py-2.5 px-5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95"
                        >
                          <span>Book Doctor</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full bg-white rounded-3xl p-12 text-center text-slate-400 text-xs border border-slate-200">
                    No doctors associated with this hospital campus yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: DIAGNOSTIC TESTS */}
          {activeTab === 'tests' && (
            <div className="space-y-6">
              <h3 className="font-headline font-black text-2xl text-slate-900">Diagnostic Tests & Pathology</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hospital.diagnostic_tests && hospital.diagnostic_tests.length > 0 ? (
                  hospital.diagnostic_tests.map((test) => (
                    <div key={test.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                          {test.category || 'Pathology'}
                        </span>
                        <h4 className="font-headline font-bold text-slate-900 text-base">{test.test_name}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed font-normal">{test.description}</p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                        <div className="flex items-center justify-between text-slate-500">
                          <span>Report Turnaround:</span>
                          <span className="font-bold text-slate-800">{test.report_time || '24 Hours'}</span>
                        </div>
                        {test.fasting_required && (
                          <div className="flex items-center gap-1.5 text-amber-600 font-semibold text-[11px]">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Fasting required before test</span>
                          </div>
                        )}
                        {test.home_collection && (
                          <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Free Home Sample Collection</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-baseline gap-2">
                          <span className="font-black text-slate-900 text-xl">₹{test.discount_price || test.original_price}</span>
                          {test.discount_price && test.original_price > test.discount_price && (
                            <span className="text-xs text-slate-400 line-through">₹{test.original_price}</span>
                          )}
                        </div>
                        <button className="py-2 px-4 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 rounded-xl text-xs font-bold transition-all">
                          Book Test
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full bg-white rounded-3xl p-12 text-center text-slate-400 text-xs border border-slate-200">
                    No diagnostic tests configured for this hospital campus yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: DIAGNOSTIC PACKAGES */}
          {activeTab === 'packages' && (
            <div className="space-y-6">
              <h3 className="font-headline font-black text-2xl text-slate-900">Health Checkup Packages</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {hospital.diagnostic_packages && hospital.diagnostic_packages.length > 0 ? (
                  hospital.diagnostic_packages.map((pkg) => (
                    <div key={pkg.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm flex flex-col justify-between">
                      {pkg.package_image && (
                        <div className="h-44 bg-slate-900 relative">
                          <img src={pkg.package_image} alt={pkg.package_name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <h4 className="font-headline font-bold text-slate-900 text-xl">{pkg.package_name}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed">{pkg.description}</p>
                        </div>

                        {pkg.included_tests && pkg.included_tests.length > 0 && (
                          <div className="bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-200/60">
                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                              Included Tests ({pkg.included_tests.length}):
                            </span>
                            <ul className="space-y-1 text-xs text-slate-600 font-medium">
                              {pkg.included_tests.map((t) => (
                                <li key={t.id} className="flex items-center gap-2">
                                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>{t.test_name}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <div className="flex items-baseline gap-2">
                            <span className="font-black text-emerald-600 text-2xl">₹{pkg.discount_price || pkg.original_price}</span>
                            {pkg.discount_price && pkg.original_price > pkg.discount_price && (
                              <span className="text-xs text-slate-400 line-through">₹{pkg.original_price}</span>
                            )}
                          </div>
                          <button className="py-2.5 px-6 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md">
                            Book Package
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full bg-white rounded-3xl p-12 text-center text-slate-400 text-xs border border-slate-200">
                    No diagnostic packages available for this hospital campus yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: REVIEWS & RATINGS */}
          {activeTab === 'reviews' && (
            <div className="space-y-8">
              <div className="grid lg:grid-cols-3 gap-8">
                
                {/* Rating Score Summary */}
                <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm text-center space-y-3">
                  <span className="text-5xl font-black text-slate-900">{rating}</span>
                  <div className="flex justify-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-5 h-5 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Based on {totalReviews} patient reviews</p>
                </div>

                {/* Submit Review Form */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-4">
                  <h4 className="font-headline font-bold text-slate-900 text-lg">Submit Patient Review</h4>
                  {reviewMessage && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                      {reviewMessage}
                    </div>
                  )}
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Your Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Percy Boyina"
                          value={userTitle}
                          onChange={(e) => setUserTitle(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Rating (1 to 5)</label>
                        <select
                          value={reviewRating}
                          onChange={(e) => setReviewRating(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                        >
                          <option value="5">5 ★★★★★ (Excellent)</option>
                          <option value="4">4 ★★★★☆ (Very Good)</option>
                          <option value="3">3 ★★★☆☆ (Average)</option>
                          <option value="2">2 ★★☆☆☆ (Poor)</option>
                          <option value="1">1 ★☆☆☆☆ (Terrible)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Your Experience / Feedback</label>
                      <textarea
                        rows={3}
                        placeholder="Write your hospital visit feedback..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="py-2.5 px-6 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submittingReview ? 'Submitting...' : 'Post Review'}</span>
                    </button>
                  </form>
                </div>

              </div>

              {/* Reviews List */}
              <div className="space-y-4 pt-4">
                <h4 className="font-headline font-bold text-slate-900 text-xl">Recent Patient Reviews</h4>
                <div className="space-y-4">
                  {hospital.reviews && hospital.reviews.length > 0 ? (
                    hospital.reviews.map((rev) => (
                      <div key={rev.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm">{rev.user_name || 'Verified Patient'}</span>
                          <div className="flex items-center gap-1 text-amber-400">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span className="text-xs font-bold text-slate-800">{rev.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-normal">{rev.review}</p>
                        <span className="text-[10px] text-slate-400 font-medium block">
                          {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recently'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-xs border border-slate-200">
                      No reviews posted yet. Be the first to share your experience!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      <Footer />
    </div>
  );
};

export default HospitalDetailsPage;
