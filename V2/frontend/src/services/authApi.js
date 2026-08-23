import { supabase } from './supabaseClient';

// This helper converts a plain username into an email format that Supabase accepts
const formatUsername = (username) => {
  const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '');
  return `${cleanUsername}@roomtracker.local`;
};

export const authApi = {
  signIn: async (username, password) => {
    const email = formatUsername(username);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  
  signUp: async (username, password) => {
    const email = formatUsername(username);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },
  
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },
  
  onAuthStateChange: (callback) => {
    const { data } = supabase.auth.onAuthStateChange(callback);
    return data.subscription;
  }
};
