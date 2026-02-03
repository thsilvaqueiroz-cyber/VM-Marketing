
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || "https://kdohrbadfrfgnrzuxtxw.supabase.co"; 
const SUPABASE_KEY = process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtkb2hyYmFkZnJmZ25yenV4dHh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MDI0MTQsImV4cCI6MjA4NTE3ODQxNH0.7PSXcFkM-FvFKEeN8XHmEnmu3VzIl1YuQR5xqzaNiJM";

const getStoredCreds = () => {
  const localUrl = localStorage.getItem('vm_crm_sb_url');
  const localKey = localStorage.getItem('vm_crm_sb_key');
  return { url: localUrl || SUPABASE_URL, key: localKey || SUPABASE_KEY };
};

const creds = getStoredCreds();

let supabaseClient: any = null;

if (creds.url && creds.key) {
  try {
    supabaseClient = createClient(creds.url, creds.key);
  } catch (e) {
    console.error("Erro ao inicializar Supabase:", e);
  }
}

export const supabase = supabaseClient;
