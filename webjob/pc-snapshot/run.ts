// WebJob "triggered" (agendado via settings.job) que roda dentro do mesmo
// App Service, 1x por dia: lista os clientes reais do Partner Center, busca
// licenças/assinaturas de cada um, e grava um snapshot no Azure SQL.
//
// Roda como processo Node separado (não pelo Nitro/servidor HTTP) — por isso
// é buildado à parte (ver package.json script "build:webjob") com todas as
// dependências (mssql, @azure/identity, o cliente do Partner Center) já
// embutidas no arquivo final, sem depender de node_modules no deploy.
import { listarClientes, buscarDetalheCliente } from "@/lib/partnercenter/snapshot";
import { getPool, sql } from "@/lib/db/client";

async function main() {
  const hoje = new Date().toISOString().slice(0, 10);
  const clientes = await listarClientes();
  console.log(`[pc-snapshot] ${clientes.length} clientes encontrados, iniciando snapshot de ${hoje}`);

  const pool = await getPool();
  let ok = 0;
  let falhas = 0;

  for (const cliente of clientes) {
    try {
      await pool
        .request()
        .input("id", sql.UniqueIdentifier, cliente.id)
        .input("nome", sql.NVarChar, cliente.nome)
        .input("tenant", sql.NVarChar, cliente.tenant).query(`
          MERGE customers AS target
          USING (SELECT @id AS id) AS src ON target.id = src.id
          WHEN MATCHED THEN UPDATE SET nome = @nome, tenant = @tenant, ultimo_visto = SYSUTCDATETIME()
          WHEN NOT MATCHED THEN INSERT (id, nome, tenant) VALUES (@id, @nome, @tenant);
        `);

      const detalhe = await buscarDetalheCliente(cliente.id);

      await pool
        .request()
        .input("customerId", sql.UniqueIdentifier, cliente.id)
        .input("data", sql.Date, hoje)
        .input("produtos", sql.NVarChar, detalhe.licencas.ok ? JSON.stringify(detalhe.licencas.produtos) : null)
        .input("gaps", sql.NVarChar, detalhe.licencas.ok ? JSON.stringify(detalhe.licencas.gapsCriticos) : null)
        .input("pontos", sql.Int, detalhe.licencas.ok ? detalhe.licencas.pontosPotenciais : null)
        .input("licencasErro", sql.NVarChar, detalhe.licencas.ok ? null : detalhe.licencas.erro.slice(0, 500))
        .input("assinaturas", sql.NVarChar, detalhe.assinaturas.ok ? JSON.stringify(detalhe.assinaturas.itens) : null)
        .input("assinaturasErro", sql.NVarChar, detalhe.assinaturas.ok ? null : detalhe.assinaturas.erro.slice(0, 500))
        .query(`
          IF NOT EXISTS (SELECT 1 FROM snapshots WHERE customer_id = @customerId AND data_snapshot = @data)
          INSERT INTO snapshots (customer_id, data_snapshot, produtos, gaps_criticos, pontos_potenciais, licencas_erro, assinaturas, assinaturas_erro)
          VALUES (@customerId, @data, @produtos, @gaps, @pontos, @licencasErro, @assinaturas, @assinaturasErro);
        `);

      ok++;
    } catch (e) {
      falhas++;
      console.error(`[pc-snapshot] falhou pra cliente ${cliente.id} (${cliente.nome}):`, e instanceof Error ? e.message : e);
    }
  }

  console.log(`[pc-snapshot] concluído: ${ok} ok, ${falhas} falhas`);
  await pool.close();
}

main().catch((e) => {
  console.error("[pc-snapshot] erro fatal:", e instanceof Error ? e.message : e);
  process.exit(1);
});
