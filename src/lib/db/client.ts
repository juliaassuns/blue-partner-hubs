// Conexão com o Azure SQL — autenticação só via Microsoft Entra ID (sem
// senha/connection string com segredo). `DefaultAzureCredential` resolve
// pra Managed Identity no App Service, e pro `az login` local em dev.
import { DefaultAzureCredential } from "@azure/identity";
import sql from "mssql";

import { ErroSeguro } from "@/lib/http/safe-error";

let pool: Promise<sql.ConnectionPool> | undefined;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new ErroSeguro(`Configuração do banco de dados ausente: ${name}`);
  return value;
}

async function connect(): Promise<sql.ConnectionPool> {
  const server = requireEnv("SQL_SERVER");
  const database = requireEnv("SQL_DATABASE");
  const credential = new DefaultAzureCredential();
  const token = await credential.getToken("https://database.windows.net/.default");

  return sql.connect({
    server,
    database,
    authentication: {
      type: "azure-active-directory-access-token",
      options: { token: token.token },
    },
    options: { encrypt: true },
  });
}

export async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool) pool = connect();
  try {
    return await pool;
  } catch (e) {
    pool = undefined;
    throw e;
  }
}

export { sql };
