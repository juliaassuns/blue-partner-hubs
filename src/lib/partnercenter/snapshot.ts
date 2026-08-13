// Lógica de busca de licenças/assinaturas de um cliente do Partner Center —
// reaproveitada pela rota de API (src/routes/api/partnercenter/customers.$id.ts)
// e pelo WebJob de snapshot diário (webjob/pc-snapshot/run.mjs).
import { pcFetch } from "./client";
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
export type Resultado<T> = { ok: true; dados: T } | { ok: false; erro: string };

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

export type LicencasResultado =
  | { ok: true; produtos: Produto[]; gapsCriticos: string[]; pontosPotenciais: number }
  | { ok: false; erro: string };

export type Assinatura = {
  nome: string;
  quantidade: number;
  status: string;
  renovacao: string | null;
  autoRenova: boolean | null;
};
export type AssinaturasResultado = { ok: true; itens: Assinatura[] } | { ok: false; erro: string };

export async function buscarDetalheCliente(
  clienteId: string,
): Promise<{ licencas: LicencasResultado; assinaturas: AssinaturasResultado }> {
  const [skus, subs] = await Promise.all([
    tentar(pcFetch<PCSubscribedSkuList>(`/customers/${clienteId}/subscribedskus`)),
    tentar(pcFetch<PCSubscriptionList>(`/customers/${clienteId}/subscriptions`)),
  ]);

  const licencas: LicencasResultado = skus.ok
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
          ok: true,
          produtos: produtosAtivos,
          gapsCriticos: gaps.map((g) => g.label),
          pontosPotenciais: gaps.reduce((s, g) => s + g.pontos, 0),
        };
      })()
    : { ok: false, erro: skus.erro };

  const assinaturas: AssinaturasResultado = subs.ok
    ? {
        ok: true,
        itens: (subs.dados.items ?? []).map((s) => ({
          nome: s.friendlyName ?? s.offerName ?? "Assinatura",
          quantidade: s.quantity ?? 0,
          status: s.status ?? "unknown",
          renovacao: s.commitmentEndDate ?? null,
          autoRenova: s.autoRenewEnabled ?? null,
        })),
      }
    : { ok: false, erro: subs.erro };

  return { licencas, assinaturas };
}

type PCCustomer = { id: string; companyProfile?: { companyName?: string; domain?: string } };
type PCCustomerList = { items?: PCCustomer[] };

export async function listarClientes(): Promise<{ id: string; nome: string; tenant: string }[]> {
  const clientes: { id: string; nome: string; tenant: string }[] = [];
  const size = 200;
  let offset = 0;
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
  return clientes;
}
