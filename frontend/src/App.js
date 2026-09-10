import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DoctorDirectory from './pages/DoctorDirectory';
import DepartmentDirectory from './pages/DepartmentDirectory';
import HospitalDirectory from './pages/HospitalDirectory';
import HospitalDetailsPage from './pages/HospitalDetailsPage';
import InsuranceDirectory from './pages/InsuranceDirectory';
import InsuranceClaimPage from './pages/InsuranceClaimPage';
import DiagnosticDirectory from './pages/DiagnosticDirectory';
import PackageDetailsPage from './pages/PackageDetailsPage';
import PackageBookingTracker from './pages/PackageBookingTracker';
import AppointmentBooking from './pages/AppointmentBooking';
import AboutPage from './pages/AboutPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminDepartments from './pages/admin/AdminDepartments';
import AdminServices from './pages/admin/AdminServices';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminPatients from './pages/admin/AdminPatients';
import AdminHospitals from './pages/admin/AdminHospitals';
import AdminInsurance from './pages/admin/AdminInsurance';
import AdminPackages from './pages/admin/AdminPackages';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLogin from './pages/admin/AdminLogin';
import AdminHeroSlider from './pages/admin/AdminHeroSlider';
import ProtectedRoute from './components/ProtectedRoute';

// Doctor Dashboard Imports
import DoctorLayout from './pages/doctor/DoctorLayout';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientDetails from './pages/doctor/PatientDetails';
import DoctorLogin from './pages/doctor/DoctorLogin';
import DoctorProtectedRoute from './components/DoctorProtectedRoute';

// Patient Dashboard Imports
import PatientLogin from './pages/patient/PatientLogin';
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientDetailsForm from './pages/patient/PatientDetailsForm';
import PatientProtectedRoute from './components/PatientProtectedRoute';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/doctors" element={<DoctorDirectory />} />
        <Route path="/hospitals" element={<HospitalDirectory />} />
        <Route path="/hospitals/:id" element={<HospitalDetailsPage />} />
        <Route path="/departments" element={<DepartmentDirectory />} />
        <Route path="/insurance" element={<InsuranceDirectory />} />
        <Route path="/insurance/claim" element={<InsuranceClaimPage />} />
        <Route path="/packages" element={<DiagnosticDirectory />} />
        <Route path="/packages/:id" element={<PackageDetailsPage />} />
        <Route path="/packages/track" element={<PackageBookingTracker />} />
        <Route path="/book-appointment" element={<AppointmentBooking />} />
        <Route path="/book-appointment/:doctorId" element={<AppointmentBooking />} />
        <Route path="/book-consultation" element={<AppointmentBooking />} />
        <Route path="/book-consultation/:doctorId" element={<AppointmentBooking />} />
        <Route path="/consultation" element={<AppointmentBooking />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="hospitals" element={<AdminHospitals />} />
          <Route path="doctors" element={<AdminDoctors />} />
          <Route path="insurance" element={<AdminInsurance />} />
          <Route path="packages" element={<AdminPackages />} />
          <Route path="departments" element={<AdminDepartments />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="patients" element={<AdminPatients />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="slider" element={<AdminHeroSlider />} />
        </Route>

        {/* Doctor Routes (New) */}
        <Route path="/doctor-login" element={<DoctorLogin />} />
        <Route 
          path="/doctor-dashboard" 
          element={
            <DoctorProtectedRoute>
              <DoctorLayout />
            </DoctorProtectedRoute>
          }
        >
          <Route index element={<DoctorDashboard />} />
          <Route path="patient/:id" element={<PatientDetails />} />
        </Route>

        {/* Patient Routes */}
        <Route path="/patient-login" element={<PatientLogin />} />
        <Route 
          path="/patient-dashboard" 
          element={
            <PatientProtectedRoute>
              <PatientDashboard />
            </PatientProtectedRoute>
          }
        />
        <Route 
          path="/patient-details" 
          element={
            <PatientProtectedRoute>
              <PatientDetailsForm />
            </PatientProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;