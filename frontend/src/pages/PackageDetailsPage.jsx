import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { packageService } from '../lib/packageService';
import { supabase } from '../lib/supabaseClient';
import { TestTube, Clock, Building2, CheckCircle2, ShieldCheck, ArrowRight, Calendar } from 'lucide-react';

const PackageDetailsPage = () => {
  const { id } = useParams();
  const [pkg, setPkg] = useState(null);
  const [testsList, setTestsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Form State
  const [patientName, setPatientName] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('07:00:00 - 09:00:00');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    loadPackageDetails();
  }, [id]);

  const loadPackageDetails = async () => {
    setLoading(true);
    try {
      const data = await packageService.getPackageById(id);
      if (data) {
        setPkg(data);
        const tests = await packageService.getPackageTests(id);
        setTestsList(tests || []);
      }
    } catch (err) {
      console.error('Error loading package details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!patientName || !selectedDate) {
      setBookingError('Please enter patient name and select sample collection date.');
      return;
    }
    setBookingLoading(true);
    setBookingError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const bookingPayload = {
        package_id: pkg.id,
        hospital_id: pkg.hospital_id,
        user_id: user ? user.id : null,
        patient_name: patientName,
        patient_email: user?.email || 'patient@clinicalserenity.com',
        appointment_date: selectedDate,
        appointment_time: selectedTimeSlot,
        amount: pkg.price
      };

      const result = await packageService.createBooking(bookingPayload);
      setBookingResult(result);
    } catch (err) {
      setBookingError('Failed to create package booking reservation. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <NavBar />
        <div className="py-32 text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium text-xs">Loading package details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <NavBar />
        <div className="py-32 text-center max-w-md mx-auto space-y-4">
          <h2 className="font-headline font-bold text-2xl text-slate-900">Package Not Found</h2>
          <p className="text-slate-500 text-xs">The requested health checkup package is unavailable.</p>
          <Link to="/packages" className="inline-block py-2.5 px-5 bg-slate-900 text-white rounded-xl text-xs font-bold">
            Back to All Packages
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const origPrice = pkg.original_price || pkg.price;
  const discPrice = pkg.price;
  const savings = origPrice > discPrice ? Math.round(((origPrice - discPrice) / origPrice) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <NavBar />

        {/* Hero Section */}
        <section className="relative pt-28 pb-16 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-6">
              <Link to="/packages" className="hover:text-blue-400 transition-colors">Diagnostic Packages</Link>
              <span>/</span>
              <span className="text-white font-semibold">{pkg.package_name}</span>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
              
              {/* Left Details */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3.5 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider">
                    {pkg.category?.category_name || 'Health Checkup'}
                  </span>

                  {savings > 0 && (
                    <span className="px-3 py-1 bg-emerald-500 text-slate-950 rounded-full text-xs font-black uppercase tracking-wider">
                      Save {savings}%
                    </span>
                  )}

                  {pkg.home_collection && (
                    <span className="px-3 py-1 bg-slate-800 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-700">
                      Free Home Collection
                    </span>
                  )}
                </div>

                <h1 className="font-headline text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
                  {pkg.package_name}
                </h1>

                <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                  {pkg.description}
                </p>

                {pkg.recommended_for && (
                  <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-xs space-y-1">
                    <span className="text-blue-400 font-bold uppercase tracking-wider text-[10px] block">RECOMMENDED FOR</span>
                    <p className="text-slate-200 font-medium">{pkg.recommended_for}</p>
                  </div>
                )}

                {/* Quick Info Badges */}
                <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-300 font-medium">
                  <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/60">
                    <TestTube className="w-4 h-4 text-blue-400" />
                    <span>{testsList.length} Tests Included</span>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/60">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span>Report Delivery: {pkg.report_time || '24 Hours'}</span>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/60">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span>{pkg.hospital?.hospital_name || 'Main Campus'}</span>
                  </div>
                </div>
              </div>

              {/* Right Booking Card */}
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-2xl space-y-6 text-slate-900">
                <div className="space-y-1 border-b border-slate-100 pb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Discounted Package Price</span>
                  <div className="flex items-baseline gap-3">
                    <span className="font-black text-slate-900 text-3xl">₹{discPrice}</span>
                    {savings > 0 && (
                      <span className="text-sm text-slate-400 line-through">₹{origPrice}</span>
                    )}
                  </div>
                </div>

                {bookingResult ? (
                  /* Success Booking Modal */
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
                    <div className="w-12 h-12 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center mx-auto shadow-md">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="font-headline font-bold text-lg text-emerald-950">Package Booked!</h4>
                    <p className="text-xs text-emerald-800">Booking Reference Code:</p>
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-300 font-mono text-base font-bold text-slate-900">
                      {bookingResult.booking_reference}
                    </div>
                    <Link
                      to={`/packages/track?ref=${bookingResult.booking_reference}`}
                      className="block py-2.5 px-4 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md mt-2"
                    >
                      Track Sample Collection
                    </Link>
                  </div>
                ) : (
                  /* Booking Form */
                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    {bookingError && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                        {bookingError}
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Patient Full Name *
                      </label>
                      <input
                        type="text"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        required
                        className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Select Collection Date *
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        required
                        className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Select Sample Collection Slot *
                      </label>
                      <select
                        value={selectedTimeSlot}
                        onChange={(e) => setSelectedTimeSlot(e.target.value)}
                        className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                      >
                        <option value="07:00:00 - 09:00:00">07:00 AM - 09:00 AM (Recommended Fasting)</option>
                        <option value="09:00:00 - 11:00:00">09:00 AM - 11:00 AM</option>
                        <option value="11:00:00 - 13:00:00">11:00 AM - 01:00 PM</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <span>{bookingLoading ? 'Processing...' : 'Confirm & Reserve Collection Slot'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}

              </div>

            </div>
          </div>
        </section>

        {/* Included Tests Accordion/List Section */}
        <main className="max-w-7xl mx-auto px-6 md:px-12 py-16">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="font-headline font-black text-2xl text-slate-900">
                  Included Laboratory Tests ({testsList.length})
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Detailed pathology parameters included in this health checkup package.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {testsList.length > 0 ? (
                testsList.map((test) => (
                  <div key={test.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          {test.category || 'Pathology'}
                        </span>
                        <h4 className="font-headline font-bold text-slate-900 text-lg">{test.test_name}</h4>
                      </div>
                    </div>
                    {test.test_description && (
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">{test.test_description}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-slate-400 text-xs font-medium italic border border-dashed border-slate-200 rounded-3xl">
                  Test parameters list available upon slot booking.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default PackageDetailsPage;
