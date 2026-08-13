import { createFileRoute } from "@tanstack/react-router";

import { buscarDetalheCliente } from "@/lib/partnercenter/snapshot";

export const Route = createFileRoute("/api/partnercenter/customers/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const detalhe = await buscarDetalheCliente(params.id);
        return Response.json(detalhe);
      },
    },
  },
});
