import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get Supabase URL and key from environment variables
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL and Anon Key not found. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      storage: require('@react-native-async-storage/async-storage').default,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Database types (update these based on your schema)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          photo_url: string | null;
          created_at: string;
        };
      };
      diary_entries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          type: 'Hike' | 'Run' | 'Ski';
          duration: string;
          distance: string;
          max_speed: string;
          created_at: string;
        };
      };
      feed_posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          image_url: string | null;
          likes_count: number;
          created_at: string;
        };
      };
    };
  };
}
