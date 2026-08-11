import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, TrendingUp, Trophy } from "lucide-react";

import { KpiCard, PageHeader, StatusDot } from "@/components/ui-kit";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { rankingRevendas } from "@/lib/data/dataset";

export const Route = createFileRoute("/revendas/")({
  head: () => ({
    meta: [
      { title: "Revendas CSP | BluePartner Intelligence Center" },
      {
        name: "description",
        content:
          "Ranking, saúde e potencial das aproximadamente 70 revendas CSP do ecossistema BluePartner.",
      },
      { property: "og:title", content: "Revendas CSP | BluePartner" },
      { property: "og:description", content: "Gestão completa das revendas CSP BluePartner." },
    ],
  }),
  component: RevendasIndex,
});

function RevendasIndex() {
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("todos");
  const [segmento, setSegmento] = useState("todos");
  const [ordem, setOrdem] = useState("pontuacao");

  const lista = useMemo(() => {
    const filtradas = rankingRevendas.filter(
      (r) =>
        r.nome.toLowerCase().includes(busca.toLowerCase()) &&
        (status === "todos" || r.status === status) &&
        (segmento === "todos" || r.segmento === segmento),
    );
    return [...filtradas].sort((a, b) => {
      if (ordem === "nome") return a.nome.localeCompare(b.nome);
      if (ordem === "potencial") return b.potencial - a.potencial;
      if (ordem === "saude") return b.saude - a.saude;
      if (ordem === "clientes") return b.qtdClientes - a.qtdClientes;
      return b.contribuicaoMaicpp - a.contribuicaoMaicpp;
    });
  }, [busca, status, segmento, ordem]);

  const emRisco = rankingRevendas.filter((r) => r.saude < 55).slice(0, 6);
  const maiorPotencial = [...rankingRevendas].sort((a, b) => b.potencial - a.potencial).slice(0, 6);
  const top10 = rankingRevendas.slice(0, 10);

  return (
    <div className="space-y-6">
      <PageHeader titulo="Revendas CSP" descricao={`${rankingRevendas.length} revendas no ecossistema BluePartner`} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total de revendas" valor={rankingRevendas.length} />
        <KpiCard label="Ativas" valor={rankingRevendas.filter((r) => r.status === "Ativa").length} tom="success" />
        <KpiCard label="Em risco" valor={emRisco.length} tom="danger" detalhe="saúde abaixo de 55" />
        <KpiCard
          label="Contribuição MAICPP"
          valor={rankingRevendas.reduce((s, r) => s + r.contribuicaoMaicpp, 0).toFixed(0)}
          detalhe="pontos somados"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ListaCard titulo="Top 10 revendas" icone={<Trophy className="size-4 text-warning" />} itens={top10.map((r) => ({ id: r.id, nome: r.nome, valor: `${r.contribuicaoMaicpp.toFixed(1)} pts` }))} />
        <ListaCard titulo="Revendas em risco" icone={<AlertTriangle className="size-4 text-destructive" />} itens={emRisco.map((r) => ({ id: r.id, nome: r.nome, valor: `saúde ${r.saude}` }))} />
        <ListaCard titulo="Maior potencial" icone={<TrendingUp className="size-4 text-success" />} itens={maiorPotencial.map((r) => ({ id: r.id, nome: r.nome, valor: `${r.potencial}%` }))} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ranking geral</CardTitle>
          <CardDescription>Filtre por nome, status, segmento e ordenação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Input placeholder="Buscar revenda..." value={busca} onChange={(e) => setBusca(e.target.value)} />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                {["todos", "Ativa", "Atenção", "Inativa"].map((s) => (
                  <SelectItem key={s} value={s}>{s === "todos" ? "Todos os status" : s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={segmento} onValueChange={setSegmento}>
              <SelectTrigger><SelectValue placeholder="Segmento" /></SelectTrigger>
              <SelectContent>
                {["todos", "Corporate", "SMB", "Enterprise", "Governo", "Educação", "Saúde"].map((s) => (
                  <SelectItem key={s} value={s}>{s === "todos" ? "Todos os segmentos" : s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={ordem} onValueChange={setOrdem}>
              <SelectTrigger><SelectValue placeholder="Ordenar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pontuacao">Maior pontuação</SelectItem>
                <SelectItem value="potencial">Maior potencial</SelectItem>
                <SelectItem value="saude">Melhor saúde</SelectItem>
                <SelectItem value="clientes">Mais clientes</SelectItem>
                <SelectItem value="nome">Nome (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto rounded border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Revenda</TableHead>
                  <TableHead>Gerente</TableHead>
                  <TableHead>Segmento</TableHead>
                  <TableHead className="text-right">Clientes</TableHead>
                  <TableHead className="text-right">MAICPP</TableHead>
                  <TableHead className="w-36">Saúde</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map((r) => (
                  <TableRow key={r.id} className="cursor-pointer">
                    <TableCell className="text-muted-foreground tabular-nums">{r.posicao}</TableCell>
                    <TableCell>
                      <Link to="/revendas/$id" params={{ id: r.id }} className="font-medium hover:text-primary">
                        {r.nome}
                      </Link>
                      <p className="text-xs text-muted-foreground">{r.cidade}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.gerente}</TableCell>
                    <TableCell><Badge variant="secondary">{r.segmento}</Badge></TableCell>
                    <TableCell className="text-right tabular-nums">{r.qtdClientes}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.contribuicaoMaicpp.toFixed(1)}</TableCell>
                    <TableCell>
                      <Progress
                        value={r.saude}
                        className={r.saude > 70 ? "[&>div]:bg-success" : r.saude > 50 ? "[&>div]:bg-warning" : "[&>div]:bg-destructive"}
                      />
                    </TableCell>
                    <TableCell><StatusDot status={r.status} /></TableCell>
                  </TableRow>
                ))}
                {lista.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                      Nenhuma revenda encontrada com os filtros atuais.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ListaCard({
  titulo,
  icone,
  itens,
}: {
  titulo: string;
  icone: React.ReactNode;
  itens: { id: string; nome: string; valor: string }[];
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {icone}
          {titulo}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {itens.map((i, idx) => (
          <Link
            key={i.id}
            to="/revendas/$id"
            params={{ id: i.id }}
            className="flex items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-accent"
          >
            <span className="truncate">
              <span className="mr-2 text-muted-foreground tabular-nums">{idx + 1}.</span>
              {i.nome}
            </span>
            <span className="shrink-0 text-muted-foreground tabular-nums">{i.valor}</span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
