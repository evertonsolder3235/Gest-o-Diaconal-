import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Aniversariante, TipoComemoracao } from '../../types';
import {
  Cake,
  Heart,
  Sparkles,
  Plus,
  Search,
  Calendar,
  Phone,
  MessageCircle,
  Edit2,
  Trash2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AniversariantesView: React.FC = () => {
  const {
    aniversariantes,
    addAniversariante,
    updateAniversariante,
    deleteAniversariante,
    askConfirmDelete,
    searchQuery,
    setSearchQuery,
    requestAdminAuth
  } = useApp();

  const [tipoFilter, setTipoFilter] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Aniversariante | null>(null);

  // Form State
  const [nome, setNome] = useState('');
  const [tipoComemoracao, setTipoComemoracao] = useState<TipoComemoracao>('Aniversário');
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [telefone, setTelefone] = useState('');
  const [observacao, setObservacao] = useState('');

  const openAddModal = () => {
    setEditingItem(null);
    setNome('');
    setTipoComemoracao('Aniversário');
    setData(new Date().toISOString().slice(0, 10));
    setTelefone('');
    setObservacao('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: Aniversariante) => {
    requestAdminAuth(() => {
      setEditingItem(item);
      setNome(item.nome);
      setTipoComemoracao(item.tipoComemoracao);
      setData(item.data);
      setTelefone(item.telefone || '');
      setObservacao(item.observacao || '');
      setIsModalOpen(true);
    }, 'Editar Comemoração');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    if (editingItem) {
      updateAniversariante(editingItem.id, {
        nome,
        tipoComemoracao,
        data,
        telefone,
        observacao
      });
    } else {
      addAniversariante({
        nome,
        tipoComemoracao,
        data,
        telefone,
        observacao
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (item: Aniversariante) => {
    askConfirmDelete(
      'Excluir Comemoração',
      `Deseja realmente excluir o registro de comemoração de "${item.nome}"?`,
      () => deleteAniversariante(item.id)
    );
  };

  const getWhatsAppMsgLink = (item: Aniversariante) => {
    if (!item.telefone) return '#';
    const cleanPhone = item.telefone.replace(/\D/g, '');
    let text = `Parabéns, ${item.nome}! A família diaconal da igreja deseja que o Senhor Jesus abençoe rica e abundantemente o seu dia de ${item.tipoComemoracao}! "O Senhor te abençoe e te guarde!" (Números 6:24)`;
    return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  const filteredList = aniversariantes.filter((item) => {
    const matchesSearch =
      item.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.data.includes(searchQuery) ||
      (item.observacao && item.observacao.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter =
      tipoFilter === 'todos' ? true : item.tipoComemoracao === tipoFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400">
              <Cake className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-100">Aniversariantes & Comemorações</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gestão de aniversários natalícios, casamentos, bodas e datas festivas
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Comemoração</span>
        </button>
      </div>

      {/* Filter Chips & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por nome ou data..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setTipoFilter('todos')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
              tipoFilter === 'todos'
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos ({aniversariantes.length})
          </button>
          <button
            onClick={() => setTipoFilter('Aniversário')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
              tipoFilter === 'Aniversário'
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Aniversários
          </button>
          <button
            onClick={() => setTipoFilter('Casamento')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
              tipoFilter === 'Casamento'
                ? 'bg-rose-600 border-rose-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Casamentos
          </button>
          <button
            onClick={() => setTipoFilter('Bodas')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
              tipoFilter === 'Bodas'
                ? 'bg-amber-600 border-amber-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Bodas
          </button>
        </div>
      </div>

      {/* List Grid */}
      {filteredList.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <Cake className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300">Nenhuma comemoração registrada</h3>
          <p className="text-xs text-slate-500 mt-1">
            Clique em "Nova Comemoração" para adicionar aniversariantes ou bodas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-purple-500/40 transition-all shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-100 text-base">{item.nome}</h3>
                    <span className="inline-flex items-center gap-1 text-xs text-purple-400 font-bold mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{item.tipoComemoracao}</span>
                    </span>
                  </div>

                  <div className="px-3 py-1 bg-purple-950/80 border border-purple-800/80 rounded-xl text-right">
                    <span className="text-xs font-mono font-bold text-purple-200 block">{item.data}</span>
                    <span className="text-[10px] text-purple-400 uppercase font-semibold">Data</span>
                  </div>
                </div>

                {item.observacao && (
                  <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800 mb-3">
                    {item.observacao}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                {item.telefone ? (
                  <a
                    href={getWhatsAppMsgLink(item)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Enviar Parabéns</span>
                  </a>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
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
                {editingItem ? 'Editar Comemoração' : 'Cadastrar Comemoração'}
              </h3>
              <p className="text-xs text-slate-400 mb-5">
                Informe o nome e o que está sendo comemorado.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nome / Casal *</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Carlos Silva ou Pr. Marcos & Ana"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">O que comemora?</label>
                  <select
                    value={tipoComemoracao}
                    onChange={(e) => setTipoComemoracao(e.target.value as TipoComemoracao)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Aniversário">Aniversário Natalício</option>
                    <option value="Casamento">Aniversário de Casamento</option>
                    <option value="Bodas">Bodas de Prata / Ouro / Outras</option>
                    <option value="Outra comemoração">Outra comemoração especial</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Data da Comemoração</label>
                    <input
                      type="date"
                      value={data}
                      onChange={(e) => setData(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Telefone / WhatsApp</label>
                    <input
                      type="tel"
                      inputMode="tel"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      placeholder="(11) 98888-7777"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Observação / Detalhes</label>
                  <input
                    type="text"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    placeholder="Ex: 25 Anos de Casamento / Diácono da escala"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
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
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30"
                  >
                    {editingItem ? 'Salvar' : 'Cadastrar'}
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
