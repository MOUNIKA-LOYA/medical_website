import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Search, Building2, Phone, Mail, Globe, Sparkles, 
  FileText, CheckCircle2, ArrowRight, HelpCircle, ChevronDown, Award, HeartPulse, Clock, Filter
} from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { insuranceService } from '../lib/insuranceService';
import { hospitalService } from '../lib/hospitalService';

const InsuranceDirectory = () => {
  const [providers, setProviders] = useState([]);
  const [plans, setPlans] = useState([]);
  const [cashlessNetwork, setCashlessNetwork] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState('providers');
  const [search, setSearch] = useState('');
  const [selectedPlanType, setSelectedPlanType] = useState('All Types');
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [provList, planList, cashlessList, faqList] = await Promise.all([
        insuranceService.getProviders(search),
        insuranceService.getPlans({ providerId: selectedProviderId, planType: selectedPlanType }),
        insuranceService.getCashlessHospitals(selectedProviderId),
        insuranceService.getFaqs()
      ]);

      setProviders(provList || []);
      setPlans(planList || []);
      setCashlessNetwork(cashlessList || []);
      setFaqs(faqList || []);
    } catch (err) {
      console.error('Error loading insurance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedPlanType, selectedProviderId]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <NavBar />

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 bg-slate-900 text-white overflow-hidden">
          {/* Subtle Glow & Grid */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />

          <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              
              {/* Left Column */}
              <div className="space-y-6 text-center lg:text-left max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>DATABASE-DRIVEN CASHLESS HEALTHCARE</span>
                </div>

                <h1 className="font-headline text-4xl md:text-6xl font-black tracking-tight leading-tight">
                  Stress-Free <br />
                  <span className="text-blue-400">Coverage Coordination</span>
                </h1>

                <p className="text-slate-300 text-base md:text-lg font-medium leading-relaxed">
                  Focus on recovery while our dedicated desk coordinates pre-authorization and direct billing with your provider.
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
                  <Link
                    to="/insurance/claim"
                    className="py-3.5 px-7 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-xl transition-all flex items-center gap-2 active:scale-95"
                  >
                    <FileText className="w-4 h-4" />
                    <span>File New Claim</span>
                  </Link>

                  <Link
                    to="/insurance/claim?tab=track"
                    className="py-3.5 px-7 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-sm rounded-2xl transition-all flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span>Track Existing Claim</span>
                  </Link>
                </div>
              </div>

              {/* Right Summary Box */}
              <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-md rounded-3xl p-8 border border-slate-700/80 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                  <div>
                    <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest block">NETWORK VERIFIED</span>
                    <h3 className="font-headline text-xl font-bold text-white">Direct Billing Desk</h3>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-3.5 text-xs text-slate-300">
                  <div className="flex items-center gap-3 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Instant Pre-Authorization within 30 Mins</span>
                  </div>

                  <div className="flex items-center gap-3 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Clear Pre-Authorization & Direct Settlement</span>
                  </div>

                  <div className="flex items-center gap-3 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>24/7 Dedicated Support Coordinators</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Hotline Support:</span>
                  <a href="tel:7095777377" className="font-bold text-blue-400 hover:underline">
                    7095777377
                  </a>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Dynamic Search & Multi-Tab Filter Bar */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 -mt-8 relative z-20 mb-12">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-4">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search insurance provider, plan name, or coverage type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            {/* Tab Navigation Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
                <button
                  onClick={() => setActiveTab('providers')}
                  className={`py-2.5 px-5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'providers' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Award className="w-4 h-4 text-blue-400" />
                  <span>Empaneled Providers ({providers.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('plans')}
                  className={`py-2.5 px-5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'plans' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Insurance Plans ({plans.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('cashless')}
                  className={`py-2.5 px-5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'cashless' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span>Cashless Hospitals ({cashlessNetwork.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('faqs')}
                  className={`py-2.5 px-5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'faqs' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 text-blue-400" />
                  <span>FAQs & Claims Guide</span>
                </button>
              </div>

              {/* Secondary Plan Type Filter if Plans Tab is Active */}
              {activeTab === 'plans' && (
                <div className="relative">
                  <select
                    value={selectedPlanType}
                    onChange={(e) => setSelectedPlanType(e.target.value)}
                    className="py-2 px-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                  >
                    <option value="All Types">All Plan Types</option>
                    <option value="Family Floater">Family Floater</option>
                    <option value="Individual">Individual & Super</option>
                    <option value="Senior Citizen">Senior Citizen</option>
                  </select>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* Content Section */}
        <main className="max-w-7xl mx-auto px-6 md:px-12 pb-24">

          {/* TAB 1: EMPANELED INSURANCE PROVIDERS */}
          {activeTab === 'providers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h2 className="font-headline font-black text-2xl text-slate-900 tracking-tight">
                    Partner Insurance Companies
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Verified insurance partners integrated with our healthcare network for direct billing coordination.
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse space-y-4">
                      <div className="h-12 bg-slate-200 rounded-xl w-12" />
                      <div className="h-6 bg-slate-200 rounded w-1/2" />
                      <div className="h-4 bg-slate-200 rounded w-full" />
                    </div>
                  ))}
                </div>
              ) : providers.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-xs border border-slate-200">
                  No insurance providers found.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {providers.map((prov) => (
                    <div key={prov.id} className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {prov.provider_logo && (
                              <img src={prov.provider_logo} alt={prov.provider_name} className="w-12 h-12 rounded-2xl object-cover border border-slate-200" />
                            )}
                            <div>
                              <h3 className="font-headline font-black text-slate-900 text-lg">{prov.provider_name}</h3>
                              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md">
                                Cashless Partner
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed font-normal">
                          {prov.description}
                        </p>
                      </div>

                      {/* Contact & Support info */}
                      <div className="bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-200/60 text-xs">
                        {prov.support_phone && (
                          <div className="flex items-center gap-2 text-slate-700 font-medium">
                            <Phone className="w-3.5 h-3.5 text-blue-600" />
                            <span>Toll Free Support: <strong className="text-slate-900">{prov.support_phone}</strong></span>
                          </div>
                        )}

                        {prov.support_email && (
                          <div className="flex items-center gap-2 text-slate-600 font-medium">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <a href={`mailto:${prov.support_email}`} className="hover:underline">{prov.support_email}</a>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setSelectedProviderId(prov.id);
                            setActiveTab('plans');
                          }}
                          className="py-2.5 px-5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95"
                        >
                          <span>View Insurance Plans</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <Link
                          to={`/insurance/claim?providerId=${prov.id}`}
                          className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                        >
                          File Claim
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INSURANCE PLANS COMPARISON */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h2 className="font-headline font-black text-2xl text-slate-900 tracking-tight">
                    Available Insurance Policies & Coverage
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Compare sum insured, waiting periods, eligibility, and benefits.
                  </p>
                </div>
              </div>

              {plans.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-xs border border-slate-200">
                  No insurance plans found for selected filters.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {plans.map((plan) => (
                    <div key={plan.id} className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                            {plan.plan_type}
                          </span>
                          {plan.provider && (
                            <span className="text-xs text-slate-400 font-semibold">{plan.provider.provider_name}</span>
                          )}
                        </div>

                        <h3 className="font-headline font-black text-slate-900 text-xl">{plan.plan_name}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed font-normal">{plan.description}</p>
                      </div>

                      {/* Coverage details */}
                      <div className="bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-200/60 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Sum Insured Coverage:</span>
                          <span className="font-black text-blue-700 text-lg">₹{Number(plan.coverage_amount).toLocaleString()}</span>
                        </div>
                        {plan.eligibility && (
                          <div className="flex items-start gap-2 text-slate-600 text-[11px]">
                            <span className="font-bold text-slate-700 shrink-0">Eligibility:</span>
                            <span>{plan.eligibility}</span>
                          </div>
                        )}
                        {plan.waiting_period && (
                          <div className="flex items-start gap-2 text-slate-600 text-[11px]">
                            <span className="font-bold text-slate-700 shrink-0">Waiting Period:</span>
                            <span>{plan.waiting_period}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <Link
                          to={`/insurance/claim?planId=${plan.id}&providerId=${plan.provider_id}`}
                          className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md text-center flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <span>Apply / Claim Policy</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CASHLESS NETWORK HOSPITALS */}
          {activeTab === 'cashless' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h2 className="font-headline font-black text-2xl text-slate-900 tracking-tight">
                    Empaneled Cashless Hospital Network
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Hospitals supporting direct cashless pre-authorization with partner insurers.
                  </p>
                </div>
              </div>

              {cashlessNetwork.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-xs border border-slate-200">
                  No cashless hospital mappings found.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {cashlessNetwork.map((item) => (
                    <div key={item.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
                      <div className="flex gap-4 items-start">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-headline font-bold text-slate-900 text-lg">{item.hospital?.hospital_name}</h3>
                          <p className="text-xs text-slate-500 font-medium">{item.hospital?.address}, {item.hospital?.city}</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Insurance Provider:</span>
                          <span className="font-bold text-slate-900">{item.provider?.provider_name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Cashless Facility:</span>
                          <span className="font-bold text-emerald-600">Available ✅</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Pre-Authorization:</span>
                          <span className="font-bold text-slate-800">{item.pre_authorization_required ? 'Required (Fast-track)' : 'Not Required'}</span>
                        </div>
                      </div>

                      <Link
                        to={`/hospitals/${item.hospital?.id}`}
                        className="py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all text-center active:scale-95"
                      >
                        View Hospital Details
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: FAQS & CLAIMS GUIDE */}
          {activeTab === 'faqs' && (
            <div className="space-y-8 max-w-4xl mx-auto">
              <div className="text-center space-y-2">
                <h2 className="font-headline font-black text-3xl text-slate-900">Insurance FAQs & Guide</h2>
                <p className="text-xs text-slate-500">Everything you need to know about cashless hospitalization, pre-authorization, and reimbursement.</p>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full p-5 text-left font-headline font-bold text-slate-900 text-sm md:text-base flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                      </button>

                      {isOpen && (
                        <div className="p-5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </main>
      </div>

      <Footer />
    </div>
  );
};

export default InsuranceDirectory;
