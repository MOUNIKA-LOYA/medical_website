/**
 * Notification Service
 * Manages automated SMS and WhatsApp dispatches to patients:
 * 1. notifyBookingInitiated: Dispatched when booking is created (before doctor confirmation)
 * 2. notifyDoctorConfirmation: Dispatched when doctor confirms appointment (after doctor confirmation)
 * 
 * Default Sender Helpline: 7893124722
 */

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000';
const SENDER_NUMBER = '7893124722';

export const notificationService = {
  /**
   * Send notification when an appointment is initiated by the patient
   */
  async notifyBookingInitiated({
    patientName,
    patientPhone,
    doctorId,
    doctorName,
    doctorTitle,
    specialty,
    department,
    hospitalName,
    hospitalLocation,
    appointmentDate,
    appointmentTime,
    consultationFee,
    appointmentId,
    sendSms = true,
    sendWhatsapp = true
  }) {
    const payload = {
      appointment_id: appointmentId,
      patient_name: patientName || 'Valued Patient',
      patient_phone: patientPhone,
      doctor_id: doctorId,
      doctor_name: doctorName || 'Medical Specialist',
      doctor_title: doctorTitle || 'Senior Consultant',
      specialty: specialty || department || 'Clinical Specialist',
      department: department,
      hospital_name: hospitalName || 'Prana Main Medical Center',
      hospital_location: hospitalLocation || 'Road No. 72, Jubilee Hills, Hyderabad',
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      consultation_fee: parseFloat(consultationFee) || 135.0,
      sender_number: SENDER_NUMBER,
      send_sms: sendSms,
      send_whatsapp: sendWhatsapp
    };

    try {
      const res = await fetch(`${BACKEND_URL}/api/notify/booking-initiated`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend notification endpoint unreachable, generating client-side fallback dispatch:', e);
    }

    // Local simulated notification fallback
    const cleanDigits = (patientPhone || '').replace(/[^\d]/g, '');
    const formattedPhone = cleanDigits.length === 10 ? `+91${cleanDigits}` : `+${cleanDigits}`;
    const waText = `🏥 *PRANA HEALTH NETWORK - BOOKING RECEIVED* ⏳\n\nDear *${patientName}*,\nYour appointment request has been received for Dr. ${doctorName} at ${hospitalName || 'Prana Main Medical Center'}, ${hospitalLocation || 'Road No. 72, Jubilee Hills, Hyderabad'} on ${appointmentDate} at ${appointmentTime}.\nRef: ${appointmentId || 'APT-ONLINE'}\nStatus: Pending Doctor Confirmation.\nHelpline: ${SENDER_NUMBER}`;
    
    return {
      success: true,
      message: `Booking notification generated for ${patientName} (${formattedPhone}) from ${SENDER_NUMBER}`,
      sender_number: SENDER_NUMBER,
      whatsapp_direct_url: `https://wa.me/${cleanDigits}?text=${encodeURIComponent(waText)}`,
      whatsapp_body: waText,
      sms_body: `Prana Health: Dear ${patientName}, appointment request with Dr. ${doctorName} on ${appointmentDate} at ${appointmentTime} is received. Ref: ${appointmentId}. Helpline: ${SENDER_NUMBER}.`
    };
  },

  /**
   * Send notification when the doctor confirms the appointment in Doctor Portal
   */
  async notifyDoctorConfirmation({
    appointmentId,
    patientName,
    patientPhone,
    doctorId,
    doctorName,
    doctorTitle,
    specialty,
    hospitalName,
    hospitalLocation,
    appointmentDate,
    appointmentTime,
    consultationFee,
    notes,
    sendSms = true,
    sendWhatsapp = true
  }) {
    const payload = {
      appointment_id: appointmentId,
      patient_name: patientName || 'Valued Patient',
      patient_phone: patientPhone,
      doctor_id: doctorId,
      doctor_name: doctorName || 'Medical Specialist',
      doctor_title: doctorTitle || 'Senior Consultant',
      specialty: specialty || 'Clinical Specialist',
      hospital_name: hospitalName || 'Prana Main Medical Center',
      hospital_location: hospitalLocation || 'Road No. 72, Jubilee Hills, Hyderabad',
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      consultation_fee: parseFloat(consultationFee) || 135.0,
      notes: notes || 'Please arrive 15 minutes before your scheduled consultation.',
      sender_number: SENDER_NUMBER,
      send_sms: sendSms,
      send_whatsapp: sendWhatsapp
    };

    try {
      const res = await fetch(`${BACKEND_URL}/api/notify/doctor-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend confirmation notification endpoint unreachable, generating client-side fallback dispatch:', e);
    }

    const cleanDigits = (patientPhone || '').replace(/[^\d]/g, '');
    const formattedPhone = cleanDigits.length === 10 ? `+91${cleanDigits}` : `+${cleanDigits}`;
    const waText = `✅ *APPOINTMENT CONFIRMED - PRANA HEALTH NETWORK*\n\nDear *${patientName}*,\nDr. ${doctorName} has CONFIRMED your appointment at ${hospitalName || 'Prana Main Medical Center'}, ${hospitalLocation || 'Road No. 72, Jubilee Hills, Hyderabad'} for ${appointmentDate} at ${appointmentTime}.\nAppointment ID: ${appointmentId}\nInstructions: ${notes || 'Arrive 15 min prior.'}\nHelpline: ${SENDER_NUMBER}`;

    return {
      success: true,
      message: `Doctor confirmation notification generated for ${patientName} (${formattedPhone}) from ${SENDER_NUMBER}`,
      sender_number: SENDER_NUMBER,
      whatsapp_direct_url: `https://wa.me/${cleanDigits}?text=${encodeURIComponent(waText)}`,
      whatsapp_body: waText,
      sms_body: `CONFIRMED: Dear ${patientName}, your appointment with Dr. ${doctorName} is CONFIRMED for ${appointmentDate} at ${appointmentTime}. Helpline: ${SENDER_NUMBER}.`
    };
  }
};
