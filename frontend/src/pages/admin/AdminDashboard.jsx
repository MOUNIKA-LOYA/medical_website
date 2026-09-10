import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  MdPeople, 
  MdEvent, 
  MdLocalHospital, 
  MdShield, 
  MdMedicalServices, 
  MdFormatListBulleted,
  MdHistory,
  MdFlashOn,
  MdApartment,
  MdMiscellaneousServices
} from 'react-icons/md';
import { hospitalService } from '@/lib/hospitalService';
import { packageService } from '@/lib/packageService';
import { insuranceService } from '@/lib/insuranceService';
import { serviceService } from '@/lib/serviceService';
import { departmentService } from '@/lib/departmentService';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    hospitals: 0,
    doctors: 0,
    departments: 0,
    services: 0,
    insurance: 0,
    packages: 0,
    appointments: 0,
    patients: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [
        docRes, 
        apptRes, 
        patientRes,
        hospitalsData,
        packagesData,
        providersData,
        servicesData,
        deptsData
      ] = await Promise.all([
        supabase.from('doctors').select('*', { count: 'exact', head: true }),
        supabase.from('appointments').select('*', { count: 'exact', head: true }),
        supabase.from('patients').select('*', { count: 'exact', head: true }),
        hospitalService.getHospitals(),
        packageService.getPackages(),
        insuranceService.getProviders(),
        serviceService.getServices(),
        departmentService.getDepartments()
      ]);

      setStats({
        hospitals: hospitalsData ? hospitalsData.length : 0,
        doctors: docRes?.count || 0,
        departments: deptsData ? deptsData.length : 0,
        services: servicesData ? servicesData.length : 0,
        insurance: providersData ? providersData.length : 0,
        packages: packagesData ? packagesData.length : 0,
        appointments: apptRes?.count || 0,
        patients: patientRes?.count || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const metricCards = [
    { title: 'Total Hospitals', count: stats.hospitals, icon: <MdLocalHospital size={26} />, color: 'bg-blue-50 text-blue-600' },
    { title: 'Total Doctors', count: stats.doctors, icon: <MdPeople size={26} />, color: 'bg-emerald-50 text-emerald-600' },
    { title: 'Departments', count: stats.departments, icon: <MdApartment size={26} />, color: 'bg-blue-50 text-blue-600' },
    { title: 'Healthcare Services', count: stats.services, icon: <MdMiscellaneousServices size={26} />, color: 'bg-emerald-50 text-emerald-600' },
    { title: 'Insurance Providers', count: stats.insurance, icon: <MdShield size={26} />, color: 'bg-blue-50 text-blue-600' },
    { title: 'Diagnostic Packages', count: stats.packages, icon: <MdMedicalServices size={26} />, color: 'bg-emerald-50 text-emerald-600' },
    { title: 'Total Appointments', count: stats.appointments, icon: <MdEvent size={26} />, color: 'bg-blue-50 text-blue-600' },
    { title: 'Total Patients', count: stats.patients, icon: <MdPeople size={26} />, color: 'bg-emerald-50 text-emerald-600' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Dashboard Overview</h2>
        <p className="text-xs text-slate-500 font-medium">Real-time statistics connected directly to the Supabase database.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {metricCards.map((card) => (
            <div key={card.title} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.title}</p>
                <p className="text-3xl font-black text-slate-900">{card.count}</p>
              </div>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${card.color}`}>
                {card.icon}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Placeholder Widgets Row */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Quick Actions Placeholder Widget */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MdFlashOn className="text-blue-600 text-xl" />
            <h3 className="font-bold text-base text-slate-900">Quick Actions</h3>
          </div>
          <div className="space-y-2 text-xs font-medium text-slate-600">
            <p className="p-3 bg-slate-50 rounded-xl border border-slate-100">⚡ Fast-track Hospital & Doctor registration</p>
            <p className="p-3 bg-slate-50 rounded-xl border border-slate-100">⚡ Manage Cashless Insurance Provider policies</p>
            <p className="p-3 bg-slate-50 rounded-xl border border-slate-100">⚡ Update Diagnostic Checkup Packages</p>
          </div>
        </div>

        {/* Recent Activity Placeholder Widget */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MdHistory className="text-emerald-600 text-xl" />
            <h3 className="font-bold text-base text-slate-900">Recent Platform Activity</h3>
          </div>
          <div className="space-y-2 text-xs text-slate-500">
            <div className="p-3 bg-slate-50/80 rounded-xl flex items-center justify-between">
              <span>Database query executed successfully</span>
              <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border">Just now</span>
            </div>
            <div className="p-3 bg-slate-50/80 rounded-xl flex items-center justify-between">
              <span>Appointments sync verified</span>
              <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border">2 mins ago</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
