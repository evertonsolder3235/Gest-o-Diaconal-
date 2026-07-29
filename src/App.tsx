import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ToastContainer } from './components/ToastContainer';
import { ConfirmModal } from './components/ConfirmModal';
import { AdminPasswordModal } from './components/AdminPasswordModal';

import { DashboardView } from './components/views/DashboardView';
import { VisitantesView } from './components/views/VisitantesView';
import { AniversariantesView } from './components/views/AniversariantesView';
import { ObreirosView } from './components/views/ObreirosView';
import { PedidosOracaoView } from './components/views/PedidosOracaoView';
import { AvisosView } from './components/views/AvisosView';
import { FinanceiroView } from './components/views/FinanceiroView';
import { ConfiguracoesView } from './components/views/ConfiguracoesView';

const MainLayout: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header />

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Dynamic View Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'visitantes' && <VisitantesView />}
          {activeTab === 'aniversariantes' && <AniversariantesView />}
          {activeTab === 'obreiros' && <ObreirosView />}
          {activeTab === 'pedidos' && <PedidosOracaoView />}
          {activeTab === 'avisos' && <AvisosView />}
          {activeTab === 'financeiro' && <FinanceiroView />}
          {activeTab === 'configuracoes' && <ConfiguracoesView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Global Feedback Toasts, Deletion Confirmation Modal & Admin Password Protection */}
      <ToastContainer />
      <ConfirmModal />
      <AdminPasswordModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
