import React, { useEffect, useState, useCallback } from 'react';
import { departmentService } from '@/lib/departmentService';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdApartment } from 'react-icons/md';

const DEPARTMENT_ICONS = [
  { label: 'Cardiology (Heart)', value: 'favorite' },
  { label: 'Neurology (Brain/Mind)', value: 'psychology' },
  { label: 'Orthopedics (Bones/Joints)', value: 'accessibility_new' },
  { label: 'Pediatrics (Child Care)', value: 'child_care' },
  { label: 'Gastroenterology (Digestive)', value: 'medical_services' },
  { label: 'Dermatology (Skin)', value: 'health_and_safety' },
  { label: 'Oncology (Cancer Care)', value: 'medication' },
  { label: 'ENT (Ear, Nose, Throat)', value: 'hearing' },
  { label: 'Ophthalmology (Eyes)', value: 'visibility' },
  { label: 'Dental / Oral Care', value: 'dentistry' },
  { label: 'Emergency / Trauma', value: 'emergency' },
  { label: 'Radiology / X-Ray', value: 'biotech' },
  { label: 'General / Clinical', value: 'clinical_notes' },
];

const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', icon: 'medical_services' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await departmentService.getDepartments();
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (dept = null) => {
    if (dept) {
      setEditingDepartment(dept);
      setFormData({
        name: dept.name || '',
        description: dept.description || '',
        icon: dept.icon || 'medical_services'
      });
    } else {
      setEditingDepartment(null);
      setFormData({ name: '', description: '', icon: 'medical_services' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      return alert('Department name is required');
    }

    try {
      if (editingDepartment) {
        await departmentService.updateDepartment(editingDepartment.id, formData);
      } else {
        await departmentService.createDepartment(formData);
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (error) {
      alert('Error saving department: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department? Doctors and consultations under this department will be impacted.')) {
      try {
        await departmentService.deleteDepartment(id);
        fetchData();
      } catch (error) {
        alert('Error deleting department: ' + error.message);
      }
    }
  };

  const filteredDepartments = departments.filter(dept =>
    (dept.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (dept.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">apartment</span>
            Manage Medical Departments
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Dynamically add and organize medical specialties across doctors, appointments, and hospital wings.
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm active:scale-95"
        >
          <MdAdd size={18} /> Add New Department
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
              placeholder="Search departments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Total output: <strong className="text-slate-800">{filteredDepartments.length}</strong> departments
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Department / Specialty</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-slate-400">Loading departments...</td>
                </tr>
              ) : filteredDepartments.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-slate-400">
                    No departments found matching your search.
                  </td>
                </tr>
              ) : (
                filteredDepartments.map((dept) => (
                  <tr key={dept.id || dept.name} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#275B99] flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
                          <span className="material-symbols-outlined text-2xl">
                            {dept.icon || 'medical_services'}
                          </span>
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{dept.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Icon: {dept.icon || 'medical_services'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-md">
                      {dept.description || 'Specialized diagnostic procedures and advanced clinical care.'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenModal(dept)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Department"
                        >
                          <MdEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(dept.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Department"
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
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-black text-xl text-slate-900">
                  {editingDepartment ? 'Edit Medical Department' : 'Add New Department'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Define department metadata and select a specialty icon.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Department Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neurology, Cardiology, Orthopedics"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Department Icon
                </label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer mb-2"
                >
                  {DEPARTMENT_ICONS.map(i => (
                    <option key={i.value} value={i.value}>{i.label}</option>
                  ))}
                  <option value="custom">Custom Icon Name...</option>
                </select>

                <input
                  type="text"
                  placeholder="Or enter any Google Material Symbol name..."
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-xs text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Clinical Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe conditions treated, specialized therapies, and diagnostic capabilities..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                />
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
                  {editingDepartment ? 'Save Changes' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDepartments;
