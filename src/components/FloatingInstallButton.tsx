import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Smartphone,
  X,
  ShieldCheck,
  Sparkles,
  Share2,
  PlusSquare,
  MoreVertical,
  CheckCircle,
  ExternalLink,
  Laptop
} from 'lucide-react';

export const FloatingInstallButton: React.FC = () => {
  const { isStandalone, deferredPrompt, installPWA, showToast } = useApp();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
  }, []);

  // Hide button if app is already running in standalone/installed mode
  if (isStandalone) {
    return null;
  }

  const handleMainClick = () => {
    if (deferredPrompt) {
      // Execute 1-click native installation via browser PWA/WebAPK prompt
      installPWA();
    } else {
      // Open clean instruction modal for native installation
      setIsOpenModal(true);
    }
  };

  return (
    <>
      {/* Floating Action Button (FAB) on Bottom Right */}
      <div className="fixed bottom-20 right-4 z-40 sm:bottom-6 sm:right-6 group">
        <button
          onClick={handleMainClick}
          className="relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-950/60 border border-emerald-400/40 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          title="Instalar Aplicativo Nativo no Dispositivo"
        >
          {/* Glowing background animation */}
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 opacity-70 blur-sm group-hover:opacity-100 transition duration-500 animate-pulse"></span>
          
          <div className="relative flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30">
              <Smartphone className="w-4 h-4 animate-bounce" />
            </div>
            <div className="flex flex-col text-left">
              <span className="leading-tight font-black tracking-wide text-white drop-shadow">
                INSTALAR APLICATIVO
              </span>
              <span className="text-[10px] text-emerald-100 font-medium leading-none">
                {deferredPrompt ? 'Clique para Instalar (1-Clique)' : 'Adicionar Ícone Nativo'}
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Native App Install Modal */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative overflow-hidden space-y-6">
            
            {/* Header background glow */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600" />

            {/* Close Button */}
            <button
              onClick={() => setIsOpenModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                <Smartphone className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black text-slate-100">
                    Instalar Gestão Diaconal
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    App Nativo
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Tenha o ícone oficial no seu celular para abrir como aplicativo nativo em tela cheia e sem barra de navegação.
                </p>
              </div>
            </div>

            {/* If Direct Browser Install Prompt is Available */}
            {deferredPrompt ? (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/40 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Instalação Automática Pronta</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Seu navegador permite criar o aplicativo nativo diretamente. Clique no botão abaixo para concluir.
                </p>
                <button
                  onClick={() => {
                    installPWA();
                    setIsOpenModal(false);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Instalar Agora no Celular</span>
                </button>
              </div>
            ) : (
              /* Instructions when browser prompt needs manual trigger */
              <div className="space-y-4">
                {isIOS ? (
                  /* iOS Safari Step-by-step */
                  <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 space-y-3">
                    <div className="font-bold flex items-center gap-2 text-amber-300 text-sm">
                      <Share2 className="w-4 h-4" />
                      <span>Instalação no iPhone / iPad (Safari)</span>
                    </div>
                    <ol className="space-y-2 text-xs text-amber-100/90 list-decimal pl-4">
                      <li>
                        Toque no botão <strong className="text-white">Compartilhar</strong> (ícone do quadrado com seta para cima) na barra inferior do Safari.
                      </li>
                      <li>
                        Role as opções e toque em <strong className="text-white font-bold">"Adicionar à Tela de Início"</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1" />.
                      </li>
                      <li>
                        Toque em <strong className="text-white font-bold">"Adicionar"</strong> no canto superior direito.
                      </li>
                    </ol>
                  </div>
                ) : (
                  /* Android / Chrome Step-by-step */
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="font-bold flex items-center gap-2 text-emerald-400 text-sm">
                      <MoreVertical className="w-4 h-4" />
                      <span>Como Criar o Ícone Nativo no Android (Chrome / Edge)</span>
                    </div>
                    <ol className="space-y-2 text-xs text-slate-300 list-decimal pl-4">
                      <li>
                        Toque nos <strong className="text-white">3 pontinhos (⋮)</strong> no canto superior do seu navegador.
                      </li>
                      <li>
                        Selecione a opção <strong className="text-emerald-400 font-bold">"Instalar aplicativo"</strong> ou <strong className="text-emerald-400 font-bold">"Adicionar à tela inicial"</strong>.
                      </li>
                      <li>
                        Confirme clicando em <strong className="text-white">"Instalar"</strong>.
                      </li>
                    </ol>
                  </div>
                )}

                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>
                    Após adicionar, o ícone ficará disponível na sua lista de aplicativos do celular como um app nativo, funcionando em tela cheia e offline.
                  </span>
                </div>
              </div>
            )}

            {/* Security & Features Badge */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Aplicativo seguro e verificado</span>
              </span>
              <button
                onClick={() => setIsOpenModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

