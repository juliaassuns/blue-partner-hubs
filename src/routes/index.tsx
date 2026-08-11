import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  Users,
  BadgeCheck,
  GraduationCap,
  Award,
  CalendarClock,
  Gauge,
  TrendingUp,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

import { KpiCard, PageHeader, ScoreBar, SemaforoBadge, tooltipStyle } from "@/components/ui-kit";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AREAS,
  historico,
  rankingRevendas,
  semaforo,
  totais,
  diasRestantes,
} from "@/lib/data/dataset";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard Executivo | BluePartner Intelligence Center" },
      {
        name: "description",
        content:
          "KPIs consolidados do ecossistema Microsoft da BluePartner: MAICPP, revendas CSP, clientes, certificações e renovações.",
      },
      { property: "og:title", content: "Dashboard Executivo | BluePartner Intelligence Center" },
      {
        property: "og:description",
        content: "KPIs consolidados do ecossistema Microsoft da BluePartner: MAICPP, revendas CSP, clientes, certificações e renovações.",
      },
    ],
  }),
  component: Dashboard,
});

const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

function Dashboard() {
  const radarData = AREAS.map((a) => ({ area: a.nome, pontuacao: a.pontuacao, meta: a.meta }));
  const top10 = rankingRevendas.slice(0, 10);

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Dashboard Executivo"
        descricao="Panorama consolidado do ecossistema Microsoft Partner da BluePartner"
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Revendas CSP" valor={totais.revendas} detalhe="parceiros ativos no programa" icone={<Building2 className="size-4" />} />
        <KpiCard label="Clientes" valor={totais.clientes} detalhe={`${totais.usuariosGerenciados.toLocaleString("pt-BR")} usuários gerenciados`} icone={<Users className="size-4" />} />
        <KpiCard label="Certificações" valor={totais.certificacoes} detalhe={`${totais.certificacoesValidas} válidas · ${totais.certificacoesExpirando} expirando`} icone={<BadgeCheck className="size-4" />} />
        <KpiCard label="Especializações" valor={totais.especializacoes} detalhe={`${totais.especializacoesConquistadas} conquistadas`} icone={<GraduationCap className="size-4" />} />
        <KpiCard label="Designações" valor={`${totais.designacoes}/6`} detalhe="Solutions Partner ativas" icone={<Award className="size-4" />} tom="success" />
        <KpiCard label="Próximas renovações" valor={totais.proximasRenovacoes} detalhe="áreas com renovação em 180 dias" icone={<CalendarClock className="size-4" />} tom="warning" />
        <KpiCard label="Pontuação Global MAICPP" valor={`${totais.maicppGlobal}/100`} detalhe="média das seis áreas" icone={<Gauge className="size-4" />} />
        <KpiCard label="Potencial de pontos" valor={`+${totais.pontosPotenciais}`} detalhe="oportunidades detectadas na base" icone={<TrendingUp className="size-4" />} tom="success" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Radar por área</CardTitle>
            <CardDescription>Pontuação atual versus meta anual</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="area" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                <Radar name="Atual" dataKey="pontuacao" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.4} />
                <Radar name="Meta" dataKey="meta" stroke="var(--chart-4)" fill="var(--chart-4)" fillOpacity={0.12} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Evolução dos últimos 24 meses</CardTitle>
            <CardDescription>Histórico mensal de pontuação MAICPP por área</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historico}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mes" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} interval={2} />
                <YAxis domain={[0, 100]} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {AREAS.map((a, i) => (
                  <Line
                    key={a.id}
                    type="monotone"
                    dataKey={a.id}
                    name={a.nome}
                    stroke={chartColors[i]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status por área e metas anuais</CardTitle>
          <CardDescription>Clique em uma área para abrir o detalhamento Solutions Partner</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {AREAS.map((a) => {
            const nivel = semaforo(a.pontuacao, a.meta);
            return (
              <Link
                key={a.id}
                to="/solutions/$area"
                params={{ area: a.id }}
                className="rounded-md border border-border bg-secondary/30 p-4 transition-colors hover:border-primary/60 hover:bg-secondary/60"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="font-medium">{a.nome}</span>
                  <SemaforoBadge nivel={nivel} />
                </div>
                <p className="mb-2 text-2xl font-semibold tabular-nums">
                  {a.pontuacao}
                  <span className="text-sm text-muted-foreground">/{a.meta}</span>
                </p>
                <ScoreBar valor={a.pontuacao} meta={a.meta} nivel={nivel} />
                <p className="mt-3 text-xs text-muted-foreground">
                  Renovação em {diasRestantes(a.renovacao)} dias
                </p>
              </Link>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top 10 revendas por contribuição MAICPP</CardTitle>
          <CardDescription>Contribuição consolidada em pontos</CardDescription>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top10} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
              <YAxis type="category" dataKey="nome" width={130} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--accent)", opacity: 0.3 }} />
              <Bar dataKey="contribuicaoMaicpp" name="Pontos" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
