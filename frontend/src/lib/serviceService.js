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

export const serviceService = {
  /**
   * Get all healthcare services
   */
  async getServices() {
    try {
      const res = await fetch(`${BACKEND_URL}/api/services`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setStoredServices(data);
          return data;
        }
      }
    } catch (err) {
      console.warn('Backend query for services failed, using local store:', err);
    }
    return getStoredServices();
  },

  /**
   * Create a new healthcare service
   */
  async createService(serviceData) {
    const newService = {
      id: 'serv-' + Date.now(),
      title: serviceData.title,
      subtitle: serviceData.subtitle || '',
      description: serviceData.description || '',
      icon: serviceData.icon || 'Stethoscope',
      path: serviceData.path || '/doctors',
      badge: serviceData.badge || '',
      is_active: serviceData.is_active !== undefined ? serviceData.is_active : true,
      display_order: serviceData.display_order ? parseInt(serviceData.display_order) : 0,
      bg_color: serviceData.bg_color || 'bg-blue-50 text-[#275B99]'
    };

    // 1. Try Backend
    try {
      const res = await fetch(`${BACKEND_URL}/api/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService)
      });
      if (res.ok) {
        const data = await res.json();
        const current = getStoredServices();
        setStoredServices([...current, data]);
        return data;
      }
    } catch (e) {
      console.warn('Failed to save service on backend, storing locally:', e);
    }

    // 2. Fallback to local storage
    const current = getStoredServices();
    const updated = [...current, newService];
    setStoredServices(updated);
    return newService;
  },

  /**
   * Update an existing healthcare service
   */
  async updateService(id, serviceData) {
    const payload = {
      title: serviceData.title,
      subtitle: serviceData.subtitle || '',
      description: serviceData.description || '',
      icon: serviceData.icon || 'Stethoscope',
      path: serviceData.path || '/doctors',
      badge: serviceData.badge || '',
      is_active: serviceData.is_active !== undefined ? serviceData.is_active : true,
      display_order: serviceData.display_order ? parseInt(serviceData.display_order) : 0,
      bg_color: serviceData.bg_color || 'bg-blue-50 text-[#275B99]'
    };

    // 1. Try Backend
    try {
      const res = await fetch(`${BACKEND_URL}/api/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        const current = getStoredServices();
        const updated = current.map(s => (s.id === id ? { ...s, ...data } : s));
        setStoredServices(updated);
        return data;
      }
    } catch (e) {
      console.warn('Failed to update service on backend, updating locally:', e);
    }

    // 2. Fallback to local storage
    const current = getStoredServices();
    const updated = current.map(s => (s.id === id ? { ...s, ...payload } : s));
    setStoredServices(updated);
    return { id, ...payload };
  },

  /**
   * Delete a service
   */
  async deleteService(id) {
    // 1. Try Backend
    try {
      const res = await fetch(`${BACKEND_URL}/api/services/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const current = getStoredServices();
        const updated = current.filter(s => s.id !== id);
        setStoredServices(updated);
        return true;
      }
    } catch (e) {
      console.warn('Failed to delete service on backend, removing locally:', e);
    }

    // 2. Fallback to local storage
    const current = getStoredServices();
    const updated = current.filter(s => s.id !== id);
    setStoredServices(updated);
    return true;
  }
};
