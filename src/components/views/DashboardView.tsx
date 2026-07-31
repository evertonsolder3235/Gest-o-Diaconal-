import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChurchLogo } from '../ChurchLogo';
import { EscalaModal } from '../modals/EscalaModal';
import {
  Users,
  Cake,
  ShieldCheck,
  Heart,
  Megaphone,
  Wallet,
  UserPlus,
  PlusCircle,
  Pin,
  ChevronRight,
  TrendingUp,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Activity,
  Plus,
  Check,
  CheckCheck,
  User,
  Eye,
  EyeOff,
  Smartphone,
  Download,
  X,
  CheckCircle2,
  Share2
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    visitantes,
    aniversariantes,
    obreiros,
    pedidos,
    avisos,
    contribuicoes,
    setActiveTab,
    setSearchQuery,
    unseenModules,
    markAsSeen,
    markAllAsSeen,
    config,
    currentUser,
    installPWA
  } = useApp();

  const [escalaModalOpen, setEscalaModalOpen] = useState(false);
  const [escalaGrupo, setEscalaGrupo] = useState<'Homens' | 'Mulheres'>('Homens');
  const [showFinanceiroValue, setShowFinanceiroValue] = useState<boolean>(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);

  const totalVisitantes = visitantes.length;
  const visitantesNovos = visitantes.filter(v => v.status === 'Novo').length;

  const totalObreiros = obreiros.length;
  const obreirosAtivos = obreiros.filter(o => o.status === 'Ativo').length;

  const totalPedidos = pedidos.length;
  const pedidosUrgentes = pedidos.filter(p => p.status === 'Urgente').length;

  const totalFinanceiro = contribuicoes.reduce((acc, item) => acc + item.valor, 0);

  const avisosFixados = avisos.filter(a => a.fixado);

  // Pulse triggers based on unseen creation status
  const pulseVisitantes = unseenModules.visitantes;
  const pulseAniversariantes = unseenModules.aniversariantes;
  const pulseObreiros = unseenModules.obreiros;
  const pulsePedidos = unseenModules.pedidos;
  const pulseAvisos = unseenModules.avisos;
  const pulseFinanceiro = unseenModules.financeiro;

  const hasAnyUnseen = Object.values(unseenModules).some(Boolean);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDateBR = (dateStr?: string) => {
    if (!dateStr) return '';
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const [, year, month, day] = match;
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  };

  const isBirthdayToday = (dateStr?: string) => {
    if (!dateStr) return false;
    const now = new Date();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentDay = String(now.getDate()).padStart(2, '0');

    // YYYY-MM-DD or MM-DD
    const ymdMatch = dateStr.match(/^(?:\d{4}-)?(\d{2})-(\d{2})$/);
    if (ymdMatch) {
      const [, month, day] = ymdMatch;
      return month === currentMonth && day === currentDay;
    }

    // DD/MM or DD/MM/YYYY
    const dmyMatch = dateStr.match(/^(\d{2})\/(\d{2})(?:\/\d{4})?$/);
    if (dmyMatch) {
      const [, day, month] = dmyMatch;
      return month === currentMonth && day === currentDay;
    }

    return false;
  };

  const obreirosAniversariantesHoje = obreiros.filter((o) => isBirthdayToday(o.dataNascimento));
  const comemoracoesHoje = aniversariantes.filter((a) => isBirthdayToday(a.data));
  const totalAniversariantesHoje = obreirosAniversariantesHoje.length + comemoracoesHoje.length;
  const temAniversarianteHoje = totalAniversariantesHoje > 0;

  const alertAniversariantes = pulseAniversariantes || temAniversarianteHoje;

  return (
    <div className="space-y-6 pb-12">
      {/* Banner de Download do Aplicativo Android / APK & PWA */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950/80 via-slate-900 to-blue-950/80 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center p-2.5 shadow-lg shadow-emerald-950/60 border border-emerald-400/40 shrink-0">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
                  Aplicativo Android Instalável (APK & PWA)
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full uppercase">
                  Nativo Standalone
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Abra sem barra do navegador, em tela cheia com ícone personalizado na tela inicial do celular.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
            <a
              href="/gestao-diaconal.apk"
              download="GestaoDiaconal.apk"
              onClick={() => setIsApkModalOpen(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-950/50 border border-emerald-400/40 transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Aplicativo (APK)</span>
            </a>

            <button
              onClick={() => setIsApkModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all"
              title="Instruções de Instalação"
            >
              Como Instalar
            </button>
          </div>
        </div>
      </div>

      {/* Top Main Status Bar - Topo da Visão do Painel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        {/* Top Header: Calendar Icon & Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-center p-3 shadow-lg shadow-blue-900/40 border border-blue-400/30 shrink-0">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                MINHA ESCALA
              </h2>
            </div>
          </div>

          {hasAnyUnseen && (
            <button
              onClick={markAllAsSeen}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all"
              title="Marcar todos os cards como vistos"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Marcar Vistos</span>
            </button>
          )}
        </div>

        {/* Bottom Buttons: Blue on the far left extremity, Pink on the far right extremity */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <button
            onClick={() => {
              setEscalaGrupo('Homens');
              setEscalaModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-lg shadow-blue-900/40 border border-blue-400/40 transition-all cursor-pointer active:scale-95"
            title="Escala de Serviço - Homens"
          >
            <User className="w-4 h-4" />
            <span>Homem</span>
          </button>

          <button
            onClick={() => {
              setEscalaGrupo('Mulheres');
              setEscalaModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white font-extrabold text-sm shadow-lg shadow-pink-900/40 border border-pink-400/40 transition-all cursor-pointer active:scale-95"
            title="Escala de Serviço - Mulheres"
          >
            <User className="w-4 h-4" />
            <span>Mulher</span>
          </button>
        </div>
      </div>

      {/* Top Category Summary Cards Row - No Topo para Visão Imediata */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Visitantes */}
        <div
          onClick={() => {
            markAsSeen('visitantes');
            setActiveTab('visitantes');
          }}
          className={`bg-slate-900/90 border rounded-2xl p-3.5 cursor-pointer transition-all hover:bg-slate-850 group flex flex-col justify-between relative overflow-hidden ${
            pulseVisitantes
              ? 'border-blue-500/80 shadow-[0_0_15px_rgba(59,130,246,0.25)] animate-pulse'
              : 'border-slate-800 hover:border-blue-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 group-hover:text-blue-400">Visitantes</span>
              {pulseVisitantes && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
              )}
            </div>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-end justify-between gap-1">
            <div>
              <div className="text-xl font-extrabold text-white">{totalVisitantes}</div>
              <span className="text-[10px] text-slate-500 block truncate">
                {visitantesNovos > 0 ? `${visitantesNovos} novos` : 'Atualizados'}
              </span>
            </div>
            {pulseVisitantes && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  markAsSeen('visitantes');
                }}
                className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold bg-blue-950/90 hover:bg-blue-900 text-blue-200 border border-blue-700/80 rounded-md transition-colors shadow-sm"
                title="Marcar como visto"
              >
                <Check className="w-3 h-3 text-blue-400" />
                <span>Visto</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Aniversariantes */}
        <div
          onClick={() => {
            markAsSeen('aniversariantes');
            setActiveTab('aniversariantes');
          }}
          className={`bg-slate-900/90 border rounded-2xl p-3.5 cursor-pointer transition-all hover:bg-slate-850 group flex flex-col justify-between relative overflow-hidden ${
            alertAniversariantes
              ? 'border-purple-500/80 shadow-[0_0_18px_rgba(168,85,247,0.35)] animate-pulse'
              : 'border-slate-800 hover:border-purple-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 group-hover:text-purple-400">Aniversários</span>
              {alertAniversariantes && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
              )}
            </div>
            <Cake className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-end justify-between gap-1">
            <div>
              <div className="text-xl font-extrabold text-white">{aniversariantes.length}</div>
              <span className={`text-[10px] block truncate font-semibold ${temAniversarianteHoje ? 'text-purple-300 font-bold' : 'text-slate-500'}`}>
                {temAniversarianteHoje ? `🎉 ${totalAniversariantesHoje} hoje!` : 'Bodas & Nasc.'}
              </span>
            </div>
            {alertAniversariantes && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  markAsSeen('aniversariantes');
                }}
                className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold bg-purple-950/90 hover:bg-purple-900 text-purple-200 border border-purple-700/80 rounded-md transition-colors shadow-sm"
                title="Marcar como visto"
              >
                <Check className="w-3 h-3 text-purple-400" />
                <span>Visto</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. Obreiros */}
        <div
          onClick={() => {
            markAsSeen('obreiros');
            setActiveTab('obreiros');
          }}
          className={`bg-slate-900/90 border rounded-2xl p-3.5 cursor-pointer transition-all hover:bg-slate-850 group flex flex-col justify-between relative overflow-hidden ${
            pulseObreiros
              ? 'border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.25)] animate-pulse'
              : 'border-slate-800 hover:border-emerald-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 group-hover:text-emerald-400">Obreiros</span>
              {pulseObreiros && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-end justify-between gap-1">
            <div>
              <div className="text-xl font-extrabold text-white">{totalObreiros}</div>
              <span className="text-[10px] text-slate-500 block truncate">{obreirosAtivos} ativos</span>
            </div>
            {pulseObreiros && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  markAsSeen('obreiros');
                }}
                className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold bg-emerald-950/90 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/80 rounded-md transition-colors shadow-sm"
                title="Marcar como visto"
              >
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Visto</span>
              </button>
            )}
          </div>
        </div>

        {/* 4. Pedidos de Oração */}
        <div
          onClick={() => {
            markAsSeen('pedidos');
            setActiveTab('pedidos');
          }}
          className={`bg-slate-900/90 border rounded-2xl p-3.5 cursor-pointer transition-all hover:bg-slate-850 group flex flex-col justify-between relative overflow-hidden ${
            pulsePedidos
              ? 'border-rose-500/80 shadow-[0_0_18px_rgba(244,63,94,0.3)] animate-pulse'
              : 'border-slate-800 hover:border-rose-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 group-hover:text-rose-400">Orações</span>
              {pulsePedidos && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
              )}
            </div>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-end justify-between gap-1">
            <div>
              <div className="text-xl font-extrabold text-white flex items-center gap-1">
                <span>{totalPedidos}</span>
                {pedidosUrgentes > 0 && (
                  <span className="text-[9px] px-1.5 py-0.2 bg-rose-950 text-rose-300 border border-rose-800 rounded font-bold">
                    !
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 block truncate">
                {pedidosUrgentes > 0 ? `${pedidosUrgentes} urgentes` : 'Em oração'}
              </span>
            </div>
            {pulsePedidos && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  markAsSeen('pedidos');
                }}
                className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold bg-rose-950/90 hover:bg-rose-900 text-rose-200 border border-rose-700/80 rounded-md transition-colors shadow-sm"
                title="Marcar como visto"
              >
                <Check className="w-3 h-3 text-rose-400" />
                <span>Visto</span>
              </button>
            )}
          </div>
        </div>

        {/* 5. Avisos */}
        <div
          onClick={() => {
            markAsSeen('avisos');
            setActiveTab('avisos');
          }}
          className={`bg-slate-900/90 border rounded-2xl p-3.5 cursor-pointer transition-all hover:bg-slate-850 group flex flex-col justify-between relative overflow-hidden ${
            pulseAvisos
              ? 'border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.25)] animate-pulse'
              : 'border-slate-800 hover:border-amber-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 group-hover:text-amber-400">Avisos</span>
              {pulseAvisos && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              )}
            </div>
            <Megaphone className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-end justify-between gap-1">
            <div>
              <div className="text-xl font-extrabold text-white">{avisos.length}</div>
              <span className="text-[10px] text-slate-500 block truncate">
                {avisosFixados.length > 0 ? `${avisosFixados.length} destacados` : 'Comunicados'}
              </span>
            </div>
            {pulseAvisos && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  markAsSeen('avisos');
                }}
                className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold bg-amber-950/90 hover:bg-amber-900 text-amber-200 border border-amber-700/80 rounded-md transition-colors shadow-sm"
                title="Marcar como visto"
              >
                <Check className="w-3 h-3 text-amber-400" />
                <span>Visto</span>
              </button>
            )}
          </div>
        </div>

        {/* 6. Financeiro */}
        <div
          onClick={() => {
            markAsSeen('financeiro');
            setActiveTab('financeiro');
          }}
          className={`bg-slate-900/90 border rounded-2xl p-3.5 cursor-pointer transition-all hover:bg-slate-850 group flex flex-col justify-between relative overflow-hidden ${
            pulseFinanceiro
              ? 'border-teal-500/80 shadow-[0_0_15px_rgba(20,184,166,0.25)] animate-pulse'
              : 'border-slate-800 hover:border-teal-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 group-hover:text-teal-400">Financeiro</span>
              {pulseFinanceiro && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFinanceiroValue((prev) => !prev);
                }}
                className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-md transition-colors"
                title={showFinanceiroValue ? 'Ocultar valor' : 'Mostrar valor'}
              >
                {showFinanceiroValue ? (
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-2 flex items-end justify-between gap-1">
            <div>
              <div className="text-sm font-extrabold text-emerald-400 tracking-tight truncate">
                {showFinanceiroValue ? formatBRL(totalFinanceiro) : 'R$ •••,••'}
              </div>
              <span className="text-[10px] text-slate-500 block truncate">
                {contribuicoes.length} lançamentos
              </span>
            </div>
            {pulseFinanceiro && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  markAsSeen('financeiro');
                }}
                className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold bg-teal-950/90 hover:bg-teal-900 text-teal-200 border border-teal-700/80 rounded-md transition-colors shadow-sm"
                title="Marcar como visto"
              >
                <Check className="w-3 h-3 text-teal-400" />
                <span>Visto</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Featured Pinned Announcements Banner (Avisos em Destaque) */}
      {avisosFixados.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-800/40 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Pin className="w-4 h-4 fill-amber-400/20" />
              <span>Avisos Importantes!</span>
            </div>
            <button
              onClick={() => setActiveTab('avisos')}
              className="text-xs font-semibold text-amber-300 hover:underline flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {avisosFixados.map((aviso) => (
              <div
                key={aviso.id}
                onClick={() => setActiveTab('avisos')}
                className="bg-slate-900/80 border border-amber-800/30 rounded-xl p-3.5 hover:border-amber-600/50 cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-slate-100 text-xs sm:text-sm">{aviso.titulo}</h4>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-700/40 shrink-0">
                    {formatDateBR(aviso.data)} {aviso.horario ? `às ${aviso.horario}` : ''}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                  {aviso.descricao}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity Brief Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>Últimos Visitantes Cadastrados</span>
          </h3>
          <button
            onClick={() => setActiveTab('visitantes')}
            className="text-xs text-blue-400 font-semibold hover:underline"
          >
            Ver todos
          </button>
        </div>

        <div className="space-y-2.5">
          {visitantes.slice(0, 3).map((v) => (
            <div
              key={v.id}
              onClick={() => setActiveTab('visitantes')}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700 cursor-pointer transition-colors"
            >
              <div>
                <h4 className="text-xs font-bold text-slate-200">{v.nome}</h4>
                <p className="text-[11px] text-slate-400">{v.telefone} • {v.comoConheceu || 'Visita recente'}</p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                v.status === 'Novo'
                  ? 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                  : v.status === 'Em Acompanhamento'
                  ? 'bg-amber-900/60 text-amber-300 border border-amber-700/50'
                  : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
              }`}>
                {v.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Escala Modal */}
      <EscalaModal
        isOpen={escalaModalOpen}
        onClose={() => setEscalaModalOpen(false)}
        grupoTarget={escalaGrupo}
      />

      {/* Modal de Instalação do Aplicativo Android (APK & PWA) */}
      {isApkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsApkModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Instalar Aplicativo Android</h3>
                <p className="text-xs text-emerald-400 font-semibold">Modo Nativo Standalone & Tela Cheia</p>
              </div>
            </div>

            <div className="space-y-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Sem Barra de Navegador:</strong> Abre exatamente como um app nativo baixado da Play Store.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Ícone & Splash Screen:</strong> Acesso direto na tela inicial do celular com abertura instantânea.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Funcionalidade 100% Sincronizada:</strong> Todos os dados de escalas, avisos, visitantes e financeiro em tempo real.</span>
              </div>
            </div>

            <div className="space-y-3 text-left">
              <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">Passo a Passo para Instalar o APK:</h4>
              <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
                <li className="leading-relaxed">Clique no botão verde <strong>"Baixar Arquivo APK"</strong> abaixo para realizar o download do pacote do aplicativo.</li>
                <li className="leading-relaxed">Após o término do download, abra o arquivo <strong>GestaoDiaconal.apk</strong> na barra de notificações ou pasta Downloads.</li>
                <li className="leading-relaxed">Se o Android perguntar, selecione <strong>Permitir instalação de fontes desconhecidas</strong> para este arquivo.</li>
                <li className="leading-relaxed">Clique em <strong>Instalar</strong>. O ícone do app será adicionado à sua tela inicial!</li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-slate-800">
              <a
                href="/gestao-diaconal.apk"
                download="GestaoDiaconal.apk"
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-950/60 border border-emerald-400/40 transition-all cursor-pointer text-center"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Arquivo APK</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  installPWA();
                  setIsApkModalOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm border border-blue-400/40 transition-all cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Instalar via PWA (Navegador)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
