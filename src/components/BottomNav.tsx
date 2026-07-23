import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ViewTab } from '../types';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Heart,
  MoreHorizontal,
  Cake,
  Megaphone,
  Wallet,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, logout } = useApp();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const mainTabs: { id: ViewTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'visitantes', label: 'Visitantes', icon: Users },
    { id: 'obreiros', label: 'Obreiros', icon: ShieldCheck },
    { id: 'pedidos', label: 'Orações', icon: Heart },
  ];

  const secondaryTabs: { id: ViewTab; label: string; icon: React.ElementType }[] = [
    { id: 'aniversariantes', label: 'Aniversariantes & Bodas', icon: Cake },
    { id: 'avisos', label: 'Avisos da Igreja', icon: Megaphone },
    { id: 'financeiro', label: 'Módulo Financeiro', icon: Wallet },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  const handleSelectTab = (tab: ViewTab) => {
    setActiveTab(tab);
    setIsMoreOpen(false);
  };

  const isSecondaryActive = secondaryTabs.some((t) => t.id === activeTab);

  return (
    <>
      {/* Mobile Bottom Navigation Sheet overlay */}
      <AnimatePresence>
        {isMoreOpen && (
          <div className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden flex flex-col justify-end">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 pb-safe shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-3">
                <h3 className="font-bold text-slate-200 text-sm">Mais Módulos e Opções</h3>
                <button
                  onClick={() => setIsMoreOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-4">
                {secondaryTabs.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border text-left text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/40'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20' : 'bg-slate-800 text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  setIsMoreOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs font-bold"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair da Conta</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Persistent Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 border-t border-slate-800/90 backdrop-blur-lg lg:hidden pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                  isActive ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200 font-medium'
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-blue-600/20' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isSecondaryActive || isMoreOpen
                ? 'text-blue-400 font-bold'
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            <div className={`p-1 rounded-lg ${isSecondaryActive || isMoreOpen ? 'bg-blue-600/20' : ''}`}>
              <MoreHorizontal className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Mais</span>
          </button>
        </div>
      </nav>
    </>
  );
};
