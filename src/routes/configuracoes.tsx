import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/ui-kit";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AREAS } from "@/lib/data/dataset";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações | BluePartner Intelligence Center" },
      {
        name: "description",
        content: "Metas anuais por área, alertas de certificação e parâmetros gerais da plataforma.",
      },
      { property: "og:title", content: "Configurações | BluePartner" },
      { property: "og:description", content: "Parâmetros internos da central BluePartner." },
    ],
  }),
  component: Configuracoes,
});

function Configuracoes() {
  return (
    <div className="space-y-6">
      <PageHeader titulo="Configurações" descricao="Metas, alertas e parâmetros da central" />

      <Card>
        <CardHeader>
          <CardTitle>Metas anuais por área</CardTitle>
          <CardDescription>Pontuação alvo usada nos semáforos e no plano de ação</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {AREAS.map((a) => (
            <div key={a.id} className="space-y-2">
              <Label htmlFor={a.id}>{a.nome}</Label>
              <Input id={a.id} type="number" defaultValue={a.meta} />
              <p className="text-xs text-muted-foreground">Atual: {a.pontuacao} pts</p>
            </div>
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
            "Revenda com queda de saúde",
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
