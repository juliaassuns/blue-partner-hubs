import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { KpiCard, PageHeader } from "@/components/ui-kit";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AREAS, planoAcao } from "@/lib/data/dataset";

export const Route = createFileRoute("/plano-acao")({
  head: () => ({
    meta: [
      { title: "Plano de Ação | BluePartner Intelligence Center" },
      {
        name: "description",
        content: "Ações recomendadas automaticamente para fechar gaps de pontuação MAICPP por área.",
      },
      { property: "og:title", content: "Plano de Ação | BluePartner" },
      { property: "og:description", content: "Priorização por esforço, impacto e urgência." },
    ],
  }),
  component: PlanoAcao,
});

function PlanoAcao() {
  const [area, setArea] = useState("todas");
  const [esforco, setEsforco] = useState("todos");

  const lista = planoAcao
    .filter((a) => (area === "todas" || a.area === area) && (esforco === "todos" || a.esforco === esforco))
    .sort((a, b) => Number(b.urgente) - Number(a.urgente) || b.impacto - a.impacto);

  return (
    <div className="space-y-6">
      <PageHeader titulo="Plano de Ação" descricao="Ações geradas automaticamente a partir dos gaps do programa" />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Ações abertas" valor={planoAcao.length} />
        <KpiCard label="Urgentes" valor={planoAcao.filter((a) => a.urgente).length} tom="danger" />
        <KpiCard label="Baixo esforço" valor={planoAcao.filter((a) => a.esforco === "Baixo").length} tom="success" />
        <KpiCard label="Alto impacto" valor={planoAcao.filter((a) => a.impacto >= 6).length} tom="warning" />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:w-1/2">
        <Select value={area} onValueChange={setArea}>
          <SelectTrigger><SelectValue placeholder="Área" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as áreas</SelectItem>
            {AREAS.map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={esforco} onValueChange={setEsforco}>
          <SelectTrigger><SelectValue placeholder="Esforço" /></SelectTrigger>
          <SelectContent>
            {["todos", "Baixo", "Médio", "Alto"].map((e) => (
              <SelectItem key={e} value={e}>{e === "todos" ? "Todos os esforços" : `Esforço ${e}`}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {lista.map((a) => (
          <Card key={a.id} className={a.urgente ? "border-destructive/40" : undefined}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{a.titulo}</CardTitle>
                {a.urgente && <Badge className="bg-destructive/15 text-destructive">Urgente</Badge>}
              </div>
              <CardDescription>{AREAS.find((x) => x.id === a.area)?.nome}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">{a.descricao}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="outline">Esforço {a.esforco}</Badge>
                <Badge variant="outline">Impacto {a.impacto}/10</Badge>
                <Badge variant="secondary">{a.responsavel}</Badge>
                <Badge variant="outline">Prazo {new Date(a.prazo).toLocaleDateString("pt-BR")}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
