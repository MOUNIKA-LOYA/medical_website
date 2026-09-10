import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { supabase } from '@/lib/supabaseClient';
import { departmentService } from '@/lib/departmentService';
import { notificationService } from '@/lib/notificationService';
import { 
  CheckCircle2, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Stethoscope, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  MessageSquare, 
  Smartphone, 
  Building2, 
  AlertCircle,
  FileText,
  Check,
  ChevronDown
} from 'lucide-react';

const MORNING_SLOTS = [
  "09:00 AM", "09:15 AM", "09:30 AM", "09:45 AM",
  "10:00 AM", "10:15 AM", "10:30 AM", "10:45 AM",
  "11:00 AM", "11:15 AM", "11:30 AM", "11:45 AM"
];

const AFTERNOON_SLOTS = [
  "02:00 PM", "02:15 PM", "02:30 PM", "02:45 PM",
  "03:00 PM", "03:15 PM", "03:30 PM", "03:45 PM",
  "04:00 PM", "04:15 PM", "04:30 PM", "04:45 PM",
  "05:00 PM", "05:15 PM", "05:30 PM", "05:45 PM"
];

const AppointmentBooking = () => {
  const { doctorId: initialDoctorId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialDept = searchParams.get('dept');

  const [currentStep, setCurrentStep] = useState(1);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);
  const [notificationInfo, setNotificationInfo] = useState(null);
  const [validationError, setValidationError] = useState('');

  const [formData, setFormData] = useState({
    department: initialDept || '',
    doctorId: initialDoctorId || '',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '',
    patientName: '',
    age: '',
    gender: 'Male',
    phone: '',
    symptoms: '',
    smsConfirm: true,
    whatsappConfirm: true
  });
  const [bookedSlots, setBookedSlots] = useState([]);

  const fetchDoctorById = useCallback(async (id) => {
    try {
      const { data, error } = await supabase.from('doctors').select('*').eq('id', id).single();
      if (!error && data) {
        setSelectedDoctor(data);
        setFormData(prev => ({
          ...prev,
          department: data.department || prev.department,
          doctorId: data.id
        }));
        setCurrentStep(3);
        return;
      }
      
      // Fallback dummy doctor profile if ID is mock or not found
      const dummyDoctor = {
        id: id,
        name: 'Dr. Alex Morgan (Specialist)',
        title: 'MD, Senior Consultant & Specialist',
        specialty: initialDept || 'General Medicine',
        department: initialDept || 'General Medicine',
        experience_years: 14,
        rating: 4.9,
        review_count: 92,
        available_today: true,
        consultation_fee: 150.0,
        photo_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&h=400&auto=format&fit=crop',
        about: 'Senior medical specialist dedicated to evidence-based treatment and comprehensive patient care.'
      };
      setSelectedDoctor(dummyDoctor);
      setFormData(prev => ({
        ...prev,
        department: dummyDoctor.department,
        doctorId: dummyDoctor.id
      }));
      setCurrentStep(3);
    } catch (error) {
      console.error('Error fetching doctor:', error);
    }
  }, [initialDept]);

  const fetchDoctorsByDepartment = useCallback(async (dept) => {
    if (!dept) return;
    try {
      const { data, error } = await supabase.from('doctors').select('*');
      let filtered = [];
      if (!error && data) {
        filtered = data.filter(doc => 
          doc.department?.trim().toLowerCase() === dept?.trim().toLowerCase()
        );
      }
      
      // Ensure every department has at least one dummy doctor for client demo
      if (filtered.length === 0) {
        filtered = [
          {
            id: `doc-demo-${dept.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            name: `Dr. Alex Morgan`,
            title: `MD, Senior Consultant - ${dept}`,
            specialty: dept,
            department: dept,
            experience_years: 12,
            rating: 4.9,
            review_count: 88,
            available_today: true,
            consultation_fee: 150.0,
            photo_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&h=400&auto=format&fit=crop',
            about: `Leading specialist in ${dept} with over 12 years of clinical excellence and patient care.`
          }
        ];
      }
      
      setDoctors(filtered);
      
      if (selectedDoctor && selectedDoctor.department?.trim().toLowerCase() !== dept?.trim().toLowerCase()) {
        setSelectedDoctor(null);
        setFormData(prev => ({ ...prev, doctorId: '' }));
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([
        {
          id: `doc-demo-${dept.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          name: `Dr. Alex Morgan`,
          title: `MD, Senior Consultant - ${dept}`,
          specialty: dept,
          department: dept,
          experience_years: 12,
          rating: 4.9,
          review_count: 88,
          available_today: true,
          consultation_fee: 150.0,
          photo_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&h=400&auto=format&fit=crop',
          about: `Leading specialist in ${dept} with over 12 years of clinical excellence and patient care.`
        }
      ]);
    }
  }, [selectedDoctor]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const { data, error } = await supabase.from('departments').select('name').order('name');
        if (error || !data || data.length === 0) {
          const depts = await departmentService.getDepartments();
          setDepartments(depts.map(d => d.name) || []);
        } else {
          setDepartments(data.map(d => d.name) || []);
        }
      } catch (error) {
        console.warn('Supabase departments table not yet seeded, using local department service:', error);
        try {
          const depts = await departmentService.getDepartments();
          setDepartments(depts.map(d => d.name) || []);
        } catch (e) {
          console.error('Fallback department fetch failed:', e);
        }
      }
    };
    fetchDepartments();

    if (initialDoctorId) {
      fetchDoctorById(initialDoctorId);
    } else if (initialDept) {
      setCurrentStep(2);
    }
  }, [initialDoctorId, initialDept, fetchDoctorById]);

  useEffect(() => {
    if (formData.department) {
      fetchDoctorsByDepartment(formData.department);
    }
  }, [formData.department, fetchDoctorsByDepartment]);

  const fetchBookedSlots = useCallback(async () => {
    if (!formData.doctorId || !formData.appointmentDate) return;
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('doctor_id', formData.doctorId)
        .eq('appointment_date', formData.appointmentDate)
        .neq('status', 'cancelled');

      if (!error && data) {
        setBookedSlots(data.map(apt => apt.appointment_time) || []);
        return;
      }
    } catch (error) {
      // Table may not exist yet in Supabase - check localStorage
    }

    try {
      const localApts = JSON.parse(localStorage.getItem('prana_local_appointments') || '[]');
      const booked = localApts
        .filter(apt => apt.doctor_id === formData.doctorId && apt.appointment_date === formData.appointmentDate && apt.status !== 'cancelled')
        .map(apt => apt.appointment_time);
      setBookedSlots(booked);
    } catch (e) {
      setBookedSlots([]);
    }
  }, [formData.doctorId, formData.appointmentDate]);

  useEffect(() => {
    fetchBookedSlots();
  }, [fetchBookedSlots]);

  const handleDoctorChange = (id) => {
    const doc = doctors.find(d => d.id === id);
    setSelectedDoctor(doc);
    setFormData({ ...formData, doctorId: id });
    setValidationError('');
  };

  const handleDepartmentSelect = (deptName) => {
    setFormData({ ...formData, department: deptName, doctorId: '' });
    setSelectedDoctor(null);
    setValidationError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setValidationError('');
  };

  // Step Validation checks
  const canProceedToNextStep = () => {
    if (currentStep === 1) {
      if (!formData.department) {
        setValidationError('Please select a medical department to proceed.');
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.doctorId || !selectedDoctor) {
        setValidationError('Please select a specialist doctor to proceed.');
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.appointmentDate || !formData.appointmentTime) {
        setValidationError('Please select an appointment date and time slot.');
        return false;
      }
    } else if (currentStep === 4) {
      if (!formData.patientName || !formData.phone || !formData.age) {
        setValidationError('Please fill in all required patient details (Name, Age, Phone).');
        return false;
      }
    }
    setValidationError('');
    return true;
  };

  const handleNextStep = () => {
    if (canProceedToNextStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handlePrevStep = () => {
    setValidationError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Final Validation
    if (!formData.department || !formData.doctorId || !formData.appointmentTime || !formData.patientName || !formData.phone || !formData.age) {
      setValidationError('Missing Information: Please complete all required fields.');
      return;
    }

    setLoading(true);
    try {
      const appointmentData = {
        doctor_id: formData.doctorId,
        doctor_name: selectedDoctor.name,
        department: formData.department,
        appointment_date: formData.appointmentDate,
        appointment_time: formData.appointmentTime,
        patient_full_name: formData.patientName,
        patient_age: parseInt(formData.age) || 0,
        patient_gender: formData.gender,
        patient_phone: formData.phone,
        patient_symptoms: formData.symptoms,
        consultation_fee: (parseFloat(selectedDoctor?.consultation_fee || 150.0) * 0.9),
        status: 'confirmed'
      };

      let confirmedApt = {
        id: `apt-${Date.now()}`,
        ...appointmentData,
        created_at: new Date().toISOString()
      };

      try {
        const { data, error } = await supabase.from('appointments').insert([appointmentData]).select();
        if (!error && data && data.length > 0) {
          confirmedApt = data[0];
        }
      } catch (insertErr) {
        console.warn('Supabase appointments table not yet seeded, saving appointment locally:', insertErr);
      }

      try {
        const existing = JSON.parse(localStorage.getItem('prana_local_appointments') || '[]');
        existing.unshift(confirmedApt);
        localStorage.setItem('prana_local_appointments', JSON.stringify(existing));
      } catch (storageErr) {
        console.warn('Could not save appointment to localStorage:', storageErr);
      }

      setConfirmedAppointment(confirmedApt);

      // Automated Notification via notificationService (Sender: 7893124722)
      let notifResponse = null;
      try {
        const notifPayload = {
          patientName: formData.patientName,
          patientPhone: formData.phone,
          doctorId: formData.doctorId,
          doctorName: selectedDoctor?.name || 'Medical Specialist',
          doctorTitle: selectedDoctor?.title || 'Senior Consultant',
          specialty: selectedDoctor?.specialty || formData.department,
          department: formData.department,
          hospitalName: selectedDoctor?.schedule_details?.hospital_name || 'Prana Main Medical Center',
          hospitalLocation: selectedDoctor?.schedule_details?.location_address || 'Road No. 72, Jubilee Hills, Hyderabad',
          appointmentDate: formData.appointmentDate,
          appointmentTime: formData.appointmentTime,
          consultationFee: (parseFloat(selectedDoctor?.consultation_fee || 150.0) * 0.9),
          appointmentId: confirmedApt.id,
          sendSms: formData.smsConfirm,
          sendWhatsapp: formData.whatsappConfirm
        };

        notifResponse = await notificationService.notifyBookingInitiated(notifPayload);
        setNotificationInfo(notifResponse);
      } catch (notifErr) {
        console.error('Failed to trigger notification:', notifErr);
      }

      setBookingSuccess(true);
    } catch (error) {
      console.error('Booking Error:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Steps Configuration for Progress Bar
  const stepsList = [
    { number: 1, title: 'Department', icon: Building2 },
    { number: 2, title: 'Specialist', icon: Stethoscope },
    { number: 3, title: 'Schedule', icon: Calendar },
    { number: 4, title: 'Patient Info', icon: User },
    { number: 5, title: 'Review & Confirm', icon: ShieldCheck },
  ];

  // Render Confirmation Success View
  if (bookingSuccess && confirmedAppointment) {
    const hospName = selectedDoctor?.schedule_details?.hospital_name || 'Prana Main Medical Center';
    const hospLoc = selectedDoctor?.schedule_details?.location_address || 'Road No. 72, Jubilee Hills, Hyderabad';

    return (
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <main className="pt-32 pb-24 px-6 max-w-3xl mx-auto">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-14 text-center border border-slate-100 animate-fade-in-up">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
              <CheckCircle2 className="w-10 h-10 animate-bounce-subtle" />
            </div>

            <span className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold tracking-wider mb-3 border border-emerald-100 uppercase">
              BOOKING RESERVED & INITIATED
            </span>

            <h1 className="font-headline text-3xl md:text-4xl font-black text-slate-900 mb-2">
              Appointment Successfully Reserved!
            </h1>

            <p className="text-slate-500 text-sm mb-6">
              Your reference code is <span className="font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">#{confirmedAppointment.id.slice(0, 8)}</span>
            </p>

            {/* Notification Live Status Alert */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-4 md:p-5 mb-6 text-left shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span>Automated WhatsApp & SMS Dispatched</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-md">LIVE</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    Details including doctor profile, hospital name, location, and time slot have been sent to{' '}
                    <strong className="text-slate-900 font-bold">{formData.phone}</strong> from helpline{' '}
                    <strong className="text-blue-700 font-bold">7893124722</strong>.
                  </p>
                  {notificationInfo?.whatsapp_direct_url && (
                    <div className="mt-3">
                      <a
                        href={notificationInfo.whatsapp_direct_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95"
                      >
                        <MessageSquare className="w-4 h-4" /> Open WhatsApp Confirmation
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Appointment Details Summary Card */}
            <div className="bg-slate-50 rounded-2xl p-6 md:p-8 mb-8 text-left space-y-4 border border-slate-100">
              <div className="flex justify-between items-center text-sm py-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Doctor Specialist</span>
                <span className="font-bold text-slate-900 text-base">{selectedDoctor?.name} ({selectedDoctor?.title || 'Consultant'})</span>
              </div>

              <div className="flex justify-between items-center text-sm py-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Hospital & Location</span>
                <span className="font-bold text-slate-900 text-right text-xs md:text-sm">
                  {hospName} <br />
                  <span className="text-[11px] text-slate-500 font-normal">{hospLoc}</span>
                </span>
              </div>

              <div className="flex justify-between items-center text-sm py-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Department</span>
                <span className="font-bold text-blue-700">{formData.department}</span>
              </div>

              <div className="flex justify-between items-center text-sm py-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Date & Time</span>
                <span className="font-bold text-slate-900">{formData.appointmentTime} on {formData.appointmentDate}</span>
              </div>

              <div className="flex justify-between items-center text-sm py-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Patient Name & Phone</span>
                <span className="font-bold text-slate-900">{formData.patientName} ({formData.phone})</span>
              </div>

              <div className="flex justify-between items-center text-sm py-2">
                <span className="text-slate-500 font-medium">Sender Number</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> 7893124722 (Auto-dispatched)
                </span>
              </div>
            </div>

            {/* Success Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => {
                  setBookingSuccess(false);
                  setConfirmedAppointment(null);
                  setNotificationInfo(null);
                  setCurrentStep(1);
                  setFormData({
                    department: '',
                    doctorId: '',
                    appointmentDate: new Date().toISOString().split('T')[0],
                    appointmentTime: '',
                    patientName: '',
                    age: '',
                    gender: 'Male',
                    phone: '',
                    symptoms: '',
                    smsConfirm: true,
                    whatsappConfirm: true
                  });
                }}
                className="py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all"
              >
                Book Another
              </button>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-all shadow-md"
              >
                Return to Home
              </button>

              <button
                type="button"
                onClick={() => navigate('/patient-dashboard')}
                className="py-3.5 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs transition-all shadow-md active:scale-95"
              >
                View Dashboard
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <main className="pt-28 md:pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Header Title */}
        <header className="mb-10 text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold tracking-wider mb-3 border border-blue-100 uppercase">
            <ShieldCheck className="w-4 h-4" />
            EASY APPOINTMENT SCHEDULING
          </span>

          <h1 className="font-headline text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
            Schedule Your Clinical Visit
          </h1>

          <p className="text-slate-500 text-sm md:text-base leading-relaxed">
            Follow the guided steps below to select your medical department, physician, preferred time slot, and patient details.
          </p>
        </header>

        {/* Multi-Step Wizard Progress Bar */}
        <div className="mb-12 bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 max-w-4xl mx-auto">
          <div className="grid grid-cols-5 gap-2 relative">
            {stepsList.map((step, idx) => {
              const StepIcon = step.icon;
              const isCompleted = currentStep > step.number;
              const isCurrent = currentStep === step.number;

              return (
                <button
                  key={step.number}
                  type="button"
                  onClick={() => {
                    if (isCompleted) setCurrentStep(step.number);
                  }}
                  disabled={!isCompleted && !isCurrent}
                  className={`flex flex-col items-center text-center group transition-all ${
                    isCompleted || isCurrent ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                    isCompleted
                      ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                      : isCurrent
                      ? 'bg-slate-900 text-white shadow-md ring-4 ring-slate-100'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-4 h-4" />}
                  </div>

                  <span className={`text-[11px] font-bold tracking-tight hidden sm:block ${
                    isCurrent ? 'text-slate-900' : isCompleted ? 'text-blue-700' : 'text-slate-400'
                  }`}>
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Validation Error Alert Banner */}
        {validationError && (
          <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold flex items-center gap-3 animate-fade-in-up">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Main Grid: Form Steps + Desktop Summary Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
          
          {/* Left Main Form Container */}
          <div className="lg:col-span-8 bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
            
            {/* STEP 1: Select Department */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h2 className="font-headline text-2xl font-black text-slate-900 mb-1">
                    Step 1: Choose Medical Department
                  </h2>
                  <p className="text-slate-500 text-xs">
                    Select the specialized department corresponding to your healthcare need.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {departments.map((dept) => {
                    const isSelected = formData.department?.toLowerCase() === dept.toLowerCase();
                    return (
                      <div
                        key={dept}
                        onClick={() => handleDepartmentSelect(dept)}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group ${
                          isSelected
                            ? 'bg-blue-50/50 border-blue-600 shadow-md ring-2 ring-blue-600/20'
                            : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-blue-700 text-white' : 'bg-white text-slate-700 shadow-sm'
                          }`}>
                            <Building2 className="w-5 h-5" />
                          </div>
                          <span className={`font-bold text-sm ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                            {dept}
                          </span>
                        </div>

                        {isSelected && <Check className="w-5 h-5 text-blue-600" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: Select Doctor */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h2 className="font-headline text-2xl font-black text-slate-900 mb-1">
                    Step 2: Choose Specialist Doctor
                  </h2>
                  <p className="text-slate-500 text-xs">
                    Select your preferred clinician available in <span className="font-bold text-blue-700">{formData.department}</span>.
                  </p>
                </div>

                <div className="space-y-4">
                  {doctors.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-sm">
                      No doctors available in this department. Please select another department.
                    </div>
                  ) : (
                    doctors.map((doc) => {
                      const isSelected = formData.doctorId === doc.id;
                      const fee = Number(doc.consultation_fee) || 500;
                      return (
                        <div
                          key={doc.id}
                          onClick={() => handleDoctorChange(doc.id)}
                          className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            isSelected
                              ? 'bg-blue-50/50 border-blue-600 shadow-md ring-2 ring-blue-600/20'
                              : 'bg-white border-slate-200/80 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={doc.photo_url || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&h=200&auto=format&fit=crop"}
                              alt={doc.name}
                              className="w-16 h-16 rounded-2xl object-cover bg-slate-100 border shrink-0"
                            />
                            <div>
                              <h3 className="font-headline font-bold text-slate-900 text-base mb-0.5">{doc.name}</h3>
                              <p className="text-xs font-semibold text-blue-700 mb-1">{doc.title || doc.specialty}</p>
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                                <span>{doc.experience_years || 5} Yrs Exp</span>
                                <span>•</span>
                                <span>Rating: {doc.rating || '5.0'} ★</span>
                                <span>•</span>
                                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                  Fee: ₹{fee}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                            <div className="text-left sm:text-right">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Consultation Fee</span>
                              <span className="text-base font-black text-blue-700">₹{fee}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                doc.available_today ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {doc.available_today ? 'Available Today' : 'Next Available'}
                              </span>
                              {isSelected && <Check className="w-5 h-5 text-blue-700 shrink-0" />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: Select Date & Time */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h2 className="font-headline text-2xl font-black text-slate-900 mb-1">
                    Step 3: Select Date & Time Slot
                  </h2>
                  <p className="text-slate-500 text-xs">
                    Choose an available appointment date and preferred time slot for your consultation.
                  </p>
                </div>

                {/* Date Picker Input */}
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Select Appointment Date:
                  </label>
                  <div className="relative">
                    <input 
                      type="date"
                      name="appointmentDate"
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.appointmentDate}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Morning & Afternoon Slot Chips */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Morning Slots
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {MORNING_SLOTS.map(slot => {
                        const isBooked = bookedSlots.includes(slot);
                        const isSelected = formData.appointmentTime === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => !isBooked && setFormData({ ...formData, appointmentTime: slot })}
                            disabled={isBooked}
                            className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                              isSelected
                                ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                                : isBooked
                                ? 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-blue-500 hover:bg-blue-50/40'
                            }`}
                          >
                            <span>{slot}</span>
                            {isBooked && <div className="text-[8px] font-black uppercase text-slate-400">Booked</div>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Afternoon & Evening Slots
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {AFTERNOON_SLOTS.map(slot => {
                        const isBooked = bookedSlots.includes(slot);
                        const isSelected = formData.appointmentTime === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => !isBooked && setFormData({ ...formData, appointmentTime: slot })}
                            disabled={isBooked}
                            className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                              isSelected
                                ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                                : isBooked
                                ? 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-blue-500 hover:bg-blue-50/40'
                            }`}
                          >
                            <span>{slot}</span>
                            {isBooked && <div className="text-[8px] font-black uppercase text-slate-400">Booked</div>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Patient Details */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h2 className="font-headline text-2xl font-black text-slate-900 mb-1">
                    Step 4: Patient Personal Details
                  </h2>
                  <p className="text-slate-500 text-xs">
                    Fill in the details of the patient attending the clinical consultation.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Patient Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="patientName"
                      placeholder="e.g. Percy Boyina"
                      value={formData.patientName}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="age"
                      placeholder="e.g. 32"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Primary Symptoms / Notes (Optional)
                    </label>
                    <input
                      type="text"
                      name="symptoms"
                      placeholder="Brief description of symptoms or medical history"
                      value={formData.symptoms}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>

                {/* Notification Toggles */}
                <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 cursor-pointer hover:bg-slate-100 transition-all">
                    <input 
                      type="checkbox" 
                      checked={formData.smsConfirm}
                      onChange={(e) => setFormData({...formData, smsConfirm: e.target.checked})}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-slate-900">Send SMS Alert</div>
                      <div className="text-[10px] text-slate-500">Instant SMS confirmation</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3.5 bg-blue-50/40 rounded-xl border border-blue-100 cursor-pointer hover:bg-blue-50 transition-all">
                    <input 
                      type="checkbox" 
                      checked={formData.whatsappConfirm}
                      onChange={(e) => setFormData({...formData, whatsappConfirm: e.target.checked})}
                      className="w-4 h-4 rounded text-blue-700 focus:ring-blue-600"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-slate-900">WhatsApp Alert</div>
                      <div className="text-[10px] text-slate-500">Real-time chat notification</div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 5: Review & Confirm */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h2 className="font-headline text-2xl font-black text-slate-900 mb-1">
                    Step 5: Review Booking Summary
                  </h2>
                  <p className="text-slate-500 text-xs">
                    Review your consultation details before finalizing your appointment reservation.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-4 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="font-bold text-slate-500 uppercase">Department</span>
                    <span className="font-extrabold text-blue-700 text-sm">{formData.department}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="font-bold text-slate-500 uppercase">Doctor Specialist</span>
                    <span className="font-extrabold text-slate-900 text-sm">{selectedDoctor?.name}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="font-bold text-slate-500 uppercase">Hospital & Location</span>
                    <span className="font-extrabold text-slate-800 text-xs text-right">
                      {selectedDoctor?.hospital_name || selectedDoctor?.schedule_details?.hospital_name || 'Prana Main Medical Center'}
                      <span className="block text-[10px] text-slate-500 font-normal">
                        {selectedDoctor?.location_address || selectedDoctor?.schedule_details?.location_address || 'Medical District'}
                      </span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="font-bold text-slate-500 uppercase">Date & Time</span>
                    <span className="font-extrabold text-slate-900 text-sm">{formData.appointmentTime} on {formData.appointmentDate}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="font-bold text-slate-500 uppercase">Patient Name</span>
                    <span className="font-extrabold text-slate-900 text-sm">{formData.patientName} ({formData.age}Y, {formData.gender})</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="font-bold text-slate-500 uppercase">Consultation Fee</span>
                    <span className="font-semibold text-slate-500 text-xs">
                      ₹{(selectedDoctor?.consultation_fee ? Number(selectedDoctor.consultation_fee) : 500).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="font-bold text-emerald-600 uppercase">Client Discount (10% OFF)</span>
                    <span className="font-bold text-emerald-600 text-sm">
                      -₹{(Math.round((selectedDoctor?.consultation_fee ? Number(selectedDoctor.consultation_fee) : 500) * 0.1)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-extrabold text-slate-900 uppercase">Total Fee Payable</span>
                    <span className="font-black text-blue-700 text-lg">
                      ₹{((selectedDoctor?.consultation_fee ? Number(selectedDoctor.consultation_fee) : 500) - Math.round((selectedDoctor?.consultation_fee ? Number(selectedDoctor.consultation_fee) : 500) * 0.1)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons Row */}
            <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-100 gap-4">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-8 py-3.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-2 ml-auto"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-10 py-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-black text-sm transition-all shadow-lg shadow-blue-700/20 flex items-center gap-2 ml-auto disabled:opacity-50 active:scale-95"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Confirming...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Confirm Appointment</span>
                    </>
                  )}
                </button>
              )}
            </div>

          </div>

          {/* Right Sticky Booking Summary Sidebar */}
          <div className="lg:col-span-4 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6 sticky top-32">
            <h3 className="font-headline font-bold text-lg text-slate-900 border-b border-slate-100 pb-3">
              Booking Summary
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Department</div>
                  <div className="font-bold text-slate-800">{formData.department || 'Not selected'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Stethoscope className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Doctor Specialist</div>
                  <div className="font-bold text-slate-800">{selectedDoctor?.name || 'Not selected'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Date & Time</div>
                  <div className="font-bold text-slate-800">
                    {formData.appointmentTime ? `${formData.appointmentTime} on ${formData.appointmentDate}` : 'Not selected'}
                  </div>
                </div>
              </div>
            </div>

            {(() => {
              const currentDocFee = selectedDoctor?.consultation_fee ? Number(selectedDoctor.consultation_fee) : (selectedDoctor ? 500 : 0);
              const discount = Math.round(currentDocFee * 0.1);
              const finalFee = currentDocFee - discount;
              return (
                <div className="pt-4 border-t border-slate-100 text-xs space-y-2">
                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>Consultation Fee</span>
                    <span className="font-semibold text-slate-700">
                      {selectedDoctor ? `₹${currentDocFee.toFixed(2)}` : '—'}
                    </span>
                  </div>
                  {selectedDoctor && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Booking Discount (10% OFF)</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-slate-900 text-sm pt-2 border-t border-slate-100">
                    <span>Total Fee</span>
                    <span className="font-black text-blue-700 text-base">
                      {selectedDoctor ? `₹${finalFee.toFixed(2)}` : '—'}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AppointmentBooking;
