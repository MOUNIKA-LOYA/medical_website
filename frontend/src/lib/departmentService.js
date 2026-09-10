import { supabase } from './supabaseClient';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000';
const STORAGE_KEY = 'prana_medical_departments';

export const DEFAULT_DEPARTMENTS = [
  { id: 'dept-1', name: 'Cardiology', description: 'Comprehensive cardiac evaluations, angioplasty, and cardiovascular wellness programs.', icon: 'favorite' },
  { id: 'dept-2', name: 'Neurology', description: 'Expert treatment for stroke, epilepsy, neuromuscular conditions, and spine disorders.', icon: 'psychology' },
  { id: 'dept-3', name: 'Orthopedics', description: 'Joint replacement, fracture treatment, sports trauma rehabilitation, and spine surgery.', icon: 'accessibility_new' },
  { id: 'dept-4', name: 'Pediatrics', description: 'Compassionate pediatric healthcare, immunization, neonatal intensive care, and development tracking.', icon: 'child_care' },
  { id: 'dept-5', name: 'Gastroenterology', description: 'Treatment for digestive system disorders, endoscopy, liver wellness, and metabolic care.', icon: 'medical_services' },
  { id: 'dept-6', name: 'Dermatology', description: 'Advanced therapeutic skincare, cosmetic dermatology, allergy testing, and minor laser procedures.', icon: 'health_and_safety' },
  { id: 'dept-7', name: 'Oncology', description: 'Multidisciplinary oncology care, targeted chemotherapy, surgical oncology, and patient support.', icon: 'medication' },
  { id: 'dept-8', name: 'ENT', description: 'Ear, nose, and throat diagnostic evaluation, microsurgery, and audiometric screenings.', icon: 'hearing' },
  { id: 'dept-9', name: 'General Medicine', description: 'Primary diagnosis, preventive checkups, seasonal infections, and chronic illness care.', icon: 'medical_services' }
];

const getStoredDepartments = () => {
  if (typeof window === 'undefined') return DEFAULT_DEPARTMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading departments from localStorage:', e);
  }
  return DEFAULT_DEPARTMENTS;
};

const setStoredDepartments = (departments) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(departments));
  } catch (e) {
    console.warn('Error saving departments to localStorage:', e);
  }
};

export const departmentService = {
  /**
   * Get all medical departments (Supabase + Backend + LocalStorage merge)
   */
  async getDepartments() {
    let merged = new Map();

    // 1. Seed defaults first
    DEFAULT_DEPARTMENTS.forEach(d => merged.set(d.name.toLowerCase().trim(), d));

    // 2. Load stored local departments
    const local = getStoredDepartments();
    local.forEach(d => merged.set(d.name.toLowerCase().trim(), d));

    // 3. Try Backend API
    try {
      const res = await fetch(`${BACKEND_URL}/api/departments`);
      if (res.ok) {
        const backendData = await res.json();
        if (Array.isArray(backendData)) {
          backendData.forEach(d => merged.set(d.name.toLowerCase().trim(), d));
        }
      }
    } catch (e) {
      // Backend not running, proceed to Supabase
    }

    // 4. Try Supabase Client
    try {
      const { data, error } = await supabase.from('departments').select('*');
      if (!error && Array.isArray(data)) {
        data.forEach(d => merged.set(d.name.toLowerCase().trim(), d));
      }
    } catch (e) {
      console.warn('Supabase query failed:', e);
    }

    const list = Array.from(merged.values()).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    setStoredDepartments(list);
    return list;
  },

  /**
   * Create a new medical department
   */
  async createDepartment(deptData) {
    const newDept = {
      id: deptData.id || 'dept-' + Date.now(),
      name: deptData.name.trim(),
      description: deptData.description ? deptData.description.trim() : '',
      icon: deptData.icon || 'medical_services'
    };

    // 1. Try Backend API
    try {
      const res = await fetch(`${BACKEND_URL}/api/departments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDept)
      });
      if (res.ok) {
        const data = await res.json();
        const current = getStoredDepartments();
        const updated = [...current.filter(d => d.name.toLowerCase() !== data.name.toLowerCase()), data];
        setStoredDepartments(updated);
        return data;
      }
    } catch (e) {
      console.warn('Backend create department failed, trying Supabase/Local:', e);
    }

    // 2. Try Supabase Client
    try {
      const { data, error } = await supabase.from('departments').insert([newDept]).select();
      if (!error && data && data.length > 0) {
        const current = getStoredDepartments();
        const updated = [...current.filter(d => d.name.toLowerCase() !== data[0].name.toLowerCase()), data[0]];
        setStoredDepartments(updated);
        return data[0];
      }
    } catch (e) {
      console.warn('Supabase insert failed (possibly RLS):', e);
    }

    // 3. Fallback to LocalStorage (Always succeeds!)
    const current = getStoredDepartments();
    const updated = [...current.filter(d => d.name.toLowerCase() !== newDept.name.toLowerCase()), newDept];
    setStoredDepartments(updated);
    return newDept;
  },

  /**
   * Update a medical department
   */
  async updateDepartment(id, deptData) {
    const payload = {
      name: deptData.name.trim(),
      description: deptData.description ? deptData.description.trim() : '',
      icon: deptData.icon || 'medical_services'
    };

    // 1. Try Backend API
    try {
      const res = await fetch(`${BACKEND_URL}/api/departments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        const current = getStoredDepartments();
        const updated = current.map(d => (d.id === id ? { ...d, ...data } : d));
        setStoredDepartments(updated);
        return data;
      }
    } catch (e) {
      console.warn('Backend update department failed:', e);
    }

    // 2. Try Supabase Client
    try {
      const { data, error } = await supabase.from('departments').update(payload).eq('id', id).select();
      if (!error && data && data.length > 0) {
        const current = getStoredDepartments();
        const updated = current.map(d => (d.id === id ? { ...d, ...data[0] } : d));
        setStoredDepartments(updated);
        return data[0];
      }
    } catch (e) {
      console.warn('Supabase update department failed:', e);
    }

    // 3. Fallback to LocalStorage
    const current = getStoredDepartments();
    const updated = current.map(d => (d.id === id ? { ...d, ...payload } : d));
    setStoredDepartments(updated);
    return { id, ...payload };
  },

  /**
   * Delete a medical department
   */
  async deleteDepartment(id) {
    // 1. Try Backend API
    try {
      const res = await fetch(`${BACKEND_URL}/api/departments/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const current = getStoredDepartments();
        const updated = current.filter(d => d.id !== id);
        setStoredDepartments(updated);
        return true;
      }
    } catch (e) {
      console.warn('Backend delete department failed:', e);
    }

    // 2. Try Supabase Client
    try {
      await supabase.from('departments').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete department failed:', e);
    }

    // 3. Update LocalStorage
    const current = getStoredDepartments();
    const updated = current.filter(d => d.id !== id);
    setStoredDepartments(updated);
    return true;
  }
};
