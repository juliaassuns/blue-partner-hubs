import { createFileRoute } from "@tanstack/react-router";

import { KpiCard, PageHeader, StatusDot } from "@/components/ui-kit";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AREAS, especializacoes } from "@/lib/data/dataset";

export const Route = createFileRoute("/especializacoes")({
  head: () => ({
    meta: [
      { title: "Especializações | BluePartner Intelligence Center" },
      {
        name: "description",
        content:
          "Status, requisitos, pendências e progresso das especializações Microsoft da BluePartner.",
      },
      { property: "og:title", content: "Especializações | BluePartner" },
      { property: "og:description", content: "Especializações conquistadas, em andamento e não iniciadas." },
    ],
  }),
  component: Especializacoes,
});

function Especializacoes() {
  const grupos = ["Conquistada", "Em andamento", "Não iniciada"] as const;

  return (
    <div className="space-y-6">
      <PageHeader titulo="Especializações" descricao="Especializações avançadas Microsoft e requisitos de renovação" />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total" valor={especializacoes.length} />
        {grupos.map((g) => (
          <KpiCard
            key={g}
            label={g}
            valor={especializacoes.filter((e) => e.status === g).length}
            tom={g === "Conquistada" ? "success" : g === "Em andamento" ? "warning" : "default"}
          />
        ))}
      </div>

      {grupos.map((g) => {
        const itens = especializacoes.filter((e) => e.status === g);
        if (itens.length === 0) return null;
        return (
          <Card key={g}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <StatusDot status={g} />
                <span className="text-muted-foreground">({itens.length})</span>
              </CardTitle>
              <CardDescription>
                {g === "Conquistada"
                  ? "Manter requisitos até a data de renovação"
                  : g === "Em andamento"
                    ? "Pendências abertas para conclusão"
                    : "Oportunidades de novas especializações"}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {itens.map((e) => (
                <div key={e.id} className="rounded border border-border bg-secondary/30 p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{e.nome}</p>
                    <Badge variant="secondary" className="shrink-0">
                      {AREAS.find((a) => a.id === e.area)?.nome}
                    </Badge>
                  </div>
                  <Progress
                    value={e.progresso}
                    className={e.progresso === 100 ? "[&>div]:bg-success" : e.progresso > 40 ? "[&>div]:bg-warning" : "[&>div]:bg-primary"}
                  />
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground tabular-nums">
                    <span>{e.progresso}% concluído</span>
                    <span>{e.pontuacao} pts</span>
                  </div>
                  <p className="mt-3 text-[11px] uppercase tracking-wide text-muted-foreground">Requisitos</p>
                  <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                    {e.requisitos.map((r) => (
                      <li key={r}>• {r}</li>
                    ))}
                  </ul>
                  {e.pendencias.length > 0 && (
                    <p className="mt-2 text-xs text-warning">Pendências: {e.pendencias.join(", ")}</p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    Renovação: {new Date(e.renovacao).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
