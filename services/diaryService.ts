/**
 * Example service for Diary Entries using Supabase
 * This shows how to interact with your database
 */

import { supabase } from '../lib/supabase';

export interface DiaryEntry {
  id: string;
  user_id: string;
  date: string;
  type: 'Hike' | 'Run' | 'Ski';
  duration: string;
  distance: string;
  max_speed: string;
  notes?: string;
  created_at: string;
}

export const diaryService = {
  // Get all diary entries for current user
  async getEntries(): Promise<DiaryEntry[]> {
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Create a new diary entry
  async createEntry(entry: Omit<DiaryEntry, 'id' | 'user_id' | 'created_at'>): Promise<DiaryEntry> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('diary_entries')
      .insert({
        user_id: user.id,
        ...entry,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a diary entry
  async updateEntry(id: string, updates: Partial<DiaryEntry>): Promise<DiaryEntry> {
    const { data, error } = await supabase
      .from('diary_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a diary entry
  async deleteEntry(id: string): Promise<void> {
    const { error } = await supabase
      .from('diary_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
