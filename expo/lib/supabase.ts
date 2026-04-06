import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://cdmgwukshlipzuycwqud.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbWd3dWtzaGxpcHp1eWN3cXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMzc5NDEsImV4cCI6MjA5MDkxMzk0MX0.MXaUN27sQVXtjE7SLucx1fm569IhWYKYD1R8ahP72';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
