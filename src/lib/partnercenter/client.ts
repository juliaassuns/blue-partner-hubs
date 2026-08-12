// Cliente mínimo para a API v1 do Partner Center (app-only / client-credentials).
// Docs: https://learn.microsoft.com/partner-center/developer/partner-center-authentication
// Usa o endpoint de token v1 legado (resource=...) — é o vigente para app-only,
// não o v2 (`/.default`).

const BASE_URL = "https://api.partnercenter.microsoft.com/v1";
const RESOURCE = "https://api.partnercenter.microsoft.com";

type TokenCache = { accessToken: string; expiresAt: number };
let cache: TokenCache | undefined;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Configuração do Partner Center ausente: ${name}`);
  return value;
}

async function getToken(): Promise<string> {
  const now = Date.now();
  if (cache && cache.expiresAt - 5 * 60_000 > now) return cache.accessToken;

  const tenantId = requireEnv("PARTNERCENTER_TENANT_ID");
  const clientId = requireEnv("PARTNERCENTER_CLIENT_ID");
  const clientSecret = requireEnv("PARTNERCENTER_CLIENT_SECRET");

  const body = new URLSearchParams({
    resource: RESOURCE,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });

  const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Falha ao autenticar no Partner Center (${response.status}): ${detail}`);
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
    throw new Error(`Partner Center limitou as requisições (429). Tente novamente em ${retryAfter ?? "alguns"}s.`);
  }
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Erro do Partner Center (${response.status}) em ${path}: ${detail}`);
  }
  return response.json() as Promise<T>;
}
