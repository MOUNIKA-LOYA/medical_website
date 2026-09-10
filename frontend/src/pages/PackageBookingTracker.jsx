import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { packageService } from '../lib/packageService';
import { supabase } from '../lib/supabaseClient';
import { Search, TestTube, CheckCircle2, Clock, Calendar, FileText, Check, ShieldCheck } from 'lucide-react';

const PackageBookingTracker = () => {
  const [searchParams] = useSearchParams();
  const initialRef = searchParams.get('ref') || '';

  const [searchQuery, setSearchQuery] = useState(initialRef);
  const [trackedBooking, setTrackedBooking] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserBookings();
    if (initialRef) {
      handleTrackByRef(initialRef);
    }
  }, [initialRef]);

  const loadUserBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const bookings = await packageService.getUserBookings(user.id);
        setUserBookings(bookings || []);
      }
    } catch (err) {
      console.error('Error fetching user bookings:', err);
    }
  };

  const handleTrackByRef = async (ref) => {
    if (!ref.trim()) return;
    setLoading(true);
    setError('');
    setTrackedBooking(null);
    try {
      const data = await packageService.getBookingByReference(ref.trim());
      if (!data) {
        setError(`No package booking found with Reference Code "${ref}". Please verify your reference number.`);
      } else {
        setTrackedBooking(data);
      }
    } catch (err) {
      setError('Unable to fetch package booking status. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitForm = (e) => {
    e.preventDefault();
    handleTrackByRef(searchQuery);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <NavBar />

        {/* Hero Section */}
        <section className="relative pt-32 pb-16 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-6 md:px-12 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
              <TestTube className="w-4 h-4" />
              <span>LIVE DIAGNOSTIC TRACKER</span>
            </div>

            <h1 className="font-headline text-3xl md:text-5xl font-black tracking-tight mb-2">
              Track Package <span className="text-emerald-400">Booking & Reports</span>
            </h1>

            <p className="text-slate-400 text-sm md:text-base max-w-xl font-medium">
              Check real-time home sample collection status, lab processing stages, and download digital diagnostic reports.
            </p>
          </div>
        </section>

        {/* Search & Content Section */}
        <main className="max-w-4xl mx-auto px-6 md:px-12 -mt-8 relative z-20 pb-24 space-y-8">
          
          {/* Search Box */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl space-y-4">
            <h2 className="font-headline font-black text-2xl text-slate-900">Track Booking Status</h2>
            <p className="text-xs text-slate-500 font-medium">
              Enter your Booking Reference Code (e.g., <strong className="text-slate-800">PKG-2026-9901</strong>).
            </p>

            <form onSubmit={onSubmitForm} className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. PKG-2026-9901"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="py-3.5 px-6 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl text-xs font-bold transition-all shadow-md shrink-0"
              >
                {loading ? 'Searching...' : 'Track Booking'}
              </button>
            </form>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}
          </div>

          {/* Tracked Booking Result */}
          {trackedBooking && (
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-lg space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-widest block">
                    REFERENCE: {trackedBooking.booking_reference}
                  </span>
                  <h3 className="font-headline font-black text-2xl text-slate-900">
                    {trackedBooking.package?.package_name || 'Diagnostic Checkup Package'}
                  </h3>
                </div>

                <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Status: {trackedBooking.booking_status}
                </span>
              </div>

              {/* Progress Timeline */}
              {trackedBooking.timeline && (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60 space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sample Collection & Report Timeline</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {trackedBooking.timeline.map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            item.completed ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {item.completed ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                          </div>
                          <span className={`text-xs font-bold ${item.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                            {item.stage}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Patient Name</span>
                  <span className="font-bold text-slate-800">{trackedBooking.patient_name}</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Scheduled Date & Slot</span>
                  <span className="font-bold text-slate-800">{trackedBooking.appointment_date} ({trackedBooking.appointment_time})</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Amount Paid</span>
                  <span className="font-bold text-emerald-600 text-sm">₹{Number(trackedBooking.amount).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* User Booking History */}
          <div className="space-y-4 pt-4">
            <h3 className="font-headline font-bold text-slate-900 text-xl">Past Package Reservations</h3>
            <div className="space-y-4">
              {userBookings.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center text-slate-400 text-xs border border-slate-200">
                  No past package bookings found.
                </div>
              ) : (
                userBookings.map((b) => (
                  <div key={b.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-600">{b.booking_reference}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase bg-slate-100 text-slate-700">
                          {b.booking_status}
                        </span>
                      </div>
                      <h4 className="font-headline font-bold text-slate-900 text-base">
                        {b.package?.package_name || 'Health Checkup Package'} • ₹{Number(b.amount).toLocaleString()}
                      </h4>
                      <p className="text-xs text-slate-500">{b.hospital?.hospital_name} • Reserved for {b.appointment_date}</p>
                    </div>

                    <button
                      onClick={() => {
                        setSearchQuery(b.booking_reference);
                        setTrackedBooking(b);
                      }}
                      className="py-2 px-4 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shrink-0"
                    >
                      View Details
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </main>
      </div>

      <Footer />
    </div>
  );
};

export default PackageBookingTracker;
