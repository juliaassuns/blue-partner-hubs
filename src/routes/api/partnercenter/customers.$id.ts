import { createFileRoute } from "@tanstack/react-router";

import { pcFetch } from "@/lib/partnercenter/client";
import { GAP_RULES, PRODUTOS, type Produto } from "@/lib/data/dataset";

type PCSubscribedSku = {
  productSku?: { id?: string; name?: string };
  servicePlans?: { servicePlanName?: string }[];
};
type PCSubscribedSkuList = { items?: PCSubscribedSku[] };

type PCSubscription = {
  id?: string;
  friendlyName?: string;
  offerName?: string;
  quantity?: number;
  status?: string;
  commitmentEndDate?: string;
  autoRenewEnabled?: boolean;
};
type PCSubscriptionList = { items?: PCSubscription[] };

// Licenças e assinaturas podem exigir papéis Entra diferentes — uma falhar
// (ex: falta de permissão) não deve derrubar a outra.
type Resultado<T> = { ok: true; dados: T } | { ok: false; erro: string };

async function tentar<T>(promise: Promise<T>): Promise<Resultado<T>> {
  try {
    return { ok: true, dados: await promise };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro desconhecido" };
  }
}

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
        const [skus, subs] = await Promise.all([
          tentar(pcFetch<PCSubscribedSkuList>(`/customers/${params.id}/subscribedskus`)),
          tentar(pcFetch<PCSubscriptionList>(`/customers/${params.id}/subscriptions`)),
        ]);

        const licencas = skus.ok
          ? (() => {
              const textos = (skus.dados.items ?? [])
                .flatMap((item) => [item.productSku?.name, ...(item.servicePlans ?? []).map((sp) => sp.servicePlanName)])
                .filter((t): t is string => Boolean(t))
                .map((t) => t.toUpperCase());
              const produtosAtivos = PRODUTOS.filter((produto) =>
                PRODUTO_KEYWORDS[produto].some((palavra) => textos.some((t) => t.includes(palavra))),
              );
              const gaps = GAP_RULES.filter((g) => !produtosAtivos.includes(g.produto));
              return {
                ok: true as const,
                produtos: produtosAtivos,
                gapsCriticos: gaps.map((g) => g.label),
                pontosPotenciais: gaps.reduce((s, g) => s + g.pontos, 0),
              };
            })()
          : { ok: false as const, erro: skus.erro };

        const assinaturas = subs.ok
          ? {
              ok: true as const,
              itens: (subs.dados.items ?? []).map((s) => ({
                nome: s.friendlyName ?? s.offerName ?? "Assinatura",
                quantidade: s.quantity ?? 0,
                status: s.status ?? "unknown",
                renovacao: s.commitmentEndDate ?? null,
                autoRenova: s.autoRenewEnabled ?? null,
              })),
            }
          : { ok: false as const, erro: subs.erro };

        return Response.json({ licencas, assinaturas });
      },
    },
  },
});
