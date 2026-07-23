import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Visitante, VisitanteStatus } from '../../types';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Phone,
  Calendar,
  MessageCircle,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  MessageSquare,
  UserCheck,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const VisitantesView: React.FC = () => {
  const {
    visitantes,
    addVisitante,
    updateVisitante,
    deleteVisitante,
    askConfirmDelete,
    searchQuery,
    setSearchQuery,
    requestAdminAuth
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Visitante | null>(null);

  // Form State
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [dataVisita, setDataVisita] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<VisitanteStatus>('Novo');
  const [observacao, setObservacao] = useState('');

  const openAddModal = () => {
    setEditingItem(null);
    setNome('');
    setTelefone('');
    setEmail('');
    setDataVisita(new Date().toISOString().slice(0, 10));
    setStatus('Novo');
    setObservacao('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: Visitante) => {
    requestAdminAuth(() => {
      setEditingItem(item);
      setNome(item.nome);
      setTelefone(item.telefone || '');
      setEmail(item.email || '');
      setDataVisita(item.dataVisita || new Date().toISOString().slice(0, 10));
      setStatus(item.status);
      setObservacao(item.observacao || '');
      setIsModalOpen(true);
    }, 'Editar Visitante');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    if (editingItem) {
      updateVisitante(editingItem.id, {
        nome,
        telefone,
        email,
        dataVisita,
        status,
        observacao
      });
    } else {
      addVisitante({
        nome,
        telefone,
        email,
        dataVisita,
        status,
        observacao
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (item: Visitante) => {
    askConfirmDelete(
      'Excluir Visitante',
      `Deseja realmente excluir o cadastro do visitante "${item.nome}"? Esta ação não poderá ser desfeita.`,
      () => deleteVisitante(item.id)
    );
  };

  // WhatsApp Helper Message
  const getWhatsAppLink = (v: Visitante) => {
    if (!v.telefone) return '#';
    const cleanPhone = v.telefone.replace(/\D/g, '');
    const msg = encodeURIComponent(
      `A Paz do Senhor, ${v.nome}! Somos da equipe de recepção da igreja. Foi uma grande alegria receber você em nosso culto! Como podemos orar por você esta semana?`
    );
    return `https://wa.me/55${cleanPhone}?text=${msg}`;
  };

  // Filter & Search Logic
  const filteredList = visitantes.filter((item) => {
    const matchesSearch =
      item.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.telefone && item.telefone.includes(searchQuery)) ||
      (item.comoConheceu && item.comoConheceu.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter =
      statusFilter === 'todos' ? true : item.status === statusFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-100">Cadastro de Visitantes</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Total de {visitantes.length} visitantes registrados no sistema
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-900/30 transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Novo Visitante</span>
        </button>
      </div>

      {/* Search & Filter controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por nome, telefone ou observação..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('todos')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
              statusFilter === 'todos'
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos ({visitantes.length})
          </button>
          <button
            onClick={() => setStatusFilter('Novo')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
              statusFilter === 'Novo'
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Novos ({visitantes.filter(v => v.status === 'Novo').length})
          </button>
          <button
            onClick={() => setStatusFilter('Em Acompanhamento')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
              statusFilter === 'Em Acompanhamento'
                ? 'bg-amber-600 border-amber-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Acompanhando ({visitantes.filter(v => v.status === 'Em Acompanhamento').length})
          </button>
          <button
            onClick={() => setStatusFilter('Integrado')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
              statusFilter === 'Integrado'
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Integrados ({visitantes.filter(v => v.status === 'Integrado').length})
          </button>
        </div>
      </div>

      {/* Visitors Cards List */}
      {filteredList.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300">Nenhum visitante encontrado</h3>
          <p className="text-xs text-slate-500 mt-1">
            Tente mudar o termo da pesquisa ou cadastre um novo visitante.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-100 text-base leading-snug">{item.nome}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      <span>Visitou em: {item.dataVisita}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 border ${
                      item.status === 'Novo'
                        ? 'bg-blue-950 text-blue-300 border-blue-800'
                        : item.status === 'Em Acompanhamento'
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                {/* Additional metadata */}
                <div className="space-y-1.5 text-xs text-slate-300 mb-4 bg-slate-950/50 rounded-xl p-3 border border-slate-800/80">
                  {item.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{item.telefone}</span>
                    </div>
                  )}

                  {item.comoConheceu && (
                    <div className="text-[11px] text-slate-400">
                      <strong className="text-slate-300">Como conheceu:</strong> {item.comoConheceu}
                    </div>
                  )}

                  {item.atendidoPor && (
                    <div className="text-[11px] text-slate-400">
                      <strong className="text-slate-300">Atendido por:</strong> {item.atendidoPor}
                    </div>
                  )}

                  {item.pedidoOracao && (
                    <div className="text-[11px] text-rose-300 font-medium pt-1 border-t border-slate-800">
                      <strong>Pedido de Oração:</strong> {item.pedidoOracao}
                    </div>
                  )}

                  {item.observacao && (
                    <div className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800">
                      "{item.observacao}"
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                {item.telefone ? (
                  <a
                    href={getWhatsAppLink(item)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp</span>
                  </a>
                ) : (
                  <span />
                )}

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

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative my-8"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-slate-100 mb-1">
                {editingItem ? 'Editar Visitante' : 'Cadastrar Novo Visitante'}
              </h3>
              <p className="text-xs text-slate-400 mb-5">
                Preencha as informações do visitante para acompanhamento pastoral e diaconal.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Gabriel Santos"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Telefone / WhatsApp</label>
                    <input
                      type="tel"
                      inputMode="tel"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      placeholder="(11) 99999-8888"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Data da Visita</label>
                    <input
                      type="date"
                      value={dataVisita}
                      onChange={(e) => setDataVisita(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status de Acompanhamento</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as VisitanteStatus)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Novo">Novo (Primeira Visita)</option>
                    <option value="Em Acompanhamento">Em Acompanhamento (Retornou/Célula)</option>
                    <option value="Integrado">Integrado (Membro/Frequente)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Observações Internas</label>
                  <textarea
                    rows={2}
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    placeholder="Anotações para a equipe diaconal..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
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
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-900/30"
                  >
                    {editingItem ? 'Salvar Alterações' : 'Cadastrar Visitante'}
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
