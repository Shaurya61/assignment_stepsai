import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sxwrwyiizlgncqtwmjqt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4d3J3eWlpemxnbmNxdHdtanF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjEyNDE0NDksImV4cCI6MjAzNjgxNzQ0OX0.V7brluJ8a9llx7oZrlsRQI5VrScFeF92T8eeHeq7EcA';

export const supabase = createClient(supabaseUrl, supabaseKey);
