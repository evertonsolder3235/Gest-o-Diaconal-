import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PedidoOracao, PedidoStatus } from '../../types';
import {
  Heart,
  Plus,
  Search,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Edit2,
  Trash2,
  X,
  Sparkles,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PedidosOracaoView: React.FC = () => {
  const {
    pedidos,
    addPedido,
    updatePedido,
    deletePedido,
    askConfirmDelete,
    searchQuery,
    setSearchQuery,
    requestAdminAuth
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PedidoOracao | null>(null);

  // Form State
  const [nome, setNome] = useState('');
  const [pedidoText, setPedidoText] = useState('');
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<PedidoStatus>('Em Oração');
  const [atendidoObservacao, setAtendidoObservacao] = useState('');

  const openAddModal = () => {
    setEditingItem(null);
    setNome('');
    setPedidoText('');
    setData(new Date().toISOString().slice(0, 10));
    setStatus('Em Oração');
    setAtendidoObservacao('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: PedidoOracao) => {
    requestAdminAuth(() => {
      setEditingItem(item);
      setNome(item.nome);
      setPedidoText(item.pedido);
      setData(item.data);
      setStatus(item.status);
      setAtendidoObservacao(item.atendidoObservacao || '');
      setIsModalOpen(true);
    }, 'Editar Pedido de Oração');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !pedidoText.trim()) return;

    if (editingItem) {
      updatePedido(editingItem.id, {
        nome,
        pedido: pedidoText,
        data,
        status,
        atendidoObservacao
      });
    } else {
      addPedido({
        nome,
        pedido: pedidoText,
        data,
        status,
        atendidoObservacao
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (item: PedidoOracao) => {
    askConfirmDelete(
      'Excluir Pedido de Oração',
      `Deseja realmente excluir o motivo de oração de "${item.nome}"?`,
      () => deletePedido(item.id)
    );
  };

  const filteredList = pedidos.filter((item) => {
    const matchesSearch =
      item.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pedido.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      statusFilter === 'todos' ? true : item.status === statusFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-600/20 text-rose-400">
              <Heart className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-100">Pedidos de Oração</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Mural de intercessão da igreja e acompanhamento de testemunhos
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-900/30 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Pedido</span>
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por nome ou pedido de oração..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('todos')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
              statusFilter === 'todos'
                ? 'bg-rose-600 border-rose-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos ({pedidos.length})
          </button>
          <button
            onClick={() => setStatusFilter('Urgente')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
              statusFilter === 'Urgente'
                ? 'bg-rose-700 border-rose-600 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Urgentes ({pedidos.filter(p => p.status === 'Urgente').length})
          </button>
          <button
            onClick={() => setStatusFilter('Em Oração')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
              statusFilter === 'Em Oração'
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Em Oração ({pedidos.filter(p => p.status === 'Em Oração').length})
          </button>
          <button
            onClick={() => setStatusFilter('Atendido / Agradecimento')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
              statusFilter === 'Atendido / Agradecimento'
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Atendidos ({pedidos.filter(p => p.status === 'Atendido / Agradecimento').length})
          </button>
        </div>
      </div>

      {/* Prayers List */}
      {filteredList.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <Heart className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300">Nenhum pedido de oração encontrado</h3>
          <p className="text-xs text-slate-500 mt-1">
            Utilize o botão "Cadastrar Pedido" para registrar novos motivos de oração.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className={`bg-slate-900 border rounded-2xl p-5 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between ${
                item.status === 'Urgente'
                  ? 'border-rose-800/80 bg-slate-900/90'
                  : item.status === 'Atendido / Agradecimento'
                  ? 'border-emerald-800/60 bg-slate-900/90'
                  : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-100 text-base">{item.nome}</h3>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>Registrado em: {item.data}</span>
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 border ${
                      item.status === 'Urgente'
                        ? 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse'
                        : item.status === 'Em Oração'
                        ? 'bg-blue-950 text-blue-300 border-blue-800'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 leading-relaxed mb-3">
                  "{item.pedido}"
                </div>

                {item.atendidoObservacao && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300 mb-3 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[10px] uppercase font-bold text-emerald-400">Testemunho / Vitória:</strong>
                      <span>{item.atendidoObservacao}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  onClick={() => {
                    const nextStatus: PedidoStatus =
                      item.status === 'Em Oração'
                        ? 'Urgente'
                        : item.status === 'Urgente'
                        ? 'Atendido / Agradecimento'
                        : 'Em Oração';
                    updatePedido(item.id, { status: nextStatus });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors"
                >
                  Alternar Status
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
                    title="Editar"
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
                {editingItem ? 'Editar Pedido de Oração' : 'Cadastrar Pedido de Oração'}
              </h3>
              <p className="text-xs text-slate-400 mb-5">
                Informe o nome da pessoa/família e o motivo de oração.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Solicitante *</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Irmã Francisca / Família Souza"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Pedido de Oração *</label>
                  <textarea
                    rows={3}
                    required
                    value={pedidoText}
                    onChange={(e) => setPedidoText(e.target.value)}
                    placeholder="Descreva o motivo de intercessão (saúde, libertação, emprego, família)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Data</label>
                    <input
                      type="date"
                      value={data}
                      onChange={(e) => setData(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as PedidoStatus)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                    >
                      <option value="Em Oração">Em Oração</option>
                      <option value="Urgente">Urgente</option>
                      <option value="Atendido / Agradecimento">Atendido / Agradecimento</option>
                    </select>
                  </div>
                </div>

                {status === 'Atendido / Agradecimento' && (
                  <div>
                    <label className="block text-xs font-semibold text-emerald-400 mb-1">Testemunho de Vitória</label>
                    <textarea
                      rows={2}
                      value={atendidoObservacao}
                      onChange={(e) => setAtendidoObservacao(e.target.value)}
                      placeholder="Descreva a benção alcançada para louvor a Deus..."
                      className="w-full bg-slate-950 border border-emerald-800/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}

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
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-900/30"
                  >
                    {editingItem ? 'Salvar Alterações' : 'Cadastrar Pedido'}
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
