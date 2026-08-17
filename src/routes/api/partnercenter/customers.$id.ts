import { createFileRoute } from "@tanstack/react-router";

import { buscarDetalheCliente } from "@/lib/partnercenter/snapshot";

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/api/partnercenter/customers/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        if (!GUID.test(params.id)) {
          return new Response("id de cliente inválido", { status: 400 });
        }
        const detalhe = await buscarDetalheCliente(params.id);
        return Response.json(detalhe);
      },
    },
  },
});
