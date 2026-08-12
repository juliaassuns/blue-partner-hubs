import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

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
import { clientes, clientesQueParamDePontuar, rankingRevendas, totais } from "@/lib/data/dataset";

export const Route = createFileRoute("/clientes/")({
  head: () => ({
    meta: [
      { title: "Clientes | BluePartner Intelligence Center" },
      {
        name: "description",
        content:
          "Base completa de clientes por parceiro MAICPP com adoção de produtos Microsoft e score de oportunidade.",
      },
      { property: "og:title", content: "Clientes | BluePartner" },
      { property: "og:description", content: "Drill down de clientes e oportunidades Microsoft." },
    ],
  }),
  component: ClientesIndex,
});

function ClientesIndex() {
  const [busca, setBusca] = useState("");
  const [revenda, setRevenda] = useState("todas");
  const [status, setStatus] = useState("todos");
  const [ordem, setOrdem] = useState("oportunidade");

  const lista = useMemo(() => {
    const filtrados = clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(busca.toLowerCase()) &&
        (revenda === "todas" || c.revendaId === revenda) &&
        (status === "todos" || (status === "Parou de pontuar" ? !c.contribuindo : c.status === status)),
    );
    const sorted = [...filtrados].sort((a, b) => {
      if (ordem === "usuarios") return b.usuarios - a.usuarios;
      if (ordem === "adocao") return b.adocao - a.adocao;
      if (ordem === "nome") return a.nome.localeCompare(b.nome);
      return b.scoreOportunidade - a.scoreOportunidade;
    });
    return sorted.slice(0, 200);
  }, [busca, revenda, status, ordem]);

  const emRisco = clientes.filter((c) => c.status === "Em risco").length;
  const semCopilot = clientes.filter((c) => !c.produtos.includes("Copilot")).length;
  const semDefender = clientes.filter((c) => !c.produtos.includes("Defender")).length;
  const pararamDePontuar = clientesQueParamDePontuar().length;

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Clientes"
        descricao="Drill down por parceiro MAICPP, produtos utilizados e oportunidades detectadas"
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Clientes" valor={totais.clientes} detalhe={`${totais.usuariosGerenciados.toLocaleString("pt-BR")} usuários`} />
        <KpiCard label="Em risco" valor={emRisco} tom="danger" />
        <KpiCard label="Pararam de pontuar" valor={pararamDePontuar} tom="danger" detalhe="últimos 3 meses" />
        <KpiCard label="Sem Copilot" valor={semCopilot} tom="warning" detalhe="oportunidade Modern Work" />
        <KpiCard label="Sem Defender" valor={semDefender} tom="warning" detalhe="oportunidade Security" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Base de clientes</CardTitle>
          <CardDescription>Exibindo os 200 primeiros resultados dos filtros aplicados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Input placeholder="Buscar cliente..." value={busca} onChange={(e) => setBusca(e.target.value)} />
            <Select value={revenda} onValueChange={setRevenda}>
              <SelectTrigger><SelectValue placeholder="Parceiro" /></SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="todas">Todos os parceiros</SelectItem>
                {rankingRevendas.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                {["todos", "Ativo", "Renovação próxima", "Em risco", "Parou de pontuar"].map((s) => (
                  <SelectItem key={s} value={s}>{s === "todos" ? "Todos os status" : s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={ordem} onValueChange={setOrdem}>
              <SelectTrigger><SelectValue placeholder="Ordenar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="oportunidade">Maior oportunidade</SelectItem>
                <SelectItem value="usuarios">Mais usuários</SelectItem>
                <SelectItem value="adocao">Maior adoção</SelectItem>
                <SelectItem value="nome">Nome (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto rounded border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Parceiro</TableHead>
                  <TableHead className="text-right">Usuários</TableHead>
                  <TableHead>Licenciamento</TableHead>
                  <TableHead className="text-right">Adoção</TableHead>
                  <TableHead className="text-right">Score oport.</TableHead>
                  <TableHead className="text-right">+Pontos</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link to="/clientes/$id" params={{ id: c.id }} className="font-medium hover:text-primary">
                        {c.nome}
                      </Link>
                      <p className="text-xs text-muted-foreground">{c.tenant}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {rankingRevendas.find((r) => r.id === c.revendaId)?.nome}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{c.usuarios.toLocaleString("pt-BR")}</TableCell>
                    <TableCell><Badge variant="secondary">{c.licenciamento}</Badge></TableCell>
                    <TableCell className="text-right tabular-nums">{c.adocao}%</TableCell>
                    <TableCell className="text-right tabular-nums">{c.scoreOportunidade}</TableCell>
                    <TableCell className="text-right tabular-nums text-success">+{c.pontosPotenciais}</TableCell>
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
