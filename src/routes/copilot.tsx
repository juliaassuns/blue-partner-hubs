import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Bot, Send, User } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/copilot")({
  head: () => ({
    meta: [
      { title: "Copilot BluePartner | Intelligence Center" },
      {
        name: "description",
        content:
          "Assistente de IA interno que responde sobre MAICPP, parceiros MAICPP, clientes, certificações e planos de crescimento.",
      },
      { property: "og:title", content: "Copilot BluePartner" },
      { property: "og:description", content: "Assistente de IA com todos os dados da plataforma." },
    ],
  }),
  component: Copilot,
});

type Msg = { role: "user" | "assistant"; content: string };

const SUGESTOES = [
  "O que falta para renovar Security?",
  "Quais parceiros possuem maior potencial para Modern Work?",
  "Quais clientes podem gerar pontos para Data & AI?",
  "Quais certificações devemos priorizar?",
  "Quais especializações estão em risco?",
  "Monte um plano para atingir 70 pontos.",
];

function Copilot() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [loading]);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function enviar(texto: string) {
    const conteudo = texto.trim();
    if (!conteudo || loading) return;
    const novas: Msg[] = [...messages, { role: "user", content: conteudo }];
    setMessages([...novas, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: novas }),
      });
      if (!res.ok || !res.body) {
        const detalhe = await res.text().catch(() => "");
        throw new Error(
          res.status === 429
            ? "Limite de requisições atingido. Tente novamente em instantes."
            : res.status === 402
              ? "Créditos de IA esgotados. Adicione créditos ao workspace."
              : detalhe || "Falha ao consultar o Copilot.",
        );
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages([...novas, { role: "assistant", content: acc }]);
      }
    } catch (e) {
      setMessages(novas);
      toast.error(e instanceof Error ? e.message : "Erro ao falar com o Copilot");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col">
      <PageHeader
        titulo="Copilot BluePartner"
        descricao="Assistente interno com acesso a todos os dados da plataforma"
      />

      <Card className="flex min-h-0 flex-1 flex-col">
        <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-4">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            {messages.length === 0 && (
              <div className="space-y-4 py-6">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded bg-primary/15 text-primary">
                    <Bot className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium">Como posso ajudar?</p>
                    <p className="text-sm text-muted-foreground">
                      Pergunte sobre pontuação MAICPP, parceiros MAICPP, clientes ou planos de crescimento.
                    </p>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {SUGESTOES.map((s) => (
                    <button
                      key={s}
                      onClick={() => enviar(s)}
                      className="rounded border border-border bg-secondary/30 px-3 py-2 text-left text-sm transition-colors hover:border-primary/60 hover:bg-secondary/60"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className="flex gap-3">
                <div
                  className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded ${
                    m.role === "user" ? "bg-secondary" : "bg-primary/15 text-primary"
                  }`}
                >
                  {m.role === "user" ? <User className="size-4" /> : <Bot className="size-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  {m.role === "user" ? (
                    <div className="inline-block rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground">
                      {m.content}
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {m.content || (
                        <span className="animate-pulse text-muted-foreground">Analisando os dados...</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={fimRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              enviar(input);
            }}
            className="flex items-end gap-2 border-t border-border pt-3"
          >
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  enviar(input);
                }
              }}
              placeholder="Pergunte ao Copilot BluePartner..."
              className="max-h-32 min-h-11 resize-none"
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()}>
              <Send className="size-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
