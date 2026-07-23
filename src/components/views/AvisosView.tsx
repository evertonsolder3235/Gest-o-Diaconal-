import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Aviso } from '../../types';
import {
  Megaphone,
  Plus,
  Pin,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  X,
  Search,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AvisosView: React.FC = () => {
  const {
    avisos,
    addAviso,
    updateAviso,
    deleteAviso,
    toggleFixarAviso,
    askConfirmDelete,
    searchQuery,
    setSearchQuery,
    requestAdminAuth
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Aviso | null>(null);

  // Form State
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [horario, setHorario] = useState('19:00');
  const [fixado, setFixado] = useState(false);

  const openAddModal = () => {
    requestAdminAuth(() => {
      setEditingItem(null);
      setTitulo('');
      setDescricao('');
      setData(new Date().toISOString().slice(0, 10));
      setHorario('19:00');
      setFixado(false);
      setIsModalOpen(true);
    }, 'Publicar Novo Aviso');
  };

  const openEditModal = (item: Aviso) => {
    requestAdminAuth(() => {
      setEditingItem(item);
      setTitulo(item.titulo);
      setDescricao(item.descricao);
      setData(item.data);
      setHorario(item.horario || '');
      setFixado(item.fixado);
      setIsModalOpen(true);
    }, 'Editar Aviso');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !descricao.trim()) return;

    if (editingItem) {
      updateAviso(editingItem.id, {
        titulo,
        descricao,
        data,
        horario,
        fixado
      });
    } else {
      addAviso({
        titulo,
        descricao,
        data,
        horario,
        fixado
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (item: Aviso) => {
    askConfirmDelete(
      'Excluir Aviso',
      `Deseja realmente excluir o comunicado "${item.titulo}"?`,
      () => deleteAviso(item.id)
    );
  };

  const filteredList = avisos.filter((item) => {
    return (
      item.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.descricao.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-600/20 text-amber-400">
              <Megaphone className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-100">Avisos & Comunicados</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Divulgação de eventos, escalas e boletim informativo da semana
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-900/30 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Publicar Novo Aviso</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Pesquisar aviso por título ou conteúdo..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
        />
      </div>

      {/* Announcements List */}
      {filteredList.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <Megaphone className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300">Nenhum aviso encontrado</h3>
          <p className="text-xs text-slate-500 mt-1">
            Clique no botão "Publicar Novo Aviso" para criar um comunicado.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className={`bg-slate-900 border rounded-2xl p-5 hover:border-amber-500/40 transition-all shadow-md flex flex-col justify-between ${
                item.fixado ? 'border-amber-700/60 bg-amber-950/10' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    {item.fixado && (
                      <Pin className="w-4 h-4 text-amber-400 fill-amber-400/20 shrink-0" />
                    )}
                    <h3 className="font-extrabold text-slate-100 text-base">{item.titulo}</h3>
                  </div>

                  <button
                    onClick={() => toggleFixarAviso(item.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                      item.fixado
                        ? 'bg-amber-900/60 text-amber-300 border-amber-700/60'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {item.fixado ? 'Destaque Ativo' : 'Fixar'}
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4 whitespace-pre-line bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  {item.descricao}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>{item.data}</span>
                  </div>
                  {item.horario && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{item.horario}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-1 pt-3 border-t border-slate-800 mt-4">
                <button
                  onClick={() => openEditModal(item)}
                  className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
                  title="Editar Aviso"
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
          ))}
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-slate-100 mb-1">
                {editingItem ? 'Editar Aviso' : 'Publicar Novo Aviso'}
              </h3>
              <p className="text-xs text-slate-400 mb-5">
                Preencha os dados do aviso para exibição no aplicativo.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Título do Aviso *</label>
                  <input
                    type="text"
                    required
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ex: Culto de Celebração e Santa Ceia"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição / Detalhes *</label>
                  <textarea
                    rows={3}
                    required
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Descreva o objetivo, público-alvo ou orientações do culto/evento..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Data</label>
                    <input
                      type="date"
                      value={data}
                      onChange={(e) => setData(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Horário (Opcional)</label>
                    <input
                      type="time"
                      value={horario}
                      onChange={(e) => setHorario(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    id="fixadoCheck"
                    checked={fixado}
                    onChange={(e) => setFixado(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="fixadoCheck" className="text-xs font-semibold text-slate-300 cursor-pointer">
                    Fixar este aviso em destaque na Dashboard principal
                  </label>
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
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-900/30"
                  >
                    {editingItem ? 'Salvar Alterações' : 'Publicar Aviso'}
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
