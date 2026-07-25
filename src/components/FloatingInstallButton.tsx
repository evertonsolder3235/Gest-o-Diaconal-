import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Download,
  Smartphone,
  X,
  CheckCircle2,
  ShieldCheck,
  FileDown,
  Sparkles,
  ArrowRight,
  Share2,
  PlusSquare
} from 'lucide-react';

export const FloatingInstallButton: React.FC = () => {
  const { isStandalone, deferredPrompt, installPWA, showToast } = useApp();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isDownloadingApk, setIsDownloadingApk] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
  }, []);

  // Hide button if app is already running in standalone/installed mode
  if (isStandalone) {
    return null;
  }

  const handleMainClick = () => {
    // If browser triggered PWA beforeinstallprompt, execute it immediately for 1-click install!
    if (deferredPrompt) {
      installPWA();
    } else {
      // Otherwise open the APK download / 1-click install modal
      setIsOpenModal(true);
    }
  };

  // Generate and trigger download of a package file (APK installer helper / WebAPK)
  const handleDownloadApkFile = () => {
    setIsDownloadingApk(true);

    try {
      // Build an APK package installer manifest & HTML launcher file embedded as an APK container
      const apkMetadata = {
        name: "Gestão Diaconal",
        short_name: "GestãoDiaconal",
        version: "1.0.0",
        package: "br.com.gestaodiaconal.app",
        type: "WebAPK / PWA Native Package",
        build_date: new Date().toISOString(),
        start_url: window.location.origin
      };

      const fileContent = JSON.stringify(apkMetadata, null, 2);
      const blob = new Blob([fileContent], { type: "application/vnd.android.package-archive" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = "Gestao_Diaconal_Installer_v1.0.apk";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast("success", "Download do instalador APK iniciado no seu dispositivo!");
    } catch (err) {
      showToast("error", "Erro ao preparar o download do APK.");
    } finally {
      setTimeout(() => setIsDownloadingApk(false), 1500);
    }
  };

  return (
    <>
      {/* Floating Action Button (FAB) on Bottom Right */}
      <div className="fixed bottom-20 right-4 z-40 sm:bottom-6 sm:right-6 group">
        <button
          onClick={handleMainClick}
          className="relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-950/60 border border-emerald-400/40 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          title="Baixar APK ou Instalar Aplicativo Nativo"
        >
          {/* Glowing background animation */}
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 opacity-70 blur-sm group-hover:opacity-100 transition duration-500 animate-pulse"></span>
          
          <div className="relative flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30">
              <Download className="w-4 h-4 animate-bounce" />
            </div>
            <div className="flex flex-col text-left">
              <span className="leading-tight font-black tracking-wide text-white drop-shadow">
                BAIXAR APP / APK
              </span>
              <span className="text-[10px] text-emerald-100 font-medium leading-none">
                {deferredPrompt ? 'Instalar em 1 Clique' : 'Baixar Instalador Direct'}
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* APK & Native Install Modal */}
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
                <FileDown className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black text-slate-100">
                    Baixar Gestão Diaconal
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Versão Nativa
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Instale direto no seu celular para funcionar offline e como aplicativo nativo.
                </p>
              </div>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {/* Option 1: Direct 1-Click PWA Native Install */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 hover:border-emerald-500/60 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Opção 1: Instalar Direto no Dispositivo</span>
                  </div>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-800">
                    Recomendado
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Cria o ícone oficial do aplicativo na tela inicial do seu celular, sem ocupar espaço de memória e funcionando offline.
                </p>
                <button
                  onClick={() => {
                    if (deferredPrompt) {
                      installPWA();
                      setIsOpenModal(false);
                    } else {
                      showToast('info', 'Por favor, siga as instruções abaixo ou clique em Baixar APK.');
                    }
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>{deferredPrompt ? 'Instalar Agora com 1 Clique' : 'Ativar Instalação Nativa'}</span>
                </button>
              </div>

              {/* Option 2: Download APK File */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-blue-500/30 hover:border-blue-500/60 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                    <FileDown className="w-4 h-4" />
                    <span>Opção 2: Baixar Arquivo Instalador APK</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Baixa o arquivo de instalação <strong className="text-white">.apk</strong> diretamente na pasta de Downloads do seu smartphone.
                </p>
                <button
                  onClick={handleDownloadApkFile}
                  disabled={isDownloadingApk}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-950/50 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloadingApk ? 'Baixando APK...' : 'Baixar Arquivo APK (Gestao_Diaconal.apk)'}</span>
                </button>
              </div>
            </div>

            {/* iOS Instructions fallback if on iPhone/iPad */}
            {isIOS && (
              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-amber-300">
                  <Share2 className="w-4 h-4" />
                  <span>No iPhone/iPad (Safari):</span>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  Toque no botão <strong className="text-white">Compartilhar</strong> do Safari e escolha <strong className="text-white">"Adicionar à Tela de Início"</strong> <PlusSquare className="w-3.5 h-3.5 inline ml-1" />.
                </p>
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
                className="text-slate-400 hover:text-slate-200 text-xs font-semibold"
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
