import { createFileRoute } from "@tanstack/react-router";

import { getPool, sql } from "@/lib/db/client";
import { AREAS, type AreaId } from "@/lib/data/dataset";

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

export const Route = createFileRoute("/api/maicpp/scores")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const pool = await getPool();
          const resultado = await pool.request().query(`SELECT * FROM maicpp_scores`);
          const salvos = new Map((resultado.recordset as LinhaScore[]).map((l) => [l.area_id, l]));

          const areas = AREAS.map((a) => {
            const salvo = salvos.get(a.id);
            return salvo
              ? {
                  id: a.id,
                  nome: a.nome,
                  pontuacao: salvo.pontuacao,
                  meta: salvo.meta,
                  performance: salvo.performance,
                  skilling: salvo.skilling,
                  customerSuccess: salvo.customer_success,
                  designacao: salvo.designacao,
                  atualizadoEm: salvo.atualizado_em.toISOString(),
                  atualizadoPor: salvo.atualizado_por,
                  fonte: "real" as const,
                }
              : {
                  id: a.id,
                  nome: a.nome,
                  pontuacao: a.pontuacao,
                  meta: a.meta,
                  performance: a.performance,
                  skilling: a.skilling,
                  customerSuccess: a.customerSuccess,
                  designacao: a.designacao,
                  atualizadoEm: null,
                  atualizadoPor: null,
                  fonte: "mock" as const,
                };
          });

          return Response.json({ areas });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Erro desconhecido";
          return new Response(msg, { status: 500 });
        }
      },
      PUT: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            areaId: AreaId;
            pontuacao: number;
            meta: number;
            performance: number;
            skilling: number;
            customerSuccess: number;
            designacao: boolean;
          };
          if (!AREAS.some((a) => a.id === body.areaId)) {
            return new Response("areaId inválido", { status: 400 });
          }

          const autor = request.headers.get("x-ms-client-principal-name") ?? "desconhecido";
          const pool = await getPool();
          await pool
            .request()
            .input("areaId", sql.NVarChar, body.areaId)
            .input("pontuacao", sql.Int, body.pontuacao)
            .input("meta", sql.Int, body.meta)
            .input("performance", sql.Int, body.performance)
            .input("skilling", sql.Int, body.skilling)
            .input("customerSuccess", sql.Int, body.customerSuccess)
            .input("designacao", sql.Bit, body.designacao)
            .input("autor", sql.NVarChar, autor).query(`
              MERGE maicpp_scores AS target
              USING (SELECT @areaId AS area_id) AS src ON target.area_id = src.area_id
              WHEN MATCHED THEN UPDATE SET
                pontuacao = @pontuacao, meta = @meta, performance = @performance,
                skilling = @skilling, customer_success = @customerSuccess,
                designacao = @designacao, atualizado_em = SYSUTCDATETIME(), atualizado_por = @autor
              WHEN NOT MATCHED THEN INSERT (area_id, pontuacao, meta, performance, skilling, customer_success, designacao, atualizado_por)
                VALUES (@areaId, @pontuacao, @meta, @performance, @skilling, @customerSuccess, @designacao, @autor);
            `);

          return Response.json({ ok: true });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Erro desconhecido";
          return new Response(msg, { status: 500 });
        }
      },
    },
  },
});
