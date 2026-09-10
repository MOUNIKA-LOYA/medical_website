import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  MdDashboard, 
  MdLocalHospital, 
  MdPeople, 
  MdEvent, 
  MdLogout,
  MdShield,
  MdMedicalServices,
  MdSettings,
  MdPhotoLibrary,
  MdApartment,
  MdBiotech
} from 'react-icons/md';
import { supabase } from '@/lib/supabaseClient';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/admin/login'); // Redirect anyway
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/admin', icon: <MdDashboard size={20} />, exact: true },
    { name: 'Hospitals', path: '/admin/hospitals', icon: <MdLocalHospital size={20} /> },
    { name: 'Doctors', path: '/admin/doctors', icon: <MdPeople size={20} /> },
    { name: 'Departments', path: '/admin/departments', icon: <MdApartment size={20} /> },
    { name: 'Services', path: '/admin/services', icon: <MdMedicalServices size={20} /> },
    { name: 'Insurance', path: '/admin/insurance', icon: <MdShield size={20} /> },
    { name: 'Diagnostic Packages', path: '/admin/packages', icon: <MdBiotech size={20} /> },
    { name: 'Appointments', path: '/admin/appointments', icon: <MdEvent size={20} /> },
    { name: 'Patients', path: '/admin/patients', icon: <MdPeople size={20} /> },
    { name: 'Hero Slider', path: '/admin/slider', icon: <MdPhotoLibrary size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <MdSettings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex fixed h-full shadow-2xl z-20">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400">medical_services</span>
            Admin Panel
          </h2>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {link.icon}
              <span className="font-medium text-sm">{link.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-all"
          >
            <MdLogout size={20} />
            <span className="font-medium text-sm">Exit Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 sticky top-0 z-10 border-b border-slate-200">
          <div className="flex items-center md:hidden">
            <button className="text-slate-600">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="ml-4 font-bold text-slate-900">Admin Panel</h2>
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Prana Health Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden flex items-center justify-center border-2 border-white shadow-sm text-slate-600 font-bold">
              AD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 flex-1 overflow-auto bg-slate-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
