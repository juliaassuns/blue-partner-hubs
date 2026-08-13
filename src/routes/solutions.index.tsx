import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader, ScoreBar, SemaforoBadge } from "@/components/ui-kit";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { diasRestantes, semaforo } from "@/lib/data/dataset";
import { buscarAreasReais } from "@/lib/maicpp/scores";

export const Route = createFileRoute("/solutions/")({
  loader: () => buscarAreasReais(),
  head: () => ({
    meta: [
      { title: "Solutions Partner | BluePartner Intelligence Center" },
      {
        name: "description",
        content:
          "Acompanhe as seis designações Solutions Partner: pontuação, metas, renovação e recomendações.",
      },
      { property: "og:title", content: "Solutions Partner | BluePartner" },
      {
        property: "og:description",
        content: "Pontuação MAICPP por área de solução Microsoft.",
      },
    ],
  }),
  component: SolutionsIndex,
});

function SolutionsIndex() {
  const areas = Route.useLoaderData();
  return (
    <div>
      <PageHeader
        titulo="Solutions Partner"
        descricao="Designações Microsoft por área de solução com pontuação MAICPP"
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {areas.map((a) => {
          const nivel = semaforo(a.pontuacao, a.meta);
          const dias = diasRestantes(a.renovacao);
          return (
            <Link key={a.id} to="/solutions/$area" params={{ area: a.id }}>
              <Card className="h-full transition-colors hover:border-primary/60">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{a.nome}</CardTitle>
                    <SemaforoBadge nivel={nivel} />
                  </div>
                  <CardDescription>
                    {a.designacao ? "Designação ativa" : "Designação não atingida"} · renova em {dias} dias
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-3xl font-semibold tabular-nums">
                    {a.pontuacao}
                    <span className="text-base text-muted-foreground">/{a.meta}</span>
                  </p>
                  <ScoreBar valor={a.pontuacao} meta={a.meta} nivel={nivel} />
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <Metric label="Performance" valor={a.performance} />
                    <Metric label="Skilling" valor={a.skilling} />
                    <Metric label="Cust. Success" valor={a.customerSuccess} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ label, valor }: { label: string; valor: number }) {
  return (
    <div className="rounded border border-border bg-secondary/40 py-2">
      <p className="text-sm font-semibold tabular-nums">{valor}</p>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
