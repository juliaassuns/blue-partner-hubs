import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Fragment, useState } from "react";
import { CheckCircle2, Cloud, XCircle } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { KpiCard, PageHeader, tooltipStyle } from "@/components/ui-kit";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PRODUTOS } from "@/lib/data/dataset";

export const Route = createFileRoute("/clientes-partner-center")({
  head: () => ({
    meta: [
      { title: "Clientes (Partner Center) | BluePartner Intelligence Center" },
      {
        name: "description",
        content: "Clientes reais da BluePartner, licenças e gaps calculados via API do Partner Center.",
      },
    ],
  }),
  component: ClientesPartnerCenter,
});

type ClienteReal = { id: string; nome: string; tenant: string };
type ClientesResponse = { clientes: ClienteReal[]; total: number };

type Assinatura = { nome: string; quantidade: number; status: string; renovacao: string | null; autoRenova: boolean | null };
type DetalheResponse = {
  licencas: { ok: true; produtos: string[]; gapsCriticos: string[]; pontosPotenciais: number } | { ok: false; erro: string };
  assinaturas: { ok: true; itens: Assinatura[] } | { ok: false; erro: string };
};

async function buscarClientes(): Promise<ClientesResponse> {
  const res = await fetch("/api/partnercenter/customers");
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<ClientesResponse>;
}

function ClientesPartnerCenter() {
  const [expandido, setExpandido] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["partnercenter-customers"],
    queryFn: buscarClientes,
    retry: false,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Clientes (Partner Center)"
        descricao="Base real de clientes da BluePartner, com licenças e gaps calculados via API do Partner Center"
        acoes={
          <Badge variant="outline" className="gap-1">
            <Cloud className="size-3.5" /> dados reais
          </Badge>
        }
      />

      {isError && (
        <Card className="border-destructive/40">
          <CardContent className="space-y-1 p-4 text-sm text-destructive">
            <p>Não foi possível carregar os clientes do Partner Center: {error instanceof Error ? error.message : "erro desconhecido"}.</p>
            <p className="text-muted-foreground">
              Confirme se PARTNERCENTER_TENANT_ID / PARTNERCENTER_CLIENT_ID / PARTNERCENTER_CLIENT_SECRET estão
              configurados e se o app foi cadastrado em Partner Center → Configurações da conta → Gerenciamento de
              aplicativos.
            </p>
          </CardContent>
        </Card>
      )}

      {!isError && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <KpiCard label="Clientes (Partner Center)" valor={isLoading ? "…" : data?.total ?? 0} detalhe="base real" />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Base de clientes real</CardTitle>
          <CardDescription>Clique num cliente para carregar licenças e gaps calculados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tenant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={2} className="py-8 text-center text-muted-foreground">
                      Carregando clientes reais do Partner Center...
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && !isError && data?.clientes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="py-8 text-center text-muted-foreground">
                      Nenhum cliente encontrado na conta do Partner Center.
                    </TableCell>
                  </TableRow>
                )}
                {data?.clientes.map((c) => (
                  <Fragment key={c.id}>
                    <TableRow
                      className="cursor-pointer"
                      onClick={() => setExpandido(expandido === c.id ? null : c.id)}
                    >
                      <TableCell className="font-medium">{c.nome}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{c.tenant}</TableCell>
                    </TableRow>
                    {expandido === c.id && <DetalheRow clienteId={c.id} />}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DetalheRow({ clienteId }: { clienteId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["partnercenter-customer-detalhe", clienteId],
    queryFn: async () => {
      const res = await fetch(`/api/partnercenter/customers/${clienteId}`);
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<DetalheResponse>;
    },
    retry: false,
  });

  return (
    <TableRow>
      <TableCell colSpan={2} className="bg-secondary/30">
        {isLoading && <p className="py-2 text-sm text-muted-foreground">Carregando licenças e assinaturas...</p>}
        {isError && <p className="py-2 text-sm text-destructive">Não foi possível carregar os detalhes deste cliente.</p>}
        {data && (
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Produtos ativos</p>
              {data.licencas.ok ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    {PRODUTOS.map((p) => {
                      const ativo = data.licencas.ok && data.licencas.produtos.includes(p);
                      return (
                        <span
                          key={p}
                          className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-xs ${
                            ativo ? "border-success/30 bg-success/10" : "border-border text-muted-foreground"
                          }`}
                        >
                          {ativo ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />} {p}
                        </span>
                      );
                    })}
                  </div>
                  {data.licencas.gapsCriticos.length === 0 ? (
                    <p className="mt-3 text-sm text-muted-foreground">Nenhum gap crítico detectado.</p>
                  ) : (
                    <ul className="mt-3 space-y-1 text-sm">
                      {data.licencas.gapsCriticos.map((g) => (
                        <li key={g}>• {g}</li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-2 text-sm font-semibold text-success">
                    +{data.licencas.pontosPotenciais} pts MAICPP potenciais
                  </p>
                </>
              ) : (
                <p className="text-sm text-destructive">{data.licencas.erro}</p>
              )}
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Assinaturas</p>
              {data.assinaturas.ok ? (
                data.assinaturas.itens.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma assinatura encontrada.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {data.assinaturas.itens.map((a, i) => (
                      <li key={i} className="rounded border border-border bg-secondary/30 p-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{a.nome}</span>
                          <Badge variant="secondary">{a.status}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {a.quantidade} licenças
                          {a.renovacao ? ` · renova em ${new Date(a.renovacao).toLocaleDateString("pt-BR")}` : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                )
              ) : (
                <p className="text-sm text-destructive">{data.assinaturas.erro}</p>
              )}
            </div>
          </div>
        )}
        {data && <EvolucaoCliente clienteId={clienteId} />}
      </TableCell>
    </TableRow>
  );
}

type PontoHistorico = { data: string; produtosAtivos: number; pontosPotenciais: number };

function EvolucaoCliente({ clienteId }: { clienteId: string }) {
  const { data } = useQuery({
    queryKey: ["partnercenter-historico", clienteId],
    queryFn: async () => {
      const res = await fetch(`/api/partnercenter/historico/${clienteId}`);
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<{ pontos: PontoHistorico[] }>;
    },
    retry: false,
  });

  if (!data || data.pontos.length < 2) return null;

  return (
    <div className="mt-4 border-t border-border pt-4">
      <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
        Evolução ({data.pontos.length} snapshots)
      </p>
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.pontos}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="data" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
            <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="produtosAtivos" name="Produtos ativos" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="pontosPotenciais" name="Pts MAICPP potenciais" stroke="var(--chart-3)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
