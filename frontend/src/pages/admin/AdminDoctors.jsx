import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { departmentService } from '@/lib/departmentService';
import { doctorAuthService } from '@/lib/doctorAuthService';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdSearch, 
  MdLocalHospital, 
  MdPlace, 
  MdVpnKey,
  MdContentCopy,
  MdVisibility,
  MdVisibilityOff,
  MdAutoFixHigh,
  MdCheck,
  MdEmail,
  MdPhone,
  MdLock
} from 'react-icons/md';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [customHospital, setCustomHospital] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  // Success / Credentials Share Modal
  const [credentialsModal, setCredentialsModal] = useState(null);

  // Quick Credentials View / Reset Modal
  const [viewCredDoctor, setViewCredDoctor] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    specialty: '',
    department: '',
    email: '',
    phone: '',
    password: '',
    experience_years: 5,
    available_today: true,
    photo_url: '',
    schedule: 'Mon - Sat: 10:00 - 16:00',
    languages: ['English', 'Hindi'],
    display_sections: [],
    hospital_id: '',
    hospital_name: '',
    location_address: '',
    consultation_fee: 500
  });

  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const generateUUID = () => {
    try {
      return crypto.randomUUID();
    } catch (e) {
      return 'doc_' + Math.random().toString(36).substr(2, 9);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch doctors
      const { data, error } = await supabase.from('doctors').select('*');
      if (error) {
        console.warn('Supabase doctors fetch warning:', error.message);
      }
      
      let doctorList = data || [];
      
      // Fallback if empty: fetch from doctorAuthService or local
      if (doctorList.length === 0) {
        const vault = doctorAuthService.getAllCredentials();
        doctorList = vault.map(v => ({
          id: v.doctorId,
          name: v.doctorName,
          title: 'Specialist Consultant',
          specialty: 'Clinical Medicine',
          department: 'General Medicine',
          email: v.email,
          phone: v.phone || '9876543210',
          consultation_fee: 500,
          schedule: 'Mon - Sat: 10:00 - 16:00',
          available_today: true,
          hospital_name: 'Prana Main Medical Center',
          location_address: 'Road No. 72, Jubilee Hills, Hyderabad'
        }));
      }

      const sorted = doctorList.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setDoctors(sorted);

      // 2. Fetch departments dynamically
      const deptList = await departmentService.getDepartments();
      setDepartments(deptList || []);

      // 3. Fetch hospitals
      const { data: hospData } = await supabase.from('hospitals').select('id, hospital_name, address, city');
      setHospitals(hospData || []);
    } catch (error) {
      console.error('Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleHospitalChange = (e) => {
    const val = e.target.value;
    if (val === 'custom') {
      setCustomHospital(true);
      setFormData(prev => ({ ...prev, hospital_id: '', hospital_name: '', location_address: '' }));
    } else {
      setCustomHospital(false);
      const selectedHosp = hospitals.find(h => h.id === val);
      if (selectedHosp) {
        const fullAddr = [selectedHosp.address, selectedHosp.city].filter(Boolean).join(', ');
        setFormData(prev => ({
          ...prev,
          hospital_id: selectedHosp.id,
          hospital_name: selectedHosp.hospital_name,
          location_address: fullAddr
        }));
      } else {
        setFormData(prev => ({ ...prev, hospital_id: '', hospital_name: '', location_address: '' }));
      }
    }
  };

  const handleOpenModal = (doctor = null) => {
    setShowPassword(false);
    if (doctor) {
      setEditingDoctor(doctor);
      const matchedHosp = hospitals.find(h => h.id === doctor.hospital_id);
      const docHospitalName = doctor.hospital_name || doctor.schedule_details?.hospital_name || matchedHosp?.hospital_name || '';
      const docLocation = doctor.location_address || doctor.schedule_details?.location_address || (matchedHosp ? [matchedHosp.address, matchedHosp.city].filter(Boolean).join(', ') : '') || '';
      const isKnownHosp = hospitals.some(h => h.id === doctor.hospital_id);

      // Fetch existing password from vault if available
      const cred = doctorAuthService.getCredentialsByDoctorId(doctor.id) || doctorAuthService.getCredentialsByEmail(doctor.email);

      setCustomHospital(!isKnownHosp && !!docHospitalName);
      setFormData({
        name: doctor.name || '',
        title: doctor.title || '',
        specialty: doctor.specialty || '',
        department: doctor.department || '',
        email: doctor.email || cred?.email || '',
        phone: doctor.phone || cred?.phone || '',
        password: cred?.password || '',
        experience_years: doctor.experience_years || 5,
        available_today: doctor.available_today ?? true,
        photo_url: doctor.photo_url || '',
        schedule: doctor.schedule || 'Mon - Sat: 10:00 - 16:00',
        languages: doctor.languages || ['English', 'Hindi'],
        display_sections: doctor.display_sections || [],
        hospital_id: doctor.hospital_id || '',
        hospital_name: docHospitalName,
        location_address: docLocation,
        consultation_fee: doctor.consultation_fee !== undefined && doctor.consultation_fee !== null ? doctor.consultation_fee : 500
      });
      setImagePreview(doctor.photo_url);
    } else {
      setEditingDoctor(null);
      setCustomHospital(false);
      const autoPass = doctorAuthService.generateSecurePassword();
      setFormData({
        name: '',
        title: '',
        specialty: '',
        department: '',
        email: '',
        phone: '',
        password: autoPass,
        experience_years: 5,
        available_today: true,
        photo_url: '',
        schedule: 'Mon - Sat: 10:00 - 16:00',
        languages: ['English', 'Hindi'],
        display_sections: [],
        hospital_id: '',
        hospital_name: '',
        location_address: '',
        consultation_fee: 500
      });
      setImagePreview(null);
    }
    setIsModalOpen(true);
    setSelectedFile(null);
  };

  const handleGeneratePassword = () => {
    const generated = doctorAuthService.generateSecurePassword();
    setFormData(prev => ({ ...prev, password: generated }));
    setShowPassword(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.title.trim() || !formData.specialty.trim() || !formData.department || !formData.schedule) {
      return alert('Please fill in all required fields');
    }
    if (!formData.email.trim()) {
      return alert('Doctor Login Email is required to provide portal access.');
    }
    if (!formData.photo_url && !selectedFile && !editingDoctor) {
      formData.photo_url = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&h=300&auto=format&fit=crop';
    }

    setUploading(true);
    try {
      let finalPhotoUrl = formData.photo_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&h=300&auto=format&fit=crop';
      
      // Phase 1: Image Upload (Resilient)
      if (selectedFile) {
        try {
          const fileExt = selectedFile.name.split('.').pop();
          const fileName = `${Date.now()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('doctor-images')
            .upload(`doctor-photos/${fileName}`, selectedFile);

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('doctor-images')
              .getPublicUrl(`doctor-photos/${fileName}`);
            finalPhotoUrl = publicUrl;
          } else if (imagePreview && imagePreview.startsWith('data:image')) {
            finalPhotoUrl = imagePreview;
          }
        } catch (uploadErr) {
          console.warn('Storage Upload Failed, using preview:', uploadErr.message);
          if (imagePreview && imagePreview.startsWith('data:image')) {
            finalPhotoUrl = imagePreview;
          }
        }
      }

      const assignedDoctorId = editingDoctor?.id || generateUUID();
      const finalEmail = formData.email.trim().toLowerCase();
      const finalPassword = formData.password.trim() || 'Doctor@123';

      // Phase 2: Save Credentials in Doctor Auth Vault & Supabase Auth
      await doctorAuthService.saveCredentials({
        doctorId: assignedDoctorId,
        email: finalEmail,
        password: finalPassword,
        doctorName: formData.name.trim(),
        phone: formData.phone.trim()
      });

      // Phase 3: Database Save in Supabase
      const scheduleDetails = {
        ...(editingDoctor?.schedule_details || {}),
        hospital_name: formData.hospital_name || '',
        location_address: formData.location_address || ''
      };

      const doctorData = {
        id: assignedDoctorId,
        name: formData.name.trim(),
        doctor_name: formData.name.trim(),
        title: formData.title.trim(),
        specialty: formData.specialty.trim(),
        specialization: formData.specialty.trim(),
        department: formData.department,
        email: finalEmail,
        phone: formData.phone.trim(),
        experience_years: parseInt(formData.experience_years) || 5,
        experience: parseInt(formData.experience_years) || 5,
        schedule: formData.schedule,
        available_today: !!formData.available_today,
        is_available: !!formData.available_today,
        photo_url: finalPhotoUrl,
        languages: formData.languages || ['English', 'Hindi'],
        display_sections: formData.display_sections || [],
        rating: formData.rating || 4.9,
        review_count: formData.review_count || 35,
        about: formData.about || `Senior specialist in ${formData.specialty}`,
        consultation_fee: Number(formData.consultation_fee) || 500,
        hospital_id: formData.hospital_id || null,
        hospital_name: formData.hospital_name || '',
        location_address: formData.location_address || '',
        schedule_details: scheduleDetails
      };

      try {
        const { error: saveError } = editingDoctor 
          ? await supabase.from('doctors').update(doctorData).eq('id', editingDoctor.id)
          : await supabase.from('doctors').insert([doctorData]);

        if (saveError) {
          console.warn('Database save note:', saveError.message);
        }
      } catch (saveErr) {
        console.warn('DB save caught:', saveErr);
      }

      setIsModalOpen(false);
      fetchData();

      // Show Credentials Success Pop-up with 1-click share
      setCredentialsModal({
        doctorName: formData.name.trim(),
        email: finalEmail,
        password: finalPassword,
        portalUrl: `${window.location.origin}/doctor-login`
      });

    } catch (err) {
      console.error('Save Flow Failed:', err);
      alert('Error saving doctor: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor? This will remove their record and access.')) {
      try {
        await supabase.from('doctors').delete().eq('id', id);
        // Also update local list
        setDoctors(prev => prev.filter(d => d.id !== id));
        fetchData();
      } catch (error) {
        alert('Error deleting doctor: ' + error.message);
      }
    }
  };

  const handleOpenCredentialsViewer = (doctor) => {
    const cred = doctorAuthService.getCredentialsByDoctorId(doctor.id) || doctorAuthService.getCredentialsByEmail(doctor.email);
    setViewCredDoctor({
      ...doctor,
      email: doctor.email || cred?.email || `${doctor.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@hospital.com`,
      password: cred?.password || 'doctor123'
    });
    setNewPasswordInput('');
    setShowPassword(false);
  };

  const handleUpdatePasswordFromViewer = async () => {
    if (!newPasswordInput.trim()) return alert('Please enter a new password');
    
    await doctorAuthService.saveCredentials({
      doctorId: viewCredDoctor.id,
      email: viewCredDoctor.email,
      password: newPasswordInput.trim(),
      doctorName: viewCredDoctor.name,
      phone: viewCredDoctor.phone
    });

    setViewCredDoctor(prev => ({ ...prev, password: newPasswordInput.trim() }));
    setNewPasswordInput('');
    alert('Password updated successfully for ' + viewCredDoctor.name);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredDoctors = doctors.filter(doc =>
    (doc.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (doc.department || '').toLowerCase().includes(search.toLowerCase()) ||
    (doc.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (doc.schedule_details?.hospital_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (doc.schedule_details?.location_address || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">people</span>
            Manage Doctors & Login Credentials
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Add doctors, assign portal login credentials (email & password), and manage clinical schedules.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-blue-200 active:scale-95"
        >
          <MdAdd size={18} /> Add Doctor & Credentials
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <MdSearch className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search doctors by name, email, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Showing <strong className="text-slate-800">{filteredDoctors.length}</strong> of {doctors.length} doctors
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Login Credentials</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider text-center">Fee</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">Loading doctors...</td>
                </tr>
              ) : filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">No doctors found matching your search.</td>
                </tr>
              ) : (
                filteredDoctors.map(doctor => {
                  const fee = doctor.consultation_fee !== undefined && doctor.consultation_fee !== null ? doctor.consultation_fee : 500;
                  const docCred = doctorAuthService.getCredentialsByDoctorId(doctor.id) || doctorAuthService.getCredentialsByEmail(doctor.email);
                  const displayEmail = doctor.email || docCred?.email || 'Login not configured';

                  return (
                    <tr key={doctor.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={doctor.photo_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&h=200&auto=format&fit=crop'}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&h=200&auto=format&fit=crop';
                            }}
                            alt={doctor.name}
                            className="w-11 h-11 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{doctor.name}</div>
                            <div className="text-[11px] text-slate-500 font-medium">{doctor.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-1 bg-blue-50 text-[#275B99] rounded-lg font-bold text-[11px]">
                          {doctor.department}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                            <MdEmail className="text-slate-400" size={14} />
                            <span className="font-mono text-[11px]">{displayEmail}</span>
                          </div>
                          <button
                            onClick={() => handleOpenCredentialsViewer(doctor)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded hover:bg-blue-100 transition-colors"
                          >
                            <MdVpnKey size={12} />
                            <span>View / Reset Password</span>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-black text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                          ₹{fee}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                          doctor.available_today ? 'bg-green-50 text-[#4D9B2A] border border-green-200' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {doctor.available_today ? 'Active' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenModal(doctor)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Doctor"
                          >
                            <MdEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(doctor.id)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Doctor"
                          >
                            <MdDelete size={18} />
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

      {/* Main Add/Edit Doctor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-black text-xl text-slate-900">
                  {editingDoctor ? 'Edit Doctor & Credentials' : 'Add New Doctor & Login Credentials'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Set profile, specialty, hospital affiliation, and Doctor Portal access credentials.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="doctorForm" onSubmit={handleSave} className="grid grid-cols-2 gap-4 text-xs">
                
                {/* 🔐 DOCTOR LOGIN CREDENTIALS SECTION */}
                <div className="col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                        <MdVpnKey size={16} />
                      </div>
                      <span className="font-black text-slate-900 text-sm">Doctor Portal Login Credentials</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      Portal Access
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600">
                    The doctor will use this <strong>Email</strong> and <strong>Password</strong> to sign in at <code className="text-blue-700 bg-white px-1.5 py-0.5 rounded border border-blue-100">/doctor-login</code>.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Login Email */}
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                        Doctor Login Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          required
                          type="email"
                          placeholder="doctor.name@hospital.com"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                      </div>
                    </div>

                    {/* Login Password */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                          Login Password <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleGeneratePassword}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <MdAutoFixHigh size={12} /> Auto-generate
                        </button>
                      </div>
                      <div className="relative">
                        <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          required
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={e => setFormData({ ...formData, password: e.target.value })}
                          className="w-full pl-9 pr-9 py-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        >
                          {showPassword ? <MdVisibilityOff size={16} /> : <MdVisibility size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Full Name */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input required type="text" placeholder="Dr. Jane Doe" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none" />
                </div>

                {/* Title */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Title <span className="text-red-500">*</span></label>
                  <input required type="text" placeholder="e.g. MD - Senior Cardiologist" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none" />
                </div>

                {/* Specialty */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Specialty <span className="text-red-500">*</span></label>
                  <input required type="text" placeholder="e.g. Interventional Cardiology" value={formData.specialty} onChange={e => setFormData({ ...formData, specialty: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none" />
                </div>

                {/* Department */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Department <span className="text-red-500">*</span></label>
                  <select 
                    required 
                    value={formData.department} 
                    onChange={e => setFormData({ ...formData, department: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer"
                  >
                    <option value="">Select Department...</option>
                    {departments.map(dept => (
                      <option key={dept.id || dept.name} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                {/* Contact Phone */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Phone Number</label>
                  <div className="relative">
                    <MdPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="tel"
                      placeholder="e.g. +91 9876543210"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>

                {/* Consultation Fee */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Consultation Fee (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-sm">₹</span>
                    <input
                      required
                      type="number"
                      min="0"
                      step="50"
                      placeholder="500"
                      value={formData.consultation_fee}
                      onChange={e => setFormData({ ...formData, consultation_fee: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>

                {/* Hospital Selection */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Hospital Affiliation</label>
                  <select
                    value={customHospital ? 'custom' : formData.hospital_id}
                    onChange={handleHospitalChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer mb-2"
                  >
                    <option value="">Select Registered Hospital...</option>
                    {hospitals.map(h => (
                      <option key={h.id} value={h.id}>{h.hospital_name} ({h.city || 'Hospital'})</option>
                    ))}
                    <option value="custom">Enter Other / Custom Hospital Name</option>
                  </select>

                  {customHospital && (
                    <input
                      type="text"
                      placeholder="Type custom hospital name..."
                      value={formData.hospital_name}
                      onChange={e => setFormData({ ...formData, hospital_name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  )}
                </div>

                {/* Location Address */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Location Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Jubilee Hills, Road No. 36, Hyderabad"
                    value={formData.location_address}
                    onChange={e => setFormData({ ...formData, location_address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                {/* Schedule / Timing */}
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Schedule / Timing <span className="text-red-500">*</span></label>
                  <select 
                    required 
                    value={formData.schedule} 
                    onChange={e => setFormData({ ...formData, schedule: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer"
                  >
                    <option value="Mon - Sat: 10:00 - 16:00">Mon - Sat: 10:00 - 16:00</option>
                    <option value="Mon - Fri: 09:00 - 13:00">Mon - Fri: 09:00 - 13:00</option>
                    <option value="Mon - Fri: 14:00 - 18:00">Mon - Fri: 14:00 - 18:00</option>
                    <option value="Sat - Sun: 09:00 - 14:00">Sat - Sun: 09:00 - 14:00</option>
                    <option value="Night Shift: 20:00 - 06:00">Night Shift: 20:00 - 06:00</option>
                  </select>
                </div>

                {/* Photo Upload / URL */}
                <div className="col-span-2 space-y-3">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider">Photo Upload</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover bg-slate-50" />
                      ) : (
                        <span className="material-symbols-outlined text-slate-300">image</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" 
                      />
                      <p className="text-[10px] text-slate-400 mt-1">PNG, JPG or WEBP up to 5MB</p>
                    </div>
                  </div>

                  <div>
                    <input type="url" value={formData.photo_url} onChange={e => {
                      setFormData({ ...formData, photo_url: e.target.value });
                      setImagePreview(e.target.value);
                    }} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none" placeholder="Or paste Photo URL: https://..." />
                  </div>
                </div>

                {/* Available Today */}
                <div className="col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.available_today} onChange={e => setFormData({ ...formData, available_today: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" />
                    <span className="font-bold text-slate-800">Available Today for Consultations</span>
                  </label>
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
              <button type="submit" form="doctorForm" disabled={uploading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-md shadow-blue-200 active:scale-95">
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                    <span>Saving Doctor & Credentials...</span>
                  </>
                ) : (
                  editingDoctor ? 'Update Doctor & Access' : 'Create Doctor & Credentials'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🎉 Credentials Created / Share Pop-up */}
      {credentialsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up border border-slate-100">
            <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-center">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 text-white">
                <MdVpnKey size={28} />
              </div>
              <h3 className="text-xl font-black">Doctor Credentials Ready!</h3>
              <p className="text-xs text-blue-100 mt-1">
                Share these login details with <strong>{credentialsModal.doctorName}</strong>.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-200/80 text-xs">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Portal URL</div>
                  <div className="font-mono font-bold text-blue-600 select-all">{credentialsModal.portalUrl}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Doctor Email</div>
                  <div className="font-mono font-bold text-slate-900 select-all">{credentialsModal.email}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Password</div>
                  <div className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-200 select-all inline-block">
                    {credentialsModal.password}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(
                    `Hello ${credentialsModal.doctorName},\nHere are your login credentials for the Doctor Portal:\nPortal: ${credentialsModal.portalUrl}\nEmail: ${credentialsModal.email}\nPassword: ${credentialsModal.password}`
                  )}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  {copied ? <MdCheck size={18} /> : <MdContentCopy size={18} />}
                  <span>{copied ? 'Copied Details!' : 'Copy Login Details'}</span>
                </button>
                <button
                  onClick={() => setCredentialsModal(null)}
                  className="px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔑 Quick View / Reset Credentials Modal */}
      {viewCredDoctor && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up border border-slate-100">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                  <MdVpnKey size={18} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">{viewCredDoctor.name}</h3>
                  <p className="text-[10px] text-slate-500">Doctor Portal Credentials</p>
                </div>
              </div>
              <button onClick={() => setViewCredDoctor(null)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 rounded-xl p-3.5 space-y-2 border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Doctor Email</span>
                  <span className="font-mono font-bold text-slate-900">{viewCredDoctor.email}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Password</span>
                  <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
                    {viewCredDoctor.password}
                  </span>
                </div>
              </div>

              {/* Set New Password */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Reset / Set New Password
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter new password..."
                    value={newPasswordInput}
                    onChange={e => setNewPasswordInput(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                  <button
                    onClick={handleUpdatePasswordFromViewer}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-xs transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => copyToClipboard(
                    `Hello ${viewCredDoctor.name},\nYour Doctor Portal Login:\nURL: ${window.location.origin}/doctor-login\nEmail: ${viewCredDoctor.email}\nPassword: ${viewCredDoctor.password}`
                  )}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {copied ? <MdCheck size={16} /> : <MdContentCopy size={16} />}
                  <span>{copied ? 'Copied Details!' : 'Copy Login Details'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDoctors;
