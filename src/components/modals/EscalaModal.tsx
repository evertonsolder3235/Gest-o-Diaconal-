import React, { useState, useMemo } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Plus,
  Trash2,
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Car,
  Sparkles,
  Droplets,
  Layers,
  Heart,
  Users,
  Edit2,
  CalendarDays,
  ListFilter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ItemEscala, LugarEscala } from '../../types';

interface EscalaModalProps {
  isOpen: boolean;
  onClose: () => void;
  grupoTarget: 'Homens' | 'Mulheres';
}

export const EscalaModal: React.FC<EscalaModalProps> = ({
  isOpen,
  onClose,
  grupoTarget = 'Homens'
}) => {
  const { escalas, addEscalaItem, deleteEscalaItem, saveEscalasBulk, obreiros, showToast, requestAdminAuth } = useApp();

  // Mode: 'semanal' | 'mensal'
  const [viewMode, setViewMode] = useState<'semanal' | 'mensal'>('semanal');

  // Month navigation (Defaults to current month: July 2026)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 6, 1)); // July 2026

  // Form State for adding/editing a schedule item
  const [showItemForm, setShowItemForm] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ItemEscala | null>(null);

  const [formData, setFormData] = useState<{
    data: string;
    horario: string;
    lugar: LugarEscala | string;
    nomePessoa: string;
    observacao: string;
  }>({
    data: new Date().toISOString().slice(0, 10),
    horario: '19:30',
    lugar: 'ALTAR',
    nomePessoa: '',
    observacao: ''
  });

  // Local draft items while editing monthly scale
  const [localEscalas, setLocalEscalas] = useState<ItemEscala[]>(escalas);

  // Sync local items when scales update from context
  React.useEffect(() => {
    setLocalEscalas(escalas);
  }, [escalas]);

  // Filter items for target group ('Homens' or 'Mulheres')
  const groupEscalas = localEscalas.filter((e) => e.grupo === grupoTarget);

  // Current Week calculation (Default to week of July 20, 2026 to July 26, 2026)
  const weekDates = useMemo(() => {
    const today = new Date(2026, 6, 23); // Base date: Thursday Jul 23, 2026
    const dayOfWeek = today.getDay(); // 4 = Thu
    // Start week on Monday
    const startOfWeek = new Date(today);
    const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(today.getDate() + diffToMon);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      weekDays.push(d);
    }
    return weekDays;
  }, []);

  const todayStr = '2026-07-23';

  // Sort week dates so current service days and today are always at the top
  const sortedWeekDates = useMemo(() => {
    const formatDateStr = (y: number, m: number, d: number) => {
      const mm = String(m + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      return `${y}-${mm}-${dd}`;
    };

    return [...weekDates].sort((a, b) => {
      const dateStrA = formatDateStr(a.getFullYear(), a.getMonth(), a.getDate());
      const dateStrB = formatDateStr(b.getFullYear(), b.getMonth(), b.getDate());

      const itemsA = groupEscalas.filter((i) => i.data === dateStrA);
      const itemsB = groupEscalas.filter((i) => i.data === dateStrB);

      const isTodayA = dateStrA === todayStr;
      const isTodayB = dateStrB === todayStr;

      const isPastA = dateStrA < todayStr;
      const isPastB = dateStrB < todayStr;

      const getRank = (isToday: boolean, isPast: boolean, count: number) => {
        if (isToday && count > 0) return 0; // Today with active service
        if (isToday) return 1; // Today
        if (!isPast && count > 0) return 2; // Upcoming days with active service
        if (!isPast && count === 0) return 3; // Upcoming days without service
        if (isPast && count > 0) return 4; // Past days with active service
        return 5; // Past days without service
      };

      const rankA = getRank(isTodayA, isPastA, itemsA.length);
      const rankB = getRank(isTodayB, isPastB, itemsB.length);

      if (rankA !== rankB) {
        return rankA - rankB;
      }

      return dateStrA.localeCompare(dateStrB);
    });
  }, [weekDates, groupEscalas]);

  if (!isOpen) return null;

  // Month calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // Days in month
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Helper for formatted date
  const formatDateString = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Handle Form Submission
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nomePessoa.trim()) {
      showToast('error', 'Por favor, informe ou selecione o nome da pessoa.');
      return;
    }

    if (editingItem) {
      // Update item in localEscalas
      setLocalEscalas((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? { ...item, ...formData, grupo: grupoTarget }
            : item
        )
      );
      showToast('info', 'Item da escala atualizado localmente.');
    } else {
      // Add new item to localEscalas
      const newItem: ItemEscala = {
        id: 'e-' + Date.now() + Math.random().toString(36).substring(2, 5),
        ...formData,
        grupo: grupoTarget
      };
      setLocalEscalas((prev) => [...prev, newItem]);
      showToast('success', 'Nova pessoa adicionada à escala local.');
    }

    setShowItemForm(false);
    setEditingItem(null);
  };

  const handleOpenAddForm = (selectedDate?: string) => {
    requestAdminAuth(() => {
      setEditingItem(null);
      setFormData({
        data: selectedDate || new Date().toISOString().slice(0, 10),
        horario: '19:30',
        lugar: 'ALTAR',
        nomePessoa: '',
        observacao: ''
      });
      setShowItemForm(true);
    }, 'Adicionar à Escala');
  };

  const handleOpenEditForm = (item: ItemEscala) => {
    requestAdminAuth(() => {
      setEditingItem(item);
      setFormData({
        data: item.data,
        horario: item.horario,
        lugar: item.lugar,
        nomePessoa: item.nomePessoa,
        observacao: item.observacao || ''
      });
      setShowItemForm(true);
    }, 'Editar Escalado');
  };

  const handleDeleteItemLocal = (id: string) => {
    setLocalEscalas((prev) => prev.filter((i) => i.id !== id));
    showToast('info', 'Item removido da escala local.');
  };

  // Final Save Escala Action
  const handleSaveAndShowWeekly = () => {
    saveEscalasBulk(localEscalas);
    setViewMode('semanal');
  };

  const getPlaceBadgeColor = (lugar: string) => {
    switch (lugar.toUpperCase()) {
      case 'ALTAR':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/80';
      case 'BANHEIRO':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-700/80';
      case 'ESTACIONAMENTO':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80';
      case 'GALERIA':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-700/80';
      case 'INTERCESSÃO':
        return 'bg-rose-950/80 text-rose-300 border-rose-700/80';
      case 'RECEPÇÃO':
        return 'bg-purple-950/80 text-purple-300 border-purple-700/80';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getPlaceIcon = (lugar: string) => {
    switch (lugar.toUpperCase()) {
      case 'ALTAR':
        return <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />;
      case 'BANHEIRO':
        return <Droplets className="w-3.5 h-3.5 text-cyan-400" />;
      case 'ESTACIONAMENTO':
        return <Car className="w-3.5 h-3.5 text-emerald-400" />;
      case 'GALERIA':
        return <Layers className="w-3.5 h-3.5 text-indigo-400" />;
      case 'INTERCESSÃO':
        return <Heart className="w-3.5 h-3.5 text-rose-400" />;
      case 'RECEPÇÃO':
        return <Users className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <MapPin className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-inner ${
                grupoTarget === 'Homens'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'bg-pink-600/20 text-pink-400 border border-pink-500/30'
              }`}
            >
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white">
                  Escala de Serviço - {grupoTarget}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    grupoTarget === 'Homens'
                      ? 'bg-blue-950 text-blue-300 border-blue-800'
                      : 'bg-pink-950 text-pink-300 border-pink-800'
                  }`}
                >
                  {viewMode === 'semanal' ? 'Visão Semanal' : 'Montagem Mensal'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Postos: <strong className="text-slate-200">ALTAR, BANHEIRO, ESTACIONAMENTO, GALERIA, INTERCESSÃO, RECEPÇÃO</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Mode Switcher Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-slate-900/50 border-b border-slate-800">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('semanal')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'semanal'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Escala Semanal</span>
            </button>
            <button
              onClick={() => requestAdminAuth(() => setViewMode('mensal'), 'Montar / Editar Escala Mensal')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'mensal'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Montar / Editar Escala Mensal</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenAddForm()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-blue-400" />
              <span>+ Escalado</span>
            </button>
            {viewMode === 'mensal' && (
              <button
                onClick={handleSaveAndShowWeekly}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Salvar & Ver Semanal</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* VIEW MODE 1: ESCALA SEMANAL */}
          {viewMode === 'semanal' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <CalendarIcon className="w-4 h-4 text-blue-400" />
                  <span>
                    Semana Vigente:{' '}
                    <strong className="text-white">
                      {weekDates[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} até{' '}
                      {weekDates[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Weekly Days Grid - Current service days & today at the top */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {sortedWeekDates.map((dateObj) => {
                  const dateStr = formatDateString(
                    dateObj.getFullYear(),
                    dateObj.getMonth(),
                    dateObj.getDate()
                  );
                  const dayName = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' });
                  const dayNum = dateObj.getDate();
                  const monthNameShort = dateObj.toLocaleDateString('pt-BR', { month: 'short' });
                  const isToday = dateStr === todayStr;

                  // Filter escalados for this day
                  const dayItems = groupEscalas.filter((i) => i.data === dateStr);

                  return (
                    <div
                      key={dateStr}
                      className={`rounded-2xl p-4 flex flex-col justify-between transition-all shadow-md ${
                        isToday
                          ? 'bg-blue-950/20 border-2 border-blue-500 shadow-blue-950/50 ring-1 ring-blue-500/30'
                          : 'bg-slate-950 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        {/* Day Header */}
                        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-xs font-bold uppercase tracking-wider block capitalize ${isToday ? 'text-blue-400 font-extrabold' : 'text-slate-400'}`}>
                                {dayName}
                              </span>
                              {isToday && (
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-600 text-white shadow-sm">
                                  HOJE
                                </span>
                              )}
                            </div>
                            <span className="text-base font-extrabold text-white">
                              {dayNum} {monthNameShort}
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            dayItems.length > 0
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {dayItems.length} escalado(s)
                          </span>
                        </div>

                        {/* Scheduled Items for this day */}
                        {dayItems.length === 0 ? (
                          <div className="py-5 text-center text-slate-500 text-xs border border-dashed border-slate-850 rounded-xl">
                            Sem escala cadastrada para este dia
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {dayItems.map((item) => (
                              <div
                                key={item.id}
                                className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-start justify-between gap-2"
                              >
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span
                                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border flex items-center gap-1 ${getPlaceBadgeColor(
                                        item.lugar
                                      )}`}
                                    >
                                      {getPlaceIcon(item.lugar)}
                                      <span>{item.lugar}</span>
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                                      <Clock className="w-2.5 h-2.5 text-blue-400" />
                                      <span>{item.horario}</span>
                                    </span>
                                  </div>
                                  <div className="text-xs font-bold text-white flex items-center gap-1.5 pt-0.5">
                                    <User className="w-3 h-3 text-blue-400 shrink-0" />
                                    <span>{item.nomePessoa}</span>
                                  </div>
                                  {item.observacao && (
                                    <p className="text-[10px] text-slate-400 italic">
                                      {item.observacao}
                                    </p>
                                  )}
                                </div>

                                <button
                                  onClick={() => handleOpenEditForm(item)}
                                  className="p-1 rounded text-slate-500 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                                  title="Editar"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Add button inside day card */}
                      <button
                        onClick={() => handleOpenAddForm(dateStr)}
                        className="mt-3 w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                      >
                        <Plus className="w-3 h-3 text-blue-400" />
                        <span>Adicionar no dia</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW MODE 2: EDITAR / MONTAR ESCALA MENSAL (CALENDAR VIEW) */}
          {viewMode === 'mensal' && (
            <div className="space-y-4">
              {/* Calendar Navigator */}
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition-all flex items-center gap-1 text-xs font-bold"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Mês anterior</span>
                </button>

                <div className="text-center">
                  <h4 className="text-base font-extrabold text-white capitalize">
                    {monthName}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    Clique em um dia para escalar lugares e horários
                  </span>
                </div>

                <button
                  onClick={nextMonth}
                  className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition-all flex items-center gap-1 text-xs font-bold"
                >
                  <span>Próximo mês</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Monthly Calendar Grid */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 sm:p-4">
                {/* Weekday Labels */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <div>Dom</div>
                  <div>Seg</div>
                  <div>Ter</div>
                  <div>Qua</div>
                  <div>Qui</div>
                  <div>Sex</div>
                  <div>Sáb</div>
                </div>

                {/* Calendar Days Cells */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {/* Empty cells before month start */}
                  {Array.from({ length: startDayOfWeek }).map((_, idx) => (
                    <div
                      key={`empty-${idx}`}
                      className="min-h-[85px] bg-slate-900/30 border border-slate-900/50 rounded-xl"
                    />
                  ))}

                  {/* Day cells */}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const dateStr = formatDateString(year, month, dayNum);
                    const dayItems = groupEscalas.filter((i) => i.data === dateStr);

                    return (
                      <div
                        key={dateStr}
                        onClick={() => handleOpenAddForm(dateStr)}
                        className={`min-h-[85px] p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                          dayItems.length > 0
                            ? 'bg-slate-900/90 border-blue-600/40 hover:border-blue-500 shadow-sm'
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-extrabold ${
                              dayItems.length > 0 ? 'text-blue-400' : 'text-slate-300'
                            }`}
                          >
                            {dayNum}
                          </span>
                          {dayItems.length > 0 && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                          )}
                        </div>

                        {/* List of members assigned */}
                        <div className="space-y-1 my-1 overflow-hidden">
                          {dayItems.slice(0, 3).map((item) => (
                            <div
                              key={item.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditForm(item);
                              }}
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded border truncate flex items-center justify-between gap-1 hover:opacity-80 ${getPlaceBadgeColor(
                                item.lugar
                              )}`}
                              title={`${item.lugar} (${item.horario}): ${item.nomePessoa}`}
                            >
                              <span className="truncate">{item.lugar}: {item.nomePessoa.split(' ')[0]}</span>
                            </div>
                          ))}
                          {dayItems.length > 3 && (
                            <span className="text-[9px] text-slate-400 block font-semibold text-center">
                              +{dayItems.length - 3} mais
                            </span>
                          )}
                        </div>

                        <div className="text-[9px] text-slate-500 font-semibold text-right hover:text-blue-400">
                          + Adicionar
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Save Floating Bar inside modal */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xl">
                <div>
                  <h5 className="text-xs font-extrabold text-white">
                    Pronto com a montagem dos Lugares e Horários?
                  </h5>
                  <p className="text-[11px] text-slate-400">
                    Ao salvar, o botão exibirá automaticamente a <strong className="text-emerald-400">escala semanal</strong>.
                  </p>
                </div>

                <button
                  onClick={handleSaveAndShowWeekly}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-900/40 border border-emerald-500/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Escala e Exibir Semanal</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SUB-MODAL: FORM FOR ADDING / EDITING ESCALADO */}
        {showItemForm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>
                    {editingItem ? 'Editar Escalado' : `Escalar Pessoa (${grupoTarget})`}
                  </span>
                </h4>
                <button
                  onClick={() => setShowItemForm(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="space-y-3">
                {/* Data */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Data da Escala
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Horário */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Horário / Culto
                  </label>
                  <div className="flex gap-2 mb-1.5">
                    {['09:00', '19:00', '19:30'].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setFormData({ ...formData, horario: h })}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                          formData.horario === h
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 19:30 - Culto de Quinta"
                    value={formData.horario}
                    onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Lugar / Posto */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Lugar / Posto de Atendimento
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 mb-1.5">
                    {['ALTAR', 'BANHEIRO', 'ESTACIONAMENTO', 'GALERIA', 'INTERCESSÃO', 'RECEPÇÃO'].map(
                      (lugar) => (
                        <button
                          key={lugar}
                          type="button"
                          onClick={() => setFormData({ ...formData, lugar })}
                          className={`p-2 rounded-xl text-xs font-extrabold border flex items-center justify-center gap-1.5 transition-all ${
                            formData.lugar === lugar
                              ? 'bg-amber-600/30 text-amber-200 border-amber-500/80 shadow'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {getPlaceIcon(lugar)}
                          <span>{lugar}</span>
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Nome do Membro / Escalado */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nome da Pessoa Escalada
                  </label>
                  {obreiros.length > 0 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          setFormData({ ...formData, nomePessoa: e.target.value });
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 mb-2 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">-- Selecionar da Lista de Obreiros --</option>
                      {obreiros.map((ob) => (
                        <option key={ob.id} value={ob.nomeCompleto}>
                          {ob.nomeCompleto} ({ob.cargoMinistério || ob.departamento})
                        </option>
                      ))}
                    </select>
                  )}
                  <input
                    type="text"
                    required
                    placeholder="Digite o nome completo da pessoa"
                    value={formData.nomePessoa}
                    onChange={(e) => setFormData({ ...formData, nomePessoa: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Observação */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Observação / Função Específica
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Responsável pela abertura do portão"
                    value={formData.observacao}
                    onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Buttons */}
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800">
                  {editingItem ? (
                    <button
                      type="button"
                      onClick={() => {
                        handleDeleteItemLocal(editingItem.id);
                        setShowItemForm(false);
                      }}
                      className="px-3 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowItemForm(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-900/30 transition-all"
                    >
                      {editingItem ? 'Salvar Alterações' : 'Adicionar à Escala'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
