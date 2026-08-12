import { createFileRoute } from "@tanstack/react-router";

import { pcFetch } from "@/lib/partnercenter/client";
import { GAP_RULES, PRODUTOS, type Produto } from "@/lib/data/dataset";

type PCSubscribedSku = {
  productSku?: { id?: string; name?: string };
  servicePlans?: { servicePlanName?: string }[];
};
type PCSubscribedSkuList = { items?: PCSubscribedSku[] };

// Mapeamento best-effort entre nomes/SKUs do Partner Center e o enum PRODUTOS
// do dataset. Nomes de SKU da Microsoft variam bastante (ex: "SPE_E3",
// "Microsoft_365_Copilot") — ajustar essas palavras-chave depois de testar
// contra respostas reais de clientes da BluePartner.
const PRODUTO_KEYWORDS: Record<Produto, string[]> = {
  "Microsoft 365": ["MICROSOFT 365", "OFFICE 365", "M365"],
  Teams: ["TEAMS"],
  SharePoint: ["SHAREPOINT"],
  Exchange: ["EXCHANGE"],
  OneDrive: ["ONEDRIVE"],
  Copilot: ["COPILOT"],
  Defender: ["DEFENDER"],
  "Entra ID": ["AAD_PREMIUM", "ENTRA", "AZURE AD PREMIUM"],
  Azure: ["AZURE"],
  "Power Platform": ["POWER BI", "POWERAPPS", "POWER APPS", "POWER AUTOMATE", "POWER PLATFORM"],
  Dynamics: ["DYNAMICS"],
  Fabric: ["FABRIC"],
};

export const Route = createFileRoute("/api/partnercenter/customers/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const dados = await pcFetch<PCSubscribedSkuList>(`/customers/${params.id}/subscribedskus`);
          const textos = (dados.items ?? [])
            .flatMap((item) => [item.productSku?.name, ...(item.servicePlans ?? []).map((sp) => sp.servicePlanName)])
            .filter((t): t is string => Boolean(t))
            .map((t) => t.toUpperCase());

          const produtosAtivos = PRODUTOS.filter((produto) =>
            PRODUTO_KEYWORDS[produto].some((palavra) => textos.some((t) => t.includes(palavra))),
          );
          const gaps = GAP_RULES.filter((g) => !produtosAtivos.includes(g.produto));
          const pontosPotenciais = gaps.reduce((s, g) => s + g.pontos, 0);

          return Response.json({
            produtos: produtosAtivos,
            gapsCriticos: gaps.map((g) => g.label),
            pontosPotenciais,
          });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Erro desconhecido";
          return new Response(msg, { status: 500 });
        }
      },
    },
  },
});
