import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  habitName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmationModal({ isOpen, habitName, onCancel, onConfirm }: DeleteConfirmationModalProps) {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-sm rounded-[32px] border-2 border-bento-border shadow-bento p-8"
        >
          <h2 className="text-xl font-display font-black text-bento-text mb-4">Delete Habit?</h2>
          <p className="text-sm font-bold text-bento-text-soft mb-8">
            Are you sure you want to delete <span className="font-black text-bento-text">"{habitName}"</span>? This action cannot be undone.
          </p>
          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-bento-border/10 font-bold text-sm text-bento-text-soft hover:bg-bento-bg transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 rounded-xl bg-pastel-pink border-2 border-bento-border font-bold text-sm text-bento-text hover:bg-pastel-pink/80 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
