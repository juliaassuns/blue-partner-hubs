# Banco de dados (Azure SQL)

Guarda snapshots diários dos clientes/licenças reais do Partner Center.
Autenticação só via Microsoft Entra ID (sem senha SQL) — veja
`src/lib/db/client.ts`.

## Aplicar o schema (uma vez, ou depois de mudanças em `schema.sql`)

Precisa estar logada via `az login` com uma conta que seja AAD admin do
servidor SQL (`sql-bph-2026`), e liberar seu IP no firewall antes:

```sh
az sql server firewall-rule create --server sql-bph-2026 --resource-group rg-bluepartner-hub \
  --name AllowLocalSetup --start-ip-address <seu-ip> --end-ip-address <seu-ip>

node db/apply-schema.mjs

az sql server firewall-rule delete --server sql-bph-2026 --resource-group rg-bluepartner-hub --name AllowLocalSetup
```

## Testar o WebJob de snapshot localmente

```sh
bun run build:webjob
PARTNERCENTER_TENANT_ID=... PARTNERCENTER_NATIVE_CLIENT_ID=... PARTNERCENTER_REFRESH_TOKEN=... \
SQL_SERVER=sql-bph-2026.database.windows.net SQL_DATABASE=bluepartner \
  node webjob-dist/pc-snapshot/run.js
```
(libere seu IP no firewall antes, como acima).
