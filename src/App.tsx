import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  LayoutDashboard,
  CheckCircle2,
  BarChart3,
  Settings,
  Calendar as CalendarIcon,
  Bell,
  Search,
  ChevronRight,
  User,
  MoreVertical,
  Activity,
  Droplets,
  Zap,
  BookOpen,
  Heart,
  Coffee,
  Moon,
  Sun,
  Flame,
  Trophy,
  Trash2,
  Edit2,
  History
} from 'lucide-react';
import { format, startOfToday, eachDayOfInterval, subDays, isSameDay, parseISO } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { Habit, HabitLog, DailyNote } from './types';
import { storage } from './lib/storage';
import { cn } from './lib/utils';
import HabitModal from './components/HabitModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';

// Icon Map for string to Component
const IconMap: Record<string, any> = {
  Activity,
  Droplets,
  BookOpen,
  Heart,
  Zap,
  Coffee,
  Moon,
  Sun
};

// Helper component for Nav Items
const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm border-2 border-transparent",
      active
        ? "bg-white border-bento-border shadow-bento-sm text-bento-text"
        : "text-bento-text-soft hover:bg-white/50"
    )}
  >
    <Icon size={18} />
    <span>{label}</span>
  </button>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'habits' | 'analytics' | 'timeline'>('dashboard');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [allNotes, setAllNotes] = useState<DailyNote[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyNote, setDailyNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    storage.getHabits().then(loaded => {
      setHabits(loaded);
      setIsLoading(false);
    });
    
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    storage.getDailyNote(todayStr).then(content => {
      setDailyNote(content);
    });

    storage.getAllDailyNotes().then(notes => {
      setAllNotes(notes);
    });
  }, []);

  const handleSaveDailyNote = async (content: string) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    setIsSavingNote(true);
    try {
      await storage.saveDailyNote(todayStr, content);
      // Refresh timeline data
      const notes = await storage.getAllDailyNotes();
      setAllNotes(notes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleAddHabit = async (newHabit: Habit) => {
    await storage.addHabit(newHabit);
    setHabits(prev => [...prev, { ...newHabit, logs: [] }]);
  };

  const handleDeleteHabit = async (id: string) => {
    await storage.deleteHabit(id);
    setHabits(prev => prev.filter(h => h.id !== id));
    setHabitToDelete(null);
  };

  const handleToggleHabit = async (id: string) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const isCompleted = habit.logs.some(l => l.date === todayStr);

    // Optimistic UI update
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const newLogs = isCompleted
        ? h.logs.filter(l => l.date !== todayStr)
        : [...h.logs, { date: todayStr, completed: true, value: h.targetValue }];
      return { ...h, logs: newLogs };
    }));

    // Persist to Supabase
    if (isCompleted) {
      await storage.deleteLog(id, todayStr);
    } else {
      await storage.addLog(id, todayStr, habit.targetValue);
    }
  };


  const today = startOfToday();
  const weekDays = eachDayOfInterval({
    start: subDays(today, 3),
    end: subDays(today, -3)
  });

  const habitsToComplete = habits.filter(h => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return !h.logs.some(l => l.date === todayStr);
  }).length;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bento-bg font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-bento-border border-t-pastel-pink rounded-full animate-spin" />
          <p className="font-black uppercase text-sm tracking-widest text-bento-text-soft">Loading Bloom...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-bento-bg p-8 gap-8 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 flex flex-col gap-8 shrink-0">
        <div className="logo flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-pastel-pink border-2 border-bento-border rounded-lg shadow-bento-sm"></div>
          <span className="text-2xl font-display font-black tracking-tight text-bento-text">Bloom</span>
        </div>

        <nav className="flex flex-col gap-2">
          <NavItem
            icon={LayoutDashboard}
            label="Dashboard"
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
          />
          <NavItem
            icon={CheckCircle2}
            label="All Habits"
            active={activeTab === 'habits'}
            onClick={() => setActiveTab('habits')}
          />
          <NavItem
            icon={BarChart3}
            label="Analytics"
            active={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
          />
          <NavItem
            icon={History}
            label="Timeline"
            active={activeTab === 'timeline'}
            onClick={() => setActiveTab('timeline')}
          />
        </nav>

        <div className="mt-auto flex flex-col gap-4">
          <div className="bg-white border-2 border-bento-border p-5 rounded-3xl shadow-bento-sm">
            <p className="text-xs font-black uppercase tracking-wider text-bento-text mb-1 italic">Pro Tip</p>
            <p className="text-xs text-bento-text-soft leading-relaxed font-semibold">
              Until death every failure is mental!
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-auto custom-scrollbar pr-4">
        <header className="flex items-center justify-between mb-8 pt-2">
          <div>
            <h1 className="text-3xl font-display font-black text-bento-text tracking-tight uppercase">Hello, Soni</h1>
            <p className="text-bento-text-soft font-bold text-sm">Grow your virtual garden today</p>
          </div>

          <div className="flex items-center gap-4">
            <button className="w-12 h-12 flex items-center justify-center bg-white border-2 border-bento-border rounded-full shadow-bento-sm text-bento-text hover:-translate-y-0.5 transition-transform">
              <Bell size={20} strokeWidth={2.5} />
            </button>
            <button className="w-12 h-12 flex items-center justify-center bg-white border-2 border-bento-border rounded-full shadow-bento-sm text-bento-text hover:-translate-y-0.5 transition-transform">
              <User size={20} strokeWidth={2.5} />
            </button>
          </div>
        </header>

        {/* Bento Grid Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'dashboard' && (
              <Dashboard 
                habits={habits} 
                weekDays={weekDays} 
                onToggle={handleToggleHabit} 
                onOpenAdd={() => setIsAddModalOpen(true)}
                dailyNote={dailyNote}
                setDailyNote={setDailyNote}
                isSaving={isSavingNote}
                onSaveNote={handleSaveDailyNote}
              />
            )}
            {activeTab === 'habits' && (
              <HabitsList 
                habits={habits.filter(h => 
                  h.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  h.description.toLowerCase().includes(searchTerm.toLowerCase())
                )} 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onDelete={(id) => setHabitToDelete(habits.find(h => h.id === id) || null)} 
              />
            )}
            {activeTab === 'analytics' && <Analytics habits={habits} />}
            {activeTab === 'timeline' && <TimelineView notes={allNotes} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <HabitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddHabit}
      />
      <DeleteConfirmationModal
        isOpen={!!habitToDelete}
        habitName={habitToDelete?.name || ''}
        onCancel={() => setHabitToDelete(null)}
        onConfirm={() => habitToDelete && handleDeleteHabit(habitToDelete.id)}
      />
    </div>
  );
}

function Dashboard({ 
  habits, 
  weekDays, 
  onToggle, 
  onOpenAdd,
  dailyNote,
  setDailyNote,
  isSaving,
  onSaveNote
}: { 
  habits: Habit[], 
  weekDays: Date[], 
  onToggle: (id: string) => void, 
  onOpenAdd: () => void,
  dailyNote: string,
  setDailyNote: (val: string) => void,
  isSaving: boolean,
  onSaveNote: (val: string) => void
}) {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [isEditingNote, setIsEditingNote] = useState(!dailyNote);

  // Sync edit mode with content on initial load
  useEffect(() => {
    if (dailyNote && isEditingNote) {
       // Only auto-flip if we just loaded data and it's not empty
       setIsEditingNote(false);
    }
  }, [dailyNote === '']); // Trigger only on first non-empty load

  // Debounce saving removed or kept as secondary, adding explicit save button logic
  const handleManualSave = () => {
    if (dailyNote) {
      onSaveNote(dailyNote);
      setIsEditingNote(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (dailyNote && isEditingNote) {
        onSaveNote(dailyNote);
      }
    }, 5000); // Very long debounce if editing, mostly rely on button now
    return () => clearTimeout(timer);
  }, [dailyNote]);

  // Calculate weekly completion rate
  const totalCompletions = weekDays.reduce((acc, day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return acc + habits.filter(h => h.logs.some(l => l.date === dateStr)).length;
  }, 0);
  const totalPossible = habits.length * weekDays.length;
  const weeklyRate = totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0;

  return (
    <div className="grid grid-cols-4 grid-rows-4 gap-5 h-full min-h-[700px]">
      {/* Today's Routine (Span 2x3) */}
      <div className="bento-card col-span-2 row-span-3 bg-pastel-purple flex flex-col">
        <h2 className="text-xl font-display font-black uppercase tracking-tight mb-6">Today's Routine</h2>
        <div className="space-y-3 flex-grow overflow-auto pr-2 custom-scrollbar">
          {habits.map(habit => {
            const isCompleted = habit.logs.some(l => l.date === todayStr);
            return (
              <div
                key={habit.id}
                onClick={() => onToggle(habit.id)}
                className="flex items-center gap-4 p-4 bg-white/60 border-2 border-bento-border rounded-2xl cursor-pointer hover:bg-white transition-colors group"
              >
                <div className={cn(
                  "checkbox-neo flex items-center justify-center",
                  isCompleted ? "bg-pastel-green" : "bg-white"
                )}>
                  {isCompleted && <CheckCircle2 size={14} strokeWidth={3} className="text-bento-border" />}
                </div>
                <div className="flex-grow">
                  <p className="font-black text-sm text-bento-text leading-tight">{habit.name}</p>
                  <p className="text-[11px] font-bold text-bento-text-soft line-clamp-1">{habit.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black">{habit.targetValue}{habit.unit}</p>
                </div>
              </div>
            );
          })}
          {habits.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-bento-text-soft/40 py-10">
              <Zap size={40} className="mb-2 opacity-20" />
              <p className="font-bold text-sm">No tasks for today</p>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Progress (Span 2x2) */}
      <div className="bento-card col-span-2 row-span-2 bg-pastel-blue">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-display font-black uppercase tracking-tight">Weekly Progress</h2>
          <span className="text-[11px] font-black bg-white px-2 py-1 rounded-full border-bento-border border-2">
            {weeklyRate}% Rate
          </span>
        </div>
        <div className="flex items-end gap-3 h-32 mb-4">
          {weekDays.map((day, idx) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const count = habits.filter(h => h.logs.some(l => l.date === dateStr)).length;
            const max = habits.length;
            const height = max > 0 ? (count / max) * 100 : 0;
            const isToday = isSameDay(day, startOfToday());

            return (
              <div key={idx} className="flex-grow flex flex-col items-center gap-2 h-full justify-end group">
                <div className={cn(
                  "w-full bg-white border-2 border-bento-border rounded-lg relative overflow-hidden transition-all group-hover:shadow-bento-sm",
                  isToday ? "border-bento-border ring-2 ring-white/50" : ""
                )} style={{ height: '100%' }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    className={cn("absolute bottom-0 left-0 right-0 w-full transition-colors", height === 100 ? "bg-pastel-green" : "bg-bento-border/10")}
                  />
                </div>
                <span className="text-[10px] font-black text-bento-text-soft">{format(day, 'EEE').toUpperCase()}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Habit Quick Box (Span 2x1) */}
      <div className="bento-card col-span-2 row-span-1 bg-pastel-green flex items-center justify-between group cursor-pointer" onClick={onOpenAdd}>
        <div className="bg-white border-2 border-bento-border rounded-full px-5 py-2 flex-grow mr-4 shadow-bento-sm">
          <p className="text-sm font-bold text-bento-text-soft">What is your next focus?</p>
        </div>
        <div className="w-12 h-12 bg-white border-2 border-bento-border rounded-full flex items-center justify-center shadow-bento-sm group-hover:-rotate-12 transition-transform">
          <Plus size={24} strokeWidth={3} className="text-bento-border" />
        </div>
      </div>

      {/* Daily Reflection (Span 2x1) */}
      <div className="bento-card col-span-2 row-span-1 bg-pastel-yellow flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-display font-black uppercase tracking-tight">Daily Reflection</h2>
            {!isEditingNote && dailyNote && (
              <span className="text-[10px] font-black bg-pastel-green px-2 py-0.5 rounded-full border border-bento-border/20 uppercase tracking-wider">Saved</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isSaving && (
              <span className="text-[10px] font-black uppercase animate-pulse text-bento-text-soft">Saving...</span>
            )}
            {isEditingNote ? (
              <button 
                onClick={handleManualSave}
                className="bento-button bg-white text-[10px] py-1 px-3 shadow-bento-sm hover:shadow-none translate-x-[-2px] translate-y-[-2px] active:translate-x-0 active:translate-y-0"
              >
                SAVE NOTE
              </button>
            ) : (
              <button 
                onClick={() => setIsEditingNote(true)}
                className="w-8 h-8 flex items-center justify-center bg-white border-2 border-bento-border rounded-lg shadow-bento-sm hover:shadow-none translate-x-[-2px] translate-y-[-2px] active:translate-x-0 active:translate-y-0 transition-all"
              >
                <Edit2 size={14} strokeWidth={3} />
              </button>
            )}
          </div>
        </div>
        
        <div className="relative flex-grow">
          {isEditingNote ? (
            <>
              <textarea
                value={dailyNote}
                onChange={(e) => setDailyNote(e.target.value)}
                placeholder="What did you achieve today? What's the plan for tomorrow?"
                maxLength={200}
                className="w-full h-full bg-white/50 border-2 border-bento-border rounded-xl p-3 text-xs font-bold placeholder:text-bento-text-soft/50 focus:bg-white outline-none transition-all resize-none custom-scrollbar"
                autoFocus
              />
              <div className="absolute bottom-3 right-3 text-[9px] font-black uppercase text-bento-text-soft bg-white/80 px-1.5 py-0.5 rounded border border-bento-border/10">
                {dailyNote.length}/200
              </div>
            </>
          ) : (
            <div className="w-full h-full p-4 bg-white/30 border-2 border-dashed border-bento-border/20 rounded-xl flex items-center justify-center">
              <p className="text-sm font-bold text-bento-text italic leading-relaxed text-center max-w-md">
                {dailyNote || "Click the edit icon to add today's reflection..."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Streak Box (Span 1x1) */}
      <div className="bento-card col-span-1 row-span-1 bg-pastel-pink flex flex-col justify-center items-center">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-bento-text-soft absolute top-4 left-6">Streak</h2>
        <div className="text-5xl font-display font-black leading-none mt-2">
          {habits.reduce((max, h) => {
            // Simplified streak: just check consecutive days of completion for simplicity given current logs structure
            return Math.max(max, h.logs.length);
          }, 0)}
        </div>
        <p className="text-[10px] font-black uppercase text-bento-text mb-1">Days Strong</p>
        <p className="text-[10px] font-bold text-accent-pink animate-pulse">KEEP IT UP! 🔥</p>
      </div>

      {/* Stats Mini Box (Span 1x1) */}
      <div className="bento-card col-span-1 row-span-1 bg-white border-dashed flex flex-col justify-center">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-bento-text-soft mb-1">Status</h2>
        <p className="text-sm font-black text-bento-text">
          {habits.length > 0 && habits.every(h => h.logs.length > 0) ? "ACTIVE" : "GETTING STARTED"}
        </p>
        <div className="w-full h-1.5 bg-bento-bg border-bento-border border rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-pastel-blue" style={{ width: `${Math.min(habits.length * 20, 100)}%` }} />
        </div>
      </div>

    </div>
  );
}

function HabitsList({ habits, searchTerm, onSearchChange, onDelete }: { habits: Habit[], searchTerm: string, onSearchChange: (val: string) => void, onDelete: (id: string) => void }) {
  return (
    <div className="bento-card min-h-[500px] bg-white">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-display font-black uppercase tracking-tight">Your Journey</h2>
        <div className="flex items-center gap-3 bg-bento-bg border-2 border-bento-border rounded-xl px-4 py-2">
          <Search size={18} className="text-bento-text-soft" />
          <input 
            type="text" 
            placeholder="Search habits..." 
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-transparent border-none outline-none text-xs font-bold w-40 placeholder:text-bento-text-soft" 
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {habits.map(habit => (
          <div key={habit.id} className="p-5 flex items-center justify-between bg-white border-2 border-bento-border rounded-2xl shadow-bento-sm hover:-translate-y-0.5 transition-transform group">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center border-2 border-bento-border transition-transform group-hover:rotate-6 shadow-bento-sm",
                habit.color === 'green' ? 'bg-pastel-green' :
                  habit.color === 'blue' ? 'bg-pastel-blue' :
                    'bg-pastel-purple'
              )}>
                {IconMap[habit.icon] ? React.createElement(IconMap[habit.icon], { size: 24, strokeWidth: 2.5 }) : <Activity size={24} />}
              </div>
              <div>
                <h4 className="font-black text-bento-text uppercase text-sm">{habit.name}</h4>
                <p className="text-[10px] text-bento-text-soft font-bold">{habit.frequency.toUpperCase()} • {habit.reminderTime || 'No reminder'}</p>
              </div>
            </div>
            <button
              onClick={() => onDelete(habit.id)}
              className="text-bento-text-soft hover:text-pastel-pink transition-colors p-2"
            >
              <Trash2 size={20} strokeWidth={2.5} />
            </button>
          </div>
        ))}
        {habits.length === 0 && (
          <div className="col-span-2 py-20 text-center text-bento-text-soft opacity-30 font-black uppercase text-sm tracking-widest">
            Empty Slate
          </div>
        )}
      </div>
    </div>
  );
}

function Analytics({ habits }: { habits: Habit[] }) {
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date()
  });

  const chartData = last7Days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const completedCount = habits.reduce((acc, h) => {
      return acc + (h.logs.some(l => l.date === dateStr) ? 1 : 0);
    }, 0);
    return {
      name: format(day, 'EEE').toUpperCase(),
      completed: completedCount
    };
  });

  const totalCompletions = chartData.reduce((acc, d) => acc + d.completed, 0);
  const totalPossible = habits.length * last7Days.length;
  const habitScore = totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0;

  const previous7Days = eachDayOfInterval({
    start: subDays(new Date(), 13),
    end: subDays(new Date(), 7)
  });
  const prevCompletions = previous7Days.reduce((acc, day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return acc + habits.reduce((accH, h) => accH + (h.logs.some(l => l.date === dateStr) ? 1 : 0), 0);
  }, 0);
  const prevScore = totalPossible > 0 ? Math.round((prevCompletions / totalPossible) * 100) : 0;
  const scoreDiff = habitScore - prevScore;

  const lifetimeCompletions = habits.reduce((acc, h) => acc + h.logs.length, 0);
  const currentRank = Math.max(1, 500 - (lifetimeCompletions * 2));

  const getRankName = (c: number) => {
    if (c > 500) return "ELITE";
    if (c > 200) return "PRO";
    if (c > 100) return "SEMI-PRO";
    if (c > 50) return "AMATEUR";
    return "NOVICE";
  };

  const categoryData = habits.reduce((acc: any[], h) => {
    const existing = acc.find(a => a.name === h.category);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ name: h.category, count: 1 });
    }
    return acc;
  }, []);

  return (
    <div className="grid grid-cols-12 gap-5 h-full min-h-[600px]">
      <div className="bento-card col-span-8 row-span-2 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-display font-black uppercase tracking-tight">Activity Heat</h3>
          <div className="tag border-2 border-bento-border bg-pastel-blue px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
            Weekly Pulse
          </div>
        </div>
        <div className="flex-grow w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#2D2D2D', fontSize: 10, fontWeight: 900 }}
                dy={10}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{ border: '2px solid #2D2D2D', borderRadius: '12px', boxShadow: '4px 4px 0px #2D2D2D', fontWeight: '900', fontSize: '12px' }}
              />
              <Area
                type="stepAfter"
                dataKey="completed"
                stroke="#2D2D2D"
                strokeWidth={3}
                fillOpacity={1}
                fill="#E1F0FF"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bento-card col-span-4 row-span-2 bg-pastel-green">
        <h3 className="text-xl font-display font-black uppercase tracking-tight mb-8">Focus</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#2D2D2D', fontSize: 11, fontWeight: 900 }}
                width={80}
              />
              <Tooltip contentStyle={{ border: '2px solid #2D2D2D', borderRadius: '12px', boxShadow: '4px 4px 0px #2D2D2D', fontWeight: '900', fontSize: '12px' }} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={16}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#2D2D2D" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bento-card col-span-4 bg-pastel-yellow">
        <p className="text-[10px] font-black uppercase tracking-widest text-bento-text-soft mb-1">Habit Score</p>
        <p className="text-3xl font-display font-black">{habitScore}%</p>
        <p className="text-[10px] font-black text-bento-text-soft uppercase">
          {scoreDiff >= 0 ? '+' : ''}{scoreDiff}% vs last week
        </p>
      </div>
      <div className="bento-card col-span-4 bg-pastel-pink">
        <p className="text-[10px] font-black uppercase tracking-widest text-bento-text-soft mb-1">Completions</p>
        <p className="text-3xl font-display font-black">{lifetimeCompletions}</p>
        <p className="text-[10px] font-black uppercase text-bento-text">LIFETIME GROWTH</p>
      </div>
      <div className="bento-card col-span-4 bg-white">
        <p className="text-[10px] font-black uppercase tracking-widest text-bento-text-soft mb-1">Global Level</p>
        <p className="text-3xl font-display font-black">#{currentRank}</p>
        <p className="text-[10px] font-black uppercase text-bento-text">RANKED {getRankName(lifetimeCompletions)}</p>
      </div>
    </div>
  );
}

function TimelineView({ notes }: { notes: DailyNote[] }) {
  const colors = ['bg-pastel-purple', 'bg-pastel-blue', 'bg-pastel-pink', 'bg-pastel-yellow', 'bg-pastel-green'];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="max-w-4xl mx-auto py-4">
      <header className="mb-12">
        <h2 className="text-4xl font-display font-black uppercase tracking-tighter text-bento-text">Your Journey</h2>
        <p className="text-bento-text-soft font-bold">Relive your reflections and achievements</p>
      </header>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="relative border-l-4 border-bento-border pl-12 space-y-12 pb-20"
      >
        {notes.map((note, index) => {
          const date = parseISO(note.date);
          const colorClass = colors[index % colors.length];

          return (
            <motion.div key={note.date} variants={item} className="relative">
              {/* Dot on timeline */}
              <div className="absolute -left-[54px] top-6 w-5 h-5 bg-white border-4 border-bento-border rounded-full z-10" />
              
              <div className="flex gap-8">
                <div className="shrink-0 w-20 text-center">
                  <p className="text-[10px] font-black uppercase text-bento-text-soft mb-1">{format(date, 'MMM')}</p>
                  <p className="text-3xl font-display font-black leading-none">{format(date, 'dd')}</p>
                  <p className="text-[10px] font-black uppercase text-bento-text-soft mt-1">{format(date, 'EEE')}</p>
                </div>

                <div className={cn("bento-card flex-grow shadow-bento group hover:-translate-y-1 transition-transform", colorClass)}>
                  <p className="text-xl font-black text-bento-text leading-relaxed whitespace-pre-wrap italic">
                    "{note.content}"
                  </p>
                  <div className="mt-4 pt-4 border-t-2 border-bento-border/10 flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-bento-text-soft">Bloom Memory</span>
                    <div className="w-6 h-6 rounded-full bg-white/50 border border-bento-border/20 flex items-center justify-center">
                      <Zap size={12} className="text-bento-text" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {notes.length === 0 && (
          <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white border-2 border-dashed border-bento-border rounded-3xl mb-6">
              <History size={40} className="text-bento-text-soft/30" />
            </div>
            <h3 className="text-xl font-display font-black uppercase">No memories yet</h3>
            <p className="text-bento-text-soft font-bold mt-2 text-sm">Complete your daily reflection to start your timeline!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
