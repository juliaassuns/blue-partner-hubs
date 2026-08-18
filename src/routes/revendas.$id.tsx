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

import { KpiCard, PageHeader, SemaforoBadge, StatusDot, tooltipStyle } from "@/components/ui-kit";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
import { AREAS, semaforo, type Metrica } from "@/lib/data/dataset";
import { buscarClientesReais, buscarRevendasReais, ranquear } from "@/lib/revendas/data";

export const Route = createFileRoute("/revendas/$id")({
  loader: async ({ params }) => {
    const [revendasData, clientesData] = await Promise.all([buscarRevendasReais(), buscarClientesReais()]);
    const revenda = revendasData.dados.find((r) => r.id === params.id);
    if (!revenda) throw notFound();
    const posicao = ranquear(revendasData.dados).find((r) => r.id === params.id)?.posicao ?? 0;
    const clientes = clientesData.dados.filter((c) => c.revendaId === params.id);
    return { revenda, posicao, clientes, nome: revenda.nome };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.nome ?? "Parceiro"} | Parceiros MAICPP BluePartner` },
      {
        name: "description",
        content: `Contribuição MAICPP, clientes, saúde e próximas ações do parceiro ${loaderData?.nome ?? ""}.`,
      },
      { property: "og:title", content: `${loaderData?.nome ?? "Parceiro"} | BluePartner` },
      { property: "og:description", content: "Ficha completa do parceiro MAICPP." },
    ],
  }),
  notFoundComponent: () => <p className="text-muted-foreground">Parceiro não encontrado.</p>,
  errorComponent: ({ error }) => <p role="alert">{error.message}</p>,
  component: RevendaDetalhe,
});

function RevendaDetalhe() {
  const { revenda, posicao, clientes } = Route.useLoaderData();
  const radar = AREAS.map((a) => ({ area: a.nome, valor: revenda.contribuicoes[a.id] }));

  return (
    <div className="space-y-6">
      <Link to="/revendas" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Parceiros MAICPP
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

      <Card>
        <CardHeader>
          <CardTitle>Solutions Partner do parceiro</CardTitle>
          <CardDescription>
            Detalhamento por métrica de Performance, Skilling e Customer Success — mesmo formato do painel oficial do Partner Center
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3">
          <Accordion type="multiple" defaultValue={[AREAS[0]!.id]}>
            {AREAS.map((a) => {
              const areaRevenda = revenda.areas[a.id];
              const nivel = semaforo(areaRevenda.pontuacao, areaRevenda.meta);
              return (
                <AccordionItem key={a.id} value={a.id}>
                  <AccordionTrigger className="px-3">
                    <div className="flex w-full flex-wrap items-center justify-between gap-3 pr-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-medium">{areaRevenda.nome}</span>
                        <Badge variant="outline" className="text-xs">{areaRevenda.segmento}</Badge>
                        <SemaforoBadge nivel={nivel} />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground tabular-nums">
                          {areaRevenda.pontuacao}/{areaRevenda.meta} pts
                        </span>
                        {areaRevenda.designacao ? (
                          <Badge className="bg-success/15 text-success hover:bg-success/15">Qualified</Badge>
                        ) : (
                          <Badge variant="outline" className="border-warning/40 text-warning">In Progress</Badge>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3">
                    <MetricasPorCategoria metricas={areaRevenda.metricas} />
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

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
            <CardDescription>Recomendações para o parceiro</CardDescription>
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
          <CardTitle>Evolução do parceiro (12 meses)</CardTitle>
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
          <CardTitle>Clientes do parceiro</CardTitle>
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

const CATEGORIAS: { titulo: string; chave: Metrica["categoria"] }[] = [
  { titulo: "1. Performance", chave: "performance" },
  { titulo: "2. Skilling", chave: "skilling" },
  { titulo: "3. Customer success", chave: "customerSuccess" },
];

function MetricasPorCategoria({ metricas }: { metricas: Metrica[] }) {
  return (
    <div className="space-y-5">
      {CATEGORIAS.map((cat) => (
        <div key={cat.chave}>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{cat.titulo}</p>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {metricas
              .filter((m) => m.categoria === cat.chave)
              .map((m) => (
                <div key={m.nome} className="rounded-md border border-border bg-secondary/30 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <Badge
                      variant="outline"
                      className={
                        m.status === "Achieved"
                          ? "border-success/40 text-success"
                          : "border-primary/40 text-primary"
                      }
                    >
                      {m.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {m.pontos}/{m.maxPontos} Points
                    </span>
                  </div>
                  <p className="mb-2 text-sm font-medium">{m.nome}</p>
                  <Progress
                    value={(m.pontos / m.maxPontos) * 100}
                    className={m.status === "Achieved" ? "[&>div]:bg-success" : "[&>div]:bg-primary"}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">{m.descricao}</p>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
