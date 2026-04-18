import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Activity, Droplets, BookOpen, Heart, Zap, Coffee, Moon, Sun } from 'lucide-react';
import { Habit, HabitCategory } from '../types';
import { cn } from '../lib/utils';

const CATEGORIES: { name: HabitCategory, color: string, icon: any }[] = [
  { name: 'Health', color: 'green', icon: Heart },
  { name: 'Productivity', color: 'blue', icon: Zap },
  { name: 'Personal', color: 'purple', icon: BookOpen },
  { name: 'Finance', color: 'yellow', icon: Coffee },
  { name: 'Social', color: 'pink', icon: Activity },
];

const ICONS = [Activity, Droplets, BookOpen, Heart, Zap, Coffee, Moon, Sun];

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (habit: Habit) => void;
}

export default function HabitModal({ isOpen, onClose, onAdd }: HabitModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('Health');
  const [target, setTarget] = useState('1');
  const [unit, setUnit] = useState('times');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [reminder, setReminder] = useState('');

  const toggleDay = (day: number) => {
    setCustomDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name,
      description,
      category,
      frequency,
      targetValue: parseInt(target),
      unit,
      color: category.toLowerCase() as any, // Simple mapping for now
      icon: 'Activity', // Should pick from ICONS
      createdAt: new Date().toISOString(),
      reminderTime: reminder || undefined,
      customDays: frequency === 'custom' ? customDays : undefined,
      logs: []
    };
    onAdd(newHabit);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={e => e.stopPropagation()}
                className="bg-white w-full max-w-xl rounded-[32px] border-2 border-bento-border shadow-bento p-10 relative overflow-hidden"
              >
                <button 
                  onClick={onClose}
                  className="absolute top-8 right-8 p-2 text-bento-text-soft hover:text-bento-text hover:bg-bento-bg rounded-lg border-2 border-transparent hover:border-bento-border transition-all"
                >
                  <X size={24} strokeWidth={3} />
                </button>

                <div className="mb-10">
                  <h2 className="text-3xl font-display font-black text-bento-text mb-2 uppercase tracking-tight">New Focus</h2>
                  <p className="text-bento-text-soft font-bold text-sm">Build a better you, one small step at a time</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-bento-text-soft mb-3 px-1">Habit Name</label>
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g., Morning Meditation"
                      className="w-full px-6 py-4 bg-white border-2 border-bento-border rounded-2xl text-bento-text font-bold placeholder:text-bento-text-soft/30 outline-none focus:bg-bento-bg transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-bento-text-soft mb-3 px-1">Goal Value</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          value={target}
                          onChange={e => setTarget(e.target.value)}
                          className="w-20 px-4 py-3 bg-white border-2 border-bento-border rounded-xl text-bento-text font-bold outline-none"
                        />
                        <input
                          type="text"
                          value={unit}
                          onChange={e => setUnit(e.target.value)}
                          placeholder="unit (ml...)"
                          className="flex-grow px-4 py-3 bg-white border-2 border-bento-border rounded-xl text-bento-text font-bold outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-bento-text-soft mb-3 px-1">Reminder</label>
                      <input
                        type="time"
                        value={reminder}
                        onChange={e => setReminder(e.target.value)}
                        className="w-full px-4 py-3 bg-white border-2 border-bento-border rounded-xl text-bento-text font-bold outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-bento-text-soft mb-3 px-1">Frequency</label>
                    <div className="flex gap-3 mb-4">
                      {(['daily', 'weekly', 'custom'] as const).map(f => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFrequency(f)}
                          className={cn(
                            "flex-1 px-4 py-3 rounded-xl border-2 transition-all font-bold text-xs uppercase",
                            frequency === f 
                              ? "bg-pastel-blue border-bento-border shadow-bento-sm text-bento-text" 
                              : "bg-white border-bento-border/10 text-bento-text-soft"
                          )}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                    {frequency === 'custom' && (
                      <div className="flex flex-wrap gap-2">
                        {DAYS.map((day, idx) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(idx)}
                            className={cn(
                              "w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all",
                              customDays.includes(idx)
                                ? "bg-pastel-pink border-bento-border text-bento-text"
                                : "bg-white border-bento-border/10 text-bento-text-soft"
                            )}
                          >
                            {day[0]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-bento-text-soft mb-3 px-1">Category</label>
                    <div className="flex flex-wrap gap-3">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat.name}
                          type="button"
                          onClick={() => setCategory(cat.name)}
                          className={cn(
                            "flex items-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all font-bold text-sm",
                            category === cat.name 
                              ? `bg-pastel-${cat.color} border-bento-border shadow-bento-sm text-bento-text` 
                              : "bg-white border-bento-border/10 text-bento-text-soft hover:border-bento-border/30 shadow-none"
                          )}
                        >
                          <cat.icon size={18} strokeWidth={2.5} />
                          <span>{cat.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="bento-button w-full py-5 bg-bento-border text-white text-lg flex items-center justify-center gap-3 shadow-bento active:shadow-none translate-x-[-4px] translate-y-[-4px] active:translate-x-0 active:translate-y-0"
                    >
                      <Check size={24} strokeWidth={3} />
                      <span className="uppercase tracking-widest">Create Habit</span>
                    </button>
                  </div>
                </form>
              </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
