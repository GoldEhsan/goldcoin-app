const { createClient } = require('@supabase/supabase-js');

// IMPORTANT: In a real production application, these values should be stored
// in environment variables (.env file) for security, not hardcoded.
// For this task, we are using the credentials provided directly.
const supabaseUrl = 'https://ttlhvoabhpvfrytygffz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0bGh2b2FiaHB2ZnJ5dHlnZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3ODM2MjEsImV4cCI6MjA3MDM1OTYyMX0.wCdsfbDP93paOciNA01swK2CanLo-APeYEScO9YeZVU';

// Create and export the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
