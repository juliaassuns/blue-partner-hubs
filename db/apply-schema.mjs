// Aplica db/schema.sql contra o Azure SQL. Usa a credencial do ambiente
// (Managed Identity no Azure, `az login` localmente via DefaultAzureCredential).
// Uso: node db/apply-schema.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { DefaultAzureCredential } from "@azure/identity";
import sql from "mssql";

const __dirname = dirname(fileURLToPath(import.meta.url));

const server = process.env.SQL_SERVER ?? "sql-bph-2026.database.windows.net";
const database = process.env.SQL_DATABASE ?? "bluepartner";

async function main() {
  const credential = new DefaultAzureCredential();
  const token = await credential.getToken("https://database.windows.net/.default");

  const pool = await sql.connect({
    server,
    database,
    authentication: {
      type: "azure-active-directory-access-token",
      options: { token: token.token },
    },
    options: { encrypt: true },
  });

  const script = readFileSync(join(__dirname, "schema.sql"), "utf8");
  const batches = script.split(/^\s*GO\s*$/im).filter((b) => b.trim());
  for (const batch of batches) {
    await pool.request().query(batch);
  }

  console.log("Schema aplicado com sucesso.");
  await pool.close();
}

main().catch((err) => {
  console.error("Falha ao aplicar schema:", err.message ?? err);
  process.exit(1);
});
