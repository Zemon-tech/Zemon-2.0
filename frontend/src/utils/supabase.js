import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Ensure the URL has the correct protocol
if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  supabaseUrl = `https://${supabaseUrl}`;
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'api'
  }
});

// Only set up realtime if we need it for chat
if (window.location.pathname.includes('/chat')) {
  const channel = supabase.channel('system');
  channel
    .on('presence', { event: 'sync' }, () => {
      console.log('Realtime presence synced');
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Connected to Supabase realtime');
      }
    });
} 