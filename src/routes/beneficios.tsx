import { createFileRoute } from "@tanstack/react-router";

import { KpiCard, PageHeader, StatusDot } from "@/components/ui-kit";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { beneficios } from "@/lib/data/dataset";

export const Route = createFileRoute("/beneficios")({
  head: () => ({
    meta: [
      { title: "Benefícios e Incentivos | BluePartner Intelligence Center" },
      {
        name: "description",
        content:
          "ISV Success, Marketplace Rewards, Azure Credits, Copilot e demais benefícios Microsoft da BluePartner.",
      },
      { property: "og:title", content: "Benefícios e Incentivos | BluePartner" },
      { property: "og:description", content: "Saldos, utilização e expiração dos benefícios do programa." },
    ],
  }),
  component: Beneficios,
});

function Beneficios() {
  return (
    <div className="space-y-6">
      <PageHeader titulo="Benefícios e Incentivos" descricao="Utilização dos benefícios do Microsoft AI Cloud Partner Program" />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Benefícios ativos" valor={beneficios.filter((b) => b.status === "Ativo").length} tom="success" />
        <KpiCard label="Expirando" valor={beneficios.filter((b) => b.status === "Expirando").length} tom="warning" />
        <KpiCard label="Não utilizados" valor={beneficios.filter((b) => b.status === "Não utilizado").length} tom="danger" />
        <KpiCard
          label="Utilização média"
          valor={`${Math.round(beneficios.reduce((s, b) => s + b.utilizacao, 0) / beneficios.length)}%`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {beneficios.map((b) => (
          <Card key={b.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{b.nome}</CardTitle>
                <Badge variant="secondary">{b.categoria}</Badge>
              </div>
              <CardDescription>
                <StatusDot status={b.status} />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Saldo disponível</p>
                <p className="text-xl font-semibold">{b.saldo}</p>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>Utilização</span>
                  <span className="tabular-nums">{b.utilizacao}%</span>
                </div>
                <Progress
                  value={b.utilizacao}
                  className={b.utilizacao > 70 ? "[&>div]:bg-success" : b.utilizacao > 30 ? "[&>div]:bg-warning" : "[&>div]:bg-destructive"}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Expira em {new Date(b.expiracao).toLocaleDateString("pt-BR")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
