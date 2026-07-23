import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
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
  Briefcase
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
    askConfirmDelete,
    searchQuery,
    setSearchQuery,
    requestAdminAuth
  } = useApp();

  const [deptFilter, setDeptFilter] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Obreiro | null>(null);
  const [viewingItem, setViewingItem] = useState<Obreiro | null>(null);

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
      setIsModalOpen(true);
    }, 'Cadastrar Novo Obreiro');
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
      setIsModalOpen(true);
    }, 'Editar Obreiro');
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
        observacao
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
        observacao
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (item: Obreiro) => {
    askConfirmDelete(
      'Excluir Cadastro de Obreiro',
      `Deseja realmente excluir o cadastro de "${item.nomeCompleto}"? Esta informação será removida permanentemente.`,
      () => deleteObreiro(item.id)
    );
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
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/40 transition-all shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-100 text-base leading-snug">
                      {item.nomeCompleto}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mt-0.5">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>{item.cargoMinistério || 'Diácono'}</span>
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
          ))}
        </div>
      )}

      {/* Detailed Profile Viewer Modal */}
      <AnimatePresence>
        {viewingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative"
            >
              <button
                onClick={() => setViewingItem(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-xl">
                  {viewingItem.nomeCompleto.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">{viewingItem.nomeCompleto}</h3>
                  <p className="text-xs text-emerald-400 font-semibold">{viewingItem.cargoMinistério || 'Diácono'}</p>
                </div>
              </div>

              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300">
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

              <div className="flex items-center justify-end gap-2 mt-5">
                <button
                  onClick={() => {
                    const item = viewingItem;
                    setViewingItem(null);
                    openEditModal(item);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
                >
                  Editar Dados
                </button>
                <button
                  onClick={() => setViewingItem(null)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative my-8"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-slate-100 mb-1">
                {editingItem ? 'Editar Ficha do Obreiro' : 'Cadastrar Novo Obreiro'}
              </h3>
              <p className="text-xs text-slate-400 mb-5">
                Preencha todos os campos obrigatórios do obreiro/diácono.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
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
