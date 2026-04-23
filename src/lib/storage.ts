import { Habit } from '../types';
import { supabase } from './supabaseClient';

export const storage = {
  getHabits: async (): Promise<Habit[]> => {
    const { data, error } = await supabase
      .from('habits')
      .select(`*, logs (*)`);

    if (error) {
      console.error('Error fetching habits:', error);
      return [];
    }

    return (data || []).map((h: any) => ({
      id: h.id,
      name: h.name,
      description: h.description,
      category: h.category,
      frequency: h.frequency,
      targetValue: h.target_value,
      unit: h.unit,
      color: h.color,
      icon: h.icon,
      createdAt: h.created_at,
      reminderTime: h.reminder_time,
      customDays: h.custom_days,
      logs: (h.logs || []).map((l: any) => ({
        date: l.date,
        completed: l.completed,
        value: l.value
      }))
    }));
  },

  addHabit: async (habit: Habit) => {
    const { error } = await supabase.from('habits').insert({
      id: habit.id,
      name: habit.name,
      description: habit.description,
      category: habit.category,
      frequency: habit.frequency,
      target_value: habit.targetValue,
      unit: habit.unit,
      color: habit.color,
      icon: habit.icon,
      reminder_time: habit.reminderTime ?? null,
      custom_days: habit.customDays ?? null
    });

    if (error) {
      console.error('Error adding habit:', error);
      throw error;
    }
  },

  deleteHabit: async (id: string) => {
    const { error } = await supabase.from('habits').delete().eq('id', id);
    if (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  },

  addLog: async (habitId: string, date: string, value: number) => {
    const { error } = await supabase.from('logs').insert({
      habit_id: habitId,
      date,
      completed: true,
      value
    });
    if (error) {
      console.error('Error adding log:', error);
      throw error;
    }
  },

  deleteLog: async (habitId: string, date: string) => {
    const { error } = await supabase
      .from('logs')
      .delete()
      .match({ habit_id: habitId, date });
    if (error) {
      console.error('Error deleting log:', error);
      throw error;
    }
  },

  getDailyNote: async (date: string): Promise<string> => {
    const { data, error } = await supabase
      .from('daily_notes')
      .select('content')
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
      console.error('Error fetching daily note:', error);
    }

    return data?.content || '';
  },

  saveDailyNote: async (date: string, content: string) => {
    const { error } = await supabase
      .from('daily_notes')
      .upsert({ date, content, updated_at: new Date().toISOString() });

    if (error) {
      console.error('Error saving daily note:', error);
      throw error;
    }
  },

  getAllDailyNotes: async (): Promise<DailyNote[]> => {
    const { data, error } = await supabase
      .from('daily_notes')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching all daily notes:', error);
      return [];
    }

    return data || [];
  }
};
