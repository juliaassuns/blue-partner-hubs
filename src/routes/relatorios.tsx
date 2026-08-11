import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader, tooltipStyle } from "@/components/ui-kit";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AREAS, clientes, historico, rankingRevendas } from "@/lib/data/dataset";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios e Analytics | BluePartner Intelligence Center" },
      {
        name: "description",
        content:
          "Comparativos, tendências, forecast e heatmap do ecossistema Microsoft Partner da BluePartner.",
      },
      { property: "og:title", content: "Relatórios | BluePartner" },
      { property: "og:description", content: "Analytics do ecossistema Microsoft Partner." },
    ],
  }),
  component: Relatorios,
});

const cores = ["var(--chart-1)","var(--chart-2)","var(--chart-3)","var(--chart-4)","var(--chart-5)","var(--chart-6)"];

function Relatorios() {
  const segmentos = Array.from(new Set(rankingRevendas.map((r) => r.segmento))).map((s) => ({
    name: s,
    value: rankingRevendas.filter((r) => r.segmento === s).length,
  }));

  const forecast = historico.slice(-12).map((h, i) => ({
    mes: h.mes,
    real: Math.round(AREAS.reduce((s, a) => s + (h[a.id] as number), 0) / AREAS.length),
    projecao: Math.round(
      AREAS.reduce((s, a) => s + (h[a.id] as number), 0) / AREAS.length + i * 1.4,
    ),
  }));

  const heat = rankingRevendas.slice(0, 15);

  return (
    <div className="space-y-6">
      <PageHeader titulo="Relatórios e Analytics" descricao="Comparativos entre revendas, clientes e soluções" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tendência e forecast MAICPP</CardTitle>
            <CardDescription>Últimos 12 meses e projeção</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mes" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="real" name="Realizado" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="projecao" name="Forecast" stroke="var(--chart-4)" strokeDasharray="5 5" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revendas por segmento</CardTitle>
            <CardDescription>Distribuição do canal</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={segmentos} dataKey="value" nameKey="name" outerRadius={100} label>
                  {segmentos.map((_, i) => (
                    <Cell key={i} fill={cores[i % cores.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Heatmap de contribuição por revenda e solução</CardTitle>
          <CardDescription>Top 15 revendas — intensidade proporcional aos pontos</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="py-2">Revenda</th>
                {AREAS.map((a) => (
                  <th key={a.id} className="px-2 py-2 text-center">{a.nome}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heat.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="max-w-40 truncate py-1.5 pr-2">{r.nome}</td>
                  {AREAS.map((a) => {
                    const v = r.contribuicoes[a.id];
                    return (
                      <td key={a.id} className="px-1 py-1.5">
                        <div
                          className="rounded py-1 text-center text-xs tabular-nums text-foreground"
                          style={{ background: `color-mix(in oklab, var(--chart-1) ${Math.min(90, v * 12)}%, transparent)` }}
                        >
                          {v.toFixed(1)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Adoção de produtos na base de clientes</CardTitle>
          <CardDescription>Quantidade de clientes por produto Microsoft</CardDescription>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={["Copilot","Defender","Azure","Fabric","Power Platform","Dynamics","Entra ID","OneDrive"].map((p) => ({
                produto: p,
                clientes: clientes.filter((c) => (c.produtos as string[]).includes(p)).length,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="produto" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
              <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--accent)", opacity: 0.3 }} />
              <Bar dataKey="clientes" name="Clientes" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Power BI Embedded</CardTitle>
          <CardDescription>Área reservada para relatórios corporativos incorporados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid h-64 place-items-center rounded border border-dashed border-border bg-secondary/20 text-center">
            <div className="max-w-md px-6">
              <p className="font-medium">Container de embed pronto</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Para exibir um relatório real, informe o workspace ID, o report ID e as credenciais
                Microsoft (Power BI Embedded exige capacidade licenciada). Enquanto isso, os gráficos
                nativos acima cobrem os mesmos indicadores.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
