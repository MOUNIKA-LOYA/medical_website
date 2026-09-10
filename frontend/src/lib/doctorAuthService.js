import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

const supabaseUrl =
  process.env.REACT_APP_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://xpwkgsiaavpzwjnflghe.supabase.co';

const supabaseAnonKey =
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_UT4qq3-iFC2KQatcMPKzpQ_rD-P1rmh';

// Isolated Supabase Client that does NOT alter the active Admin/User session in localStorage
const isolatedAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

const STORAGE_KEY = 'prana_doctor_credentials_vault';

// Initial pre-configured doctor credentials for testing/demo
const DEFAULT_CREDENTIALS = [
  {
    doctorId: 'doc_1',
    email: 'doctor1@hospital.com',
    password: 'doctor123',
    doctorName: 'Dr. Sarah Jenkins',
    updatedAt: new Date().toISOString(),
  },
  {
    doctorId: 'doc_2',
    email: 'doctor2@hospital.com',
    password: 'doctor123',
    doctorName: 'Dr. Marcus Vance',
    updatedAt: new Date().toISOString(),
  },
  {
    doctorId: 'doc_3',
    email: 'doctor3@hospital.com',
    password: 'doctor123',
    doctorName: 'Dr. Elena Rostova',
    updatedAt: new Date().toISOString(),
  },
];

export const doctorAuthService = {
  // Retrieve all stored credentials
  getAllCredentials() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading doctor credentials vault:', e);
    }
    return DEFAULT_CREDENTIALS;
  },

  // Save or update doctor credentials
  async saveCredentials({ doctorId, email, password, doctorName, phone }) {
    if (!email) throw new Error('Doctor login email is required');

    const normalizedEmail = email.trim().toLowerCase();
    const vault = this.getAllCredentials();
    const existingIndex = vault.findIndex(
      (c) =>
        (doctorId && c.doctorId === doctorId) ||
        c.email.toLowerCase() === normalizedEmail
    );

    const credentialEntry = {
      doctorId: doctorId || (existingIndex >= 0 ? vault[existingIndex].doctorId : `doc_${Date.now()}`),
      email: normalizedEmail,
      password: password || (existingIndex >= 0 ? vault[existingIndex].password : 'Doctor@123'),
      doctorName: doctorName || (existingIndex >= 0 ? vault[existingIndex].doctorName : 'Medical Doctor'),
      phone: phone || '',
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      vault[existingIndex] = { ...vault[existingIndex], ...credentialEntry };
    } else {
      vault.push(credentialEntry);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vault));
    } catch (e) {
      console.warn('Could not persist to localStorage:', e);
    }

    // Register in Supabase Auth in the background (using isolated client)
    if (password) {
      try {
        await isolatedAuthClient.auth.signUp({
          email: normalizedEmail,
          password: password,
          options: {
            data: {
              role: 'doctor',
              name: doctorName,
              doctor_id: credentialEntry.doctorId,
            },
          },
        });
      } catch (authErr) {
        console.info('Supabase Auth doctor signup note:', authErr.message);
      }
    }

    return credentialEntry;
  },

  // Get credentials for a specific doctor by ID or email
  getCredentialsByDoctorId(doctorId) {
    const vault = this.getAllCredentials();
    return vault.find((c) => c.doctorId === doctorId) || null;
  },

  getCredentialsByEmail(email) {
    if (!email) return null;
    const vault = this.getAllCredentials();
    return vault.find((c) => c.email.toLowerCase() === email.trim().toLowerCase()) || null;
  },

  // Verify login attempt
  async verifyDoctorLogin(email, password) {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const trimmedPassword = (password || '').trim();

    if (!normalizedEmail || !trimmedPassword) {
      throw new Error('Please enter both doctor email and password.');
    }

    // 1. Try Supabase Auth First
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: trimmedPassword,
      });

      if (!authError && authData?.session) {
        // Find doctor record
        let doctorId = null;
        let doctorName = 'Doctor';

        // Check in Supabase doctors table
        try {
          const { data: doc } = await supabase
            .from('doctors')
            .select('id, name')
            .eq('email', normalizedEmail)
            .single();
          if (doc) {
            doctorId = doc.id;
            doctorName = doc.name;
          }
        } catch (e) {
          // fallback
        }

        // Check in vault if not in db
        if (!doctorId) {
          const matched = this.getCredentialsByEmail(normalizedEmail);
          if (matched) {
            doctorId = matched.doctorId;
            doctorName = matched.doctorName;
          } else {
            doctorId = `doc_${normalizedEmail.split('@')[0]}`;
          }
        }

        return {
          success: true,
          doctorId,
          doctorName,
          email: normalizedEmail,
          source: 'supabase_auth',
        };
      }
    } catch (e) {
      console.info('Supabase Auth direct sign-in fallback:', e.message);
    }

    // 2. Check in Doctor Credentials Vault (Admin-assigned credentials)
    const storedCred = this.getCredentialsByEmail(normalizedEmail);
    if (storedCred) {
      if (storedCred.password === trimmedPassword) {
        return {
          success: true,
          doctorId: storedCred.doctorId,
          doctorName: storedCred.doctorName,
          email: normalizedEmail,
          source: 'vault',
        };
      } else {
        throw new Error('Incorrect password. Please verify the credentials provided by the hospital administrator.');
      }
    }

    // 3. Check for standard demo doctor accounts
    const mockDoctors = [
      'doctor1@gmail.com',
      'doctor2@gmail.com',
      'doctor3@gmail.com',
      'doctor1@hospital.com',
      'doctor2@hospital.com',
      'doctor3@hospital.com',
    ];

    if (mockDoctors.includes(normalizedEmail)) {
      if (trimmedPassword === 'doctor123' || trimmedPassword === 'admin123') {
        return {
          success: true,
          doctorId: `mock-${normalizedEmail.split('@')[0]}`,
          doctorName: `Dr. ${normalizedEmail.split('@')[0].toUpperCase()}`,
          email: normalizedEmail,
          source: 'demo_whitelist',
        };
      } else {
        throw new Error('Invalid password for demo doctor account. (Default: doctor123)');
      }
    }

    throw new Error('Doctor account not found. Please contact the administrator to register your doctor credentials.');
  },

  // Helper to generate a secure, easy-to-read password
  generateSecurePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let pass = 'Doc#';
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pass += '!';
    return pass;
  },
};
