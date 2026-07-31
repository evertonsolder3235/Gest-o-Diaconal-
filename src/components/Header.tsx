import React from 'react';
import { useApp } from '../context/AppContext';
import { ChurchLogo } from './ChurchLogo';
import { ViewTab } from '../types';
import {
  LayoutDashboard,
  Users,
  Cake,
  ShieldCheck,
  Heart,
  Megaphone,
  Wallet,
  Settings,
  Smartphone,
  Download
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    config,
    activeTab,
    setActiveTab,
    visitantes,
    pedidos,
    avisos,
    installPWA
  } = useApp();

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Principal';
      case 'visitantes': return 'Gestão de Visitantes';
      case 'aniversariantes': return 'Aniversariantes e Comemorações';
      case 'obreiros': return 'Obreiros e Diáconos';
      case 'pedidos': return 'Pedidos de Oração';
      case 'avisos': return 'Avisos da Igreja';
      case 'financeiro': return 'Contribuições Financeiras';
      case 'configuracoes': return 'Configurações do Sistema';
      default: return 'Gestão Diaconal';
    }
  };

  const navItems: { id: ViewTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'visitantes', label: 'Visitantes', icon: Users, badge: visitantes.filter(v => v.status === 'Novo').length },
    { id: 'aniversariantes', label: 'Aniversariantes', icon: Cake },
    { id: 'obreiros', label: 'Obreiros', icon: ShieldCheck },
    { id: 'pedidos', label: 'Orações', icon: Heart, badge: pedidos.filter(p => p.status === 'Urgente').length },
    { id: 'avisos', label: 'Avisos', icon: Megaphone, badge: avisos.filter(a => a.fixado).length },
    { id: 'financeiro', label: 'Financeiro', icon: Wallet },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        {/* Main Header Bar */}
        <div className="flex items-center justify-between relative min-h-[44px]">
          {/* Left / Centered branding & legend */}
          <div className="flex items-center gap-3 sm:gap-4">
            <ChurchLogo size="md" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-extrabold text-slate-100 text-lg sm:text-xl leading-snug tracking-wide">
                  {config.nomeIgreja}
                </h1>
                <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-bold bg-blue-900/50 text-blue-300 border border-blue-700/50 rounded-full uppercase tracking-wider">
                  {config.subtitulo || 'Gestão Diaconal'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {getTabTitle()}
              </p>
            </div>
          </div>

          {/* Download & Install App Button */}
          <a
            href="/gestao-diaconal.apk"
            download="GestaoDiaconal.apk"
            onClick={() => installPWA()}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-950/40 border border-emerald-400/40 transition-all shrink-0 active:scale-95 cursor-pointer"
            title="Baixar Aplicativo Android (APK)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-200" />
            <span className="hidden xs:inline">Baixar App</span>
            <span className="xs:hidden">APK</span>
          </a>
        </div>

        {/* Desktop Top Navigation Bar */}
        <nav className="hidden lg:flex items-center gap-1 pt-2 border-t border-slate-800/60 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
