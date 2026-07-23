import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ContribuicaoFinanceira, TipoContribuicao } from '../../types';
import {
  Wallet,
  PlusCircle,
  Search,
  Filter,
  DollarSign,
  Paperclip,
  Eye,
  EyeOff,
  FileText,
  Edit2,
  Trash2,
  X,
  TrendingUp,
  Image as ImageIcon,
  CheckCircle,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const TIPOS_CONTRIBUICAO: TipoContribuicao[] = [
  'Dízimo',
  'Oferta',
  'Missões',
  'Construção',
  'Departamento',
  'Evento',
  'Outra contribuição'
];

export const FinanceiroView: React.FC = () => {
  const {
    contribuicoes,
    addContribuicao,
    updateContribuicao,
    deleteContribuicao,
    askConfirmDelete,
    searchQuery,
    setSearchQuery,
    requestAdminAuth
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContribuicaoFinanceira | null>(null);
  const [viewingProofItem, setViewingProofItem] = useState<ContribuicaoFinanceira | null>(null);
  const [showValue, setShowValue] = useState<boolean>(false);

  // Form State matching prompt specifications exactly
  const [tipoContribuicao, setTipoContribuicao] = useState<TipoContribuicao>('Dízimo');
  const [nomeContribuinte, setNomeContribuinte] = useState('');
  const [valor, setValor] = useState<number | string>('');
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [observacaoRecado, setObservacaoRecado] = useState('');
  const [comprovanteUrl, setComprovanteUrl] = useState<string | undefined>(undefined);
  const [comprovanteNome, setComprovanteNome] = useState<string | undefined>(undefined);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setTipoContribuicao('Dízimo');
    setNomeContribuinte('');
    setValor('');
    setData(new Date().toISOString().slice(0, 10));
    setObservacaoRecado('');
    setComprovanteUrl(undefined);
    setComprovanteNome(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (item: ContribuicaoFinanceira) => {
    requestAdminAuth(() => {
      setEditingItem(item);
      setTipoContribuicao(item.tipoContribuicao);
      setNomeContribuinte(item.nomeContribuinte);
      setValor(item.valor);
      setData(item.data);
      setObservacaoRecado(item.observacaoRecado || '');
      setComprovanteUrl(item.comprovanteUrl);
      setComprovanteNome(item.comprovanteNome);
      setIsModalOpen(true);
    }, 'Editar Contribuição');
  };

  // Handle File Upload for Comprovante
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setComprovanteNome(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setComprovanteUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeContribuinte.trim() || !valor) return;

    const numericValor = typeof valor === 'string' ? parseFloat(valor) : valor;

    if (editingItem) {
      updateContribuicao(editingItem.id, {
        tipoContribuicao,
        nomeContribuinte,
        valor: numericValor,
        data,
        observacaoRecado,
        comprovanteUrl,
        comprovanteNome
      });
    } else {
      addContribuicao({
        tipoContribuicao,
        nomeContribuinte,
        valor: numericValor,
        data,
        observacaoRecado,
        comprovanteUrl,
        comprovanteNome
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (item: ContribuicaoFinanceira) => {
    askConfirmDelete(
      'Excluir Registro Financeiro',
      `Deseja realmente excluir a contribuição de ${formatBRL(item.valor)} (${item.nomeContribuinte})?`,
      () => deleteContribuicao(item.id)
    );
  };

  // Calculations for Summary
  const totalGeral = contribuicoes.reduce((acc, c) => acc + c.valor, 0);

  const filteredList = contribuicoes.filter((item) => {
    return (
      item.nomeContribuinte.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.observacaoRecado && item.observacaoRecado.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-100">Módulo Financeiro & Contribuições</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Registro de dízimos, ofertas, missões, obras e anexos de comprovantes
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Registrar Contribuição</span>
        </button>
      </div>

      {/* Resumo Financeiro Card */}
      <div className="bg-gradient-to-br from-slate-900 to-emerald-950/40 border border-emerald-800/50 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
              Total Arrecadado
            </span>
            <button
              type="button"
              onClick={() => setShowValue((prev) => !prev)}
              className="p-1 text-slate-400 hover:text-emerald-400 rounded transition-colors"
              title={showValue ? 'Ocultar valor' : 'Mostrar valor'}
            >
              {showValue ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
            </button>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            {showValue ? formatBRL(totalGeral) : 'R$ •••,••'}
          </div>
        </div>
        <div className="text-xs text-slate-400 sm:text-right">
          <span className="inline-block px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 font-semibold text-slate-300">
            {contribuicoes.length} lançamentos registrados
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Pesquisar contribuinte ou recado..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
        />
      </div>

      {/* Contributions List */}
      {filteredList.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <Wallet className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300">Nenhum registro financeiro encontrado</h3>
          <p className="text-xs text-slate-500 mt-1">
            Clique em "Registrar Contribuição" para salvar lançamentos de dízimos ou ofertas.
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
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-800 inline-block mb-1">
                      {item.tipoContribuicao}
                    </span>
                    <h3 className="font-extrabold text-slate-100 text-base">{item.nomeContribuinte}</h3>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-extrabold text-emerald-400 block tracking-tight">
                      {showValue ? formatBRL(item.valor) : 'R$ •••,••'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{item.data}</span>
                  </div>
                </div>

                {item.observacaoRecado && (
                  <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800 mb-3">
                    <strong className="text-slate-400 block text-[10px] uppercase">Recado / Detalhe:</strong>
                    {item.observacaoRecado}
                  </p>
                )}

                {item.comprovanteNome && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 mb-3">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <Paperclip className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate text-[11px] font-medium">{item.comprovanteNome}</span>
                    </div>

                    {item.comprovanteUrl ? (
                      <button
                        onClick={() => setViewingProofItem(item)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:underline shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500">Anexo</span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-1 pt-3 border-t border-slate-800">
                <button
                  onClick={() => openEditModal(item)}
                  className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
                  title="Editar Contribuição"
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

      {/* Comprovante Image Viewer Modal */}
      <AnimatePresence>
        {viewingProofItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative"
            >
              <button
                onClick={() => setViewingProofItem(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-slate-100 mb-1">
                Comprovante de Contribuição
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                {viewingProofItem.nomeContribuinte} • {formatBRL(viewingProofItem.valor)} ({viewingProofItem.tipoContribuicao})
              </p>

              <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center max-h-[350px]">
                {viewingProofItem.comprovanteUrl ? (
                  <img
                    src={viewingProofItem.comprovanteUrl}
                    alt="Comprovante de pagamento"
                    className="max-h-[340px] w-auto object-contain"
                  />
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    Comprovante indisponível para visualização direta.
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 mt-4">
                <button
                  onClick={() => setViewingProofItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-slate-100 mb-1">
                {editingItem ? 'Editar Registro Financeiro' : 'Registrar Nova Contribuição'}
              </h3>
              <p className="text-xs text-slate-400 mb-5">
                Preencha os dados do dízimo, oferta ou contribuição ministerial.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Tipo de contribuição */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tipo de Contribuição *
                  </label>
                  <select
                    value={tipoContribuicao}
                    onChange={(e) => setTipoContribuicao(e.target.value as TipoContribuicao)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {TIPOS_CONTRIBUICAO.map((tipo) => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>

                {/* Contribuinte e Valor */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nome do Contribuinte / Membro *
                  </label>
                  <input
                    type="text"
                    required
                    value={nomeContribuinte}
                    onChange={(e) => setNomeContribuinte(e.target.value)}
                    placeholder="Ex: João da Silva / Oferta Culto de Domingo"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Valor da Contribuição (R$) *
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      required
                      value={valor}
                      onChange={(e) => setValor(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Data do Lançamento
                    </label>
                    <input
                      type="date"
                      value={data}
                      onChange={(e) => setData(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Observação / Recado */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Recado / Observação da Contribuição
                  </label>
                  <textarea
                    rows={2}
                    value={observacaoRecado}
                    onChange={(e) => setObservacaoRecado(e.target.value)}
                    placeholder="Ex: Dízimo do mês de julho / Oferta para a festa da escola dominical..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* File Upload for Comprovante */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="block text-xs font-semibold text-slate-300 mb-2">
                    Anexar Comprovante (Upload de Imagem)
                  </span>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-semibold cursor-pointer transition-colors">
                      <Upload className="w-4 h-4 text-emerald-400" />
                      <span>{comprovanteNome ? 'Trocar Arquivo' : 'Escolher Comprovante'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    {comprovanteNome && (
                      <span className="text-xs text-emerald-400 font-medium truncate max-w-[200px]">
                        ✓ {comprovanteNome}
                      </span>
                    )}
                  </div>
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
                    {editingItem ? 'Salvar Lançamento' : 'Registrar Contribuição'}
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
