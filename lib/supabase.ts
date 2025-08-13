import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nmjsrywvlycryjkzledp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tanNyeXd2bHljcnlqa3psZWRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODI2MTEsImV4cCI6MjA2NTE1ODYxMX0.68MqRbggg10WZqXNUxlgmf_mbiBxZl5bUsdRSdDWUZ0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);