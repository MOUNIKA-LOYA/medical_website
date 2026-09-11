import { supabase } from './supabaseClient';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000';
const STORAGE_KEY = 'prana_healthcare_services';

export const DEFAULT_SERVICES = [
  {
    id: 'serv-1',
    title: 'Clinical Specialists',
    subtitle: 'Expert consultations',
    description: 'Comprehensive evaluations with board-certified physicians across multiple specialized disciplines.',
    icon: 'Stethoscope',
    path: '/doctors',
    badge: 'Top Rated',
    is_active: true,
    display_order: 1,
    bg_color: 'bg-blue-50 text-[#275B99]'
  },
  {
    id: 'serv-2',
    title: 'Our Care Facilities',
    subtitle: 'State-of-the-art centers',
    description: 'Leading hospitals equipped with modern diagnostic units, trauma suites, and comfortable rooms.',
    icon: 'Building2',
    path: '/hospitals',
    badge: 'Verified',
    is_active: true,
    display_order: 2,
    bg_color: 'bg-green-50 text-[#4D9B2A]'
  },
  {
    id: 'serv-3',
    title: 'Direct Coverage',
    subtitle: 'Stress-free billing',
    description: 'Seamless cashless hospital admission and immediate insurance pre-authorization with major providers.',
    icon: 'ShieldCheck',
    path: '/insurance',
    badge: 'Cashless',
    is_active: true,
    display_order: 3,
    bg_color: 'bg-blue-50 text-[#275B99]'
  },
  {
    id: 'serv-4',
    title: 'Wellness Panels',
    subtitle: 'Proactive screenings',
    description: 'Thorough full-body preventative health checkups, cardiovascular panels, and executive wellness packages.',
    icon: 'Activity',
    path: '/packages',
    badge: 'Popular',
    is_active: true,
    display_order: 4,
    bg_color: 'bg-green-50 text-[#4D9B2A]'
  },
  {
    id: 'serv-5',
    title: 'Advanced Diagnostics',
    subtitle: 'High-precision testing',
    description: 'State-of-the-art radiology, clinical pathology, and imaging facilities delivering rapid digital reports.',
    icon: 'Microscope',
    path: '/book-appointment',
    badge: '24h Reports',
    is_active: true,
    display_order: 5,
    bg_color: 'bg-blue-50 text-[#275B99]'
  },
  {
    id: 'serv-6',
    title: 'Immediate Response',
    subtitle: '24/7 emergency dispatch',
    description: 'Round-the-clock priority trauma triage, rapid critical ambulance transport, and acute care assistance.',
    icon: 'Phone',
    path: '/book-appointment',
    badge: '24/7 Urgent',
    is_active: true,
    display_order: 6,
    bg_color: 'bg-green-50 text-[#4D9B2A]'
  }
];

const getStoredServices = () => {
  if (typeof window === 'undefined') return DEFAULT_SERVICES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading services from localStorage:', e);
  }
  return DEFAULT_SERVICES;
};

const setStoredServices = (services) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
  } catch (e) {
    console.warn('Error saving services to localStorage:', e);
  }
};

const notifyServicesUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('services_updated'));
  }
};

export const serviceService = {
  /**
   * Get all healthcare services (Merged from Supabase + Backend + LocalStorage + Defaults)
   */
  async getServices() {
    let merged = new Map();

    // 1. Seed defaults first
    DEFAULT_SERVICES.forEach(s => merged.set(s.id || s.title.toLowerCase().trim(), s));

    // 2. Load stored local services
    const local = getStoredServices();
    if (Array.isArray(local)) {
      local.forEach(s => merged.set(s.id || s.title.toLowerCase().trim(), s));
    }

    // 3. Try Supabase Client
    try {
      const { data, error } = await supabase.from('services').select('*').order('display_order', { ascending: true });
      if (!error && Array.isArray(data) && data.length > 0) {
        data.forEach(s => merged.set(s.id || s.title.toLowerCase().trim(), s));
      }
    } catch (e) {
      console.warn('Supabase query for services skipped:', e);
    }

    // 4. Try Backend API
    try {
      const res = await fetch(`${BACKEND_URL}/api/services`);
      if (res.ok) {
        const backendData = await res.json();
        if (Array.isArray(backendData) && backendData.length > 0) {
          backendData.forEach(s => merged.set(s.id || s.title.toLowerCase().trim(), s));
        }
      }
    } catch (err) {
      // Backend offline/serverless, continue with merged data
    }

    const list = Array.from(merged.values()).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    setStoredServices(list);
    return list;
  },

  /**
   * Create a new healthcare service
   */
  async createService(serviceData) {
    const newService = {
      id: serviceData.id || 'serv-' + Date.now(),
      title: serviceData.title.trim(),
      subtitle: serviceData.subtitle ? serviceData.subtitle.trim() : '',
      description: serviceData.description ? serviceData.description.trim() : '',
      icon: serviceData.icon || 'Stethoscope',
      path: serviceData.path || '/doctors',
      badge: serviceData.badge ? serviceData.badge.trim() : '',
      is_active: serviceData.is_active !== undefined ? serviceData.is_active : true,
      display_order: serviceData.display_order ? parseInt(serviceData.display_order) : 0,
      bg_color: serviceData.bg_color || 'bg-blue-50 text-[#275B99]'
    };

    // 1. Try Supabase
    try {
      await supabase.from('services').upsert(newService);
    } catch (e) {
      console.warn('Supabase insert service skipped:', e);
    }

    // 2. Try Backend
    try {
      await fetch(`${BACKEND_URL}/api/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService)
      });
    } catch (e) {
      console.warn('Backend insert service skipped:', e);
    }

    // 3. Save locally
    const current = getStoredServices();
    const updated = [...current.filter(s => s.id !== newService.id), newService];
    setStoredServices(updated);

    notifyServicesUpdated();
    return newService;
  },

  /**
   * Update an existing healthcare service
   */
  async updateService(id, serviceData) {
    const payload = {
      title: serviceData.title.trim(),
      subtitle: serviceData.subtitle ? serviceData.subtitle.trim() : '',
      description: serviceData.description ? serviceData.description.trim() : '',
      icon: serviceData.icon || 'Stethoscope',
      path: serviceData.path || '/doctors',
      badge: serviceData.badge ? serviceData.badge.trim() : '',
      is_active: serviceData.is_active !== undefined ? serviceData.is_active : true,
      display_order: serviceData.display_order ? parseInt(serviceData.display_order) : 0,
      bg_color: serviceData.bg_color || 'bg-blue-50 text-[#275B99]'
    };

    // 1. Try Supabase
    try {
      await supabase.from('services').update(payload).eq('id', id);
    } catch (e) {
      console.warn('Supabase update service skipped:', e);
    }

    // 2. Try Backend
    try {
      await fetch(`${BACKEND_URL}/api/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn('Backend update service skipped:', e);
    }

    // 3. Update locally
    const current = getStoredServices();
    const updated = current.map(s => (s.id === id ? { ...s, ...payload } : s));
    setStoredServices(updated);

    notifyServicesUpdated();
    return { id, ...payload };
  },

  /**
   * Delete a service
   */
  async deleteService(id) {
    // 1. Try Supabase
    try {
      await supabase.from('services').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete service skipped:', e);
    }

    // 2. Try Backend
    try {
      await fetch(`${BACKEND_URL}/api/services/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn('Backend delete service skipped:', e);
    }

    // 3. Remove locally
    const current = getStoredServices();
    const updated = current.filter(s => s.id !== id);
    setStoredServices(updated);

    notifyServicesUpdated();
    return true;
  }
};

