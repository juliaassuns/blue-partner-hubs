import { readFileSync } from "node:fs";
import { DefaultAzureCredential } from "@azure/identity";
import sql from "mssql";

async function main() {
  const credential = new DefaultAzureCredential();
  const token = await credential.getToken("https://database.windows.net/.default");
  const pool = await sql.connect({
    server: "sql-bph-2026.database.windows.net",
    database: "bluepartner",
    authentication: { type: "azure-active-directory-access-token", options: { token: token.token } },
    options: { encrypt: true },
  });
  const r = await pool.request().query(`
    SELECT COUNT(*) AS total,
      SUM(CASE WHEN licencas_erro IS NULL THEN 1 ELSE 0 END) AS licencas_ok,
      SUM(CASE WHEN assinaturas_erro IS NULL THEN 1 ELSE 0 END) AS assinaturas_ok
    FROM snapshots
  `);
  console.log(r.recordset);
  await pool.close();
}
main().catch((e) => { console.error(e.message ?? e); process.exit(1); });
