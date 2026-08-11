import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";

import { KpiCard, PageHeader, StatusDot } from "@/components/ui-kit";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AREAS, certificacoes, diasRestantes, totais } from "@/lib/data/dataset";

export const Route = createFileRoute("/certificacoes")({
  head: () => ({
    meta: [
      { title: "Certificações | BluePartner Intelligence Center" },
      {
        name: "description",
        content:
          "Controle de certificações Microsoft dos colaboradores BluePartner com alertas de 30, 60 e 90 dias.",
      },
      { property: "og:title", content: "Certificações | BluePartner" },
      { property: "og:description", content: "Validade e impacto das certificações no score MAICPP." },
    ],
  }),
  component: Certificacoes,
});

function Certificacoes() {
  const [busca, setBusca] = useState("");
  const [area, setArea] = useState("todas");
  const [status, setStatus] = useState("todos");

  const lista = useMemo(
    () =>
      certificacoes
        .filter(
          (c) =>
            (c.colaborador.toLowerCase().includes(busca.toLowerCase()) ||
              c.certificacao.toLowerCase().includes(busca.toLowerCase())) &&
            (area === "todas" || c.area === area) &&
            (status === "todos" || c.status === status),
        )
        .sort((a, b) => a.validade.localeCompare(b.validade)),
    [busca, area, status],
  );

  const alerta = (dias: number) => certificacoes.filter((c) => {
    const d = diasRestantes(c.validade);
    return d >= 0 && d <= dias;
  }).length;

  return (
    <div className="space-y-6">
      <PageHeader titulo="Certificações" descricao="Capacidade técnica do time BluePartner e impacto no Skilling" />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Válidas" valor={totais.certificacoesValidas} tom="success" />
        <KpiCard label="Expirando (90 dias)" valor={totais.certificacoesExpirando} tom="warning" />
        <KpiCard label="Expiradas" valor={totais.certificacoesExpiradas} tom="danger" />
        <KpiCard
          label="Impacto no score"
          valor={certificacoes.filter((c) => c.status === "Válida").reduce((s, c) => s + c.impacto, 0)}
          detalhe="pontos de Skilling ativos"
        />
      </div>

      <Card className="border-warning/30 bg-warning/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="size-4 text-warning" /> Alertas automáticos de expiração
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {[30, 60, 90].map((d) => (
            <div key={d} className="rounded border border-border bg-secondary/40 p-3">
              <p className="text-2xl font-semibold tabular-nums text-warning">{alerta(d)}</p>
              <p className="text-xs text-muted-foreground">certificações expiram em até {d} dias</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Colaboradores e certificações</CardTitle>
          <CardDescription>{lista.length} registros</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-3">
            <Input placeholder="Buscar colaborador ou certificação..." value={busca} onChange={(e) => setBusca(e.target.value)} />
            <Select value={area} onValueChange={setArea}>
              <SelectTrigger><SelectValue placeholder="Área" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as áreas</SelectItem>
                {AREAS.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                {["todos", "Válida", "Expirando", "Expirada"].map((s) => (
                  <SelectItem key={s} value={s}>{s === "todos" ? "Todos os status" : s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto rounded border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Certificação</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Obtenção</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.colaborador}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.cargo}</TableCell>
                    <TableCell className="text-sm">{AREAS.find((a) => a.id === c.area)?.nome}</TableCell>
                    <TableCell className="text-sm">{c.certificacao}</TableCell>
                    <TableCell><Badge variant="secondary">{c.nivel}</Badge></TableCell>
                    <TableCell className="text-sm tabular-nums">{new Date(c.obtencao).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="text-sm tabular-nums">{new Date(c.validade).toLocaleDateString("pt-BR")}</TableCell>
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
