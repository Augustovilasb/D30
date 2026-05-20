/* supabase.js — cliente Supabase compartilhado */

const SUPABASE_URL  = 'https://veikcmsypwylpokgwvjo.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlaWtjbXN5cHd5bHBva2d3dmpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMzkzNTMsImV4cCI6MjA5NDgxNTM1M30.P2I4Qs5gntu-VMs3Y0x2R1fUgowZOVwh5pE4Ehx_ah0';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

window.sb = supabase;
