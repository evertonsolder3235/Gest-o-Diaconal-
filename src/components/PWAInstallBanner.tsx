import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Download, X, Smartphone, CheckCircle2 } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { deferredPrompt, installPWA, isStandalone } = useApp();
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if device is iOS (iPhone/iPad/iPod)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);

    // Check if user previously dismissed in this session
    const isDismissed = sessionStorage.getItem('pwa_banner_dismissed') === 'true';
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  // Do not show if already in standalone app mode or dismissed
  if (isStandalone || dismissed) {
    return null;
  }

  // Show banner if deferredPrompt is available (Chrome/Edge/Android) or if on iOS Safari
  if (!deferredPrompt && !isIOS) {
    return null;
  }

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 max-w-md mx-auto z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md border border-blue-500/30 rounded-2xl p-4 shadow-2xl shadow-black/80 text-slate-100 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center shrink-0 text-blue-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                Instalar Aplicativo
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Instale este aplicativo na tela inicial para uma experiência completa.
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
            title="Fechar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          {deferredPrompt ? (
            <button
              onClick={installPWA}
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Instalar Agora</span>
            </button>
          ) : isIOS ? (
            <button
              onClick={() => setShowIOSGuide(!showIOSGuide)}
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Como Instalar no iPhone</span>
            </button>
          ) : null}

          <button
            onClick={handleDismiss}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors shrink-0"
          >
            Agora Não
          </button>
        </div>

        {/* iOS installation instructions */}
        {showIOSGuide && (
          <div className="mt-2 p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-1.5 animate-in fade-in duration-200">
            <p className="font-bold text-blue-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Passos no iPhone/iPad:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400">
              <li>Toque no botão <strong>Compartilhar</strong> (ícone com quadrado e seta) no Safari.</li>
              <li>Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.</li>
              <li>Confirme no canto superior direito tocando em <strong>Adicionar</strong>.</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};
