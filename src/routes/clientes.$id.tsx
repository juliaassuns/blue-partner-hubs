import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AlertOctagon, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

import { KpiCard, PageHeader, StatusDot } from "@/components/ui-kit";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { clienteById, PRODUTOS, revendaById } from "@/lib/data/dataset";

export const Route = createFileRoute("/clientes/$id")({
  loader: ({ params }) => {
    const cliente = clienteById(params.id);
    if (!cliente) throw notFound();
    return { nome: cliente.nome };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.nome ?? "Cliente"} | Clientes BluePartner` },
      {
        name: "description",
        content: `Tenant, licenciamento, adoção de produtos Microsoft e oportunidades do cliente ${loaderData?.nome ?? ""}.`,
      },
      { property: "og:title", content: `${loaderData?.nome ?? "Cliente"} | BluePartner` },
      { property: "og:description", content: "Ficha detalhada do cliente e oportunidades." },
    ],
  }),
  notFoundComponent: () => <p className="text-muted-foreground">Cliente não encontrado.</p>,
  errorComponent: ({ error }) => <p role="alert">{error.message}</p>,
  component: ClienteDetalhe,
});

function ClienteDetalhe() {
  const { id } = Route.useParams();
  const cliente = clienteById(id)!;
  const revenda = revendaById(cliente.revendaId)!;

  return (
    <div className="space-y-6">
      <Link to="/clientes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Clientes
      </Link>
      <PageHeader
        titulo={cliente.nome}
        descricao={`${cliente.tenant} · ${cliente.segmento}`}
        acoes={<StatusDot status={cliente.status} />}
      />

      {!cliente.contribuindo && (
        <div className="flex items-center gap-3 rounded border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
          <AlertOctagon className="size-4 shrink-0 text-destructive" />
          <span>
            Este cliente parou de contribuir pontos MAICPP em <strong>{cliente.mesParouDePontuar}</strong>.
          </span>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Usuários" valor={cliente.usuarios.toLocaleString("pt-BR")} />
        <KpiCard label="Licenciamento" valor={<span className="text-base">{cliente.licenciamento}</span>} />
        <KpiCard label="Renovação" valor={<span className="text-base">{new Date(cliente.renovacao).toLocaleDateString("pt-BR")}</span>} tom="warning" />
        <KpiCard label="Adoção" valor={`${cliente.adocao}%`} tom={cliente.adocao > 60 ? "success" : "warning"} />
        <KpiCard label="Score de oportunidade" valor={cliente.scoreOportunidade} detalhe={`+${cliente.pontosPotenciais} pontos MAICPP`} tom="success" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Produtos utilizados</CardTitle>
            <CardDescription>Portfólio Microsoft ativo no tenant</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PRODUTOS.map((p) => {
              const ativo = cliente.produtos.includes(p);
              return (
                <div
                  key={p}
                  className={`flex items-center gap-2 rounded border p-2 text-sm ${
                    ativo ? "border-success/30 bg-success/10" : "border-border bg-secondary/30 text-muted-foreground"
                  }`}
                >
                  {ativo ? (
                    <CheckCircle2 className="size-4 shrink-0 text-success" />
                  ) : (
                    <XCircle className="size-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="truncate">{p}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Painel de oportunidades</CardTitle>
            <CardDescription>Gaps detectados automaticamente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {cliente.gapsCriticos.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum gap crítico detectado neste cliente.</p>
            )}
            {cliente.gapsCriticos.map((g) => (
              <div key={g} className="flex items-center justify-between rounded border border-warning/30 bg-warning/10 px-3 py-2 text-sm">
                <span>{g}</span>
                <Badge variant="outline" className="border-warning/40 text-warning">oportunidade</Badge>
              </div>
            ))}
            <div className="pt-2">
              <p className="mb-1 text-xs text-muted-foreground">Nível de adoção do portfólio</p>
              <Progress value={cliente.adocao} className={cliente.adocao > 60 ? "[&>div]:bg-success" : "[&>div]:bg-warning"} />
            </div>
            <p className="text-sm">
              Potencial de geração de pontos:{" "}
              <span className="font-semibold text-success">+{cliente.pontosPotenciais} pts MAICPP</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenda responsável</CardTitle>
        </CardHeader>
        <CardContent>
          <Link
            to="/revendas/$id"
            params={{ id: revenda.id }}
            className="flex flex-wrap items-center justify-between gap-3 rounded border border-border bg-secondary/30 p-3 hover:border-primary/60"
          >
            <div>
              <p className="font-medium">{revenda.nome}</p>
              <p className="text-xs text-muted-foreground">
                {revenda.gerente} · {revenda.cidade} · {revenda.qtdClientes} clientes
              </p>
            </div>
            <Badge variant="secondary">{revenda.contribuicaoMaicpp.toFixed(1)} pts MAICPP</Badge>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
