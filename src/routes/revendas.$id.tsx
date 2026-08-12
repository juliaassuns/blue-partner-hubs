import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { KpiCard, PageHeader, StatusDot, tooltipStyle } from "@/components/ui-kit";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AREAS, clientesPorRevenda, rankingRevendas, revendaById } from "@/lib/data/dataset";

export const Route = createFileRoute("/revendas/$id")({
  loader: ({ params }) => {
    const revenda = revendaById(params.id);
    if (!revenda) throw notFound();
    return { nome: revenda.nome };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.nome ?? "Revenda"} | Revendas CSP BluePartner` },
      {
        name: "description",
        content: `Contribuição MAICPP, clientes, saúde e próximas ações da revenda ${loaderData?.nome ?? ""}.`,
      },
      { property: "og:title", content: `${loaderData?.nome ?? "Revenda"} | BluePartner` },
      { property: "og:description", content: "Ficha completa da revenda CSP." },
    ],
  }),
  notFoundComponent: () => <p className="text-muted-foreground">Revenda não encontrada.</p>,
  errorComponent: ({ error }) => <p role="alert">{error.message}</p>,
  component: RevendaDetalhe,
});

function RevendaDetalhe() {
  const { id } = Route.useParams();
  const revenda = revendaById(id)!;
  const posicao = rankingRevendas.find((r) => r.id === id)?.posicao ?? 0;
  const clientes = clientesPorRevenda(id);
  const radar = AREAS.map((a) => ({ area: a.nome, valor: revenda.contribuicoes[a.id] }));

  return (
    <div className="space-y-6">
      <Link to="/revendas" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Revendas CSP
      </Link>
      <PageHeader
        titulo={revenda.nome}
        descricao={`${revenda.segmento} · ${revenda.cidade} · Gerente ${revenda.gerente}`}
        acoes={<StatusDot status={revenda.status} />}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Posição no ranking" valor={`#${posicao}`} />
        <KpiCard
          label="Clientes"
          valor={clientes.length}
          detalhe={`${revenda.variacaoClientes3m > 0 ? "+" : ""}${revenda.variacaoClientes3m} (3m)`}
          tom={revenda.variacaoClientes3m > 0 ? "success" : revenda.variacaoClientes3m < 0 ? "danger" : "default"}
        />
        <KpiCard
          label="Contribuição MAICPP"
          valor={revenda.contribuicaoMaicpp.toFixed(1)}
          detalhe={`${revenda.variacaoPontos3m > 0 ? "+" : ""}${revenda.variacaoPontos3m.toFixed(1)} pts (3m)`}
          tom={revenda.variacaoPontos3m > 0.5 ? "success" : revenda.variacaoPontos3m < -0.5 ? "danger" : "default"}
        />
        <KpiCard label="Saúde geral" valor={`${revenda.saude}%`} tom={revenda.saude > 70 ? "success" : revenda.saude > 50 ? "warning" : "danger"} />
        <KpiCard label="Potencial de crescimento" valor={`${revenda.potencial}%`} tom="success" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Contribuição por área</CardTitle>
            <CardDescription>Pontos MAICPP por solução</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar} outerRadius="70%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="area" tick={{ fill: "var(--muted-foreground)", fontSize: 9 }} />
                <Radar dataKey="valor" name="Pontos" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.4} />
                <Tooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de pontos</CardTitle>
            <CardDescription>Comparativo entre soluções</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={radar}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="area" tick={{ fill: "var(--muted-foreground)", fontSize: 9 }} interval={0} angle={-15} height={50} />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--accent)", opacity: 0.3 }} />
                <Bar dataKey="valor" name="Pontos" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas ações</CardTitle>
            <CardDescription>Recomendações para a revenda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {revenda.proximasAcoes.map((a) => (
              <div key={a} className="rounded border border-border bg-secondary/30 p-3 text-sm">
                {a}
              </div>
            ))}
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Saúde geral</p>
              <Progress
                value={revenda.saude}
                className={revenda.saude > 70 ? "[&>div]:bg-success" : revenda.saude > 50 ? "[&>div]:bg-warning" : "[&>div]:bg-destructive"}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Receita mensal estimada: R$ {revenda.receitaMensal.toLocaleString("pt-BR")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evolução da revenda (12 meses)</CardTitle>
          <CardDescription>Contribuição MAICPP e quantidade de clientes ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenda.historico}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mes" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
              <YAxis yAxisId="pontos" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
              <YAxis yAxisId="clientes" orientation="right" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line yAxisId="pontos" type="monotone" dataKey="contribuicaoMaicpp" name="Contribuição MAICPP" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
              <Line yAxisId="clientes" type="monotone" dataKey="qtdClientes" name="Clientes" stroke="var(--chart-3)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clientes da revenda</CardTitle>
          <CardDescription>{clientes.length} clientes — clique para abrir o detalhe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead className="text-right">Usuários</TableHead>
                  <TableHead>Licenciamento</TableHead>
                  <TableHead className="text-right">Adoção</TableHead>
                  <TableHead className="text-right">Oportunidade</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link to="/clientes/$id" params={{ id: c.id }} className="font-medium hover:text-primary">
                        {c.nome}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{c.tenant}</TableCell>
                    <TableCell className="text-right tabular-nums">{c.usuarios.toLocaleString("pt-BR")}</TableCell>
                    <TableCell><Badge variant="secondary">{c.licenciamento}</Badge></TableCell>
                    <TableCell className="text-right tabular-nums">{c.adocao}%</TableCell>
                    <TableCell className="text-right tabular-nums">{c.scoreOportunidade}</TableCell>
                    <TableCell><StatusDot status={c.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
