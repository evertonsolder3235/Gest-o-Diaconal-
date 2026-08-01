import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ChurchLogo } from '../ChurchLogo';
import {
  Settings,
  Building2
} from 'lucide-react';

export const ConfiguracoesView: React.FC = () => {
  const {
    config,
    updateConfig,
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

  // Keep local fields in sync with context updates/restores
  useEffect(() => {
    setNomeIgreja(config.nomeIgreja || '');
    setSubtitulo(config.subtitulo || '');
    setPastorPresidente(config.pastorPresidente || '');
    setEndereco(config.endereco || '');
    setTelefone(config.telefone || '');
    setEmail(config.email || '');
    setChavePix(config.chavePix || '');
  }, [config]);

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

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Page Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-100">Configurações</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Identidade e dados oficiais da igreja
            </p>
          </div>
        </div>
      </div>

      {/* 1. CHURCH IDENTITY CONFIGURATION */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <Building2 className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-slate-100 text-sm">Dados e Identidade da Igreja</h3>
        </div>

        {/* Logo Preview Banner */}
        <div className="mb-6 p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-4">
          <ChurchLogo size="xl" className="shadow-md" />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
              Logomarca Oficial Definida
            </span>
            <h4 className="text-sm font-bold text-slate-100 mt-0.5 truncate">
              {nomeIgreja || config.nomeIgreja}
            </h4>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              {subtitulo || config.subtitulo}
            </p>
            {(endereco || pastorPresidente) && (
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                {[pastorPresidente, endereco].filter(Boolean).join(' • ')}
              </p>
            )}
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
    </div>
  );
};
