import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader, ScoreBar, SemaforoBadge, tooltipStyle } from "@/components/ui-kit";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AREAS,
  areaById,
  certificacoes,
  diasRestantes,
  especializacoes,
  historico,
  planoAcao,
  rankingRevendas,
  semaforo,
} from "@/lib/data/dataset";

export const Route = createFileRoute("/solutions/$area")({
  loader: ({ params }) => {
    const area = areaById(params.area);
    if (!area) throw notFound();
    return { areaNome: area.nome };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.areaNome ?? "Área"} | Solutions Partner BluePartner` },
      {
        name: "description",
        content: `Pontuação, metas, skilling e recomendações da área ${loaderData?.areaNome ?? ""} no programa Microsoft AI Cloud Partner.`,
      },
      { property: "og:title", content: `${loaderData?.areaNome ?? "Solutions Partner"} | BluePartner` },
      {
        property: "og:description",
        content: "Detalhamento de designação Solutions Partner na BluePartner.",
      },
    ],
  }),
  notFoundComponent: () => <p className="text-muted-foreground">Área não encontrada.</p>,
  errorComponent: ({ error }) => <p role="alert">{error.message}</p>,
  component: AreaDetalhe,
});

function AreaDetalhe() {
  const { area: areaId } = Route.useParams();
  const area = areaById(areaId)!;
  const nivel = semaforo(area.pontuacao, area.meta);
  const dias = diasRestantes(area.renovacao);
  const faltam = Math.max(0, area.meta - area.pontuacao);

  const topRevendas = [...rankingRevendas]
    .sort((a, b) => b.contribuicoes[area.id] - a.contribuicoes[area.id])
    .slice(0, 8);
  const certsArea = certificacoes.filter((c) => c.area === area.id);
  const espArea = especializacoes.filter((e) => e.area === area.id);
  const acoes = planoAcao.filter((a) => a.area === area.id);

  const recomendacoes = [
    faltam > 0
      ? `Faltam ${faltam} pontos para a meta de ${area.meta}. Priorize Performance (${area.performance} pts), o componente com maior elasticidade.`
      : "Meta atingida — foque em manter o Customer Success acima do patamar exigido.",
    `Skilling em ${area.skilling} pontos: ${certsArea.filter((c) => c.status === "Expirando").length} certificações da área expiram nos próximos 90 dias.`,
    `Existem ${espArea.filter((e) => e.status !== "Conquistada").length} especializações não conquistadas nesta área que somam pontos adicionais.`,
    `Renovação em ${dias} dias (${new Date(area.renovacao).toLocaleDateString("pt-BR")}).`,
  ];

  return (
    <div className="space-y-6">
      <Link
        to="/solutions"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Solutions Partner
      </Link>
      <PageHeader
        titulo={area.nome}
        descricao={area.designacao ? "Designação ativa" : "Designação pendente"}
        acoes={<SemaforoBadge nivel={nivel} />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Pontuação</CardTitle>
            <CardDescription>Atual, meta e diferença</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-4xl font-semibold tabular-nums">
              {area.pontuacao}
              <span className="text-lg text-muted-foreground">/{area.meta}</span>
            </p>
            <ScoreBar valor={area.pontuacao} meta={area.meta} nivel={nivel} />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Info label="Pontuação necessária" valor={`${faltam} pts`} />
              <Info label="Dias restantes" valor={`${dias}`} />
              <Info label="Data de renovação" valor={new Date(area.renovacao).toLocaleDateString("pt-BR")} />
              <Info label="Status" valor={area.designacao ? "Designada" : "Em progresso"} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Componentes</CardTitle>
            <CardDescription>Performance · Skilling · Customer Success</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { nome: "Performance", valor: area.performance },
                  { nome: "Skilling", valor: area.skilling },
                  { nome: "Customer Success", valor: area.customerSuccess },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="nome" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--accent)", opacity: 0.3 }} />
                <Bar dataKey="valor" name="Pontos" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recomendações automáticas</CardTitle>
            <CardDescription>Geradas a partir dos gaps da área</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              {recomendacoes.map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="text-muted-foreground">{r}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Evolução — {area.nome}</CardTitle>
            <CardDescription>Últimos 24 meses</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historico}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mes" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} interval={3} />
                <YAxis domain={[0, 100]} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey={area.id} name={area.nome} stroke="var(--chart-1)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revendas que mais contribuem</CardTitle>
            <CardDescription>Contribuição em pontos nesta área</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {topRevendas.map((r) => (
              <Link
                key={r.id}
                to="/revendas/$id"
                params={{ id: r.id }}
                className="flex items-center justify-between rounded border border-border bg-secondary/30 px-3 py-2 text-sm hover:border-primary/60"
              >
                <span className="truncate">{r.nome}</span>
                <Badge variant="secondary" className="tabular-nums">
                  {r.contribuicoes[area.id].toFixed(1)} pts
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ações recomendadas para {area.nome}</CardTitle>
          <CardDescription>Detalhamento completo no módulo Plano de Ação</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {acoes.map((a) => (
            <div key={a.id} className="rounded border border-border bg-secondary/30 p-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{a.titulo}</p>
                {a.urgente && <Badge className="bg-destructive/15 text-destructive">Urgente</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">{a.descricao}</p>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Esforço {a.esforco} · Impacto {a.impacto}/10 · {a.responsavel}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {AREAS.filter((a) => a.id !== area.id).map((a) => (
          <Link key={a.id} to="/solutions/$area" params={{ area: a.id }}>
            <Badge variant="outline" className="cursor-pointer hover:border-primary">
              {a.nome}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Info({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="rounded border border-border bg-secondary/40 p-2">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium tabular-nums">{valor}</p>
    </div>
  );
}
