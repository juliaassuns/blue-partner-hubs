// Cliente mínimo para a API v1 do Partner Center via autenticação delegada
// (App+User / "Secure Application Model").
//
// A tela "Gerenciamento de Aplicativos" do Partner Center não funciona para
// a conta da BluePartner (Indirect Reseller via Ingram/TD Synnex) — ela fica
// vazia/trava em qualquer fluxo (Web, Nativo, Painel de Elegibilidade), então
// client-credentials/app-only (que dependeria dela) não é viável hoje.
//
// Caminho que funcionou: adicionar a API pública "Microsoft Partner Center"
// (appId fa3d9a0c-3fb0-42cc-9193-47c7ecd2edbd, delegated scope
// user_impersonation) diretamente nas permissões de um app nativo no Entra
// ID — sem depender do Partner Center. Um login único via device code flow
// (com MFA) gera um refresh token de longa duração, guardado no Key Vault.
// Esse refresh token é trocado por um access token novo a cada chamada.
//
// Limitação aceita: não reescrevemos o refresh token rotacionado de volta no
// Key Vault (evita dar permissão de escrita à Managed Identity). Na prática
// o token deve continuar válido por bastante tempo; se um dia parar de
// funcionar, basta repetir o login de dispositivo e atualizar o secret
// `partnercenter-refresh-token` no Key Vault.
//
// Docs: https://learn.microsoft.com/partner-center/developer/partner-center-authentication

import { ErroSeguro } from "@/lib/http/safe-error";

const BASE_URL = "https://api.partnercenter.microsoft.com/v1";
const RESOURCE = "https://api.partnercenter.microsoft.com";

type TokenCache = { accessToken: string; expiresAt: number };
let cache: TokenCache | undefined;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new ErroSeguro(`Configuração do Partner Center ausente: ${name}`);
  return value;
}

async function getToken(): Promise<string> {
  const now = Date.now();
  if (cache && cache.expiresAt - 5 * 60_000 > now) return cache.accessToken;

  const tenantId = requireEnv("PARTNERCENTER_TENANT_ID");
  const clientId = requireEnv("PARTNERCENTER_NATIVE_CLIENT_ID");
  const refreshToken = requireEnv("PARTNERCENTER_REFRESH_TOKEN");

  const body = new URLSearchParams({
    resource: RESOURCE,
    client_id: clientId,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error(`Partner Center: falha ao renovar token (${response.status}):`, detail);
    throw new ErroSeguro(`Falha ao autenticar com o Partner Center (código ${response.status}).`);
  }

  const data = (await response.json()) as { access_token: string; expires_in: string };
  cache = { accessToken: data.access_token, expiresAt: now + Number(data.expires_in) * 1000 };
  return cache.accessToken;
}

export async function pcFetch<T>(path: string): Promise<T> {
  const token = await getToken();
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
  });

  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    throw new ErroSeguro(`Partner Center limitou as requisições (429). Tente novamente em ${retryAfter ?? "alguns"}s.`);
  }
  if (!response.ok) {
    const detail = await response.text();
    console.error(`Partner Center: erro (${response.status}) em ${path}:`, detail);
    throw new ErroSeguro(
      response.status === 401 || response.status === 403
        ? "Sem permissão delegada para acessar este recurso no Partner Center."
        : response.status === 404
          ? "Recurso não encontrado no Partner Center."
          : `Erro do Partner Center (código ${response.status}).`,
    );
  }
  return response.json() as Promise<T>;
}
