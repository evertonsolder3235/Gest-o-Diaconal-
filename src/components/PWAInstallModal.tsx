import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Smartphone,
  Share2,
  PlusSquare,
  MoreVertical,
  Download,
  X,
  CheckCircle2,
  Copy,
  ExternalLink,
  Laptop,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PWAInstallModal: React.FC = () => {
  const {
    isInstallModalOpen,
    closeInstallModal,
    deferredPrompt,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'desktop'>('android');
  const [copied, setCopied] = useState(false);

  // Auto-detect user OS on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setActiveTab('ios');
    } else if (/android/.test(ua)) {
      setActiveTab('android');
    } else {
      setActiveTab('desktop');
    }
  }, [isInstallModalOpen]);

  if (!isInstallModalOpen) return null;

  const handleTriggerDirectInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          showToast('success', 'Aplicativo instalado na Tela Inicial com sucesso!');
          closeInstallModal();
        } else {
          showToast('info', 'Instalação cancelada.');
        }
      });
    } else {
      showToast('info', 'O navegador não permitiu a instalação direta. Siga o passo a passo abaixo.');
    }
  };

  const handleCopyLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true);
      showToast('success', 'Link do aplicativo copiado!');
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-2xl">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-100">
                  Instalar Atalho no Celular
                </h3>
                <p className="text-xs text-slate-400">
                  Adicione o ícone na sua Tela Inicial para abrir como App
                </p>
              </div>
            </div>

            <button
              onClick={closeInstallModal}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Direct prompt trigger if available */}
          {deferredPrompt && (
            <div className="mt-4 p-3.5 bg-blue-950/70 border border-blue-600/50 rounded-2xl flex items-center justify-between gap-3">
              <div className="text-xs">
                <span className="font-bold text-blue-200 block">Instalação Automática Suportada</span>
                <span className="text-blue-300/80 text-[11px]">Seu navegador suporta a instalação direta em 1 clique.</span>
              </div>
              <button
                onClick={handleTriggerDirectInstall}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-900/50 shrink-0 flex items-center gap-1.5 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Instalar Agora</span>
              </button>
            </div>
          )}

          {/* Platform Switcher Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 mt-4">
            <button
              onClick={() => setActiveTab('android')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'android'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android</span>
            </button>

            <button
              onClick={() => setActiveTab('ios')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'ios'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>iPhone (iOS)</span>
            </button>

            <button
              onClick={() => setActiveTab('desktop')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'desktop'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Computador</span>
            </button>
          </div>

          {/* Content Area for instructions */}
          <div className="py-4 space-y-3 overflow-y-auto pr-1">
            {activeTab === 'ios' && (
              <div className="space-y-3">
                <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-amber-200 text-xs leading-relaxed">
                  <strong>Atenção iPhone/iPad:</strong> O sistema iOS (Safari) não permite instalação automática com botão direto. Siga o passo a passo de 3 cliques abaixo:
                </div>

                <ol className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold text-xs shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <p className="font-bold text-slate-100">Abra no Safari e toque em Compartilhar</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Na barra inferior do navegador Safari, toque no ícone de <Share2 className="w-3.5 h-3.5 text-blue-400 inline mx-1" /> <strong>Compartilhar</strong> (quadrado com seta para cima).
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold text-xs shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <p className="font-bold text-slate-100">Selecione "Adicionar à Tela de Início"</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Role as opções para baixo até encontrar <PlusSquare className="w-3.5 h-3.5 text-blue-400 inline mx-1" /> <strong>"Adicionar à Tela de Início"</strong>.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold text-xs shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <p className="font-bold text-slate-100">Confirme em "Adicionar"</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        No canto superior direito da tela, toque em <strong>"Adicionar"</strong>. O ícone oficial da igreja aparecerá na tela do seu celular!
                      </p>
                    </div>
                  </li>
                </ol>
              </div>
            )}

            {activeTab === 'android' && (
              <div className="space-y-3">
                <ol className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold text-xs shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <p className="font-bold text-slate-100">Abra o menu do navegador Chrome</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        No canto superior direito, toque no ícone de <MoreVertical className="w-3.5 h-3.5 text-blue-400 inline mx-1" /> <strong>3 pontos</strong>.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold text-xs shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <p className="font-bold text-slate-100">Toque em "Instalar aplicativo" ou "Adicionar à tela inicial"</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Procure a opção <Download className="w-3.5 h-3.5 text-blue-400 inline mx-1" /> <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à Tela Inicial"</strong>.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold text-xs shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <p className="font-bold text-slate-100">Toque em Instalar</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Confirme no popup e o ícone do aplicativo será adicionado à tela inicial do seu celular.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>
            )}

            {activeTab === 'desktop' && (
              <div className="space-y-3">
                <ol className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold text-xs shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <p className="font-bold text-slate-100">Olhe a barra de endereços do Chrome ou Edge</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        No canto direito da barra de navegação (ao lado de favoritar), procure pelo ícone de computador com seta <Download className="w-3.5 h-3.5 text-blue-400 inline mx-1" />.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold text-xs shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <p className="font-bold text-slate-100">Clique em "Instalar"</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        O aplicativo se abrirá em uma janela separada e criará um atalho na sua área de trabalho.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>
            )}

            {/* Quick Share / Link option */}
            <div className="pt-2">
              <p className="text-[11px] text-slate-400 mb-2 font-medium">
                Está abrindo dentro de um aplicativo (Instagram/WhatsApp)? Abra no navegador principal (Chrome/Safari) para conseguir instalar:
              </p>
              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                <span>{copied ? 'Link Copiado! Cole no Chrome ou Safari' : 'Copiar Link para Abrir no Navegador'}</span>
              </button>
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
            <button
              onClick={closeInstallModal}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-900/40 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Entendi, fechar</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
