import { createFileRoute } from "@tanstack/react-router";
import { createAzure } from "@ai-sdk/azure";
import { streamText } from "ai";

import {
  AREAS,
  beneficios,
  certificacoes,
  clientes,
  especializacoes,
  planoAcao,
  rankingRevendas,
  totais,
  diasRestantes,
} from "@/lib/data/dataset";

function contexto() {
  const areas = AREAS.map(
    (a) =>
      `- ${a.nome}: ${a.pontuacao}/${a.meta} pts (Performance ${a.performance}, Skilling ${a.skilling}, Customer Success ${a.customerSuccess}), designação ${a.designacao ? "ativa" : "pendente"}, renova em ${diasRestantes(a.renovacao)} dias.`,
  ).join("\n");

  const top = rankingRevendas
    .slice(0, 20)
    .map(
      (r) =>
        `${r.posicao}. ${r.nome} — ${r.qtdClientes} clientes, ${r.contribuicaoMaicpp} pts, saúde ${r.saude}, potencial ${r.potencial}, status ${r.status}`,
    )
    .join("\n");

  const oportunidades = ["Copilot", "Defender", "Azure", "Fabric", "Power Platform"]
    .map((p) => `${p}: ${clientes.filter((c) => !(c.produtos as string[]).includes(p)).length} clientes sem`)
    .join("; ");

  const esp = especializacoes
    .map((e) => `${e.nome} (${e.status}, ${e.progresso}%)`)
    .join("; ");

  return `DADOS DA PLATAFORMA BLUEPARTNER (${new Date().toLocaleDateString("pt-BR")}):
Totais: ${totais.revendas} parceiros MAICPP, ${totais.clientes} clientes, ${totais.usuariosGerenciados} usuários, MAICPP global ${totais.maicppGlobal}/100, ${totais.designacoes}/6 designações.

ÁREAS SOLUTIONS PARTNER:
${areas}

TOP 20 PARCEIROS MAICPP:
${top}

OPORTUNIDADES NA BASE DE CLIENTES: ${oportunidades}. Potencial total estimado: +${totais.pontosPotenciais} pontos.

CERTIFICAÇÕES: ${totais.certificacoesValidas} válidas, ${totais.certificacoesExpirando} expirando em 90 dias, ${totais.certificacoesExpiradas} expiradas. Total de ${certificacoes.length} registros.

ESPECIALIZAÇÕES: ${esp}

BENEFÍCIOS: ${beneficios.map((b) => `${b.nome} (${b.status}, ${b.utilizacao}% usado, saldo ${b.saldo})`).join("; ")}

PLANO DE AÇÃO (amostra): ${planoAcao.slice(0, 8).map((a) => a.titulo).join("; ")}`;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          messages?: { role: "user" | "assistant"; content: string }[];
        };
        if (!Array.isArray(body.messages)) {
          return new Response("Mensagens obrigatórias", { status: 400 });
        }

        const apiKey = process.env["AZURE_OPENAI_API_KEY"];
        const resourceName = process.env["AZURE_OPENAI_RESOURCE_NAME"];
        const deployment = process.env["AZURE_OPENAI_DEPLOYMENT"];
        if (!apiKey || !resourceName || !deployment) {
          return new Response("Configuração do Azure OpenAI ausente", { status: 500 });
        }

        const azure = createAzure({ resourceName, apiKey });

        try {
          const result = streamText({
            model: azure(deployment),
            system: `Você é o Copilot BluePartner, assistente interno de inteligência do ecossistema Microsoft Partner da BluePartner. Responda sempre em português do Brasil, de forma executiva, objetiva e acionável, usando markdown com listas e números concretos. Baseie-se exclusivamente nos dados abaixo; quando faltar dado, diga o que precisa ser levantado.\n\n${contexto()}`,
            messages: body.messages.slice(-12),
          });
          return result.toTextStreamResponse();
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Erro desconhecido";
          console.error("Copilot error:", msg);
          return new Response(msg, { status: 500 });
        }
      },
    },
  },
});
