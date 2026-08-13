import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";

import { PageHeader } from "@/components/ui-kit";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AreaId } from "@/lib/data/dataset";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações | BluePartner Intelligence Center" },
      {
        name: "description",
        content: "Pontuação MAICPP real, metas anuais por área, alertas e parâmetros gerais da plataforma.",
      },
      { property: "og:title", content: "Configurações | BluePartner" },
      { property: "og:description", content: "Parâmetros internos da central BluePartner." },
    ],
  }),
  component: Configuracoes,
});

type AreaScore = {
  id: AreaId;
  nome: string;
  pontuacao: number;
  meta: number;
  performance: number;
  skilling: number;
  customerSuccess: number;
  designacao: boolean;
  atualizadoEm: string | null;
  atualizadoPor: string | null;
  fonte: "real" | "mock";
};

function Configuracoes() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["maicpp-scores"],
    queryFn: async () => {
      const res = await fetch("/api/maicpp/scores");
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<{ areas: AreaScore[] }>;
    },
    retry: false,
  });

  return (
    <div className="space-y-6">
      <PageHeader titulo="Configurações" descricao="Pontuação MAICPP, metas, alertas e parâmetros da central" />

      <Card>
        <CardHeader>
          <CardTitle>Pontuação MAICPP por área</CardTitle>
          <CardDescription>
            Valores reais, atualizados manualmente (a Microsoft não expõe essa pontuação via API). Enquanto
            nenhum valor for salvo, a área mostra um valor padrão de referência.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
          {isError && (
            <p className="text-sm text-destructive">
              Não foi possível carregar as pontuações: {error instanceof Error ? error.message : "erro desconhecido"}
            </p>
          )}
          {data?.areas.map((area) => (
            <AreaScoreForm
              key={area.id}
              area={area}
              onSaved={() => queryClient.invalidateQueries({ queryKey: ["maicpp-scores"] })}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alertas</CardTitle>
          <CardDescription>Notificações internas da equipe BluePartner</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            "Certificações expirando em 30/60/90 dias",
            "Renovação de designação em menos de 120 dias",
            "Parceiro com queda de saúde",
            "Cliente sem Copilot ou Defender",
          ].map((t, i) => (
            <div key={t} className="flex items-center justify-between gap-4 rounded border border-border bg-secondary/30 p-3">
              <span className="text-sm">{t}</span>
              <Switch defaultChecked={i < 3} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function AreaScoreForm({ area, onSaved }: { area: AreaScore; onSaved: () => void }) {
  const [form, setForm] = useState(area);

  useEffect(() => setForm(area), [area]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/maicpp/scores", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          areaId: form.id,
          pontuacao: form.pontuacao,
          meta: form.meta,
          performance: form.performance,
          skilling: form.skilling,
          customerSuccess: form.customerSuccess,
          designacao: form.designacao,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: onSaved,
  });

  const num = (key: keyof AreaScore) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: Number(e.target.value) }));

  return (
    <div className="rounded-md border border-border p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium">{area.nome}</span>
        {area.fonte === "real" ? (
          <Badge variant="outline" className="border-success/40 text-success">
            real — atualizado {area.atualizadoEm ? new Date(area.atualizadoEm).toLocaleDateString("pt-BR") : ""}
            {area.atualizadoPor ? ` por ${area.atualizadoPor}` : ""}
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">valor padrão, ainda não salvo</Badge>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div className="space-y-1">
          <Label>Pontuação</Label>
          <Input type="number" value={form.pontuacao} onChange={num("pontuacao")} />
        </div>
        <div className="space-y-1">
          <Label>Meta</Label>
          <Input type="number" value={form.meta} onChange={num("meta")} />
        </div>
        <div className="space-y-1">
          <Label>Performance</Label>
          <Input type="number" value={form.performance} onChange={num("performance")} />
        </div>
        <div className="space-y-1">
          <Label>Skilling</Label>
          <Input type="number" value={form.skilling} onChange={num("skilling")} />
        </div>
        <div className="space-y-1">
          <Label>Customer Success</Label>
          <Input type="number" value={form.customerSuccess} onChange={num("customerSuccess")} />
        </div>
        <div className="flex flex-col justify-between">
          <Label>Designação ativa</Label>
          <Switch checked={form.designacao} onCheckedChange={(v) => setForm((f) => ({ ...f, designacao: v }))} />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Button size="sm" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? "Salvando..." : "Salvar"}
        </Button>
        {mutation.isError && (
          <span className="text-xs text-destructive">
            {mutation.error instanceof Error ? mutation.error.message : "Erro ao salvar"}
          </span>
        )}
        {mutation.isSuccess && <span className="text-xs text-success">Salvo!</span>}
      </div>
    </div>
  );
}
