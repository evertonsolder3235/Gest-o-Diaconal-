import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Download, X, Smartphone, CheckCircle2, Info, ChevronDown, ChevronUp } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { deferredPrompt, installPWA, isStandalone } = useApp();
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

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

  const handleInstallClick = () => {
    const hasPrompt = deferredPrompt || (window as any).deferredPWAInstallPrompt;
    if (hasPrompt) {
      installPWA();
    } else {
      setShowGuide(true);
      installPWA();
    }
  };

  // Do not show if already in standalone app mode or dismissed
  if (isStandalone || dismissed) {
    return null;
  }

  const hasPrompt = Boolean(deferredPrompt || (window as any).deferredPWAInstallPrompt);

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
          <button
            onClick={handleInstallClick}
            className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Instalar Agora</span>
          </button>

          {!hasPrompt && (
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1 shrink-0"
              title="Instruções de instalação"
            >
              <Info className="w-4 h-4 text-blue-400" />
              {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            onClick={handleDismiss}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors shrink-0"
          >
            Agora Não
          </button>
        </div>

        {/* Step-by-step instructions when prompt is not automatic */}
        {showGuide && (
          <div className="mt-1 p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-2 animate-in fade-in duration-200">
            <p className="font-bold text-blue-300 flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              Como instalar no seu dispositivo:
            </p>
            {isIOS ? (
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300 leading-relaxed">
                <li>No Safari, toque no botão <strong>Compartilhar</strong> (ícone com quadrado e seta).</li>
                <li>Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.</li>
                <li>Confirme no canto superior direito tocando em <strong>Adicionar</strong>.</li>
              </ol>
            ) : (
              <div className="space-y-2 text-[11px] text-slate-300 leading-relaxed">
                <div>
                  <strong className="text-slate-200 block mb-0.5">📱 Android (Chrome / Edge):</strong>
                  <span>Clique nos 3 pontos (⋮) no topo do navegador e selecione <em>"Instalar aplicativo"</em> ou <em>"Adicionar à Tela Inicial"</em>.</span>
                </div>
                <div>
                  <strong className="text-slate-200 block mb-0.5">💻 Computador (Chrome / Edge):</strong>
                  <span>Clique no ícone de computador/instalação (⊕) no canto direito da barra de endereço.</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
