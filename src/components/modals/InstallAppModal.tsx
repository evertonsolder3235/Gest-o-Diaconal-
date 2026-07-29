import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Download,
  Smartphone,
  Share,
  PlusSquare,
  X,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Laptop
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { deferredPrompt, installPWA, config } = useApp();

  if (!isOpen) return null;

  const handleDirectInstall = () => {
    if (deferredPrompt) {
      installPWA();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 leading-tight">
                Instalar Aplicativo
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Atalho direto na Tela Inicial (Sem barra de URL)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-300">
          {/* App Info Box */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xl shrink-0">
              {config.nomeIgreja ? config.nomeIgreja.substring(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                Aplicativo PWA Oficial
              </p>
              <h4 className="text-sm font-bold text-slate-100 truncate">
                {config.nomeIgreja || 'Igreja ADBRAS'}
              </h4>
              <p className="text-xs text-slate-400 truncate">
                {config.subtitulo || 'Gestão Diaconal & Acolhimento'}
              </p>
            </div>
          </div>

          {/* If 1-click install prompt is ready */}
          {deferredPrompt ? (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wide">
                    Instalação Direta com 1 Clique
                  </h4>
                  <p className="text-xs text-emerald-300/80 mt-1">
                    Seu navegador suporta a instalação imediata do aplicativo na tela inicial do seu celular ou computador.
                  </p>
                </div>
              </div>

              <button
                onClick={handleDirectInstall}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Instalar Aplicativo Agora</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Para ter o aplicativo instalado na tela inicial do seu dispositivo como um aplicativo nativo (sem barra de URL do navegador), siga as instruções abaixo:
              </p>

              {/* Android / Chrome */}
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wide">
                  <Smartphone className="w-4 h-4" />
                  <span>Android / Chrome ou Edge</span>
                </div>
                <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside pl-1">
                  <li>Toque nos <strong className="text-slate-100">3 pontos (⋮)</strong> no canto superior do navegador.</li>
                  <li>Selecione <strong className="text-blue-300">"Adicionar à Tela inicial"</strong> ou <strong className="text-blue-300">"Instalar aplicativo"</strong>.</li>
                  <li>Confirme clicando em <strong className="text-slate-100">Instalar</strong>.</li>
                </ol>
              </div>

              {/* iPhone / Safari */}
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wide">
                  <Share className="w-4 h-4" />
                  <span>iPhone / iPad (Safari)</span>
                </div>
                <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside pl-1">
                  <li>Toque no botão <strong className="text-slate-100">Compartilhar</strong> (ícone de quadrado com seta para cima) no Safari.</li>
                  <li>Role para baixo e selecione <strong className="text-indigo-300">"Adicionar à Tela de Início"</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-indigo-400" />).</li>
                  <li>Toque em <strong className="text-slate-100">Adicionar</strong> no canto superior direito.</li>
                </ol>
              </div>

              {/* Computer / Desktop */}
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wide">
                  <Laptop className="w-4 h-4" />
                  <span>Computador (Chrome / Edge / Brave)</span>
                </div>
                <p className="text-xs text-slate-300">
                  Clique no ícone de <strong className="text-sky-300">Instalar App</strong> localizado na barra de endereço na parte superior direita do seu navegador.
                </p>
              </div>
            </div>
          )}

          {/* Benefits list */}
          <div className="pt-2 border-t border-slate-800 space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Vantagens do Aplicativo Instalado:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Sem barra de URL</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Ícone na tela inicial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Acesso ultra-rápido</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Atualização automática</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
          >
            Entendi / Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
