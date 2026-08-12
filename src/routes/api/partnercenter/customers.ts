import { createFileRoute } from "@tanstack/react-router";

import { pcFetch } from "@/lib/partnercenter/client";

type PCCustomer = {
  id: string;
  companyProfile?: { companyName?: string; domain?: string; tenantId?: string };
  relationshipToPartner?: string;
};

type PCCustomerList = { totalCount: number; items?: PCCustomer[] };

export const Route = createFileRoute("/api/partnercenter/customers")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const clientes: { id: string; nome: string; tenant: string }[] = [];
          const size = 200;
          let offset = 0;
          // Paginação simples por size/offset (docs do Partner Center); limite de
          // segurança em 2000 registros — mais que suficiente para a base atual.
          for (let pagina = 0; pagina < 10; pagina++) {
            const resultado = await pcFetch<PCCustomerList>(`/customers?size=${size}&offset=${offset}`);
            const items = resultado.items ?? [];
            for (const c of items) {
              clientes.push({
                id: c.id,
                nome: c.companyProfile?.companyName ?? "(sem nome)",
                tenant: c.companyProfile?.domain ?? "",
              });
            }
            if (items.length < size) break;
            offset += size;
          }
          return Response.json({ clientes, total: clientes.length });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Erro desconhecido";
          return new Response(msg, { status: 500 });
        }
      },
    },
  },
});
