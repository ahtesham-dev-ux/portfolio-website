// ==========================================
// SUPABASE CONFIGURATION
// ==========================================

// TODO: Replace with your Supabase project credentials
// Get these from: https://app.supabase.com/project/YOUR_PROJECT/settings/api

const SUPABASE_URL = 'https://ksdbjkoaavzpxzhispok.supabase.co';
// TODO: Paste your anon key below. Get it from Supabase Dashboard -> Settings -> API
const SUPABASE_ANON_KEY = 'sb_publishable_cU-tmt14ZZvDrDjWuB-5eQ_Pdpnz-sr';

// key validation
if (!SUPABASE_ANON_KEY.startsWith('ey')) {
    console.warn('⚠️ WARNING: Your Supabase Key does not look like a standard JWT (usually starts with "ey"). Authentication might fail.');
    // alert('⚠️ Config Warning: Your Supabase Key syntax looks incorrect. Please check JS/supabase-config.js');
}

// Initialize Supabase client
// Initialize Supabase client
// Check if Supabase library is loaded
if (!window.supabase || !window.supabase.createClient) {
    console.error('❌ Supabase library not loaded! Check your HTML script tags.');
} else {
    // Avoid naming conflict by using a different variable name
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Export globally
    window.supabaseClient = client;
    console.log('✅ Supabase initialized successfully!');
}
