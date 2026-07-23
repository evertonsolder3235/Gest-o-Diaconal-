export type UserRole = 'Diácono Líder' | 'Diácono' | 'Secretaria' | 'Tesouraria' | 'Pastor Presbítero';

export interface User {
  id: string;
  nome: string;
  email: string;
  cargo: UserRole;
  departamento: string;
  avatarUrl?: string;
}

export type VisitanteStatus = 'Novo' | 'Em Acompanhamento' | 'Integrado';

export interface Visitante {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  dataVisita: string; // YYYY-MM-DD
  comoConheceu?: string;
  atendidoPor?: string;
  pedidoOracao?: string;
  status: VisitanteStatus;
  observacao?: string;
}

export type TipoComemoracao = 'Aniversário' | 'Casamento' | 'Bodas' | 'Outra comemoração';

export interface Aniversariante {
  id: string;
  nome: string;
  tipoComemoracao: TipoComemoracao;
  data: string; // MM-DD or YYYY-MM-DD
  telefone?: string;
  observacao?: string;
}

export type DepartamentoChurch = 
  | 'Diaconia'
  | 'Louvor & Adoração'
  | 'Ministério Infantil'
  | 'Recepção & Acolhimento'
  | 'Mídia & Som'
  | 'Ensino & EBD'
  | 'Intercessão'
  | 'Eventos & Ação Social'
  | 'Jovens & Adolescentes';

export type ObreiroStatus = 'Ativo' | 'Em Licença' | 'Honorário';

export interface Obreiro {
  id: string;
  nomeCompleto: string;
  telefone: string;
  dataNascimento: string; // YYYY-MM-DD
  departamento: DepartamentoChurch;
  rua: string;
  numero: string;
  bairro: string;
  cargoMinistério?: string;
  status: ObreiroStatus;
  observacao?: string;
}

export type PedidoStatus = 'Urgente' | 'Em Oração' | 'Atendido / Agradecimento';

export interface PedidoOracao {
  id: string;
  nome: string;
  pedido: string;
  data: string; // YYYY-MM-DD
  status: PedidoStatus;
  atendidoObservacao?: string;
}

export interface Aviso {
  id: string;
  titulo: string;
  descricao: string;
  data: string; // YYYY-MM-DD
  horario?: string; // HH:mm
  fixado: boolean;
  autor?: string;
}

export type TipoContribuicao = 
  | 'Dízimo' 
  | 'Oferta' 
  | 'Missões' 
  | 'Construção' 
  | 'Departamento' 
  | 'Evento' 
  | 'Outra contribuição';

export interface ContribuicaoFinanceira {
  id: string;
  tipoContribuicao: TipoContribuicao;
  nomeContribuinte: string;
  valor: number;
  data: string; // YYYY-MM-DD
  observacaoRecado?: string;
  comprovanteUrl?: string; // Base64 data URL or image path
  comprovanteNome?: string;
}

export interface IgrejaConfig {
  nomeIgreja: string;
  subtitulo: string;
  pastorPresidente: string;
  endereco: string;
  telefone: string;
  email: string;
  chavePix?: string;
  logoUrl?: string;
}

export type ViewTab = 
  | 'dashboard'
  | 'visitantes'
  | 'aniversariantes'
  | 'obreiros'
  | 'pedidos'
  | 'avisos'
  | 'financeiro'
  | 'configuracoes';

export type UnseenCategory = 'visitantes' | 'aniversariantes' | 'obreiros' | 'pedidos' | 'avisos' | 'financeiro';

export type UnseenModules = Record<UnseenCategory, boolean>;

export type LugarEscala = 'ALTAR' | 'BANHEIRO' | 'ESTACIONAMENTO' | 'GALERIA' | 'INTERCESSÃO' | 'RECEPÇÃO';

export interface ItemEscala {
  id: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:mm or e.g. "19:00"
  lugar: LugarEscala | string;
  nomePessoa: string;
  grupo: 'Homens' | 'Mulheres';
  observacao?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}
