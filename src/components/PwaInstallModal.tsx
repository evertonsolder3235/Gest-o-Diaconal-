import React from 'react';
import { useApp } from '../context/AppContext';
import { Download, X, CheckCircle2, Share, PlusSquare, Smartphone, Zap, WifiOff, Sparkles } from 'lucide-react';

export const PwaInstallModal: React.FC = () => {
  const {
    showInstallModal,
    setShowInstallModal,
    dismissInstallModal,
    installPWA,
    deferredPrompt,
    isIOS,
    isStandalone,
    isInstalled,
    config
  } = useApp();

  if (!showInstallModal || isStandalone || isInstalled) {
    return null;
  }

  const handleInstallClick = () => {
    if (deferredPrompt) {
      installPWA();
    } else if (isIOS) {
      // Keep modal open or show info toast
      setShowInstallModal(false);
    } else {
      installPWA();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all duration-300 animate-in fade-in">
      <div 
        className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-blue-950/50 overflow-hidden transform transition-all duration-300 animate-in zoom-in-95"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pwa-modal-title"
      >
        {/* Top ambient glow background element */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button (X) */}
        <button
          onClick={dismissInstallModal}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* App Logo Emblem */}
        <div className="flex flex-col items-center text-center mt-1">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 p-0.5 shadow-xl shadow-blue-900/40 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center overflow-hidden relative group">
                <div className="absolute inset-0 bg-blue-600/20 group-hover:bg-blue-600/30 transition-colors" />
                <div className="relative flex flex-col items-center justify-center">
                  <Smartphone className="w-9 h-9 text-blue-400" />
                  <Sparkles className="w-3.5 h-3.5 text-blue-300 absolute -top-1 -right-1 animate-pulse" />
                </div>
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-blue-600 text-[10px] font-extrabold text-white rounded-full uppercase tracking-wider shadow-md">
              PWA
            </span>
          </div>

          <h2 id="pwa-modal-title" className="text-xl font-extrabold text-slate-100 tracking-tight">
            {config?.nomeIgreja ? config.nomeIgreja : 'Gestão Diaconal'}
          </h2>

          <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-sm">
            Instale este aplicativo e tenha acesso rápido diretamente pela tela inicial do seu celular.
          </p>
        </div>

        {/* Benefits Card */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2.5">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span className="text-xs text-slate-200 font-medium">
              <strong className="text-slate-100 font-bold">Acesso com apenas um toque</strong> na tela inicial
            </span>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span className="text-xs text-slate-200 font-medium">
              <strong className="text-slate-100 font-bold">Interface em tela cheia</strong> sem barra de navegador
            </span>
          </div>

          <div className="flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span className="text-xs text-slate-200 font-medium">
              <strong className="text-slate-100 font-bold">Mais rápido</strong> com carregamento otimizado
            </span>
          </div>

          <div className="flex items-start gap-2.5">
            <WifiOff className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="text-xs text-slate-200 font-medium">
              <strong className="text-slate-100 font-bold">Pode funcionar offline</strong> sem internet
            </span>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span className="text-xs text-slate-200 font-medium">
              Experiência semelhante a um <strong className="text-slate-100 font-bold">aplicativo nativo</strong>
            </span>
          </div>
        </div>

        {/* iOS Step-by-Step Instructions if on iOS Safari without direct prompt */}
        {isIOS && !deferredPrompt && (
          <div className="mt-4 p-3.5 rounded-2xl bg-blue-950/50 border border-blue-800/60 text-xs text-blue-200">
            <p className="font-bold mb-2 text-blue-100 flex items-center gap-1.5">
              <Share className="w-4 h-4 text-blue-400" />
              Como instalar no iPhone / iPad (Safari):
            </p>
            <ol className="space-y-1.5 text-[11px] text-blue-200/90 list-decimal pl-4">
              <li>Toque no botão <strong className="text-white">Compartilhar</strong> (ícone com seta no Safari).</li>
              <li>Role para baixo e selecione <strong className="text-white font-bold">"Adicionar à Tela de Início"</strong> <PlusSquare className="inline w-3.5 h-3.5 text-blue-300 ml-0.5" />.</li>
              <li>Toque em <strong className="text-white font-bold">Adicionar</strong> no canto superior direito.</li>
            </ol>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={handleInstallClick}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>{isIOS && !deferredPrompt ? 'Entendi' : 'Instalar Aplicativo'}</span>
          </button>

          <button
            onClick={dismissInstallModal}
            className="w-full py-3 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-800 active:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700/80 transition-all text-center"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
};
