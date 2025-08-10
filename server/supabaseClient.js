const { createClient } = require('@supabase/supabase-js');

// IMPORTANT: In a real production application, these values should be stored
// in environment variables (.env file) for security, not hardcoded.
// For this task, we are using the credentials provided directly.
const supabaseUrl = 'https://jfskomtpgtsnkbabhngs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impmc2tvbXRwZ3RzbmtiYWJobmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3ODE2NzYsImV4cCI6MjA3MDM1NzY3Nn0.Y5xm9u_wWrYcD7I5aZUvNgUNimVSWQrLarfFtgiPsCc';

// Create and export the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
