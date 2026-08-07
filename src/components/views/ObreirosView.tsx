import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useRegisterBackHandler } from '../../hooks/useBackButton';
import { Obreiro, DepartamentoChurch, ObreiroStatus } from '../../types';
import {
  ShieldCheck,
  UserPlus,
  Search,
  Filter,
  Phone,
  Calendar,
  MapPin,
  Edit2,
  Trash2,
  X,
  Eye,
  Building,
  CheckCircle,
  Briefcase,
  Camera,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DEPARTAMENTOS: DepartamentoChurch[] = [
  'Diaconia',
  'Louvor & Adoração',
  'Ministério Infantil',
  'Recepção & Acolhimento',
  'Mídia & Som',
  'Ensino & EBD',
  'Intercessão',
  'Eventos & Ação Social',
  'Jovens & Adolescentes'
];

export const ObreirosView: React.FC = () => {
  const {
    obreiros,
    addObreiro,
    updateObreiro,
    deleteObreiro,
    deleteMultipleObreiros,
    askConfirmDelete,
    searchQuery,
    setSearchQuery,
    requestAdminAuth,
    showToast
  } = useApp();

  const [deptFilter, setDeptFilter] = useState<string>('todos');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Obreiro | null>(null);
  const [viewingItem, setViewingItem] = useState<Obreiro | null>(null);

  useRegisterBackHandler(isModalOpen || !!viewingItem, () => {
    setIsModalOpen(false);
    setViewingItem(null);
  });

  // Form State matching prompt requirements exactly
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('1990-01-01');
  const [departamento, setDepartamento] = useState<DepartamentoChurch>('Diaconia');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cargoMinistério, setCargoMinistério] = useState('Diácono');
  const [status, setStatus] = useState<ObreiroStatus>('Ativo');
  const [observacao, setObservacao] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('error', 'A foto deve ter no máximo 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
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
          setFotoUrl(compressedBase64);
          showToast('info', 'Foto do obreiro carregada e otimizada.');
        } else {
          setFotoUrl(event.target?.result as string);
          showToast('info', 'Foto carregada.');
        }
      };
      img.onerror = () => {
        setFotoUrl(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const openAddModal = () => {
    requestAdminAuth(() => {
      setEditingItem(null);
      setNomeCompleto('');
      setTelefone('');
      setDataNascimento('1990-01-01');
      setDepartamento('Diaconia');
      setRua('');
      setNumero('');
      setBairro('');
      setCargoMinistério('Diácono');
      setStatus('Ativo');
      setObservacao('');
      setFotoUrl('');
      setIsModalOpen(true);
    }, 'Acesso Restrito: Cadastrar Novo Obreiro', true);
  };

  const openEditModal = (item: Obreiro) => {
    requestAdminAuth(() => {
      setEditingItem(item);
      setNomeCompleto(item.nomeCompleto);
      setTelefone(item.telefone);
      setDataNascimento(item.dataNascimento);
      setDepartamento(item.departamento);
      setRua(item.rua);
      setNumero(item.numero);
      setBairro(item.bairro);
      setCargoMinistério(item.cargoMinistério || 'Diácono');
      setStatus(item.status);
      setObservacao(item.observacao || '');
      setFotoUrl(item.fotoUrl || '');
      setIsModalOpen(true);
    }, 'Acesso Restrito: Editar Obreiro', true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeCompleto.trim()) return;

    if (editingItem) {
      updateObreiro(editingItem.id, {
        nomeCompleto,
        telefone,
        dataNascimento,
        departamento,
        rua,
        numero,
        bairro,
        cargoMinistério,
        status,
        observacao,
        fotoUrl
      });
    } else {
      addObreiro({
        nomeCompleto,
        telefone,
        dataNascimento,
        departamento,
        rua,
        numero,
        bairro,
        cargoMinistério,
        status,
        observacao,
        fotoUrl
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (item: Obreiro) => {
    requestAdminAuth(() => {
      askConfirmDelete(
        'Excluir Cadastro de Obreiro',
        `Deseja realmente excluir o cadastro de "${item.nomeCompleto}"? Esta informação será removida permanentemente.`,
        () => deleteObreiro(item.id)
      );
    }, 'Acesso Restrito: Excluir Obreiro', true);
  };

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (filteredList.length === 0) return;
    const filteredIds = filteredList.map((i) => i.id);
    const isAllSelected = filteredIds.every((id) => selectedIds.includes(id));
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    requestAdminAuth(() => {
      askConfirmDelete(
        'Excluir Obreiros Selecionados',
        `Deseja realmente excluir os ${selectedIds.length} obreiro(s) selecionados? Esta ação não poderá ser desfeita.`,
        () => {
          deleteMultipleObreiros(selectedIds);
          setSelectedIds([]);
        }
      );
    }, 'Acesso Restrito: Excluir Obreiros', true);
  };

  const filteredList = obreiros.filter((item) => {
    const matchesSearch =
      item.nomeCompleto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.telefone.includes(searchQuery) ||
      item.bairro.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.cargoMinistério && item.cargoMinistério.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDept =
      deptFilter === 'todos' ? true : item.departamento === deptFilter;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-100">Cadastro de Obreiros & Diáconos</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gestão completa da equipe ministerial e escalas por departamento
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Obreiro</span>
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar obreiro por nome, telefone ou bairro..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
          />
        </div>

        <div className="w-full md:w-auto">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="todos">Todos os Departamentos ({obreiros.length})</option>
            {DEPARTAMENTOS.map((d) => (
              <option key={d} value={d}>
                {d} ({obreiros.filter(o => o.departamento === d).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selection Toolbar */}
      {filteredList.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-3 text-xs">
          <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-300 hover:text-slate-100 select-none">
            <input
              type="checkbox"
              checked={
                filteredList.length > 0 &&
                filteredList.every((item) => selectedIds.includes(item.id))
              }
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <span>
              Selecionar todos ({filteredList.length})
            </span>
          </label>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-slate-400 font-medium">
                <strong className="text-emerald-400">{selectedIds.length}</strong> selecionado(s)
              </span>
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-bold transition-all shadow-md shadow-rose-950/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Selecionados ({selectedIds.length})</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Obreiros List */}
      {filteredList.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300">Nenhum obreiro encontrado</h3>
          <p className="text-xs text-slate-500 mt-1">
            Verifique o filtro de departamento ou faça o cadastro de um novo obreiro.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <div
                key={item.id}
                className={`bg-slate-900 border rounded-2xl p-5 transition-all shadow-md flex flex-col justify-between ${
                  isSelected ? 'border-emerald-500 bg-emerald-950/20 shadow-emerald-950/20' : 'border-slate-800 hover:border-emerald-500/40'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectItem(item.id)}
                        className="mt-1 w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                        title="Selecionar para exclusão"
                      />
                      {item.fotoUrl ? (
                        <img
                          src={item.fotoUrl}
                          alt={item.nomeCompleto}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0 shadow-sm"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 font-extrabold text-sm shrink-0">
                          {item.nomeCompleto.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-slate-100 text-base leading-snug truncate">
                          {item.nomeCompleto}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mt-0.5 truncate">
                          <Briefcase className="w-3.5 h-3.5 shrink-0" />
                          <span>{item.cargoMinistério || 'Diácono'}</span>
                        </div>
                      </div>
                    </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      item.status === 'Ativo'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/60 rounded-xl p-3 border border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-semibold text-slate-200">{item.departamento}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{item.telefone || 'Telefone não informado'}</span>
                  </div>

                  <div className="flex items-start gap-2 pt-1 border-t border-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span className="text-slate-400 text-[11px] leading-tight">
                      {item.rua}, {item.numero} - {item.bairro}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  onClick={() => setViewingItem(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ver Ficha</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
                    title="Editar Obreiro"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Detailed Profile Viewer Modal */}
      <AnimatePresence>
        {viewingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl relative max-h-[90vh] flex flex-col my-auto"
            >
              <button
                onClick={() => setViewingItem(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4 pr-8 shrink-0">
                {viewingItem.fotoUrl ? (
                  <img
                    src={viewingItem.fotoUrl}
                    alt={viewingItem.nomeCompleto}
                    className="w-12 h-12 rounded-2xl object-cover border border-emerald-500/40 shrink-0 shadow-md"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-xl shrink-0">
                    {viewingItem.nomeCompleto.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-slate-100 truncate">{viewingItem.nomeCompleto}</h3>
                  <p className="text-xs text-emerald-400 font-semibold">{viewingItem.cargoMinistério || 'Diácono'}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">Departamento</span>
                    <span className="text-slate-200 font-bold">{viewingItem.departamento}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">Status</span>
                    <span className="text-emerald-400 font-bold">{viewingItem.status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">Telefone</span>
                    <span className="text-slate-200 font-bold">{viewingItem.telefone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">Data de Nascimento</span>
                    <span className="text-slate-200 font-bold">{viewingItem.dataNascimento}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Endereço Residencial</span>
                  <span className="text-slate-200 font-medium">
                    {viewingItem.rua}, Nº {viewingItem.numero} - Bairro {viewingItem.bairro}
                  </span>
                </div>

                {viewingItem.observacao && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">Anotações</span>
                    <p className="text-slate-400 italic mt-0.5">{viewingItem.observacao}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 shrink-0 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    const item = viewingItem;
                    setViewingItem(null);
                    openEditModal(item);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors"
                >
                  Editar Dados
                </button>
                <button
                  onClick={() => setViewingItem(null)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl relative max-h-[90vh] flex flex-col my-auto"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="shrink-0 mb-3 pr-8">
                <h3 className="text-lg font-bold text-slate-100 mb-0.5">
                  {editingItem ? 'Editar Ficha do Obreiro' : 'Cadastrar Novo Obreiro'}
                </h3>
                <p className="text-xs text-slate-400">
                  Preencha todos os campos obrigatórios do obreiro/diácono.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-3 text-left">
                {/* Upload da Foto do Obreiro */}
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Foto do Obreiro (Upload)
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                      {fotoUrl ? (
                        <>
                          <img src={fotoUrl} alt="Foto do obreiro" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setFotoUrl('')}
                            className="absolute top-1 right-1 p-1 bg-rose-600/90 hover:bg-rose-600 text-white rounded-full transition-colors shadow-md"
                            title="Remover foto"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <Camera className="w-6 h-6 text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700 transition-colors">
                        <Upload className="w-4 h-4 text-emerald-400" />
                        <span>{fotoUrl ? 'Alterar Foto' : 'Carregar Foto de Perfil'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoFileChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-slate-500">
                        Selecione uma foto (JPG, PNG) no seu dispositivo (Máx 10MB).
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={nomeCompleto}
                    onChange={(e) => setNomeCompleto(e.target.value)}
                    placeholder="Ex: Carlos Eduardo da Silva"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Telefone *</label>
                    <input
                      type="tel"
                      inputMode="tel"
                      required
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      placeholder="(11) 98765-4321"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Data de Nascimento *</label>
                    <input
                      type="date"
                      required
                      value={dataNascimento}
                      onChange={(e) => setDataNascimento(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Departamento *</label>
                    <select
                      value={departamento}
                      onChange={(e) => setDepartamento(e.target.value as DepartamentoChurch)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    >
                      {DEPARTAMENTOS.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Cargo / Função</label>
                    <input
                      type="text"
                      value={cargoMinistério}
                      onChange={(e) => setCargoMinistério(e.target.value)}
                      placeholder="Ex: Diácono, Cooperador"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Endereço: Rua, Número, Bairro */}
                <div className="space-y-2 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">Endereço Residencial</span>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-medium text-slate-400 mb-0.5">Rua / Logradouro *</label>
                      <input
                        type="text"
                        required
                        value={rua}
                        onChange={(e) => setRua(e.target.value)}
                        placeholder="Rua das Flores"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium text-slate-400 mb-0.5">Número *</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        required
                        value={numero}
                        onChange={(e) => setNumero(e.target.value)}
                        placeholder="120"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 mb-0.5">Bairro *</label>
                    <input
                      type="text"
                      required
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      placeholder="Centro / Vila Nova"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status no Ministério</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ObreiroStatus)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Ativo">Ativo na Escala</option>
                    <option value="Em Licença">Em Licença Temporária</option>
                    <option value="Honorário">Obreiro Honorário</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Observações Internas</label>
                  <textarea
                    rows={2}
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    placeholder="Especialidades, disponibilidades para cultos..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30"
                  >
                    {editingItem ? 'Salvar Ficha' : 'Cadastrar Obreiro'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
