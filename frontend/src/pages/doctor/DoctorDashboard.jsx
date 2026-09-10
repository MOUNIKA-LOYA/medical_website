import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { notificationService } from '@/lib/notificationService';
import { 
  MdSearch, 
  MdEvent, 
  MdHistory,
  MdCheckCircle,
  MdHourglassEmpty,
  MdClose,
  MdCheck,
  MdPhone,
  MdLocalHospital,
  MdLocationOn,
  MdAccessTime,
  MdCalendarToday
} from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';

const SENDER_NUMBER = '7893124722';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirmingId, setConfirmingId] = useState(null);
  const [notificationModal, setNotificationModal] = useState(null);
  const [searchParams] = useSearchParams();
  const doctorId = searchParams.get('doctor_id') || sessionStorage.getItem('doctor_id');
  const navigate = useNavigate();

  const fetchDoctorProfile = useCallback(async () => {
    if (!doctorId) return;
    try {
      const { data, error } = await supabase.from('doctors').select('*').eq('id', doctorId).single();
      if (!error && data) {
        setDoctorProfile(data);
      } else {
        // Fallback doctor info
        setDoctorProfile({
          id: doctorId,
          name: 'Dr. Specialist',
          title: 'Senior Consultant Physician',
          specialty: 'Clinical Medicine',
          department: 'General Medicine',
          schedule_details: {
            hospital_name: 'Prana Main Medical Center',
            location_address: 'Road No. 72, Jubilee Hills, Hyderabad'
          }
        });
      }
    } catch (e) {
      console.warn('Could not fetch doctor profile:', e);
    }
  }, [doctorId]);

  const fetchAppointments = useCallback(async () => {
    if (!doctorId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('appointment_date', { ascending: false });

      if (error || !data || data.length === 0) {
        // Fallback to localStorage appointments
        const localApts = JSON.parse(localStorage.getItem('prana_local_appointments') || '[]');
        const matching = localApts.filter(a => a.doctor_id === doctorId || (a.doctor_id && a.doctor_id.includes(doctorId)));
        setAppointments(data && data.length > 0 ? data : matching);
      } else {
        setAppointments(data || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      const localApts = JSON.parse(localStorage.getItem('prana_local_appointments') || '[]');
      setAppointments(localApts);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchDoctorProfile();
    fetchAppointments();
  }, [fetchDoctorProfile, fetchAppointments]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      if (!search.trim()) return true;
      const query = search.toLowerCase();
      return (
        apt.patient_full_name?.toLowerCase().includes(query) ||
        apt.patient_phone?.toLowerCase().includes(query) ||
        apt.appointment_date?.toLowerCase().includes(query)
      );
    });
  }, [appointments, search]);

  const handleConfirmAppointment = async (apt) => {
    setConfirmingId(apt.id);
    try {
      const docName = doctorProfile?.name || apt.doctor_name || 'Medical Specialist';
      const docTitle = doctorProfile?.title || 'Senior Consultant';
      const docSpec = doctorProfile?.specialty || apt.department || 'Specialist';
      const hospName = doctorProfile?.schedule_details?.hospital_name || 'Prana Main Medical Center';
      const hospLoc = doctorProfile?.schedule_details?.location_address || 'Road No. 72, Jubilee Hills, Hyderabad';

      // 1. Dispatch automated SMS and WhatsApp notification from 7893124722
      const notifRes = await notificationService.notifyDoctorConfirmation({
        appointmentId: apt.id,
        patientName: apt.patient_full_name,
        patientPhone: apt.patient_phone,
        doctorId: doctorId,
        doctorName: docName,
        doctorTitle: docTitle,
        specialty: docSpec,
        hospitalName: hospName,
        hospitalLocation: hospLoc,
        appointmentDate: apt.appointment_date,
        appointmentTime: apt.appointment_time,
        consultationFee: apt.consultation_fee || 135.0,
        notes: 'Please arrive 15 minutes before your scheduled consultation.'
      });

      // 2. Update status in Supabase & localStorage
      try {
        await supabase.from('appointments').update({ status: 'confirmed' }).eq('id', apt.id);
      } catch (err) {
        console.warn('Supabase status update fallback:', err);
      }

      const localApts = JSON.parse(localStorage.getItem('prana_local_appointments') || '[]');
      const updatedLocal = localApts.map(a => a.id === apt.id ? { ...a, status: 'confirmed' } : a);
      localStorage.setItem('prana_local_appointments', JSON.stringify(updatedLocal));

      // Update local UI state
      setAppointments(prev => prev.map(a => a.id === apt.id ? { ...a, status: 'confirmed' } : a));

      // Show rich notification confirmation dialog
      setNotificationModal({
        appointmentId: apt.id,
        patientName: apt.patient_full_name,
        patientPhone: apt.patient_phone,
        doctorName: docName,
        doctorTitle: docTitle,
        specialty: docSpec,
        hospitalName: hospName,
        hospitalLocation: hospLoc,
        appointmentDate: apt.appointment_date,
        appointmentTime: apt.appointment_time,
        senderNumber: SENDER_NUMBER,
        whatsappDirectUrl: notifRes.whatsapp_direct_url,
        smsBody: notifRes.sms_body,
        whatsappBody: notifRes.whatsapp_body
      });

    } catch (e) {
      alert('Error confirming appointment: ' + e.message);
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome & Stats Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between p-8 bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
         <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
         <div className="relative z-10">
            <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              Doctor Portal & Notification Center
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-3">Patient Management</h1>
            <p className="text-slate-400 font-medium max-w-md">
              Confirm appointments to instantly trigger automated WhatsApp & SMS alerts to patient phone numbers from helpline <span className="text-blue-300 font-bold">{SENDER_NUMBER}</span>.
            </p>
         </div>
         <div className="mt-8 md:mt-0 flex gap-4 relative z-10">
            <div className="p-3 px-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Visits</div>
               <div className="text-2xl font-black mt-1">{appointments.length}</div>
            </div>
            <div className="p-3 px-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confirmed</div>
               <div className="text-2xl font-black text-emerald-400 mt-1">
                  {appointments.filter(a => a.status === 'confirmed').length}
               </div>
            </div>
            <div className="p-3 px-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending</div>
               <div className="text-2xl font-black text-amber-400 mt-1">
                  {appointments.filter(a => a.status !== 'confirmed').length}
               </div>
            </div>
         </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96 group">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search patients by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
            />
          </div>
          <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
             <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
               <FaWhatsapp className="text-emerald-500" /> WhatsApp + SMS Active
             </span>
             <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full font-mono">
               Sender: {SENDER_NUMBER}
             </span>
          </div>
        </div>

        {/* List View */}
        <div className="overflow-x-auto p-4">
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] w-[30%]">Patient Identity</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Visit Schedule</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Symptoms</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto opacity-50"></div>
                  </td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-slate-400 font-medium italic">
                    {search ? 'No patients found matching your search.' : 'You have no appointments scheduled yet.'}
                  </td>
                </tr>
              ) : (
                filteredAppointments.map(apt => {
                  const isConfirmed = apt.status === 'confirmed';
                  return (
                    <tr key={apt.id} className="hover:bg-blue-50/30 transition-all group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-base shadow-sm ${
                            isConfirmed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                             {apt.patient_full_name ? apt.patient_full_name.charAt(0).toUpperCase() : 'P'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                              {apt.patient_full_name}
                            </div>
                            <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-slate-600 font-bold">{apt.patient_phone}</span>
                              {apt.patient_age && <span>• {apt.patient_age} Yrs</span>}
                              {apt.patient_gender && <span>• {apt.patient_gender}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-sm">
                            <MdEvent className="text-blue-500" size={16} />
                            <span className="text-xs font-bold text-slate-700">{apt.appointment_date} <span className="text-slate-300">|</span> {apt.appointment_time}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        {isConfirmed ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                            <MdCheckCircle className="text-emerald-500" size={14} /> Confirmed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold animate-pulse">
                            <MdHourglassEmpty className="text-amber-500" size={14} /> Pending Doctor Review
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-medium text-slate-600 line-clamp-1 max-w-[180px] bg-slate-50 p-2 rounded-lg group-hover:bg-white transition-colors italic border border-slate-100">
                          "{apt.patient_symptoms || 'General Medical Consultation'}"
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2 justify-end">
                          {!isConfirmed && (
                            <button
                              onClick={() => handleConfirmAppointment(apt)}
                              disabled={confirmingId === apt.id}
                              className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-3.5 py-2 rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                              title="Confirm appointment and automatically send WhatsApp + SMS to patient"
                            >
                              {confirmingId === apt.id ? (
                                <span className="inline-flex items-center gap-1">
                                  <span className="animate-spin rounded-full h-3 w-3 border-b border-white"></span>
                                  Notifying...
                                </span>
                              ) : (
                                <>
                                  <MdCheck size={16} />
                                  Confirm & Notify
                                </>
                              )}
                            </button>
                          )}
                          <button 
                             onClick={() => navigate(`patient/${apt.id}${doctorId ? `?doctor_id=${doctorId}` : ''}`)}
                             className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-800 px-3.5 py-2 rounded-xl font-bold text-xs hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                          >
                             <MdHistory size={15} />
                             Records
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation & Notification Sent Modal */}
      {notificationModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] max-w-2xl w-full p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setNotificationModal(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <MdClose size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <MdCheckCircle size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Appointment Confirmed & Dispatched</h3>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Automated SMS & WhatsApp Sent to Patient
                </p>
              </div>
            </div>

            {/* Overview Card */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="font-bold text-slate-400">Patient:</span>
                  <span className="font-extrabold text-slate-900 uppercase">{notificationModal.patientName}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <MdPhone className="text-blue-500" />
                  <span className="font-bold text-slate-400">Recipient Phone:</span>
                  <span className="font-mono font-bold text-slate-900">{notificationModal.patientPhone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="font-bold text-slate-400">Doctor:</span>
                  <span className="font-bold text-slate-900">{notificationModal.doctorName} ({notificationModal.specialty})</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <MdLocalHospital className="text-blue-500" />
                  <span className="font-bold text-slate-400">Hospital:</span>
                  <span className="font-bold text-slate-900">{notificationModal.hospitalName}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 col-span-full">
                  <MdLocationOn className="text-red-500" />
                  <span className="font-bold text-slate-400">Location:</span>
                  <span className="font-semibold text-slate-800">{notificationModal.hospitalLocation}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <MdCalendarToday className="text-blue-500" />
                  <span className="font-bold text-slate-400">Slot:</span>
                  <span className="font-bold text-slate-900">{notificationModal.appointmentDate} at {notificationModal.appointmentTime}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="font-bold text-slate-400">Sender Helpline:</span>
                  <span className="font-mono font-bold text-emerald-600">{notificationModal.senderNumber}</span>
                </div>
              </div>
            </div>

            {/* Notification Messages Preview */}
            <div className="space-y-4 mb-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <FaWhatsapp className="text-emerald-500" /> Dispatched WhatsApp Notification
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    Auto-Dispatched
                  </span>
                </div>
                <pre className="p-4 bg-emerald-950 text-emerald-100 rounded-2xl text-xs font-mono whitespace-pre-wrap leading-relaxed border border-emerald-800/50 shadow-inner">
                  {notificationModal.whatsappBody}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    📱 Dispatched SMS Notification
                  </span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    Auto-Dispatched
                  </span>
                </div>
                <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl text-xs font-mono leading-relaxed border border-slate-800">
                  {notificationModal.smsBody}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
              {notificationModal.whatsappDirectUrl && (
                <a
                  href={notificationModal.whatsappDirectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                >
                  <FaWhatsapp size={18} />
                  Open in WhatsApp Web / App
                </a>
              )}
              <button
                onClick={() => setNotificationModal(null)}
                className="w-full sm:w-auto bg-slate-100 text-slate-800 px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
