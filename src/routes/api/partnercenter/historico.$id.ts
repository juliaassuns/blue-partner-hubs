import { createFileRoute } from "@tanstack/react-router";

import { getPool, sql } from "@/lib/db/client";

type LinhaHistorico = {
  data_snapshot: Date;
  produtos: string | null;
  pontos_potenciais: number | null;
};

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/api/partnercenter/historico/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        if (!GUID.test(params.id)) {
          return new Response("id de cliente inválido", { status: 400 });
        }
        try {
          const pool = await getPool();
          const resultado = await pool
            .request()
            .input("customerId", sql.UniqueIdentifier, params.id)
            .query<LinhaHistorico>(`
              SELECT data_snapshot, produtos, pontos_potenciais
              FROM snapshots
              WHERE customer_id = @customerId
              ORDER BY data_snapshot ASC
            `);

          const pontos = resultado.recordset.map((linha: LinhaHistorico) => ({
            data: linha.data_snapshot.toISOString().slice(0, 10),
            produtosAtivos: linha.produtos ? (JSON.parse(linha.produtos) as string[]).length : 0,
            pontosPotenciais: linha.pontos_potenciais ?? 0,
          }));

          return Response.json({ pontos });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Erro desconhecido";
          return new Response(msg, { status: 500 });
        }
      },
    },
  },
});
