export type HabitCategory = 'Health' | 'Productivity' | 'Personal' | 'Finance' | 'Social';

export interface HabitLog {
  date: string; // ISO string (YYYY-MM-DD)
  completed: boolean;
  value?: number; // For habits like "Drink 2L water" where value matters
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  category: HabitCategory;
  frequency: 'daily' | 'weekly' | 'custom';
  targetValue: number; // e.g., 1 for binary, 2000 for ml of water
  unit: string; // e.g., 'times', 'ml', 'min'
  color: string; // Pastel color hex
  icon: string; // Lucide icon name
  createdAt: string;
  reminderTime?: string; // HH:mm
  customDays?: number[]; // 0-6 for Sunday-Saturday
  logs: HabitLog[];
}

export interface UserStats {
  totalCompletions: number;
  currentStreak: number;
  bestStreak: number;
}
