// Erro cujo texto é seguro pra mostrar ao usuário — só contém informação que
// nós mesmos escrevemos (nomes de app settings, categorias de status HTTP),
// nunca texto vindo de uma resposta externa.
export class ErroSeguro extends Error {}

// Loga o erro real só no servidor (App Service logs, nunca no navegador) e
// devolve uma mensagem segura pra resposta HTTP. Qualquer erro que não seja
// explicitamente marcado como `ErroSeguro` tem seu texto original substituído
// por uma mensagem genérica — evita vazar corpo de resposta de APIs externas
// (Partner Center, Azure OpenAI) ou mensagens de driver de banco, que podem
// conter dados de cliente ou detalhes de infraestrutura.
export function mensagemSegura(e: unknown, contexto: string): string {
  console.error(contexto, e);
  if (e instanceof ErroSeguro) return e.message;
  return "Não foi possível completar a operação. Tente novamente em instantes.";
}
