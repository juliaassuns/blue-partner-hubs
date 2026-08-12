/**
 * Dataset demo determinístico do BluePartner Partner Intelligence Center.
 * Gerado com PRNG semeado — os mesmos dados em servidor e cliente (SSR-safe).
 */

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rnd = mulberry32(20260806);
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rnd() * arr.length)]!;
const int = (min: number, max: number) => min + Math.floor(rnd() * (max - min + 1));

export type AreaId =
  | "modern-work"
  | "security"
  | "infrastructure"
  | "data-ai"
  | "digital-app"
  | "business-apps";

export type Semaforo = "verde" | "amarelo" | "vermelho";

export type Area = {
  id: AreaId;
  nome: string;
  pontuacao: number;
  meta: number;
  renovacao: string;
  performance: number;
  skilling: number;
  customerSuccess: number;
  designacao: boolean;
};

export const AREAS: Area[] = [
  {
    id: "modern-work",
    nome: "Modern Work",
    pontuacao: 59,
    meta: 70,
    renovacao: "2026-11-14",
    performance: 22,
    skilling: 19,
    customerSuccess: 18,
    designacao: false,
  },
  {
    id: "security",
    nome: "Security",
    pontuacao: 72,
    meta: 80,
    renovacao: "2026-09-30",
    performance: 28,
    skilling: 24,
    customerSuccess: 20,
    designacao: true,
  },
  {
    id: "infrastructure",
    nome: "Infrastructure",
    pontuacao: 84,
    meta: 90,
    renovacao: "2027-02-08",
    performance: 32,
    skilling: 27,
    customerSuccess: 25,
    designacao: true,
  },
  {
    id: "business-apps",
    nome: "Business Applications",
    pontuacao: 65,
    meta: 75,
    renovacao: "2026-10-21",
    performance: 25,
    skilling: 21,
    customerSuccess: 19,
    designacao: false,
  },
  {
    id: "data-ai",
    nome: "Data & AI",
    pontuacao: 45,
    meta: 70,
    renovacao: "2026-08-29",
    performance: 18,
    skilling: 14,
    customerSuccess: 13,
    designacao: false,
  },
  {
    id: "digital-app",
    nome: "Digital & App Innovation",
    pontuacao: 70,
    meta: 75,
    renovacao: "2027-01-12",
    performance: 27,
    skilling: 22,
    customerSuccess: 21,
    designacao: true,
  },
];

export function semaforo(pontuacao: number, meta: number): Semaforo {
  const r = pontuacao / meta;
  if (r >= 0.95) return "verde";
  if (r >= 0.75) return "amarelo";
  return "vermelho";
}

export function diasRestantes(iso: string, hoje = new Date("2026-08-06")) {
  return Math.round((new Date(iso).getTime() - hoje.getTime()) / 86400000);
}

/* ------------------------------------------------------------------ */
/* Revendas CSP                                                        */
/* ------------------------------------------------------------------ */

const PREFIXOS = [
  "Alfa","Nova","Prime","Vertex","Delta","Orion","Atlas","Nexo","Sigma","Vetor",
  "Lumen","Aurora","Meridian","Zenit","Kairos","Quantum","Horizonte","Ápice","Sirius","Arbor",
  "Polar","Tesla","Ítaca","Cobalto","Âmbar","Titan","Solaris","Íris","Verde","Onda",
  "Rocha","Sagres","Ubatã","Ipê","Jacarandá","Caravela",
];
const SUFIXOS = ["Tech","Systems","Cloud","IT Solutions","Digital","Consultoria","Informática","Group","Services","Partners"];
const SEGMENTOS = ["Corporate","SMB","Enterprise","Governo","Educação","Saúde"] as const;
const STATUS_REVENDA = ["Ativa","Ativa","Ativa","Atenção","Inativa"] as const;
const GERENTES = [
  "Ana Ribeiro","Carlos Menezes","Daniela Prado","Eduardo Lima","Fernanda Souza",
  "Gustavo Alves","Helena Castro","Igor Batista","Juliana Moraes","Marcelo Tavares",
];

export type PontoHistoricoRevenda = { mes: string; contribuicaoMaicpp: number; qtdClientes: number };

export type Revenda = {
  id: string;
  nome: string;
  gerente: string;
  segmento: (typeof SEGMENTOS)[number];
  status: (typeof STATUS_REVENDA)[number];
  cidade: string;
  qtdClientes: number;
  contribuicaoMaicpp: number;
  contribuicoes: Record<AreaId, number>;
  saude: number;
  potencial: number;
  receitaMensal: number;
  proximasAcoes: string[];
  historico: PontoHistoricoRevenda[];
  variacaoClientes3m: number;
  variacaoPontos3m: number;
};

const HOJE_HIST = new Date(2026, 7, 1);
function mesLabelRevenda(indice: number, total: number) {
  const d = new Date(HOJE_HIST.getFullYear(), HOJE_HIST.getMonth() - (total - 1 - indice), 1);
  return d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
}

function avg(valores: number[]) {
  return valores.reduce((s, v) => s + v, 0) / valores.length;
}

function historicoRevenda(atualPontos: number, atualClientes: number): PontoHistoricoRevenda[] {
  const meses = 12;
  const pontos = new Array<number>(meses);
  const qtdClientesPorMes = new Array<number>(meses);
  pontos[meses - 1] = atualPontos;
  qtdClientesPorMes[meses - 1] = atualClientes;
  for (let i = meses - 2; i >= 0; i--) {
    const deltaPontos = (rnd() - 0.44) * 1.6;
    pontos[i] = Math.max(0, Number((pontos[i + 1]! - deltaPontos).toFixed(1)));
    const sorteioChurn = rnd();
    const deltaClientes = sorteioChurn < 0.12 ? -1 : sorteioChurn > 0.85 ? 1 : 0;
    qtdClientesPorMes[i] = Math.max(1, qtdClientesPorMes[i + 1]! - deltaClientes);
  }
  return pontos.map((p, i) => ({
    mes: mesLabelRevenda(i, meses),
    contribuicaoMaicpp: p,
    qtdClientes: qtdClientesPorMes[i]!,
  }));
}

const CIDADES = ["São Paulo","Campinas","Rio de Janeiro","Belo Horizonte","Curitiba","Porto Alegre","Recife","Salvador","Goiânia","Florianópolis","Brasília","Fortaleza"];

const ACOES_POOL = [
  "Agendar revisão trimestral de portfólio",
  "Ativar trial de Copilot em 3 clientes",
  "Fechar deployment de Defender for Business",
  "Capacitar 2 consultores em SC-200",
  "Migrar cliente âncora para Azure Landing Zone",
  "Ativar Fabric em cliente de varejo",
  "Renovar licenciamento M365 E3 do maior cliente",
  "Apresentar Power Platform ao time de operações",
  "Executar assessment de Entra ID P2",
  "Criar plano de adoção de Teams Phone",
];

function nomeRevenda(i: number) {
  return `${PREFIXOS[i % PREFIXOS.length]} ${SUFIXOS[Math.floor(i / PREFIXOS.length) % SUFIXOS.length]}`;
}

export const revendas: Revenda[] = Array.from({ length: 70 }, (_, i) => {
  const qtdClientes = int(3, 22);
  const contribuicoes = AREAS.reduce(
    (acc, a) => {
      acc[a.id] = Number((rnd() * 8 * (a.pontuacao / 70)).toFixed(1));
      return acc;
    },
    {} as Record<AreaId, number>,
  );
  const contribuicaoMaicpp = Number(
    Object.values(contribuicoes).reduce((s, v) => s + v, 0).toFixed(1),
  );
  const status = pick(STATUS_REVENDA);
  const saude = status === "Inativa" ? int(18, 42) : status === "Atenção" ? int(40, 64) : int(60, 98);
  const historico = historicoRevenda(contribuicaoMaicpp, qtdClientes);
  const mediaPontosUltimos3 = avg(historico.slice(-3).map((h) => h.contribuicaoMaicpp));
  const mediaPontosAnteriores3 = avg(historico.slice(-6, -3).map((h) => h.contribuicaoMaicpp));
  const mediaClientesUltimos3 = avg(historico.slice(-3).map((h) => h.qtdClientes));
  const mediaClientesAnteriores3 = avg(historico.slice(-6, -3).map((h) => h.qtdClientes));
  return {
    id: `rev-${String(i + 1).padStart(3, "0")}`,
    nome: nomeRevenda(i),
    gerente: pick(GERENTES),
    segmento: pick(SEGMENTOS),
    status,
    cidade: pick(CIDADES),
    qtdClientes,
    contribuicaoMaicpp,
    contribuicoes,
    saude,
    potencial: int(20, 99),
    receitaMensal: int(18, 480) * 1000,
    proximasAcoes: [pick(ACOES_POOL), pick(ACOES_POOL)].filter((v, idx, a) => a.indexOf(v) === idx),
    historico,
    variacaoClientes3m: Math.round(mediaClientesUltimos3 - mediaClientesAnteriores3),
    variacaoPontos3m: Number((mediaPontosUltimos3 - mediaPontosAnteriores3).toFixed(1)),
  };
}).sort((a, b) => b.contribuicaoMaicpp - a.contribuicaoMaicpp);

export const rankingRevendas = revendas.map((r, i) => ({ ...r, posicao: i + 1 }));

/* ------------------------------------------------------------------ */
/* Clientes                                                            */
/* ------------------------------------------------------------------ */

export const PRODUTOS = [
  "Microsoft 365","Teams","SharePoint","Exchange","OneDrive","Copilot",
  "Defender","Entra ID","Azure","Power Platform","Dynamics","Fabric",
] as const;
export type Produto = (typeof PRODUTOS)[number];

export type Cliente = {
  id: string;
  revendaId: string;
  nome: string;
  tenant: string;
  segmento: string;
  usuarios: number;
  licenciamento: string;
  renovacao: string;
  status: "Ativo" | "Renovação próxima" | "Em risco";
  produtos: Produto[];
  adocao: number;
  gapsCriticos: string[];
  scoreOportunidade: number;
  pontosPotenciais: number;
  contribuindo: boolean;
  mesParouDePontuar?: string;
};

const MESES_PARADA = Array.from({ length: 3 }, (_, i) => mesLabelRevenda(9 + i, 12));

const NOMES_CLIENTE = [
  "Grupo Andrade","Farmácia Vitalis","Construtora Norte","Log Brasil","Cooperativa Agroval",
  "Instituto Saber","Clínica Vida","Metalúrgica Tupã","Rede Sabor","Banco Meridiano",
  "Transportes Ouro","Editora Horizonte","Hotel Aurora","Química Delta","Seguros Prisma",
  "Supermercados Bom Preço","TecnoPeças","Colégio Integrar","Hospital São Lucas","Varejo Mais",
  "Energia Solar Plus","Advocacia Ferreira","Frigorífico Serra","Indústria Vale","Telecom Ativa",
];

const LICENCAS = ["M365 Business Premium","M365 E3","M365 E5","M365 Business Standard","Office 365 E1"];

export const GAP_RULES: { produto: Produto; label: string; pontos: number }[] = [
  { produto: "Defender", label: "Sem Defender", pontos: 4 },
  { produto: "Copilot", label: "Sem Copilot", pontos: 6 },
  { produto: "Fabric", label: "Sem Fabric", pontos: 5 },
  { produto: "Azure", label: "Sem Azure", pontos: 7 },
  { produto: "Power Platform", label: "Sem Power BI / Power Platform", pontos: 4 },
];

export const clientes: Cliente[] = revendas.flatMap((rev, ri) =>
  Array.from({ length: rev.qtdClientes }, (_, ci) => {
    const produtos = PRODUTOS.filter((p) => {
      if (p === "Microsoft 365" || p === "Exchange" || p === "Teams") return true;
      return rnd() > 0.45;
    });
    const gaps = GAP_RULES.filter((g) => !produtos.includes(g.produto));
    const extras: string[] = [];
    if (!produtos.includes("Entra ID")) extras.push("Sem Entra ID P2");
    if (rnd() > 0.6) extras.push("Sem Backup / retenção");
    const pontosPotenciais = gaps.reduce((s, g) => s + g.pontos, 0) + extras.length * 3;
    const usuarios = int(12, 2400);
    const status = rnd() > 0.82 ? "Em risco" : rnd() > 0.7 ? "Renovação próxima" : "Ativo";
    const paradaRoll = rnd();
    const contribuindo = status === "Em risco" ? paradaRoll > 0.7 : paradaRoll > 0.94;
    return {
      id: `cli-${ri + 1}-${ci + 1}`,
      revendaId: rev.id,
      nome: `${NOMES_CLIENTE[(ri * 7 + ci) % NOMES_CLIENTE.length]} ${["S.A.","Ltda","ME","Holding"][(ri + ci) % 4]}`,
      tenant: `${nomeRevenda(ri).split(" ")[0]!.toLowerCase()}${ci + 1}.onmicrosoft.com`,
      segmento: rev.segmento,
      usuarios,
      licenciamento: pick(LICENCAS),
      renovacao: `2026-${String(int(9, 12)).padStart(2, "0")}-${String(int(1, 28)).padStart(2, "0")}`,
      status: status as Cliente["status"],
      produtos,
      adocao: Math.min(99, Math.round((produtos.length / PRODUTOS.length) * 100) + int(-8, 8)),
      gapsCriticos: [...gaps.map((g) => g.label), ...extras],
      scoreOportunidade: Math.min(100, pontosPotenciais * 3 + int(0, 15)),
      pontosPotenciais,
      contribuindo,
      ...(contribuindo ? {} : { mesParouDePontuar: pick(MESES_PARADA) }),
    };
  }),
);

export const clientesPorRevenda = (revendaId: string) =>
  clientes.filter((c) => c.revendaId === revendaId);

export const clientesQueParamDePontuar = () => clientes.filter((c) => !c.contribuindo);

/* ------------------------------------------------------------------ */
/* Certificações                                                       */
/* ------------------------------------------------------------------ */

export type Certificacao = {
  id: string;
  colaborador: string;
  cargo: string;
  area: AreaId;
  certificacao: string;
  nivel: "Fundamentals" | "Associate" | "Expert" | "Specialty";
  obtencao: string;
  validade: string;
  status: "Válida" | "Expirando" | "Expirada";
  impacto: number;
};

const COLABORADORES = [
  "Rafael Antunes","Bianca Cardoso","Thiago Nogueira","Larissa Duarte","Vinícius Rocha",
  "Camila Farias","Bruno Siqueira","Patrícia Lemos","André Vasconcelos","Mariana Pires",
  "Felipe Barros","Renata Coelho","Diego Fontes","Aline Peixoto","Rodrigo Amaral",
  "Tatiane Lopes","Márcio Guedes","Luana Bastos","Otávio Machado","Sabrina Neves",
];
const CARGOS = ["Consultor Cloud","Arquiteto de Soluções","Analista de Segurança","Engenheiro de Dados","Especialista M365","Pré-vendas"];
const CERTS: Record<AreaId, string[]> = {
  "modern-work": ["MS-102 Administrator Expert", "MS-700 Teams Administrator", "MS-900 Fundamentals"],
  security: ["SC-200 Security Operations", "SC-300 Identity & Access", "AZ-500 Azure Security"],
  infrastructure: ["AZ-104 Azure Administrator", "AZ-305 Solutions Architect", "AZ-800 Hybrid Infra"],
  "data-ai": ["DP-600 Fabric Analytics", "AI-102 AI Engineer", "DP-203 Data Engineer"],
  "digital-app": ["AZ-204 Developer", "AZ-400 DevOps Engineer", "GH-200 GitHub Actions"],
  "business-apps": ["PL-200 Power Platform", "PL-400 Developer", "MB-210 Dynamics Sales"],
};

export const certificacoes: Certificacao[] = Array.from({ length: 96 }, (_, i) => {
  const area = AREAS[i % AREAS.length]!.id;
  const diasValidade = int(-120, 420);
  const status = diasValidade < 0 ? "Expirada" : diasValidade <= 90 ? "Expirando" : "Válida";
  const validade = new Date(new Date("2026-08-06").getTime() + diasValidade * 86400000)
    .toISOString()
    .slice(0, 10);
  return {
    id: `cert-${i + 1}`,
    colaborador: COLABORADORES[i % COLABORADORES.length]!,
    cargo: pick(CARGOS),
    area,
    certificacao: pick(CERTS[area]),
    nivel: pick(["Fundamentals", "Associate", "Expert", "Specialty"] as const),
    obtencao: new Date(new Date(validade).getTime() - 365 * 86400000).toISOString().slice(0, 10),
    validade,
    status: status as Certificacao["status"],
    impacto: int(1, 6),
  };
});

/* ------------------------------------------------------------------ */
/* Especializações                                                     */
/* ------------------------------------------------------------------ */

export type Especializacao = {
  id: string;
  nome: string;
  area: AreaId;
  status: "Conquistada" | "Em andamento" | "Não iniciada";
  progresso: number;
  pontuacao: number;
  renovacao: string;
  requisitos: string[];
  pendencias: string[];
};

const ESPEC_BASE: { nome: string; area: AreaId }[] = [
  { nome: "Adoption and Change Management", area: "modern-work" },
  { nome: "Calling for Microsoft Teams", area: "modern-work" },
  { nome: "Meetings and Meeting Rooms", area: "modern-work" },
  { nome: "Threat Protection", area: "security" },
  { nome: "Identity and Access Management", area: "security" },
  { nome: "Information Protection and Governance", area: "security" },
  { nome: "Cloud Security", area: "security" },
  { nome: "Infra and Database Migration to Azure", area: "infrastructure" },
  { nome: "Windows Server and SQL Server to Azure", area: "infrastructure" },
  { nome: "Analytics on Microsoft Azure", area: "data-ai" },
  { nome: "Data Warehouse Migration", area: "data-ai" },
  { nome: "AI Platform on Microsoft Azure", area: "data-ai" },
  { nome: "DevOps with GitHub", area: "digital-app" },
  { nome: "Kubernetes on Microsoft Azure", area: "digital-app" },
  { nome: "Low Code Application Development", area: "business-apps" },
  { nome: "Small and Midsize Business Management", area: "business-apps" },
];

export const especializacoes: Especializacao[] = ESPEC_BASE.map((e, i) => {
  const progresso = int(0, 100);
  const status = progresso >= 100 ? "Conquistada" : progresso > 10 ? "Em andamento" : "Não iniciada";
  return {
    id: `esp-${i + 1}`,
    nome: e.nome,
    area: e.area,
    status: (i % 4 === 0 ? "Conquistada" : status) as Especializacao["status"],
    progresso: i % 4 === 0 ? 100 : progresso,
    pontuacao: int(10, 100),
    renovacao: `2026-${String(int(9, 12)).padStart(2, "0")}-${String(int(1, 28)).padStart(2, "0")}`,
    requisitos: ["Auditoria técnica", "Certificações de time", "Clientes com uso ativo", "Referências de projeto"].slice(0, int(2, 4)),
    pendencias: progresso >= 100 ? [] : ["Certificações pendentes", "Deployments insuficientes"].slice(0, int(1, 2)),
  };
});

/* ------------------------------------------------------------------ */
/* Benefícios e incentivos                                             */
/* ------------------------------------------------------------------ */

export type Beneficio = {
  id: string;
  nome: string;
  categoria: string;
  status: "Ativo" | "Expirando" | "Não utilizado";
  expiracao: string;
  utilizacao: number;
  saldo: string;
};

export const beneficios: Beneficio[] = [
  { nome: "ISV Success", categoria: "Programa", saldo: "US$ 12.000" },
  { nome: "Partner Benefits Core", categoria: "Licenciamento", saldo: "320 licenças" },
  { nome: "Marketplace Rewards", categoria: "Go-to-market", saldo: "US$ 25.000" },
  { nome: "Azure Credits", categoria: "Consumo", saldo: "US$ 8.400" },
  { nome: "Copilot Benefits", categoria: "Licenciamento", saldo: "150 licenças" },
  { nome: "Support Benefits", categoria: "Suporte", saldo: "40 incidentes" },
  { nome: "Consulting Benefits", categoria: "Serviços", saldo: "120 horas" },
  { nome: "Treinamentos (Skilling)", categoria: "Capacitação", saldo: "60 vouchers" },
].map((b, i) => {
  const utilizacao = int(5, 98);
  return {
    id: `ben-${i + 1}`,
    ...b,
    utilizacao,
    status: (utilizacao < 20 ? "Não utilizado" : i % 3 === 0 ? "Expirando" : "Ativo") as Beneficio["status"],
    expiracao: `2026-${String(int(9, 12)).padStart(2, "0")}-${String(int(1, 28)).padStart(2, "0")}`,
  };
});

/* ------------------------------------------------------------------ */
/* Histórico e metas                                                   */
/* ------------------------------------------------------------------ */

export type PontoHistorico = { mes: string } & Record<AreaId, number>;

export const historico: PontoHistorico[] = Array.from({ length: 24 }, (_, i) => {
  const d = new Date(2024, 8 + i, 1);
  const mes = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
  const fator = (i + 6) / 30;
  const row: Record<string, number | string> = { mes };
  for (const a of AREAS) {
    row[a.id] = Math.max(5, Math.round(a.pontuacao * (0.45 + fator) + int(-4, 4)));
  }
  return row as PontoHistorico;
});

/* ------------------------------------------------------------------ */
/* Plano de ação                                                       */
/* ------------------------------------------------------------------ */

export type Acao = {
  id: string;
  titulo: string;
  descricao: string;
  area: AreaId;
  esforco: "Baixo" | "Médio" | "Alto";
  impacto: number;
  urgente: boolean;
  prazo: string;
  responsavel: string;
};

export const planoAcao: Acao[] = AREAS.flatMap((a, ai) => {
  const gap = Math.max(0, a.meta - a.pontuacao);
  const base: Omit<Acao, "id" | "area">[] = [
    {
      titulo: `Faltam ${gap} pontos em ${a.nome}`,
      descricao: `Elevar pontuação de ${a.pontuacao} para a meta de ${a.meta} até ${new Date(a.renovacao).toLocaleDateString("pt-BR")}.`,
      esforco: gap > 20 ? "Alto" : gap > 10 ? "Médio" : "Baixo",
      impacto: Math.min(10, gap),
      urgente: diasRestantes(a.renovacao) < 120,
      prazo: a.renovacao,
      responsavel: pick(GERENTES),
    },
    {
      titulo: `Necessária mais 1 certificação intermediária em ${a.nome}`,
      descricao: `Skilling atual em ${a.skilling} pontos. Uma certificação Associate adiciona ~4 pontos.`,
      esforco: "Baixo",
      impacto: 4,
      urgente: false,
      prazo: a.renovacao,
      responsavel: pick(GERENTES),
    },
    {
      titulo: `Necessários mais 2 deployments em ${a.nome}`,
      descricao: "Performance depende de novos deployments registrados no Partner Center.",
      esforco: "Médio",
      impacto: 6,
      urgente: diasRestantes(a.renovacao) < 90,
      prazo: a.renovacao,
      responsavel: pick(GERENTES),
    },
    {
      titulo: `Crescimento de uso em 3 clientes — ${a.nome}`,
      descricao: "Customer Success exige crescimento mensal de usuários ativos.",
      esforco: "Médio",
      impacto: 5,
      urgente: false,
      prazo: a.renovacao,
      responsavel: pick(GERENTES),
    },
  ];
  return base.map((b, i) => ({ ...b, id: `act-${ai}-${i}`, area: a.id }));
});

/* ------------------------------------------------------------------ */
/* Agregados                                                           */
/* ------------------------------------------------------------------ */

export const totais = {
  revendas: revendas.length,
  clientes: clientes.length,
  certificacoes: certificacoes.length,
  certificacoesValidas: certificacoes.filter((c) => c.status === "Válida").length,
  certificacoesExpirando: certificacoes.filter((c) => c.status === "Expirando").length,
  certificacoesExpiradas: certificacoes.filter((c) => c.status === "Expirada").length,
  especializacoes: especializacoes.length,
  especializacoesConquistadas: especializacoes.filter((e) => e.status === "Conquistada").length,
  designacoes: AREAS.filter((a) => a.designacao).length,
  proximasRenovacoes: AREAS.filter((a) => diasRestantes(a.renovacao) < 180).length,
  maicppGlobal: Math.round(AREAS.reduce((s, a) => s + a.pontuacao, 0) / AREAS.length),
  usuariosGerenciados: clientes.reduce((s, c) => s + c.usuarios, 0),
  pontosPotenciais: clientes.reduce((s, c) => s + c.pontosPotenciais, 0),
};

export const areaById = (id: string) => AREAS.find((a) => a.id === id);
export const revendaById = (id: string) => revendas.find((r) => r.id === id);
export const clienteById = (id: string) => clientes.find((c) => c.id === id);
