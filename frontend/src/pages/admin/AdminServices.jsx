import React, { useEffect, useState, useCallback } from 'react';
import { serviceService } from '@/lib/serviceService';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdSearch, 
  MdCheckCircle, 
  MdCancel,
  MdOpenInNew,
  MdMedicalServices
} from 'react-icons/md';
import { 
  Stethoscope, 
  Building2, 
  ShieldCheck, 
  Activity, 
  Microscope, 
  Phone, 
  HeartPulse, 
  Ambulance, 
  Pill, 
  Syringe, 
  Eye, 
  Sparkles 
} from 'lucide-react';

const ICON_OPTIONS = [
  { label: 'Stethoscope (Consultations)', value: 'Stethoscope', icon: Stethoscope },
  { label: 'Building (Facilities / Hospital)', value: 'Building2', icon: Building2 },
  { label: 'Shield (Insurance / Coverage)', value: 'ShieldCheck', icon: ShieldCheck },
  { label: 'Activity (Wellness / Heart)', value: 'Activity', icon: Activity },
  { label: 'Microscope (Diagnostics / Lab)', value: 'Microscope', icon: Microscope },
  { label: 'Phone (Emergency / Hotlines)', value: 'Phone', icon: Phone },
  { label: 'Heart Pulse (Cardiology / Vitals)', value: 'HeartPulse', icon: HeartPulse },
  { label: 'Ambulance (Trauma / Dispatch)', value: 'Ambulance', icon: Ambulance },
  { label: 'Pill (Pharmacy / Medicine)', value: 'Pill', icon: Pill },
  { label: 'Syringe (Vaccines / Injections)', value: 'Syringe', icon: Syringe },
  { label: 'Eye (Ophthalmology / Vision)', value: 'Eye', icon: Eye },
  { label: 'Sparkles (Specialized Care)', value: 'Sparkles', icon: Sparkles },
];

const ROUTE_OPTIONS = [
  { label: 'Doctors Directory (/doctors)', value: '/doctors' },
  { label: 'Hospitals Directory (/hospitals)', value: '/hospitals' },
  { label: 'Insurance Plans (/insurance)', value: '/insurance' },
  { label: 'Health Packages (/packages)', value: '/packages' },
  { label: 'Book Appointment (/book-appointment)', value: '/book-appointment' },
  { label: 'About Us (/about)', value: '/about' },
  { label: 'Custom Path', value: 'custom' }
];

export const renderServiceIcon = (iconName, className = "w-6 h-6") => {
  const match = ICON_OPTIONS.find(i => i.value === iconName);
  if (match) {
    const IconComponent = match.icon;
    return <IconComponent className={className} />;
  }
  return <span className="material-symbols-outlined text-2xl">{iconName || 'medical_services'}</span>;
};

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [customPath, setCustomPath] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    icon: 'Stethoscope',
    path: '/doctors',
    badge: '',
    is_active: true,
    display_order: 1,
    bg_color: 'bg-blue-50 text-[#275B99]'
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await serviceService.getServices();
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service);
      const isKnownRoute = ROUTE_OPTIONS.some(r => r.value === service.path);
      setCustomPath(!isKnownRoute);
      setFormData({
        title: service.title || '',
        subtitle: service.subtitle || '',
        description: service.description || '',
        icon: service.icon || 'Stethoscope',
        path: service.path || '/doctors',
        badge: service.badge || '',
        is_active: service.is_active !== undefined ? service.is_active : true,
        display_order: service.display_order || 0,
        bg_color: service.bg_color || 'bg-blue-50 text-[#275B99]'
      });
    } else {
      setEditingService(null);
      setCustomPath(false);
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        icon: 'Stethoscope',
        path: '/doctors',
        badge: '',
        is_active: true,
        display_order: services.length + 1,
        bg_color: 'bg-blue-50 text-[#275B99]'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      return alert('Please enter a service title');
    }

    try {
      if (editingService) {
        await serviceService.updateService(editingService.id, formData);
      } else {
        await serviceService.createService(formData);
      }
      setIsModalOpen(false);
      await fetchData();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('services_updated'));
      }
    } catch (error) {
      alert('Error saving service: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service? It will no longer appear on the patient homepage.')) {
      try {
        await serviceService.deleteService(id);
        fetchData();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('services_updated'));
        }
      } catch (error) {
        alert('Error deleting service: ' + error.message);
      }
    }
  };

  const filteredServices = services.filter(s =>
    (s.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.subtitle || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">medical_services</span>
            Manage Healthcare Services
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configure dynamic services showcased on the patient homepage and throughout the portal.
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm active:scale-95"
        >
          <MdAdd size={18} /> Add New Service
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <MdSearch className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search services by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Showing <strong className="text-slate-800">{filteredServices.length}</strong> of {services.length} services
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Service</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Target Link</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider text-center">Order</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">Loading services...</td>
                </tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    No services found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#275B99] flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
                          {renderServiceIcon(service.icon, "w-5 h-5")}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            {service.title}
                            {service.badge && (
                              <span className="text-[10px] font-black px-2 py-0.5 bg-green-50 text-[#4D9B2A] border border-green-200 rounded-full">
                                {service.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium mt-0.5">{service.subtitle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                      {service.description || '—'}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-700">
                      <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg text-[11px]">
                        {service.path}
                        <MdOpenInNew size={12} className="text-slate-400" />
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-700">
                      #{service.display_order || 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {service.is_active ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                          <MdCheckCircle size={14} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                          <MdCancel size={14} /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenModal(service)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Service"
                        >
                          <MdEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Service"
                        >
                          <MdDelete size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-black text-xl text-slate-900">
                  {editingService ? 'Edit Healthcare Service' : 'Add New Healthcare Service'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Fill in the details below. This service will automatically render on the patient homepage.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Service Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Clinical Specialists, Dialysis Care"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Subtitle / Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Expert consultations"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Badge / Tag (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 24/7, Popular, Verified"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of clinical capability and patient benefit..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Icon
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer"
                  >
                    {ICON_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Destination Page / Action Link
                  </label>
                  <div className="space-y-2">
                    <select
                      value={customPath ? 'custom' : formData.path}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setCustomPath(true);
                        } else {
                          setCustomPath(false);
                          setFormData({ ...formData, path: e.target.value });
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer"
                    >
                      {ROUTE_OPTIONS.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>

                    {customPath && (
                      <input
                        type="text"
                        placeholder="Enter custom path, e.g. /specialties/cardio or https://..."
                        value={formData.path}
                        onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                      />
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2 flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div>
                    <div className="font-bold text-slate-800">Active on Patient Website</div>
                    <div className="text-[11px] text-slate-500">When enabled, this service card is visible on the home page.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
                >
                  {editingService ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
