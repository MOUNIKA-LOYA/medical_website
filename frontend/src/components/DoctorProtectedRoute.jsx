import React, { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { doctorAuthService } from '../lib/doctorAuthService';

const DoctorProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticatedDoctor, setIsAuthenticatedDoctor] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const checkDoctorAuth = async () => {
      try {
        const urlDoctorId = searchParams.get('doctor_id');
        const sessionDoctorId = sessionStorage.getItem('doctor_id');
        const activeDoctorId = urlDoctorId || sessionDoctorId;

        if (activeDoctorId) {
          sessionStorage.setItem('doctor_id', activeDoctorId);
          setIsAuthenticatedDoctor(true);
          setLoading(false);
          return;
        }

        // Check active Supabase Auth session
        const { data } = await supabase.auth.getSession();
        const currentSession = data?.session;

        if (currentSession?.user) {
          const email = currentSession.user.email;
          
          // Check if email belongs to a doctor
          const cred = doctorAuthService.getCredentialsByEmail(email);
          if (cred) {
            sessionStorage.setItem('doctor_id', cred.doctorId);
            setIsAuthenticatedDoctor(true);
            setLoading(false);
            return;
          }

          // Check in doctors DB table
          try {
            const { data: docData } = await supabase
              .from('doctors')
              .select('id, name')
              .eq('email', email)
              .single();

            if (docData) {
              sessionStorage.setItem('doctor_id', docData.id);
              setIsAuthenticatedDoctor(true);
              setLoading(false);
              return;
            }
          } catch (e) {
            // ignore
          }

          // Check whitelist
          const mockDoctors = [
            'doctor1@gmail.com', 'doctor2@gmail.com', 'doctor3@gmail.com',
            'doctor1@hospital.com', 'doctor2@hospital.com', 'doctor3@hospital.com'
          ];

          if (mockDoctors.includes(email)) {
            sessionStorage.setItem('doctor_id', `mock-${email.split('@')[0]}`);
            setIsAuthenticatedDoctor(true);
            setLoading(false);
            return;
          }
        }

        setIsAuthenticatedDoctor(false);
      } catch (err) {
        console.error('Doctor auth check error:', err);
        setIsAuthenticatedDoctor(false);
      } finally {
        setLoading(false);
      }
    };

    checkDoctorAuth();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-600 border-t-transparent" />
          <span className="text-xs font-bold text-slate-500">Verifying Doctor Authorization...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticatedDoctor) {
    return <Navigate to="/doctor-login" replace />;
  }

  return children;
};

export default DoctorProtectedRoute;
