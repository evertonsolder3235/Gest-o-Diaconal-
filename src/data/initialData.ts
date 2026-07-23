import { 
  Visitante, 
  Aniversariante, 
  Obreiro, 
  PedidoOracao, 
  Aviso, 
  ContribuicaoFinanceira, 
  IgrejaConfig, 
  User,
  ItemEscala
} from '../types';

export const initialConfig: IgrejaConfig = {
  nomeIgreja: 'IGREJA ADBRAS SEDE',
  subtitulo: 'Ministério Diaconal & Acolhimento',
  pastorPresidente: 'Pr. Marcos Oliveira',
  endereco: 'Rua das Palmeiras, 150 - Centro',
  telefone: '(11) 98765-4321',
  email: 'contato@adbrassede.org',
  chavePix: 'pix@adbrassede.org'
};

export const initialUsers: User[] = [
  {
    id: 'u-1',
    nome: 'Diácono Carlos Silva',
    email: 'admin@igreja.com',
    cargo: 'Diácono Líder',
    departamento: 'Diaconia'
  },
  {
    id: 'u-2',
    nome: 'Irmã Maria Fernandes',
    email: 'secretaria@igreja.com',
    cargo: 'Secretaria',
    departamento: 'Recepção & Acolhimento'
  },
  {
    id: 'u-3',
    nome: 'Pb. Roberto Santos',
    email: 'tesouraria@igreja.com',
    cargo: 'Tesouraria',
    departamento: 'Diaconia'
  }
];

export const initialVisitantes: Visitante[] = [
  {
    id: 'v-1',
    nome: 'Lucas Gabriel Souza',
    telefone: '(11) 99887-1122',
    email: 'lucas.gabriel@email.com',
    dataVisita: '2026-07-20',
    comoConheceu: 'Convite de amigo (Obreiro André)',
    atendidoPor: 'Diácono Carlos',
    pedidoOracao: 'Orar pela família e vida profissional.',
    status: 'Novo',
    observacao: 'Gostou muito do culto e do louvor. Pediu para ser avisado sobre os cultos de domingo.'
  },
  {
    id: 'v-2',
    nome: 'Juliana e Renato Lima',
    telefone: '(11) 98123-4455',
    dataVisita: '2026-07-13',
    comoConheceu: 'Aviso nas redes sociais',
    atendidoPor: 'Irmã Maria',
    pedidoOracao: 'Saúde do filho pequeno.',
    status: 'Em Acompanhamento',
    observacao: 'Casal novo no bairro, procuram uma igreja com ministério infantil ativo.'
  },
  {
    id: 'v-3',
    nome: 'Beatriz Vasconcelos',
    telefone: '(11) 97654-3210',
    dataVisita: '2026-06-28',
    comoConheceu: 'Passou em frente e entrou',
    atendidoPor: 'Diácono Paulo',
    status: 'Integrado',
    observacao: 'Já participou do curso de novos membros e ingressou na célula da zona sul.'
  }
];

export const initialAniversariantes: Aniversariante[] = [
  {
    id: 'a-1',
    nome: 'Diácono Carlos Silva',
    tipoComemoracao: 'Aniversário',
    data: '2026-07-25',
    telefone: '(11) 98765-1111',
    observacao: 'Líder da Diaconia'
  },
  {
    id: 'a-2',
    nome: 'Pb. Roberto & Ana Santos',
    tipoComemoracao: 'Casamento',
    data: '2026-07-28',
    telefone: '(11) 99123-5566',
    observacao: '25 Anos de Casados (Bodas de Prata)'
  },
  {
    id: 'a-3',
    nome: 'Pr. Marcos & Patrícia Oliveira',
    tipoComemoracao: 'Bodas',
    data: '2026-08-04',
    telefone: '(11) 98888-9999',
    observacao: '30 Anos de Casamento'
  },
  {
    id: 'a-4',
    nome: 'Irmã Claudete Ribeiro',
    tipoComemoracao: 'Aniversário',
    data: '2026-08-12',
    telefone: '(11) 97412-8899',
    observacao: 'Intercessão'
  }
];

export const initialObreiros: Obreiro[] = [
  {
    id: 'ob-1',
    nomeCompleto: 'Carlos Eduardo da Silva',
    telefone: '(11) 98765-1111',
    dataNascimento: '1984-07-25',
    departamento: 'Diaconia',
    rua: 'Rua dos Ipês',
    numero: '240',
    bairro: 'Jardim América',
    cargoMinistério: 'Diácono Chefe',
    status: 'Ativo',
    observacao: 'Coordenador da escala de recepção e ceia do mês.'
  },
  {
    id: 'ob-2',
    nomeCompleto: 'André Luiz Mendonça',
    telefone: '(11) 99112-3344',
    dataNascimento: '1990-11-14',
    departamento: 'Diaconia',
    rua: 'Avenida Brasil',
    numero: '1050',
    bairro: 'Centro',
    cargoMinistério: 'Diácono',
    status: 'Ativo',
    observacao: 'Responsável pelo som e projeção nos cultos de quinta-feira.'
  },
  {
    id: 'ob-3',
    nomeCompleto: 'Maria Fernanda Santos',
    telefone: '(11) 98111-2233',
    dataNascimento: '1988-03-10',
    departamento: 'Recepção & Acolhimento',
    rua: 'Rua XV de Novembro',
    numero: '88',
    bairro: 'Vila Nova',
    cargoMinistério: 'Diaconisa',
    status: 'Ativo',
    observacao: 'Líder da equipe de acolhimento aos visitantes.'
  },
  {
    id: 'ob-4',
    nomeCompleto: 'João Pedro Alencar',
    telefone: '(11) 97222-4455',
    dataNascimento: '1995-09-02',
    departamento: 'Louvor & Adoração',
    rua: 'Rua Flores do Campo',
    numero: '312',
    bairro: 'Alvorada',
    cargoMinistério: 'Obreiro',
    status: 'Ativo',
    observacao: 'Baterista e apoio na montagem de equipamentos.'
  },
  {
    id: 'ob-5',
    nomeCompleto: 'Luciana Aparecida Carvalho',
    telefone: '(11) 96555-7788',
    dataNascimento: '1979-05-18',
    departamento: 'Ministério Infantil',
    rua: 'Rua São Paulo',
    numero: '500',
    bairro: 'Bela Vista',
    cargoMinistério: 'Diaconisa',
    status: 'Em Licença',
    observacao: 'Licença maternidade até setembro.'
  }
];

export const initialPedidosOracao: PedidoOracao[] = [
  {
    id: 'p-1',
    nome: 'Irmã Francisca Nunes',
    pedido: 'Pedindo oração por cirurgia do joelho agendada para sexta-feira e pela paz de toda a família.',
    data: '2026-07-21',
    status: 'Urgente'
  },
  {
    id: 'p-2',
    nome: 'Família Barbosa',
    pedido: 'Oração por portas abertas de emprego para o irmão Marcelo Barbosa e saúde da avó Dona Rosa.',
    data: '2026-07-19',
    status: 'Em Oração'
  },
  {
    id: 'p-3',
    nome: 'Robson de Oliveira',
    pedido: 'Agradecimento a Deus pela aprovação no concurso público e pedido de sabedoria na nova jornada.',
    data: '2026-07-15',
    status: 'Atendido / Agradecimento',
    atendidoObservacao: 'Oração atendida! Testemunho compartilhado no culto de quarta.'
  }
];

export const initialAvisos: Aviso[] = [
  {
    id: 'av-1',
    titulo: 'Reunião Geral da Diaconia e Obreiros',
    descricao: 'Reunião mensal obrigatória de todos os diáconos e obreiros para alinhamento da escala e Santa Ceia.',
    data: '2026-07-26',
    horario: '17:00',
    fixado: true,
    autor: 'Diácono Carlos'
  },
  {
    id: 'av-2',
    titulo: 'Culto da Família & Santa Ceia do Senhor',
    descricao: 'Culto especial de celebração com Santa Ceia. Chegada da equipe diaconal às 18h00 para organização dos elementos.',
    data: '2026-08-02',
    horario: '19:00',
    fixado: true,
    autor: 'Pr. Marcos Oliveira'
  },
  {
    id: 'av-3',
    titulo: 'Mutirão de Limpeza e Manutenção do Templo',
    descricao: 'Ação voluntária para pintura e organização das salas da escola dominical. Almoço comunitário no local.',
    data: '2026-08-08',
    horario: '08:30',
    fixado: false,
    autor: 'Ministério de Obras'
  }
];

export const initialContribuicoes: ContribuicaoFinanceira[] = [
  {
    id: 'f-1',
    tipoContribuicao: 'Dízimo',
    nomeContribuinte: 'Membro Anônimo - Diaconia ID 402',
    valor: 450.00,
    data: '2026-07-21',
    observacaoRecado: 'Dízimo referente ao mês de julho',
    comprovanteNome: 'comprovante_pix_450.png'
  },
  {
    id: 'f-2',
    tipoContribuicao: 'Oferta',
    nomeContribuinte: 'Oferta de Gratidão - Culto de Domingo',
    valor: 320.50,
    data: '2026-07-20',
    observacaoRecado: 'Oferta recolhida pelos diáconos no culto da noite'
  },
  {
    id: 'f-3',
    tipoContribuicao: 'Missões',
    nomeContribuinte: 'Família Silveira',
    valor: 200.00,
    data: '2026-07-18',
    observacaoRecado: 'Oferta voluntária específica para o projeto missionário no Sertão'
  },
  {
    id: 'f-4',
    tipoContribuicao: 'Construção',
    nomeContribuinte: 'Irmão Paulo Viana',
    valor: 500.00,
    data: '2026-07-14',
    observacaoRecado: 'Apoio à reforma do sistema de som da nave principal'
  }
];

export const initialEscalas: ItemEscala[] = [
  {
    id: 'e-1',
    data: '2026-07-23',
    horario: '19:30',
    lugar: 'ALTAR',
    nomePessoa: 'Diácono Carlos Silva',
    grupo: 'Homens',
    observacao: 'Dirigente do culto'
  },
  {
    id: 'e-2',
    data: '2026-07-23',
    horario: '19:00',
    lugar: 'ESTACIONAMENTO',
    nomePessoa: 'Pb. Roberto Santos',
    grupo: 'Homens',
    observacao: 'Organização do fluxo de veículos'
  },
  {
    id: 'e-m1',
    data: '2026-07-23',
    horario: '19:00',
    lugar: 'RECEPÇÃO',
    nomePessoa: 'Irmã Maria Fernandes',
    grupo: 'Mulheres',
    observacao: 'Recepção e Acolhimento'
  },
  {
    id: 'e-m2',
    data: '2026-07-23',
    horario: '19:15',
    lugar: 'INTERCESSÃO',
    nomePessoa: 'Ana Paula Souza',
    grupo: 'Mulheres',
    observacao: 'Apoio e Oração'
  },
  {
    id: 'e-3',
    data: '2026-07-26',
    horario: '09:00',
    lugar: 'ALTAR',
    nomePessoa: 'André Luiz Mendes',
    grupo: 'Homens',
    observacao: 'Escala da Manhã'
  },
  {
    id: 'e-4',
    data: '2026-07-26',
    horario: '08:30',
    lugar: 'ESTACIONAMENTO',
    nomePessoa: 'Márcio Eduardo Costa',
    grupo: 'Homens',
    observacao: 'Estacionamento e Recepção externa'
  },
  {
    id: 'e-5',
    data: '2026-07-26',
    horario: '19:00',
    lugar: 'ALTAR',
    nomePessoa: 'Diácono Carlos Silva',
    grupo: 'Homens',
    observacao: 'Culto de Celebração'
  },
  {
    id: 'e-6',
    data: '2026-07-26',
    horario: '18:30',
    lugar: 'ESTACIONAMENTO',
    nomePessoa: 'Fernando Albuquerque',
    grupo: 'Homens',
    observacao: 'Estacionamento do templo'
  },
  {
    id: 'e-7',
    data: '2026-07-26',
    horario: '18:45',
    lugar: 'RECEPÇÃO',
    nomePessoa: 'Irmã Maria Fernandes',
    grupo: 'Mulheres',
    observacao: 'Acolhimento aos visitantes'
  },
  {
    id: 'e-8',
    data: '2026-07-26',
    horario: '18:30',
    lugar: 'GALERIA',
    nomePessoa: 'Marcos Vinícius',
    grupo: 'Homens',
    observacao: 'Apoio no segundo andar / galeria'
  },
  {
    id: 'e-9',
    data: '2026-07-26',
    horario: '18:30',
    lugar: 'INTERCESSÃO',
    nomePessoa: 'Ana Paula Souza',
    grupo: 'Mulheres',
    observacao: 'Sala de Oração'
  },
  {
    id: 'e-10',
    data: '2026-07-26',
    horario: '18:30',
    lugar: 'BANHEIRO',
    nomePessoa: 'Lucas Gabriel',
    grupo: 'Homens',
    observacao: 'Manutenção e zelo'
  }
];
