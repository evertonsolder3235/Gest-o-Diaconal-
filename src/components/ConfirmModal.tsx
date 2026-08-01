import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ConfirmModal: React.FC = () => {
  const { confirmModal, closeConfirmModal } = useApp();

  if (!confirmModal || !confirmModal.isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
        >
          <button
            onClick={closeConfirmModal}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 text-amber-400 mb-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">{confirmModal.title}</h3>
          </div>

          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            {confirmModal.message}
          </p>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={closeConfirmModal}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmModal.onConfirm}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold shadow-lg shadow-rose-900/30 transition-all"
            >
              Confirmar Exclusão
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
