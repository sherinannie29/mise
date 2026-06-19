import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-url-polyfill/auto";

const SUPABASE_URL = "https://cdkpvdioxogqmihtrsug.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNka3B2ZGlveG9ncW1paHRyc3VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0Nzg1NDksImV4cCI6MjA5NzA1NDU0OX0.T13pKUJ46eWrp8oDukCIzrh9VcSVkpdv0V9ZwbJ4X-s";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
