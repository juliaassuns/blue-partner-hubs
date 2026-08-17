// Semeia as tabelas revendas/clientes com o snapshot atual do dataset mockado
// (src/lib/data/dataset.ts) — uso único pra dar carga inicial ao banco real;
// depois disso as páginas passam a ler daqui em vez de gerar o mock a cada load.
// Uso: bun run db/seed-revendas.ts
import { getPool, sql } from "@/lib/db/client";
import { revendas, clientes } from "@/lib/data/dataset";

async function main() {
  const pool = await getPool();

  for (const r of revendas) {
    await pool
      .request()
      .input("id", sql.NVarChar, r.id)
      .input("nome", sql.NVarChar, r.nome)
      .input("gerente", sql.NVarChar, r.gerente)
      .input("segmento", sql.NVarChar, r.segmento)
      .input("status", sql.NVarChar, r.status)
      .input("cidade", sql.NVarChar, r.cidade)
      .input("qtdClientes", sql.Int, r.qtdClientes)
      .input("contribuicaoMaicpp", sql.Decimal(8, 1), r.contribuicaoMaicpp)
      .input("contribuicoes", sql.NVarChar(sql.MAX), JSON.stringify(r.contribuicoes))
      .input("saude", sql.Int, r.saude)
      .input("potencial", sql.Int, r.potencial)
      .input("receitaMensal", sql.Int, r.receitaMensal)
      .input("proximasAcoes", sql.NVarChar(sql.MAX), JSON.stringify(r.proximasAcoes))
      .input("historico", sql.NVarChar(sql.MAX), JSON.stringify(r.historico))
      .input("variacaoClientes3m", sql.Int, r.variacaoClientes3m)
      .input("variacaoPontos3m", sql.Decimal(8, 1), r.variacaoPontos3m)
      .input("areas", sql.NVarChar(sql.MAX), JSON.stringify(r.areas)).query(`
        MERGE revendas AS target
        USING (SELECT @id AS id) AS src ON target.id = src.id
        WHEN MATCHED THEN UPDATE SET
          nome = @nome, gerente = @gerente, segmento = @segmento, status = @status,
          cidade = @cidade, qtd_clientes = @qtdClientes, contribuicao_maicpp = @contribuicaoMaicpp,
          contribuicoes = @contribuicoes, saude = @saude, potencial = @potencial,
          receita_mensal = @receitaMensal, proximas_acoes = @proximasAcoes, historico = @historico,
          variacao_clientes_3m = @variacaoClientes3m, variacao_pontos_3m = @variacaoPontos3m,
          areas = @areas, atualizado_em = SYSUTCDATETIME()
        WHEN NOT MATCHED THEN INSERT
          (id, nome, gerente, segmento, status, cidade, qtd_clientes, contribuicao_maicpp,
           contribuicoes, saude, potencial, receita_mensal, proximas_acoes, historico,
           variacao_clientes_3m, variacao_pontos_3m, areas)
          VALUES
          (@id, @nome, @gerente, @segmento, @status, @cidade, @qtdClientes, @contribuicaoMaicpp,
           @contribuicoes, @saude, @potencial, @receitaMensal, @proximasAcoes, @historico,
           @variacaoClientes3m, @variacaoPontos3m, @areas);
      `);
  }
  console.log(`${revendas.length} parceiros MAICPP gravados.`);

  for (const c of clientes) {
    await pool
      .request()
      .input("id", sql.NVarChar, c.id)
      .input("revendaId", sql.NVarChar, c.revendaId)
      .input("nome", sql.NVarChar, c.nome)
      .input("tenant", sql.NVarChar, c.tenant)
      .input("segmento", sql.NVarChar, c.segmento)
      .input("usuarios", sql.Int, c.usuarios)
      .input("licenciamento", sql.NVarChar, c.licenciamento)
      .input("renovacao", sql.NVarChar, c.renovacao)
      .input("status", sql.NVarChar, c.status)
      .input("produtos", sql.NVarChar(sql.MAX), JSON.stringify(c.produtos))
      .input("adocao", sql.Int, c.adocao)
      .input("gapsCriticos", sql.NVarChar(sql.MAX), JSON.stringify(c.gapsCriticos))
      .input("scoreOportunidade", sql.Int, c.scoreOportunidade)
      .input("pontosPotenciais", sql.Int, c.pontosPotenciais)
      .input("contribuindo", sql.Bit, c.contribuindo)
      .input("mesParouDePontuar", sql.NVarChar, c.mesParouDePontuar ?? null).query(`
        MERGE clientes AS target
        USING (SELECT @id AS id) AS src ON target.id = src.id
        WHEN MATCHED THEN UPDATE SET
          revenda_id = @revendaId, nome = @nome, tenant = @tenant, segmento = @segmento,
          usuarios = @usuarios, licenciamento = @licenciamento, renovacao = @renovacao,
          status = @status, produtos = @produtos, adocao = @adocao, gaps_criticos = @gapsCriticos,
          score_oportunidade = @scoreOportunidade, pontos_potenciais = @pontosPotenciais,
          contribuindo = @contribuindo, mes_parou_de_pontuar = @mesParouDePontuar,
          atualizado_em = SYSUTCDATETIME()
        WHEN NOT MATCHED THEN INSERT
          (id, revenda_id, nome, tenant, segmento, usuarios, licenciamento, renovacao, status,
           produtos, adocao, gaps_criticos, score_oportunidade, pontos_potenciais, contribuindo,
           mes_parou_de_pontuar)
          VALUES
          (@id, @revendaId, @nome, @tenant, @segmento, @usuarios, @licenciamento, @renovacao, @status,
           @produtos, @adocao, @gapsCriticos, @scoreOportunidade, @pontosPotenciais, @contribuindo,
           @mesParouDePontuar);
      `);
  }
  console.log(`${clientes.length} clientes gravados.`);

  await pool.close();
}

main().catch((err) => {
  console.error("Falha ao semear dados:", err instanceof Error ? err.message : err);
  process.exit(1);
});
