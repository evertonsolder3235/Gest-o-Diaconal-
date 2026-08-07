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
  ListFilter,
  Camera,
  Upload,
  Maximize2,
  ZoomIn
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useRegisterBackHandler } from '../../hooks/useBackButton';
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
  const { escalas, addEscalaItem, deleteEscalaItem, saveEscalasBulk, obreiros, showToast, requestAdminAuth, isAdminUnlocked } = useApp();

  // Mode: 'semanal' | 'mensal'
  const [viewMode, setViewMode] = useState<'semanal' | 'mensal'>('semanal');
  const [isMontarEscalaAuth, setIsMontarEscalaAuth] = useState<boolean>(false);
  const [fullScreenImage, setFullScreenImage] = useState<{ url: string; title?: string } | null>(null);

  // Close full screen photo on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullScreenImage) {
        setFullScreenImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullScreenImage]);

  // Reset view mode and auth when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setIsMontarEscalaAuth(false);
      setViewMode('semanal');
      setFullScreenImage(null);
    }
  }, [isOpen]);

  // Month navigation (Defaults to current month)
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  // Form State for adding/editing a schedule item
  const [showItemForm, setShowItemForm] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ItemEscala | null>(null);

  // Register back button handlers for EscalaModal overlays
  useRegisterBackHandler(isOpen, onClose);
  useRegisterBackHandler(!!fullScreenImage, () => setFullScreenImage(null));
  useRegisterBackHandler(showItemForm, () => setShowItemForm(false));

  const [formData, setFormData] = useState<{
    data: string;
    horario: string;
    lugar: LugarEscala | string;
    nomePessoa: string;
    observacao: string;
    fotoUrl: string;
  }>({
    data: new Date().toISOString().slice(0, 10),
    horario: '19:30',
    lugar: 'ALTAR',
    nomePessoa: '',
    observacao: '',
    fotoUrl: ''
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast('error', 'A imagem da foto deve ter no máximo 10MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress image using canvas to max 400x400 to fit easily in localStorage
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          setFormData((prev) => ({ ...prev, fotoUrl: compressedBase64 }));
          showToast('info', 'Foto carregada e otimizada com sucesso.');
        } else {
          setFormData((prev) => ({ ...prev, fotoUrl: event.target?.result as string }));
          showToast('info', 'Foto carregada.');
        }
      };
      img.onerror = () => {
        showToast('error', 'Erro ao processar imagem.');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Local draft items while editing monthly scale
  const [localEscalas, setLocalEscalas] = useState<ItemEscala[]>(escalas);

  // Sync local items when scales update from context
  React.useEffect(() => {
    setLocalEscalas(escalas);
  }, [escalas]);

  // Filter items for target group ('Homens' or 'Mulheres')
  const groupEscalas = localEscalas.filter((e) => e.grupo === grupoTarget);

  // Date Formatting Helper
  const formatDateString = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const getFormattedDate = (d: Date) => {
    return formatDateString(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const todayStr = useMemo(() => getFormattedDate(new Date()), []);

  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Helper to format start/end date range for week option dropdown
  const getWeekRangeLabel = (offset: number) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() + offset * 7);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const startStr = start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const endStr = end.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

    if (offset === 0) return `Esta Semana (${startStr} a ${endStr})`;
    if (offset === 1) return `Próxima Semana (${startStr} a ${endStr})`;
    if (offset === -1) return `Semana Anterior (${startStr} a ${endStr})`;
    if (offset > 1) return `Em ${offset} semanas (${startStr} a ${endStr})`;
    return `${Math.abs(offset)} semanas atrás (${startStr} a ${endStr})`;
  };

  // Week calculation based on weekOffset (7 consecutive days)
  const weekDates = useMemo(() => {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() + weekOffset * 7);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      weekDays.push(d);
    }
    return weekDays;
  }, [weekOffset]);

  // Sort week dates so current day (HOJE) is ALWAYS at the very top as featured destaque,
  // and all other days follow in strict ascending date order (ex: 7, 8, 9, 10, 11, 12, 13)
  const sortedWeekDates = useMemo(() => {
    return [...weekDates].sort((a, b) => {
      const dateStrA = getFormattedDate(a);
      const dateStrB = getFormattedDate(b);

      const isTodayA = dateStrA === todayStr;
      const isTodayB = dateStrB === todayStr;

      // Today ALWAYS comes first at the top
      if (isTodayA && !isTodayB) return -1;
      if (!isTodayA && isTodayB) return 1;

      // Subsequent days in strict ascending date order
      return dateStrA.localeCompare(dateStrB);
    });
  }, [weekDates, todayStr]);

  if (!isOpen) return null;

  const isMulheres = grupoTarget === 'Mulheres';

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
      setShowItemForm(false);
      setEditingItem(null);
    } else {
      // Add new item to localEscalas
      const newItem: ItemEscala = {
        id: 'e-' + Date.now() + Math.random().toString(36).substring(2, 5),
        ...formData,
        grupo: grupoTarget
      };
      setLocalEscalas((prev) => [...prev, newItem]);
      showToast('success', `${formData.nomePessoa.trim()} adicionado(a) à escala!`);

      // Keep form open so user can continue adding more people
      setFormData((prev) => ({
        ...prev,
        nomePessoa: '',
        fotoUrl: '',
        observacao: ''
      }));
    }
  };

  const handleOpenAddForm = (selectedDate?: string) => {
    const openForm = () => {
      setEditingItem(null);
      setFormData({
        data: selectedDate || new Date().toISOString().slice(0, 10),
        horario: '19:30',
        lugar: 'ALTAR',
        nomePessoa: '',
        observacao: '',
        fotoUrl: ''
      });
      setViewMode('mensal');
      setShowItemForm(true);
    };

    if (isMontarEscalaAuth) {
      openForm();
    } else {
      requestAdminAuth(() => {
        setIsMontarEscalaAuth(true);
        openForm();
      }, 'Acesso Restrito: Adicionar à Escala', true);
    }
  };

  const handleOpenEditForm = (item: ItemEscala) => {
    const openForm = () => {
      setEditingItem(item);
      setFormData({
        data: item.data,
        horario: item.horario,
        lugar: item.lugar,
        nomePessoa: item.nomePessoa,
        observacao: item.observacao || '',
        fotoUrl: item.fotoUrl || ''
      });
      setShowItemForm(true);
    };

    if (isMontarEscalaAuth) {
      openForm();
    } else {
      requestAdminAuth(() => {
        setIsMontarEscalaAuth(true);
        openForm();
      }, 'Acesso Restrito: Editar Escalado', true);
    }
  };

  const handleDeleteItemLocal = (id: string) => {
    if (isMontarEscalaAuth) {
      setLocalEscalas((prev) => prev.filter((i) => i.id !== id));
      showToast('info', 'Item removido da escala local.');
    } else {
      requestAdminAuth(() => {
        setIsMontarEscalaAuth(true);
        setLocalEscalas((prev) => prev.filter((i) => i.id !== id));
        showToast('info', 'Item removido da escala local.');
      }, 'Acesso Restrito: Excluir da Escala', true);
    }
  };

  // Final Save Escala Action
  const handleSaveAndShowWeekly = () => {
    saveEscalasBulk(localEscalas);
    setIsMontarEscalaAuth(false);
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

            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsMontarEscalaAuth(false);
                onClose();
              }}
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
              onClick={() => {
                setViewMode('semanal');
                setIsMontarEscalaAuth(false);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'semanal'
                  ? isMulheres ? 'bg-pink-600 text-white shadow-md' : 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Escala Semanal</span>
            </button>
            <button
              onClick={() => {
                requestAdminAuth(() => {
                  setIsMontarEscalaAuth(true);
                  setViewMode('mensal');
                }, 'Acesso Restrito: Montar / Editar Escala Mensal', true);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'mensal'
                  ? isMulheres ? 'bg-pink-600 text-white shadow-md' : 'bg-blue-600 text-white shadow-md'
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
              <Plus className={`w-3.5 h-3.5 ${isMulheres ? 'text-pink-400' : 'text-blue-400'}`} />
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
              {/* Header com Filtro de Seleção de Semanas */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800 gap-3">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-slate-300">
                  <CalendarIcon className={`w-4 h-4 shrink-0 ${isMulheres ? 'text-pink-400' : 'text-blue-400'}`} />
                  <div>
                    <span className="text-slate-400 text-[11px] block font-semibold uppercase tracking-wider">
                      {weekOffset === 0 ? 'Semana Vigente' : 'Semana Selecionada'}
                    </span>
                    <strong className="text-white text-sm sm:text-base font-bold">
                      {weekDates[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} até{' '}
                      {weekDates[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </strong>
                  </div>
                </div>

                {/* Controles de Navegação e Filtro de Semanas */}
                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setWeekOffset((prev) => prev - 1)}
                      title="Semana anterior"
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <select
                      value={weekOffset}
                      onChange={(e) => setWeekOffset(Number(e.target.value))}
                      className="bg-transparent text-xs font-semibold text-slate-200 px-2 py-1.5 focus:outline-none cursor-pointer border-none"
                    >
                      {[-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12].map((offset) => (
                        <option key={offset} value={offset} className="bg-slate-900 text-white">
                          {getWeekRangeLabel(offset)}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => setWeekOffset((prev) => prev + 1)}
                      title="Próxima semana"
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {weekOffset !== 0 && (
                    <button
                      type="button"
                      onClick={() => setWeekOffset(0)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all shadow-sm flex items-center gap-1 shrink-0 ${
                        isMulheres
                          ? 'bg-pink-600/30 text-pink-300 border border-pink-500/50 hover:bg-pink-600/50'
                          : 'bg-blue-600/30 text-blue-300 border border-blue-500/50 hover:bg-blue-600/50'
                      }`}
                      title="Voltar para a semana atual"
                    >
                      <span>Hoje</span>
                    </button>
                  )}
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
                      className={`rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all shadow-md ${
                        isToday
                          ? isMulheres
                            ? 'col-span-1 md:col-span-2 lg:col-span-3 bg-gradient-to-br from-pink-950/90 via-slate-900 to-rose-950/90 border-2 border-pink-500 ring-2 ring-pink-500/40 shadow-xl shadow-pink-950/80'
                            : 'col-span-1 md:col-span-2 lg:col-span-3 bg-gradient-to-br from-blue-950/90 via-slate-900 to-indigo-950/90 border-2 border-blue-400 ring-2 ring-blue-500/40 shadow-xl shadow-blue-950/80'
                          : 'bg-slate-950 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        {/* Day Header */}
                        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800/80">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold uppercase tracking-wider block capitalize ${
                                isToday
                                  ? isMulheres ? 'text-pink-300 font-black' : 'text-blue-300 font-black'
                                  : 'text-slate-400'
                              }`}>
                                {dayName}
                              </span>
                              {isToday && (
                                <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-lg text-white shadow-md flex items-center gap-1 animate-pulse ${
                                  isMulheres
                                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 border border-pink-400/40'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-400/40'
                                }`}>
                                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                  HOJE - DIA ATUAL
                                </span>
                              )}
                            </div>
                            <span className="text-base font-extrabold text-white">
                              {dayNum} {monthNameShort}
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            dayItems.length > 0
                              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700/80'
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
                                className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-slate-700 transition-all shadow-sm"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  {/* Avatar Photo */}
                                  <div
                                    className={`relative shrink-0 ${
                                      item.fotoUrl ? 'cursor-pointer group/photo' : ''
                                    }`}
                                    onClick={(e) => {
                                      if (item.fotoUrl) {
                                        e.stopPropagation();
                                        setFullScreenImage({ url: item.fotoUrl, title: item.nomePessoa });
                                      }
                                    }}
                                    title={item.fotoUrl ? 'Clique para ver foto em tela cheia' : undefined}
                                  >
                                    {item.fotoUrl ? (
                                      <>
                                        <img
                                          src={item.fotoUrl}
                                          alt={item.nomePessoa}
                                          className={`w-12 h-12 rounded-full object-cover border-2 shadow-md group-hover/photo:scale-105 group-hover/photo:ring-2 transition-all ${
                                            isMulheres
                                              ? 'border-pink-500/80 group-hover/photo:border-pink-400 group-hover/photo:ring-pink-400/50'
                                              : 'border-blue-500/80 group-hover/photo:border-blue-400 group-hover/photo:ring-blue-400/50'
                                          }`}
                                        />
                                        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover/photo:opacity-100 flex items-center justify-center transition-opacity">
                                          <Maximize2 className="w-4 h-4 text-white drop-shadow-md" />
                                        </div>
                                      </>
                                    ) : (
                                      <div className="w-11 h-11 rounded-full bg-slate-800 border-2 border-slate-700/80 flex items-center justify-center text-slate-400 font-bold text-xs shadow-inner">
                                        <User className={`w-5 h-5 ${isMulheres ? 'text-pink-400' : 'text-blue-400'}`} />
                                      </div>
                                    )}
                                  </div>

                                  <div className="space-y-1 min-w-0">
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
                                        <Clock className={`w-2.5 h-2.5 ${isMulheres ? 'text-pink-400' : 'text-blue-400'}`} />
                                        <span>{item.horario}</span>
                                      </span>
                                    </div>
                                    <div className="text-xs sm:text-sm font-extrabold text-white truncate">
                                      {item.nomePessoa}
                                    </div>
                                    {item.observacao && (
                                      <p className="text-[10px] text-slate-400 italic truncate">
                                        {item.observacao}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleOpenEditForm(item)}
                                  className={`p-1.5 rounded-lg text-slate-500 hover:bg-slate-800 transition-colors shrink-0 ${
                                    isMulheres ? 'hover:text-pink-400' : 'hover:text-blue-400'
                                  }`}
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
                        <Plus className={`w-3 h-3 ${isMulheres ? 'text-pink-400' : 'text-blue-400'}`} />
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
                    const isTodayCell = dateStr === todayStr;

                    return (
                      <div
                        key={dateStr}
                        onClick={() => handleOpenAddForm(dateStr)}
                        className={`min-h-[85px] p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                          isTodayCell
                            ? isMulheres
                              ? 'bg-pink-950/80 border-2 border-pink-500 ring-2 ring-pink-500/30 shadow-md shadow-pink-950/60'
                              : 'bg-blue-950/80 border-2 border-blue-400 ring-2 ring-blue-500/30 shadow-md shadow-blue-950/60'
                            : dayItems.length > 0
                            ? isMulheres
                              ? 'bg-slate-900/90 border-pink-600/40 hover:border-pink-500 shadow-sm'
                              : 'bg-slate-900/90 border-blue-600/40 hover:border-blue-500 shadow-sm'
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span
                              className={`text-xs font-black ${
                                isTodayCell
                                  ? isMulheres ? 'text-pink-300' : 'text-blue-300'
                                  : dayItems.length > 0
                                  ? isMulheres ? 'text-pink-400' : 'text-blue-400'
                                  : 'text-slate-300'
                              }`}
                            >
                              {dayNum}
                            </span>
                            {isTodayCell && (
                              <span className={`text-[9px] font-black px-1 py-0.2 rounded text-white leading-none ${
                                isMulheres ? 'bg-pink-600' : 'bg-blue-600'
                              }`}>
                                HOJE
                              </span>
                            )}
                          </div>
                          {dayItems.length > 0 && (
                            <span className={`w-2 h-2 rounded-full animate-pulse ${isMulheres ? 'bg-pink-500' : 'bg-blue-500'}`} />
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
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded border truncate flex items-center gap-1 hover:opacity-80 ${getPlaceBadgeColor(
                                item.lugar
                              )}`}
                              title={`${item.lugar} (${item.horario}): ${item.nomePessoa}`}
                            >
                              {item.fotoUrl ? (
                                <img
                                  src={item.fotoUrl}
                                  alt={item.nomePessoa}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFullScreenImage({ url: item.fotoUrl!, title: item.nomePessoa });
                                  }}
                                  className="w-4 h-4 rounded-full object-cover border border-white/60 shrink-0 cursor-pointer hover:scale-125 transition-transform shadow-sm"
                                  title="Ver foto em tela cheia"
                                />
                              ) : (
                                <User className="w-2.5 h-2.5 shrink-0 opacity-80" />
                              )}
                              <span className="truncate">{item.lugar}: {item.nomePessoa.split(' ')[0]}</span>
                            </div>
                          ))}
                          {dayItems.length > 3 && (
                            <span className="text-[9px] text-slate-400 block font-semibold text-center">
                              +{dayItems.length - 3} mais
                            </span>
                          )}
                        </div>

                        <div className={`text-[9px] font-semibold text-right transition-colors ${
                          isMulheres ? 'text-slate-500 hover:text-pink-400' : 'text-slate-500 hover:text-blue-400'
                        }`}>
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
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-4 sm:p-5 shadow-2xl flex flex-col my-auto max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>
                    {editingItem ? 'Editar Escalado' : `Escalar Pessoa (${grupoTarget})`}
                  </span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowItemForm(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="flex flex-col flex-1 min-h-0 pt-3">
                <div className="overflow-y-auto pr-1 space-y-3 flex-1">
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
                    className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none ${
                      isMulheres ? 'focus:border-pink-500' : 'focus:border-blue-500'
                    }`}
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
                            ? isMulheres
                              ? 'bg-pink-600 text-white border-pink-500'
                              : 'bg-blue-600 text-white border-blue-500'
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
                    className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none ${
                      isMulheres ? 'focus:border-pink-500' : 'focus:border-blue-500'
                    }`}
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
                      value={formData.nomePessoa || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, nomePessoa: e.target.value });
                      }}
                      className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 mb-2 focus:outline-none ${
                        isMulheres ? 'focus:border-pink-500' : 'focus:border-blue-500'
                      }`}
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
                    className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none ${
                      isMulheres ? 'focus:border-pink-500' : 'focus:border-blue-500'
                    }`}
                  />
                </div>

                {/* Foto da Pessoa Escalada */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Camera className={`w-3.5 h-3.5 ${isMulheres ? 'text-pink-400' : 'text-blue-400'}`} />
                      <span>Foto da Pessoa</span>
                    </label>
                    {formData.fotoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, fotoUrl: '' }))}
                        className="text-[10px] font-bold text-rose-400 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remover foto</span>
                      </button>
                    )}
                  </div>

                  {formData.fotoUrl ? (
                    <div className="flex items-center gap-3 p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                      <div
                        className="relative shrink-0 cursor-pointer group/formphoto"
                        onClick={() => setFullScreenImage({ url: formData.fotoUrl, title: formData.nomePessoa || 'Foto da pessoa' })}
                        title="Clique para ver em tela cheia"
                      >
                        <img
                          src={formData.fotoUrl}
                          alt="Foto da pessoa"
                          className={`w-12 h-12 rounded-full object-cover border-2 shadow group-hover/formphoto:scale-105 group-hover/formphoto:ring-2 transition-all ${
                            isMulheres
                              ? 'border-pink-500/80 group-hover/formphoto:border-pink-400 group-hover/formphoto:ring-pink-400/50'
                              : 'border-blue-500/80 group-hover/formphoto:border-blue-400 group-hover/formphoto:ring-blue-400/50'
                          }`}
                        />
                        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover/formphoto:opacity-100 flex items-center justify-center transition-opacity">
                          <Maximize2 className="w-4 h-4 text-white drop-shadow-md" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-200 truncate">Foto Carregada</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <label className={`text-[11px] hover:underline cursor-pointer font-extrabold inline-block ${
                            isMulheres ? 'text-pink-400' : 'text-blue-400'
                          }`}>
                            <span>Alterar Foto</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                          </label>
                          <span className="text-[10px] text-slate-500">• Clique na foto para expandir</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label className={`flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-800 rounded-xl bg-slate-950/60 hover:bg-slate-950 cursor-pointer transition-all text-center group ${
                      isMulheres ? 'hover:border-pink-500/60' : 'hover:border-blue-500/60'
                    }`}>
                      <div className={`w-8 h-8 rounded-full bg-slate-850 flex items-center justify-center text-slate-400 mb-1 transition-colors ${
                        isMulheres ? 'group-hover:bg-pink-950/80 group-hover:text-pink-400' : 'group-hover:bg-blue-950/80 group-hover:text-blue-400'
                      }`}>
                        <Upload className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-extrabold text-slate-300 group-hover:text-white">
                        Carregar Foto da Pessoa
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5">
                        Clique aqui para enviar uma imagem (PNG, JPG)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
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
                    className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none ${
                      isMulheres ? 'focus:border-pink-500' : 'focus:border-blue-500'
                    }`}
                  />
                </div>

                {/* List of people already added for this date */}
                {!editingItem && (() => {
                  const itemsOnDate = localEscalas.filter(
                    (i) => i.grupo === grupoTarget && i.data === formData.data
                  );
                  if (itemsOnDate.length === 0) return null;
                  return (
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1.5 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-slate-300">
                          Já escalados para {formData.data.split('-').reverse().join('/')}:
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                          {itemsOnDate.length} {itemsOnDate.length === 1 ? 'pessoa' : 'pessoas'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
                        {itemsOnDate.map((item) => (
                          <div
                            key={item.id}
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${getPlaceBadgeColor(
                              item.lugar
                            )}`}
                          >
                            <span>{item.nomePessoa.split(' ')[0]} ({item.lugar})</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteItemLocal(item.id)}
                              className="ml-0.5 text-slate-400 hover:text-rose-400 p-0.5"
                              title="Remover este item"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
                </div>

                {/* Buttons */}
                <div className="pt-3 mt-3 flex items-center justify-between gap-2 border-t border-slate-800 shrink-0">
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
                      {editingItem ? 'Cancelar' : 'Concluir'}
                    </button>
                    <button
                      type="submit"
                      className={`px-4 py-2 rounded-xl text-white text-xs font-bold shadow-md transition-all ${
                        isMulheres
                          ? 'bg-pink-600 hover:bg-pink-500 shadow-pink-900/30'
                          : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/30'
                      }`}
                    >
                      {editingItem ? 'Salvar Alterações' : '+ Adicionar à Escala'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Foto em Tela Cheia / Fullscreen Photo Lightbox */}
        {fullScreenImage && (
          <div
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
            onClick={() => setFullScreenImage(null)}
          >
            {/* Botão de Fechar */}
            <button
              onClick={() => setFullScreenImage(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-3 rounded-full bg-slate-900/90 text-slate-200 hover:text-white hover:bg-slate-800 border border-slate-700/80 shadow-2xl transition-all hover:scale-110 z-10"
              title="Fechar (Esc)"
            >
              <X className="w-6 h-6" />
            </button>

            <div
              className="relative max-w-4xl max-h-[85vh] flex flex-col items-center justify-center space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={fullScreenImage.url}
                alt={fullScreenImage.title || 'Foto em tela cheia'}
                className="max-w-full max-h-[75vh] sm:max-h-[80vh] object-contain rounded-2xl border-2 border-slate-700/80 shadow-2xl ring-1 ring-white/10"
              />
              {fullScreenImage.title && (
                <div className="bg-slate-900/90 border border-slate-700/80 px-5 py-2.5 rounded-full text-white font-extrabold text-sm sm:text-base shadow-xl flex items-center gap-2">
                  <User className={`w-4 h-4 ${isMulheres ? 'text-pink-400' : 'text-blue-400'}`} />
                  <span>{fullScreenImage.title}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
