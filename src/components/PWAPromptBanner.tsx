import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Download, Smartphone, CheckCircle, HelpCircle, X, ExternalLink, ShieldCheck } from 'lucide-react';

export const PWAPromptBanner: React.FC = () => {
  const { deferredPrompt, installPWA, isStandalone } = useApp();
  const [dismissed, setDismissed] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Do not show if app is already running in standalone PWA mode or if dismissed by user
  if (isStandalone || dismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-slate-900 border border-blue-600/40 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden my-4">
      {/* Decorative ambient background glow */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center p-2.5 shrink-0 shadow-lg shadow-blue-600/30 border border-blue-400/40">
            <Smartphone className="w-6 h-6 text-white" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-white text-sm sm:text-base tracking-tight">
                Instalar Aplicativo Nativo (PWA)
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>PWA Nativo Pronto</span>
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Abra em tela cheia sem barra do navegador, com ícone próprio no Android e suporte offline total.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={installPWA}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-extrabold text-xs shadow-lg shadow-blue-900/50 border border-blue-400/40 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-white" />
            <span>{deferredPrompt ? 'Instalar Aplicativo' : 'Instalar no Celular'}</span>
          </button>

          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Instruções de Instalação Manual"
          >
            <HelpCircle className="w-4.5 h-4.5 text-slate-300" />
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Fechar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Manual Installation Steps Accordion */}
      {showInstructions && (
        <div className="mt-4 pt-3.5 border-t border-slate-800 text-xs text-slate-300 space-y-2 bg-slate-950/60 p-3.5 rounded-xl">
          <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
            <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>Como instalar o PWA nativo no seu navegador:</span>
          </h4>
          <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc list-inside pl-1">
            <li>
              <strong className="text-slate-100">Android (Google Chrome):</strong> Se o prompt acima não abrir automaticamente, toque nos 3 pontos verticais do menu do Chrome (⋮) e selecione <span className="text-blue-300 font-semibold">"Instalar aplicativo"</span> ou <span className="text-blue-300 font-semibold">"Adicionar à Tela Inicial"</span>.
            </li>
            <li>
              <strong className="text-slate-100">iPhone / iPad (Safari):</strong> Toque no botão de <span className="text-blue-300 font-semibold">Compartilhar</span> (ícone com seta para cima) no Safari e escolha <span className="text-blue-300 font-semibold">"Adicionar à Tela de Início"</span>.
            </li>
            <li>
              <strong className="text-slate-100">Computador (Chrome / Edge):</strong> Clique no ícone de instalação <span className="text-blue-300 font-semibold">(⊕)</span> na barra de endereço do navegador.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
