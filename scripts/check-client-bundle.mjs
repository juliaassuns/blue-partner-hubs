// Falha o build se código server-only (driver do banco, credenciais Azure)
// vazar pro bundle do navegador. Foi exatamente isso que derrubou o app
// inteiro com "Uncaught ReferenceError: Buffer is not defined" em
// 2026-08-18: um loader de rota chamava uma função com mssql/@azure-identity
// direto, e como loaders também rodam client-side, o bundler levou o driver
// (que usa Buffer, só existe em Node) pro navegador.
// Uso: node scripts/check-client-bundle.mjs (roda depois de `bun run build`)
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const CLIENT_DIR = ".output/public/assets";

const FORBIDDEN = ["mssql", "tedious", "@azure/identity", "DefaultAzureCredential", "getPool"];

const arquivos = readdirSync(CLIENT_DIR).filter((f) => f.endsWith(".js"));
const achados = [];

for (const arquivo of arquivos) {
  const conteudo = readFileSync(join(CLIENT_DIR, arquivo), "utf8");
  for (const termo of FORBIDDEN) {
    if (conteudo.includes(termo)) {
      achados.push(`${arquivo}: contém "${termo}"`);
    }
  }
}

if (achados.length > 0) {
  console.error("Código server-only vazou pro bundle do navegador:\n");
  for (const a of achados) console.error(`  - ${a}`);
  console.error(
    "\nIsso derruba o app inteiro no navegador (ex: 'Buffer is not defined').\n" +
      "Verifique se alguma função que usa mssql/@azure-identity está sendo chamada\n" +
      "direto de um `loader` de rota em vez de passar por um createServerFn\n" +
      "(veja src/lib/revendas/data.ts ou src/lib/maicpp/scores.ts como exemplo).",
  );
  process.exit(1);
}

console.log(`Bundle do navegador limpo (${arquivos.length} arquivos verificados).`);
