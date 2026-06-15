import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://cdkpvdioxogqmihtrsug.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNka3B2ZGlveG9ncW1paHRyc3VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0Nzg1NDksImV4cCI6MjA5NzA1NDU0OX0.T13pKUJ46eWrp8oDukCIzrh9VcSVkpdv0V9ZwbJ4X-s"
);
