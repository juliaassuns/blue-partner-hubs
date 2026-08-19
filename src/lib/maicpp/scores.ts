// Pontuação MAICPP real (Azure SQL), com fallback pros valores mockados de
// AREAS quando uma área ainda não foi salva ou o banco está indisponível —
// páginas nunca quebram por causa disso, só mostram o valor de referência.
import { createServerFn } from "@tanstack/react-start";

import { getPool } from "@/lib/db/client";
import { AREAS, type Area } from "@/lib/data/dataset";

export type AreaReal = Area & {
  atualizadoEm: string | null;
  atualizadoPor: string | null;
  fonte: "real" | "mock";
};

type LinhaScore = {
  area_id: string;
  pontuacao: number;
  meta: number;
  performance: number;
  skilling: number;
  customer_success: number;
  designacao: boolean;
  atualizado_em: Date;
  atualizado_por: string | null;
};

export async function buscarAreasReais(): Promise<AreaReal[]> {
  try {
    const pool = await getPool();
    const resultado = await pool.request().query(`SELECT * FROM maicpp_scores`);
    const salvos = new Map((resultado.recordset as LinhaScore[]).map((l) => [l.area_id, l]));

    return AREAS.map((a): AreaReal => {
      const salvo = salvos.get(a.id);
      if (!salvo) return { ...a, atualizadoEm: null, atualizadoPor: null, fonte: "mock" };
      return {
        ...a,
        pontuacao: salvo.pontuacao,
        meta: salvo.meta,
        performance: salvo.performance,
        skilling: salvo.skilling,
        customerSuccess: salvo.customer_success,
        designacao: salvo.designacao,
        atualizadoEm: salvo.atualizado_em.toISOString(),
        atualizadoPor: salvo.atualizado_por,
        fonte: "real",
      };
    });
  } catch (e) {
    // Banco indisponível — segue com os valores mockados sem quebrar a página.
    console.error("buscarAreasReais: banco indisponível, usando fallback mock:", e);
    return AREAS.map((a) => ({ ...a, atualizadoEm: null, atualizadoPor: null, fonte: "mock" as const }));
  }
}

// Wrapper server-only: chamado a partir de `loader`s de rota, que também
// rodam durante navegação client-side. Sem isso, o driver do SQL (que usa
// APIs só de Node, ex. Buffer) vaza pro bundle do navegador e quebra o app
// inteiro com "Buffer is not defined".
export const buscarAreasReaisServerFn = createServerFn({ method: "GET" }).handler(async () => {
  return buscarAreasReais();
});
