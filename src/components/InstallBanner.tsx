import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Download, Smartphone, X, Share, PlusSquare, CheckCircle, Info, Copy, ExternalLink, Package } from 'lucide-react';

export const InstallBanner: React.FC = () => {
  const { isStandalone, deferredPrompt, installPWA, showToast } = useApp();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk'>('pwa');

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

  const handleCopyLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      showToast('success', 'Link do app copiado com sucesso!');
    }).catch(() => {
      showToast('info', `Link do app: ${currentUrl}`);
    });
  };

  return (
    <>
      {/* Top Floating PWA & APK Install Banner */}
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
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  App PWA / APK Nativo
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate hidden sm:block">
                Instale na tela inicial do celular ou baixe o APK para Android
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-900/50 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{deferredPrompt ? 'Instalar Agora' : 'Instalar / Baixar APK'}</span>
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

      {/* Detailed Installation & APK Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative">
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
                  Instalar Aplicativo no Celular
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Escolha como deseja instalar no Android ou iOS
                </p>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setActiveTab('pwa')}
                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'pwa'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>PWA (Direto no Navegador)</span>
              </button>

              <button
                onClick={() => setActiveTab('apk')}
                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'apk'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Gerar APK (Android Nativo)</span>
              </button>
            </div>

            {/* TAB 1: DIRECT PWA INSTALL */}
            {activeTab === 'pwa' && (
              <div className="space-y-4">
                {deferredPrompt ? (
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-200 flex flex-col items-center text-center gap-3">
                    <p className="font-semibold">Seu navegador permite instalação direta com 1 clique!</p>
                    <button
                      onClick={() => {
                        installPWA();
                        setShowGuideModal(false);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-950/50 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Instalar PWA Agora</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {isIOS ? (
                      <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
                        <div className="font-bold text-blue-300 flex items-center gap-2">
                          <Share className="w-4 h-4 text-blue-400" />
                          <span>No Safari (iPhone / iPad):</span>
                        </div>
                        <ol className="list-decimal list-inside space-y-2 text-slate-300 leading-relaxed pl-1">
                          <li>
                            Abra este link diretamente no navegador <strong className="text-white">Safari</strong>.
                          </li>
                          <li>
                            Toque no botão <strong className="text-white">Compartilhar</strong> (ícone de quadrado com seta para cima na barra inferior).
                          </li>
                          <li>
                            Role a lista e selecione <strong className="text-white font-bold text-blue-400">"Adicionar à Tela de Início"</strong> <PlusSquare className="w-3.5 h-3.5 inline text-blue-400 ml-1" />.
                          </li>
                          <li>
                            Toque em <strong className="text-white font-bold">"Adicionar"</strong> no canto superior direito.
                          </li>
                        </ol>
                      </div>
                    ) : (
                      <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
                        <div className="font-bold text-blue-300 flex items-center gap-2">
                          <Info className="w-4 h-4 text-blue-400" />
                          <span>No Chrome / Samsung Internet (Android / PC):</span>
                        </div>
                        <ol className="list-decimal list-inside space-y-2 text-slate-300 leading-relaxed pl-1">
                          <li>
                            Abra a página no aplicativo <strong className="text-white">Google Chrome</strong> do celular.
                          </li>
                          <li>
                            Toque nos 3 pontinhos <strong className="text-white">(⋮)</strong> no canto superior direito.
                          </li>
                          <li>
                            Toque em <strong className="text-white font-bold text-blue-400">"Instalar aplicativo"</strong> ou <strong className="text-white font-bold text-blue-400">"Adicionar à tela inicial"</strong>.
                          </li>
                          <li>
                            O ícone do app aparecerá na área de trabalho do seu celular!
                          </li>
                        </ol>
                      </div>
                    )}
                  </>
                )}

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                  <div className="truncate text-slate-400">
                    <span className="block font-semibold text-slate-300">Link do Aplicativo:</span>
                    <span className="font-mono text-[11px] truncate block text-blue-400">{window.location.href}</span>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold shrink-0 flex items-center gap-1.5 text-xs transition-all"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Link</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: GENERATE AND INSTALL APK */}
            {activeTab === 'apk' && (
              <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
                <div className="font-bold text-blue-300 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-400" />
                  <span>Como gerar o arquivo .APK para Android:</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Você pode converter esta aplicação Web PWA em um pacote de instalação <strong>.APK Android</strong> pronto usando a ferramenta gratuita oficial da Microsoft (PWABuilder):
                </p>

                <ol className="list-decimal list-inside space-y-2 text-slate-300 leading-relaxed pl-1 pt-1">
                  <li>
                    <strong className="text-white">Copie o link do app:</strong>{' '}
                    <button
                      onClick={handleCopyLink}
                      className="text-blue-400 font-bold underline inline-flex items-center gap-1 hover:text-blue-300"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copiar link agora</span>
                    </button>
                  </li>
                  <li>
                    Acesse o site <strong className="text-white">PWABuilder.com</strong> em seu computador ou celular:
                    <div className="mt-1.5">
                      <a
                        href="https://www.pwabuilder.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition-all"
                      >
                        <span>Abrir PWABuilder</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </li>
                  <li>
                    Cole a URL do aplicativo e clique em <strong className="text-white font-bold text-emerald-400">"Start"</strong>.
                  </li>
                  <li>
                    Clique em <strong className="text-white">"Package for Store / Android"</strong> e baixe seu pacote <strong className="text-emerald-400 font-bold">.APK</strong> diretamente para o celular!
                  </li>
                </ol>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>PWA & Android APK Compatíveis</span>
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
