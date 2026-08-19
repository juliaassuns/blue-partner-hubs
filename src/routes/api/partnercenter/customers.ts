import { createFileRoute } from "@tanstack/react-router";

import { listarClientes } from "@/lib/partnercenter/snapshot";
import { mensagemSegura } from "@/lib/http/safe-error";

export const Route = createFileRoute("/api/partnercenter/customers")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const clientes = await listarClientes();
          return Response.json({ clientes, total: clientes.length });
        } catch (e) {
          return new Response(mensagemSegura(e, "GET /api/partnercenter/customers"), { status: 500 });
        }
      },
    },
  },
});
