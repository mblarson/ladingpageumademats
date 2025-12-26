
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAÇÃO DO SUPABASE ---
// 1. Vá em https://supabase.com/dashboard/project/_/settings/api
// 2. Copie a "Project URL" e cole abaixo em SUPABASE_URL
// 3. Copie a "anon" / "public" key e cole abaixo em SUPABASE_ANON_KEY

const SUPABASE_URL = 'https://qvsjlvdiuxuotlmdmtzr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2c2psdmRpdXh1b3RsbWRtdHpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3Mjc2NzksImV4cCI6MjA4MjMwMzY3OX0.dc726TbFIssNIyjNAe6E5lfB0786Osb2D3KG91yOQso';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
