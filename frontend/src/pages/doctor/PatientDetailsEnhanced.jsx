import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { notificationService } from '../../lib/notificationService';
import { 
  MdArrowBack, MdHistory, MdAssignment, 
  MdUploadFile, MdSend, MdVisibility,
  MdCheckCircle, MdEdit, MdDelete, MdInfo,
  MdCalendarToday, MdNotes, MdCheck, MdClose,
  MdPhone, MdLocalHospital, MdLocationOn
} from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';

const SENDER_NUMBER = '7893124722';

const PatientDetailsEnhanced = () => {
  const { id: appointmentId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const doctorId = searchParams.get('doctor_id') || sessionStorage.getItem('doctor_id');

  const [appointment, setAppointment] = useState(null);
  const [history, setHistory] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('symptoms');
  const [confirming, setConfirming] = useState(false);
  const [notificationModal, setNotificationModal] = useState(null);

  const [newPrescription, setNewPrescription] = useState('');
  const [savingPrescription, setSavingPrescription] = useState(false);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchData = useCallback(async () => {
    if (!appointmentId) return;
    setLoading(true);
    try {
      let aptData = null;
      if (doctorId) {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('id', appointmentId)
          .eq('doctor_id', doctorId)
          .single();
        if (!error && data) aptData = data;
      }
      
      if (!aptData) {
        const { data } = await supabase.from('appointments').select('*').eq('id', appointmentId).single();
        if (data) {
          aptData = data;
        } else {
          const localApts = JSON.parse(localStorage.getItem('prana_local_appointments') || '[]');
          aptData = localApts.find(a => a.id === appointmentId) || {
            id: appointmentId,
            patient_full_name: 'Patient Record',
            patient_phone: '+919876543210',
            patient_age: '32',
            patient_gender: 'Female',
            patient_symptoms: 'Follow-up consultation',
            appointment_date: new Date().toISOString().split('T')[0],
            appointment_time: '10:00 AM',
            status: 'pending'
          };
        }
      }

      setAppointment(aptData);

      if (aptData.patient_phone) {
        const { data: historyData } = await supabase
          .from('appointments')
          .select('*')
          .eq('patient_phone', aptData.patient_phone)
          .order('appointment_date', { ascending: false });
        setHistory(historyData || []);

        const { data: prescriptionData } = await supabase
          .from('prescriptions')
          .select('*')
          .eq('patient_phone', aptData.patient_phone)
          .order('created_at', { ascending: false });
        setPrescriptions(prescriptionData || []);

        const { data: reportData } = await supabase
          .from('reports')
          .select('*')
          .eq('patient_phone', aptData.patient_phone)
          .order('created_at', { ascending: false });
        setReports(reportData || []);
      }

    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setLoading(false);
    }
  }, [appointmentId, doctorId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const previousVisits = useMemo(() => {
    return history.filter(h => h.id !== appointmentId);
  }, [history, appointmentId]);

  const isExistingPatient = previousVisits.length > 0;
  const visitCount = history.length;

  const handleConfirmAndNotify = async () => {
    if (!appointment) return;
    setConfirming(true);
    try {
      const docName = appointment.doctor_name || 'Dr. Specialist';
      const docTitle = 'Senior Consultant Physician';
      const docSpec = appointment.department || 'Clinical Specialist';
      const hospName = 'Prana Main Medical Center';
      const hospLoc = 'Road No. 72, Jubilee Hills, Hyderabad';

      const notifRes = await notificationService.notifyDoctorConfirmation({
        appointmentId: appointment.id,
        patientName: appointment.patient_full_name,
        patientPhone: appointment.patient_phone,
        doctorId: doctorId,
        doctorName: docName,
        doctorTitle: docTitle,
        specialty: docSpec,
        hospitalName: hospName,
        hospitalLocation: hospLoc,
        appointmentDate: appointment.appointment_date,
        appointmentTime: appointment.appointment_time,
        consultationFee: appointment.consultation_fee || 135.0,
        notes: 'Please arrive 15 minutes before your scheduled consultation.'
      });

      try {
        await supabase.from('appointments').update({ status: 'confirmed' }).eq('id', appointment.id);
      } catch (err) {
        console.warn('Supabase status update error:', err);
      }

      const localApts = JSON.parse(localStorage.getItem('prana_local_appointments') || '[]');
      const updated = localApts.map(a => a.id === appointment.id ? { ...a, status: 'confirmed' } : a);
      localStorage.setItem('prana_local_appointments', JSON.stringify(updated));

      setAppointment(prev => ({ ...prev, status: 'confirmed' }));

      setNotificationModal({
        patientName: appointment.patient_full_name,
        patientPhone: appointment.patient_phone,
        doctorName: docName,
        hospitalName: hospName,
        hospitalLocation: hospLoc,
        appointmentDate: appointment.appointment_date,
        appointmentTime: appointment.appointment_time,
        senderNumber: SENDER_NUMBER,
        whatsappDirectUrl: notifRes.whatsapp_direct_url,
        smsBody: notifRes.sms_body,
        whatsappBody: notifRes.whatsapp_body
      });
    } catch (e) {
      alert('Error confirming appointment: ' + e.message);
    } finally {
      setConfirming(false);
    }
  };

  const sendWhatsApp = (text) => {
    if (!appointment) return;
    const message = `📋 *PRESCRIPTION - PRANA HEALTH NETWORK*\n\nDear *${appointment.patient_full_name}*,\n\nHere is your medical prescription from Dr. ${appointment.doctor_name || 'Medical Specialist'}:\n\n${text}\n\n🏥 *Hospital:* Prana Main Medical Center\n📍 *Location:* Road No. 72, Jubilee Hills, Hyderabad\n📞 *Helpline:* ${SENDER_NUMBER}\n\nGet well soon!`;
    const cleanDigits = (appointment.patient_phone || '').replace(/[^\d]/g, '');
    const url = `https://wa.me/${cleanDigits}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleSavePrescription = async () => {
    if (!newPrescription.trim()) return;
    setSavingPrescription(true);
    try {
      const { error } = await supabase.from('prescriptions').insert([{
        doctor_id: doctorId || 'doc-general',
        patient_phone: appointment.patient_phone,
        patient_name: appointment.patient_full_name,
        prescription_text: newPrescription,
      }]);
      if (error) console.warn('Supabase prescription fallback:', error);

      setPrescriptions(prev => [{
        id: `rx-${Date.now()}`,
        doctor_id: doctorId,
        patient_phone: appointment.patient_phone,
        patient_name: appointment.patient_full_name,
        prescription_text: newPrescription,
        created_at: new Date().toISOString()
      }, ...prev]);
      const savedRx = newPrescription;
      setNewPrescription('');
      sendWhatsApp(savedRx);
    } catch (error) {
      alert('Error saving prescription: ' + error.message);
    } finally {
      setSavingPrescription(false);
    }
  };

  const startEditing = (p) => {
    setEditingId(p.id);
    setEditingText(p.prescription_text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText('');
  };

  const handleUpdatePrescription = async () => {
    if (!editingText.trim()) return;
    setSavingEdit(true);
    try {
      await supabase
        .from('prescriptions')
        .update({ prescription_text: editingText })
        .eq('id', editingId);
      setPrescriptions(prev => prev.map(p => p.id === editingId ? { ...p, prescription_text: editingText } : p));
      setEditingId(null);
    } catch (error) {
      alert('Error updating prescription: ' + error.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeletePrescription = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prescription?')) return;
    try {
      await supabase.from('prescriptions').delete().eq('id', id);
      setPrescriptions(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      alert('Error deleting prescription: ' + error.message);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingReport(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${appointment.patient_phone}.${fileExt}`;
      const filePath = `patient-reports/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('doctor-reports')
        .upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage
        .from('doctor-reports')
        .getPublicUrl(filePath);
      const { error: dbError } = await supabase.from('reports').insert([{
        doctor_id: doctorId,
        patient_phone: appointment.patient_phone,
        file_url: publicUrl,
        file_name: file.name
      }]);
      if (dbError) throw dbError;
      fetchData();
      alert('Report uploaded successfully!');
    } catch (error) {
      alert('Error uploading report: ' + error.message);
    } finally {
      setUploadingReport(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  const isConfirmed = appointment?.status === 'confirmed';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Profile Card */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(`/doctor-dashboard${doctorId ? `?doctor_id=${doctorId}` : ''}`)}
            className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all"
          >
            <MdArrowBack size={24} />
          </button>
          <div className="w-20 h-20 rounded-3xl bg-blue-100 flex items-center justify-center text-blue-600 font-black text-3xl shadow-inner uppercase">
            {appointment?.patient_full_name ? appointment.patient_full_name.charAt(0) : 'P'}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{appointment?.patient_full_name}</h1>
            </div>
            <div className="flex items-center gap-3 text-slate-500 font-bold text-sm mt-1">
               <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-mono text-slate-800">{appointment?.patient_phone}</span>
               <span>•</span>
               {appointment?.patient_age && <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg">{appointment.patient_age} Yrs</span>}
               {appointment?.patient_gender && <span className="px-2.5 py-1 bg-slate-100 rounded-lg">{appointment.patient_gender}</span>}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           {!isConfirmed ? (
             <button
               onClick={handleConfirmAndNotify}
               disabled={confirming}
               className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl font-bold text-sm hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 transition-all disabled:opacity-50"
             >
               {confirming ? (
                 <span className="animate-spin rounded-full h-4 w-4 border-b border-white"></span>
               ) : (
                 <>
                   <MdCheck size={18} />
                   Confirm & Notify Patient
                 </>
               )}
             </button>
           ) : (
             <div className="px-4 py-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-wider">
               <MdCheckCircle size={18} /> Officially Confirmed
             </div>
           )}

           <div className={`p-3 px-5 rounded-2xl border text-center ${isExistingPatient ? 'bg-green-50 border-green-100' : 'bg-blue-50 border-blue-100'}`}>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status</div>
              <div className={`text-xs font-black uppercase ${isExistingPatient ? 'text-green-600' : 'text-blue-600'}`}>
                 {isExistingPatient ? 'Existing' : 'New Patient'}
              </div>
           </div>
           <div className="p-3 px-5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Visits</div>
              <div className="text-xs font-black text-slate-900">{visitCount}</div>
           </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[600px] flex flex-col">
        <div className="flex border-b border-slate-50 p-2">
           {[
             { id: 'symptoms', label: 'Current Symptoms', icon: <MdInfo /> },
             { id: 'history', label: 'Previous Visits', icon: <MdHistory /> },
             { id: 'prescriptions', label: 'Prescriptions & WhatsApp', icon: <MdAssignment /> },
             { id: 'reports', label: 'Lab Reports', icon: <MdUploadFile /> }
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex-1 py-4 flex items-center justify-center gap-3 font-bold transition-all rounded-2xl text-sm ${
                 activeTab === tab.id 
                 ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                 : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
               }`}
             >
               {tab.icon}
               {tab.label}
             </button>
           ))}
        </div>

        <div className="p-8 flex-1">
           {activeTab === 'symptoms' && (
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                     <MdInfo className="text-blue-600" />
                     Current Appointment & Symptoms
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <span>Helpline Sender:</span>
                    <span className="font-mono text-blue-600 font-extrabold">{SENDER_NUMBER}</span>
                  </div>
                </div>

                <div className="p-8 bg-blue-50/50 border border-blue-100 rounded-[2rem] shadow-inner relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4">
                      <div className={`px-3 py-1 text-[9px] font-black uppercase rounded-full tracking-tighter shadow-sm ${
                        isConfirmed ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                      }`}>
                        {isConfirmed ? 'Confirmed Slot' : 'Pending Confirmation'}
                      </div>
                   </div>
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                         <MdNotes />
                      </div>
                      <div className="text-sm font-black text-slate-500 uppercase tracking-widest leading-none">
                        Scheduled: {appointment?.appointment_date} at {appointment?.appointment_time}
                      </div>
                   </div>
                   <p className="text-xl font-bold text-slate-800 italic leading-relaxed pl-4 border-l-4 border-blue-600 py-2">
                      "{appointment?.patient_symptoms || 'General Medical Consultation'}"
                   </p>
                </div>
                
                {!isExistingPatient && (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-700">
                     <MdInfo />
                     <span className="text-sm font-bold">This is a New Patient. Automated notifications will be sent directly to {appointment?.patient_phone}.</span>
                  </div>
                )}
             </div>
           )}

           {activeTab === 'history' && (
             <div className="space-y-6">
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                   <MdHistory className="text-blue-600" />
                   Visit History (Past Records)
                </h3>
                {previousVisits.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {previousVisits.map((h, index) => (
                      <div key={h.id} className={`p-6 bg-slate-50 rounded-3xl border border-slate-100 transition-all hover:border-blue-200 group ${index === 0 ? 'ring-1 ring-slate-200 shadow-sm' : ''}`}>
                         <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                                  <MdCalendarToday size={18} />
                               </div>
                               <div>
                                  <div className="font-black text-slate-900 uppercase tracking-tight">{h.appointment_date}</div>
                                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{h.appointment_time}</div>
                                </div>
                            </div>
                            <div className="px-3 py-1 bg-white rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-100">{h.status || 'Completed'}</div>
                         </div>
                         <div className="bg-white/50 p-4 rounded-2xl border border-slate-50 italic text-slate-600 font-medium">
                            "{h.patient_symptoms || 'No symptoms or notes recorded.'}"
                         </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center text-slate-300 font-black uppercase italic tracking-widest border-2 border-dashed border-slate-100 rounded-[2rem]">
                     No previous visits found for this patient.
                  </div>
                )}
             </div>
           )}

           {activeTab === 'prescriptions' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                   <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <MdAssignment className="text-blue-600" />
                      Write Digital Prescription
                   </h3>
                   <div className="relative">
                      <textarea
                        value={newPrescription}
                        onChange={(e) => setNewPrescription(e.target.value)}
                        placeholder="Type medicine names, dosages, intervals, dietary recommendations, and precautions..."
                        className="w-full h-64 p-6 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none resize-none font-medium text-slate-700"
                      ></textarea>
                      <button 
                         onClick={handleSavePrescription}
                         disabled={savingPrescription || !newPrescription.trim()}
                         className="absolute bottom-4 right-4 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-extrabold text-sm shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                         <FaWhatsapp size={16} />
                         {savingPrescription ? 'Saving...' : 'Save & Send WhatsApp'}
                      </button>
                   </div>
                </div>
                <div className="space-y-6">
                   <h3 className="text-xl font-black text-slate-900">Past Prescriptions</h3>
                   <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {prescriptions.map(p => (
                        <div key={p.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                           <div className="flex justify-between items-center mb-4">
                              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{new Date(p.created_at || Date.now()).toLocaleDateString()}</span>
                              <div className="flex gap-2">
                                 <button onClick={() => sendWhatsApp(p.prescription_text)} title="Send via WhatsApp" className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition-all"><MdSend /></button>
                                 <button onClick={() => startEditing(p)} title="Edit" className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"><MdEdit /></button>
                                 <button onClick={() => handleDeletePrescription(p.id)} title="Delete" className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"><MdDelete /></button>
                              </div>
                           </div>
                           {editingId === p.id ? (
                             <div className="space-y-2">
                               <textarea value={editingText} onChange={(e) => setEditingText(e.target.value)} className="w-full p-4 bg-white border border-blue-100 rounded-xl font-medium min-h-[100px]"></textarea>
                               <div className="flex justify-end gap-2">
                                 <button onClick={cancelEditing} className="px-3 py-1 text-xs font-bold text-slate-400">Cancel</button>
                                 <button onClick={handleUpdatePrescription} disabled={savingEdit} className="px-3 py-1 text-xs font-bold bg-blue-600 text-white rounded-lg">Update</button>
                               </div>
                             </div>
                           ) : (
                             <pre className="whitespace-pre-wrap font-sans text-sm font-medium text-slate-700 bg-white/50 p-4 rounded-xl">{p.prescription_text}</pre>
                           )}
                        </div>
                      ))}
                      {prescriptions.length === 0 && (
                        <div className="p-8 text-center text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          No prescriptions issued yet. Write one above to instantly send to the patient's WhatsApp.
                        </div>
                      )}
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'reports' && (
             <div className="space-y-8">
                <div className="flex justify-between items-center">
                   <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <MdUploadFile className="text-blue-600" />
                      Medical Reports
                   </h3>
                   <label className="bg-blue-600 text-white px-6 py-2 rounded-xl font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 cursor-pointer flex items-center gap-2">
                      <MdUploadFile />
                      {uploadingReport ? 'Uploading...' : 'Upload'}
                      <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploadingReport} />
                   </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                   {reports.length === 0 ? (
                      <div className="col-span-4 py-20 text-center text-slate-300 font-bold italic border-2 border-dashed border-slate-100 rounded-[2rem]">No reports found</div>
                   ) : (
                      reports.map(r => (
                        <div key={r.id} className="bg-slate-50 p-4 rounded-3xl border border-slate-100 group">
                           <div className="w-full aspect-square bg-white rounded-2xl flex flex-col items-center justify-center mb-4 relative overflow-hidden">
                              <span className="material-symbols-outlined text-4xl text-slate-300">description</span>
                              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                 <a href={r.file_url} target="_blank" rel="noreferrer" className="bg-white p-2 rounded-full shadow-lg"><MdVisibility /></a>
                              </div>
                           </div>
                           <div className="text-sm font-bold text-slate-900 truncate px-1">{r.file_name}</div>
                           <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 px-1">{new Date(r.created_at).toDateString()}</div>
                        </div>
                      ))
                   )}
                </div>
             </div>
           )}
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
                  <span className="font-bold text-slate-900">{notificationModal.doctorName}</span>
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

export default PatientDetailsEnhanced;
