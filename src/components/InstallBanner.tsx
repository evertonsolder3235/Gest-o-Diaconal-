import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Download, Smartphone, X, Share, PlusSquare, CheckCircle, Info } from 'lucide-react';

export const InstallBanner: React.FC = () => {
  const { isStandalone, deferredPrompt, installPWA } = useApp();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    // Check if device is iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check session storage if user closed banner recently
    const dismissed = sessionStorage.getItem('pwa_banner_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  if (isStandalone || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  const handleInstallClick = () => {
    if (deferredPrompt) {
      installPWA();
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      {/* Top Floating PWA Install Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b border-blue-800/60 px-4 py-2.5 sm:px-6 shadow-lg relative z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-blue-600/30 text-blue-300 border border-blue-500/30 shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-white text-xs sm:text-sm tracking-wide">
                  Instalar Gestão Diaconal
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  App PWA
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate hidden sm:block">
                {isIOS
                  ? 'Instale na tela inicial do seu iPhone/iPad em segundos'
                  : 'Acesse offline e como aplicativo nativo sem ocupar memória'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-900/50 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{deferredPrompt ? 'Instalar Agora' : 'Como Instalar'}</span>
            </button>

            <button
              onClick={handleDismiss}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-lg transition-all"
              title="Fechar aviso de instalação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Installation Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg bg-slate-800/50"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-100">
                  Instalar como Aplicativo PWA
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Adicione o Gestão Diaconal à tela de início
                </p>
              </div>
            </div>

            {isIOS ? (
              <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
                <div className="font-bold text-blue-300 flex items-center gap-2">
                  <Share className="w-4 h-4 text-blue-400" />
                  <span>No Safari (iPhone / iPad):</span>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-slate-300 leading-relaxed pl-1">
                  <li>
                    Toque no botão <strong className="text-white">Compartilhar</strong> (ícone com seta para cima na barra inferior do Safari).
                  </li>
                  <li>
                    Role as opções e toque em <strong className="text-white font-bold text-blue-400">"Adicionar à Tela de Início"</strong> <PlusSquare className="w-3.5 h-3.5 inline text-blue-400 ml-1" />.
                  </li>
                  <li>
                    Toque em <strong className="text-white">"Adicionar"</strong> no canto superior direito.
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
                <div className="font-bold text-blue-300 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-400" />
                  <span>No Chrome ou Edge (Android / PC):</span>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-slate-300 leading-relaxed pl-1">
                  <li>
                    Clique no menu de 3 pontos <strong className="text-white">(⋮)</strong> no canto superior do navegador.
                  </li>
                  <li>
                    Selecione <strong className="text-white font-bold text-blue-400">"Instalar aplicativo"</strong> ou <strong className="text-white">"Adicionar à tela inicial"</strong>.
                  </li>
                  <li>
                    Confirme a instalação para criar o atalho direto no seu dispositivo.
                  </li>
                </ol>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Compatível com Android, iOS e PC</span>
              </span>
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
