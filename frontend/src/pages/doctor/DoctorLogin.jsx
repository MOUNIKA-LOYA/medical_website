import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { doctorAuthService } from '@/lib/doctorAuthService';
import { 
  MdEmail, 
  MdLock, 
  MdVisibility, 
  MdVisibilityOff, 
  MdArrowBack, 
  MdInfoOutline,
  MdCheckCircleOutline
} from 'react-icons/md';

const DoctorLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorPrompt, setErrorPrompt] = useState('');
  const [successPrompt, setSuccessPrompt] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorPrompt('');
    setSuccessPrompt('');

    try {
      const authResult = await doctorAuthService.verifyDoctorLogin(email, password);
      
      if (authResult?.success) {
        setSuccessPrompt(`Welcome back, ${authResult.doctorName}! Directing to dashboard...`);
        
        // Save doctor session
        sessionStorage.setItem('doctor_id', authResult.doctorId);
        sessionStorage.setItem('doctor_name', authResult.doctorName);
        sessionStorage.setItem('doctor_email', authResult.email);
        localStorage.setItem('doctor_session_auth', JSON.stringify(authResult));

        setTimeout(() => {
          navigate(`/doctor-dashboard?doctor_id=${authResult.doctorId}`);
        }, 600);
      }
    } catch (err) {
      setErrorPrompt(err.message || 'Login failed. Please check your credentials.');
      console.error('Doctor Login Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorPrompt('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header Navigation */}
        <div className="mb-6 flex justify-between items-center px-2">
          <Link
            to="/"
            className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
          >
            <MdArrowBack size={16} /> Back to Website
          </Link>
          <Link
            to="/admin/login"
            className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
          >
            Admin Sign-in →
          </Link>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-xl shadow-blue-200">
              <span className="material-symbols-outlined text-3xl">medical_services</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1">
              Doctor Portal
            </h1>
            <p className="text-slate-500 text-xs font-medium">
              Access consultations, appointments & patient medical records
            </p>
          </div>

          {/* Admin Credentials Info Banner */}
          <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-3.5 mb-6 flex items-start gap-2.5 text-xs text-blue-900">
            <MdInfoOutline className="text-blue-600 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-semibold leading-relaxed">
                Doctor accounts and login credentials are set and provided by the <strong>Hospital Administrator</strong>.
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {errorPrompt && (
              <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{errorPrompt}</span>
              </div>
            )}

            {successPrompt && (
              <div className="p-3.5 bg-green-50 border border-green-100 rounded-xl text-green-700 text-xs font-bold flex items-center gap-2">
                <MdCheckCircleOutline size={18} />
                <span>{successPrompt}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">
                Doctor Email Address
              </label>
              <div className="relative group">
                <MdEmail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@hospital.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">
                Secret Login Password
              </label>
              <div className="relative group">
                <MdLock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-4 font-bold text-sm transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <span>Sign In as Doctor</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
              Quick Demo Accounts
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                type="button"
                onClick={() => handleUseDemo('doctor1@hospital.com', 'doctor123')}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg text-[11px] font-semibold transition-colors"
              >
                doctor1@hospital.com
              </button>
              <button
                type="button"
                onClick={() => handleUseDemo('doctor2@hospital.com', 'doctor123')}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg text-[11px] font-semibold transition-colors"
              >
                doctor2@hospital.com
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-slate-400 text-xs font-medium">
          Professional Medical Portal • Prana Health Network
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;
