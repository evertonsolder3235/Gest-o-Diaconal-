import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChurchLogo } from '../ChurchLogo';
import {
  Settings,
  Building2,
  Download,
  Upload,
  RefreshCw,
  Smartphone,
  Laptop,
  CheckCircle2,
  ShieldCheck,
  User as UserIcon,
  HardDrive,
  Copy,
  Info
} from 'lucide-react';

export const ConfiguracoesView: React.FC = () => {
  const {
    config,
    updateConfig,
    currentUser,
    exportBackup,
    importBackup,
    resetDemoData,
    deferredPrompt,
    installPWA,
    isStandalone,
    showToast,
    requestAdminAuth
  } = useApp();

  // Church config edit state
  const [nomeIgreja, setNomeIgreja] = useState(config.nomeIgreja);
  const [subtitulo, setSubtitulo] = useState(config.subtitulo);
  const [pastorPresidente, setPastorPresidente] = useState(config.pastorPresidente);
  const [endereco, setEndereco] = useState(config.endereco);
  const [telefone, setTelefone] = useState(config.telefone);
  const [email, setEmail] = useState(config.email);
  const [chavePix, setChavePix] = useState(config.chavePix || '');

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    requestAdminAuth(() => {
      updateConfig({
        nomeIgreja,
        subtitulo,
        pastorPresidente,
        endereco,
        telefone,
        email,
        chavePix
      });
    }, 'Salvar Configurações da Igreja');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          importBackup(content);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Page Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-100">Configurações & PWA</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Identidade da igreja, dados de backup e instalação do aplicativo
            </p>
          </div>
        </div>
      </div>

      {/* 1. PWA INSTALLATION STATUS & INSTRUCTIONS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-slate-100 text-sm">Aplicativo PWA Instalável</h3>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              isStandalone
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-blue-950 text-blue-300 border border-blue-800'
            }`}
          >
            {isStandalone ? '✓ Executando em Modo App' : 'Navegador Web / PWA Próximo'}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          O <strong>Gestão Diaconal</strong> pode ser instalado no seu celular, tablet ou computador como um aplicativo nativo, com carregamento ultrarrápido e funcionamento offline.
        </p>

        {!isStandalone && (
          <div className="mb-5 p-4 rounded-xl bg-blue-950/40 border border-blue-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-blue-200">Instalar com um clique</h4>
              <p className="text-[11px] text-blue-300">
                Adiciona o ícone do Gestão Diaconal à sua tela inicial sem necessidade de loja de aplicativos.
              </p>
            </div>
            <button
              onClick={installPWA}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-900/40 shrink-0 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Instalar Agora</span>
            </button>
          </div>
        )}

        {/* Device installation tips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-300">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <strong className="block text-slate-200 font-bold mb-1">Android (Chrome)</strong>
            <span>Clique nos 3 pontos do navegador e selecione <em>"Adicionar à Tela Inicial"</em> ou <em>"Instalar aplicativo"</em>.</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <strong className="block text-slate-200 font-bold mb-1">iPhone / iPad (Safari)</strong>
            <span>Toque no botão <em>Compartilhar</em> (ícone com seta) e escolha <em>"Adicionar à Tela de Início"</em>.</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <strong className="block text-slate-200 font-bold mb-1">Computador (PC/Mac)</strong>
            <span>Clique no ícone de instalação no canto da barra de endereço do Chrome ou Edge.</span>
          </div>
        </div>
      </div>

      {/* 2. CHURCH IDENTITY CONFIGURATION */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <Building2 className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-slate-100 text-sm">Dados e Identidade da Igreja</h3>
        </div>

        {/* Logo Preview Banner */}
        <div className="mb-6 p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-4">
          <ChurchLogo size="xl" className="shadow-md" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
              Logomarca Oficial Definida
            </span>
            <h4 className="text-sm font-bold text-slate-100 mt-0.5">
              {config.nomeIgreja}
            </h4>
            <p className="text-xs text-slate-400">
              AD Brás • Ministério de Ribeirão Preto - SEDE
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nome da Igreja *</label>
              <input
                type="text"
                required
                value={nomeIgreja}
                onChange={(e) => setNomeIgreja(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Slogan / Subtítulo</label>
              <input
                type="text"
                value={subtitulo}
                onChange={(e) => setSubtitulo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Pastor Presidente</label>
              <input
                type="text"
                value={pastorPresidente}
                onChange={(e) => setPastorPresidente(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Chave Pix da Igreja</label>
              <input
                type="text"
                value={chavePix}
                onChange={(e) => setChavePix(e.target.value)}
                placeholder="CNPJ, E-mail ou Chave Aleatória"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Endereço do Templo</label>
            <input
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Telefone da Secretaria</label>
              <input
                type="tel"
                inputMode="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail Oficial</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-900/30"
            >
              Salvar Alterações da Igreja
            </button>
          </div>
        </form>
      </div>

      {/* 3. BACKUP & DATA MANAGEMENT */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2.5 mb-2">
          <HardDrive className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-slate-100 text-sm">Backup & Restauração de Dados</h3>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Exporte um arquivo de segurança com todos os visitantes, obreiros, orações e lançamentos financeiros.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={exportBackup}
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-bold transition-all"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exportar Backup (JSON)</span>
          </button>

          <label className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-bold cursor-pointer transition-all">
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Restaurar Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              if (window.confirm('Tem certeza de que deseja restaurar os dados de demonstração originais?')) {
                resetDemoData();
              }
            }}
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-950 border border-rose-900/40 hover:border-rose-800 text-rose-300 text-xs font-bold transition-all"
          >
            <RefreshCw className="w-4 h-4 text-rose-400" />
            <span>Restaurar Dados Iniciais</span>
          </button>
        </div>
      </div>

      {/* 4. USER & SYSTEM INFO BADGE */}
      {currentUser && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-200 block">{currentUser.nome}</span>
              <span className="text-blue-400 font-medium">{currentUser.cargo} ({currentUser.email})</span>
            </div>
          </div>

          <div className="text-right text-[11px] text-slate-500 font-mono">
            <span>Sessão Ativa</span>
            <span className="block text-slate-600">ID: {currentUser.id}</span>
          </div>
        </div>
      )}
    </div>
  );
};
