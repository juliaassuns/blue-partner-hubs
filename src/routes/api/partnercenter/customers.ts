import { createFileRoute } from "@tanstack/react-router";

import { listarClientes } from "@/lib/partnercenter/snapshot";

export const Route = createFileRoute("/api/partnercenter/customers")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const clientes = await listarClientes();
          return Response.json({ clientes, total: clientes.length });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Erro desconhecido";
          return new Response(msg, { status: 500 });
        }
      },
    },
  },
});
