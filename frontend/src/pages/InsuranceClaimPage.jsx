import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  FileText, Search, Upload, CheckCircle2, Clock, ShieldCheck, Building2, 
  ArrowRight, AlertCircle, FileCheck, DollarSign, User, File, Check
} from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { insuranceService } from '../lib/insuranceService';
import { hospitalService } from '../lib/hospitalService';

const InsuranceClaimPage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'track' ? 'track' : 'submit';
  const paramProviderId = searchParams.get('providerId') || '';
  const paramPlanId = searchParams.get('planId') || '';

  const [activeTab, setActiveTab] = useState(initialTab);

  // Form selections & options
  const [hospitals, setHospitals] = useState([]);
  const [providers, setProviders] = useState([]);
  const [plans, setPlans] = useState([]);

  // Claim Submit Form state
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(paramProviderId);
  const [selectedPlan, setSelectedPlan] = useState(paramPlanId);
  const [patientName, setPatientName] = useState('Percy Boyina');
  const [claimAmount, setClaimAmount] = useState('');
  const [remarks, setRemarks] = useState('');

  // Document files state
  const [dischargeFile, setDischargeFile] = useState(null);
  const [billFile, setBillFile] = useState(null);

  // Submission status
  const [submitting, setSubmitting] = useState(false);
  const [submittedClaim, setSubmittedClaim] = useState(null);
  const [submitError, setSubmitError] = useState('');

  // Claim Tracking State
  const [trackQuery, setTrackQuery] = useState('');
  const [trackedClaim, setTrackedClaim] = useState(null);
  const [userClaims, setUserClaims] = useState([]);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackError, setTrackError] = useState('');

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [hospList, provList, planList, userClaimList] = await Promise.all([
          hospitalService.getHospitals(),
          insuranceService.getProviders(),
          insuranceService.getPlans(),
          insuranceService.getUserClaims('00000000-0000-0000-0000-000000000001')
        ]);

        setHospitals(hospList || []);
        setProviders(provList || []);
        setPlans(planList || []);
        setUserClaims(userClaimList || []);

        if (hospList && hospList.length > 0) setSelectedHospital(hospList[0].id);
        if (provList && provList.length > 0 && !selectedProvider) setSelectedProvider(provList[0].id);
      } catch (err) {
        console.error('Error loading claim form options:', err);
      }
    };
    loadDropdownData();
  }, []);

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!selectedHospital || !selectedProvider || !claimAmount) {
      setSubmitError('Please complete all required fields.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    setSubmittedClaim(null);

    try {
      const claim = await insuranceService.submitClaim({
        user_id: '00000000-0000-0000-0000-000000000001',
        patient_name: patientName,
        hospital_id: selectedHospital,
        provider_id: selectedProvider,
        plan_id: selectedPlan || null,
        claim_amount: parseFloat(claimAmount),
        remarks: remarks || 'Claim submitted via Online Insurance Portal.'
      });

      if (claim && claim.id) {
        // Upload documents if selected
        if (dischargeFile) {
          await insuranceService.uploadDocument(claim.id, dischargeFile.name, 'discharge_summary', dischargeFile);
        }
        if (billFile) {
          await insuranceService.uploadDocument(claim.id, billFile.name, 'hospital_bill', billFile);
        }

        setSubmittedClaim(claim);
        // Refresh user claims list
        const updated = await insuranceService.getUserClaims('00000000-0000-0000-0000-000000000001');
        setUserClaims(updated || []);
      }
    } catch (err) {
      console.error('Claim submission error:', err);
      setSubmitError('Failed to submit claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;

    setTrackingLoading(true);
    setTrackError('');
    setTrackedClaim(null);

    try {
      const res = await insuranceService.getClaimStatus(trackQuery.trim());
      if (res) {
        setTrackedClaim(res);
      } else {
        setTrackError('No claim found matching this Claim Number. Please check and try again.');
      }
    } catch (err) {
      setTrackError('Claim not found. Please verify your Claim Number.');
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <NavBar />

        {/* Hero Banner */}
        <section className="relative pt-32 pb-16 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-6 md:px-12 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
              <ShieldCheck className="w-4 h-4" />
              <span>ONLINE CLAIM PORTAL</span>
            </div>

            <h1 className="font-headline text-3xl md:text-5xl font-black tracking-tight mb-2">
              Insurance Claim <span className="bg-gradient-to-r from-blue-400 to-blue-200 text-transparent bg-clip-text">Submission &amp; Tracking</span>
            </h1>

            <p className="text-slate-400 text-sm md:text-base max-w-xl font-medium">
              Submit your cashless or reimbursement claim in 3 simple steps, upload medical bills, and track real-time authorization status.
            </p>
          </div>
        </section>

        {/* Tab Toggle Bar */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 -mt-6 relative z-20 mb-12">
          <div className="bg-white rounded-3xl p-3 shadow-xl border border-slate-100 flex items-center justify-center max-w-md mx-auto">
            <button
              onClick={() => setActiveTab('submit')}
              className={`flex-1 py-3 px-6 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'submit' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Submit New Claim</span>
            </button>

            <button
              onClick={() => setActiveTab('track')}
              className={`flex-1 py-3 px-6 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'track' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Track Claim Status</span>
            </button>
          </div>
        </section>

        {/* Main Content Area */}
        <main className="max-w-4xl mx-auto px-6 md:px-12 pb-24">

          {/* TAB 1: SUBMIT NEW CLAIM */}
          {activeTab === 'submit' && (
            <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200/80 shadow-sm space-y-6">
              <div>
                <h2 className="font-headline font-black text-2xl text-slate-900">File Insurance Claim</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Fill in the patient and hospital claim details. Documents uploaded are saved securely to your claim record.
                </p>
              </div>

              {submitError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {submittedClaim ? (
                /* Success Dialog */
                <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-headline font-black text-2xl text-emerald-950">Claim Submitted Successfully!</h3>
                  <p className="text-xs text-emerald-800 max-w-md mx-auto">
                    Your claim has been registered in our database with Claim Number:
                  </p>

                  <div className="bg-white rounded-2xl p-4 border border-emerald-300 inline-block">
                    <span className="text-xs text-slate-400 font-bold uppercase block">Claim Reference Number</span>
                    <span className="font-mono text-xl font-black text-slate-900 tracking-wider">{submittedClaim.claim_number}</span>
                  </div>

                  <div className="pt-4 flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => {
                        setTrackQuery(submittedClaim.claim_number);
                        setTrackedClaim(submittedClaim);
                        setActiveTab('track');
                      }}
                      className="py-3 px-6 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
                    >
                      Track Claim Status Live
                    </button>

                    <button
                      onClick={() => {
                        setSubmittedClaim(null);
                        setClaimAmount('');
                        setRemarks('');
                      }}
                      className="py-3 px-6 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all"
                    >
                      Submit Another Claim
                    </button>
                  </div>
                </div>
              ) : (
                /* Submit Form */
                <form onSubmit={handleClaimSubmit} className="space-y-6">
                  
                  {/* Hospital Selection */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Select Hospital Campus *
                      </label>
                      <select
                        value={selectedHospital}
                        onChange={(e) => setSelectedHospital(e.target.value)}
                        required
                        className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        {hospitals.map(h => (
                          <option key={h.id} value={h.id}>{h.hospital_name} ({h.city})</option>
                        ))}
                      </select>
                    </div>

                    {/* Insurance Provider */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Insurance Provider *
                      </label>
                      <select
                        value={selectedProvider}
                        onChange={(e) => setSelectedProvider(e.target.value)}
                        required
                        className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        {providers.map(p => (
                          <option key={p.id} value={p.id}>{p.provider_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Policy Plan & Patient Name */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Insurance Policy Plan (Optional)
                      </label>
                      <select
                        value={selectedPlan}
                        onChange={(e) => setSelectedPlan(e.target.value)}
                        className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="">-- General Health Policy --</option>
                        {plans.map(pl => (
                          <option key={pl.id} value={pl.id}>{pl.plan_name} (₹{Number(pl.coverage_amount).toLocaleString()} Cover)</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Patient Full Name *
                      </label>
                      <input
                        type="text"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        required
                        className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  {/* Claim Amount & Remarks */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Claim Amount (₹) *
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 2500"
                        value={claimAmount}
                        onChange={(e) => setClaimAmount(e.target.value)}
                        required
                        min="1"
                        step="any"
                        className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Medical Remarks / Treatment Notes
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Pre-authorization for OPD pathology tests"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  {/* Document Uploads */}
                  <div className="border-t border-slate-100 pt-6 space-y-4">
                    <h4 className="font-headline font-bold text-slate-900 text-sm uppercase tracking-wider">
                      Upload Required Documents (Optional)
                    </h4>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Discharge Summary */}
                      <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl space-y-2">
                        <span className="text-xs font-bold text-slate-800 block">Discharge Summary / Report</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={(e) => setDischargeFile(e.target.files[0])}
                          className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-blue-700"
                        />
                      </div>

                      {/* Hospital Bill */}
                      <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl space-y-2">
                        <span className="text-xs font-bold text-slate-800 block">Itemized Medical / Hospital Bill</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={(e) => setBillFile(e.target.files[0])}
                          className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-blue-700"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-blue-700 hover:bg-blue-800 text-white font-black text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>{submitting ? 'Submitting Claim...' : 'Submit Claim & Generate Reference Number'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                </form>
              )}
            </div>
          )}

          {/* TAB 2: TRACK CLAIM STATUS */}
          {activeTab === 'track' && (
            <div className="space-y-8">
              
              {/* Search Box */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-4">
                <h2 className="font-headline font-black text-2xl text-slate-900">Track Insurance Claim</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Enter your Claim Reference Number (e.g., <strong className="text-slate-800">CLM-2026-8801</strong>) to view real-time authorization status.
                </p>

                <form onSubmit={handleTrackSubmit} className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. CLM-2026-8801"
                      value={trackQuery}
                      onChange={(e) => setTrackQuery(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={trackingLoading}
                    className="py-3 px-6 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl text-xs font-bold transition-all shadow-md shrink-0"
                  >
                    {trackingLoading ? 'Searching...' : 'Track Status'}
                  </button>
                </form>

                {trackError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                    {trackError}
                  </div>
                )}
              </div>

              {/* Tracked Claim Result Card */}
              {trackedClaim && (
                <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-lg space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-widest block">
                        CLAIM REFERENCE: {trackedClaim.claim_number}
                      </span>
                      <h3 className="font-headline font-black text-2xl text-slate-900">
                        {trackedClaim.provider?.provider_name || 'Health Insurance Claim'}
                      </h3>
                    </div>

                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                      trackedClaim.claim_status === 'approved' || trackedClaim.claim_status === 'paid'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      Status: {trackedClaim.claim_status?.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Status Timeline */}
                  {trackedClaim.timeline && (
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60 space-y-4">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Claim Status Progress Timeline</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {trackedClaim.timeline.map((item, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                item.completed ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
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
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Hospital</span>
                      <span className="font-bold text-slate-800">{trackedClaim.hospital?.hospital_name || 'Main Campus'}</span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Claim Amount</span>
                      <span className="font-bold text-slate-800">₹{Number(trackedClaim.claim_amount).toLocaleString()}</span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Approved Amount</span>
                      <span className="font-bold text-emerald-600 text-sm">₹{Number(trackedClaim.approved_amount || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {trackedClaim.remarks && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                      <span className="font-bold text-slate-700 block mb-1">Remarks:</span>
                      <p className="text-slate-600">{trackedClaim.remarks}</p>
                    </div>
                  )}

                  {/* Attached Documents */}
                  {trackedClaim.documents && trackedClaim.documents.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-700 block">Attached Claim Documents:</span>
                      <div className="flex flex-wrap gap-2">
                        {trackedClaim.documents.map((doc) => (
                          <a
                            key={doc.id}
                            href={doc.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[11px] font-bold flex items-center gap-1.5"
                          >
                            <File className="w-3.5 h-3.5 text-blue-600" />
                            <span>{doc.document_name}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Patient Claim History Section */}
              <div className="space-y-4 pt-4">
                <h3 className="font-headline font-bold text-slate-900 text-xl">Recent Claim History</h3>
                <div className="space-y-4">
                  {userClaims.length === 0 ? (
                    <div className="bg-white rounded-3xl p-8 text-center text-slate-400 text-xs border border-slate-200">
                      No past claims found.
                    </div>
                  ) : (
                    userClaims.map((c) => (
                      <div key={c.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-blue-600">{c.claim_number}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase bg-slate-100 text-slate-700">
                              {c.claim_status}
                            </span>
                          </div>
                          <h4 className="font-headline font-bold text-slate-900 text-base">
                            {c.provider?.provider_name || 'Insurance Claim'} • ₹{Number(c.claim_amount).toLocaleString()}
                          </h4>
                          <p className="text-xs text-slate-500">{c.hospital?.hospital_name} • Submitted {new Date(c.submitted_at).toLocaleDateString()}</p>
                        </div>

                        <button
                          onClick={() => {
                            setTrackQuery(c.claim_number);
                            setTrackedClaim(c);
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

            </div>
          )}

        </main>
      </div>

      <Footer />
    </div>
  );
};

export default InsuranceClaimPage;
