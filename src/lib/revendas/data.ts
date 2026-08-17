// Parceiros MAICPP (revendas) e clientes reais (Azure SQL), com fallback pro
// dataset mockado quando o banco ainda não foi semeado ou está indisponível —
// mesmo princípio de src/lib/maicpp/scores.ts, páginas nunca quebram por isso.
import { getPool } from "@/lib/db/client";
import {
  revendas as revendasMock,
  clientes as clientesMock,
  type Revenda,
  type Cliente,
  type AreaId,
  type Area,
  type Produto,
  type PontoHistoricoRevenda,
} from "@/lib/data/dataset";

type LinhaRevenda = {
  id: string;
  nome: string;
  gerente: string;
  segmento: string;
  status: string;
  cidade: string;
  qtd_clientes: number;
  contribuicao_maicpp: number;
  contribuicoes: string;
  saude: number;
  potencial: number;
  receita_mensal: number;
  proximas_acoes: string;
  historico: string;
  variacao_clientes_3m: number;
  variacao_pontos_3m: number;
  areas: string;
};

type LinhaCliente = {
  id: string;
  revenda_id: string;
  nome: string;
  tenant: string;
  segmento: string;
  usuarios: number;
  licenciamento: string;
  renovacao: string;
  status: string;
  produtos: string;
  adocao: number;
  gaps_criticos: string;
  score_oportunidade: number;
  pontos_potenciais: number;
  contribuindo: boolean;
  mes_parou_de_pontuar: string | null;
};

function mapRevenda(l: LinhaRevenda): Revenda {
  return {
    id: l.id,
    nome: l.nome,
    gerente: l.gerente,
    segmento: l.segmento as Revenda["segmento"],
    status: l.status as Revenda["status"],
    cidade: l.cidade,
    qtdClientes: l.qtd_clientes,
    contribuicaoMaicpp: l.contribuicao_maicpp,
    contribuicoes: JSON.parse(l.contribuicoes) as Record<AreaId, number>,
    saude: l.saude,
    potencial: l.potencial,
    receitaMensal: l.receita_mensal,
    proximasAcoes: JSON.parse(l.proximas_acoes) as string[],
    historico: JSON.parse(l.historico) as PontoHistoricoRevenda[],
    variacaoClientes3m: l.variacao_clientes_3m,
    variacaoPontos3m: l.variacao_pontos_3m,
    areas: JSON.parse(l.areas) as Record<AreaId, Area>,
  };
}

function mapCliente(l: LinhaCliente): Cliente {
  return {
    id: l.id,
    revendaId: l.revenda_id,
    nome: l.nome,
    tenant: l.tenant,
    segmento: l.segmento,
    usuarios: l.usuarios,
    licenciamento: l.licenciamento,
    renovacao: l.renovacao,
    status: l.status as Cliente["status"],
    produtos: JSON.parse(l.produtos) as Produto[],
    adocao: l.adocao,
    gapsCriticos: JSON.parse(l.gaps_criticos) as string[],
    scoreOportunidade: l.score_oportunidade,
    pontosPotenciais: l.pontos_potenciais,
    contribuindo: l.contribuindo,
    ...(l.mes_parou_de_pontuar ? { mesParouDePontuar: l.mes_parou_de_pontuar } : {}),
  };
}

export type Fonte = "real" | "mock";

export async function buscarRevendasReais(): Promise<{ dados: Revenda[]; fonte: Fonte }> {
  try {
    const pool = await getPool();
    const resultado = await pool.request().query<LinhaRevenda>(`SELECT * FROM revendas`);
    if (resultado.recordset.length === 0) return { dados: revendasMock, fonte: "mock" };
    const dados = resultado.recordset
      .map(mapRevenda)
      .sort((a, b) => b.contribuicaoMaicpp - a.contribuicaoMaicpp);
    return { dados, fonte: "real" };
  } catch {
    return { dados: revendasMock, fonte: "mock" };
  }
}

export async function buscarClientesReais(): Promise<{ dados: Cliente[]; fonte: Fonte }> {
  try {
    const pool = await getPool();
    const resultado = await pool.request().query<LinhaCliente>(`SELECT * FROM clientes`);
    if (resultado.recordset.length === 0) return { dados: clientesMock, fonte: "mock" };
    return { dados: resultado.recordset.map(mapCliente), fonte: "real" };
  } catch {
    return { dados: clientesMock, fonte: "mock" };
  }
}

export type RevendaRankeada = Revenda & { posicao: number };

export function ranquear(revendas: Revenda[]): RevendaRankeada[] {
  return revendas.map((r, i) => ({ ...r, posicao: i + 1 }));
}
