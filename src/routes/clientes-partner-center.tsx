import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Fragment, useState } from "react";
import { CheckCircle2, Cloud, XCircle } from "lucide-react";

import { KpiCard, PageHeader } from "@/components/ui-kit";
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
type GapsResponse = { produtos: string[]; gapsCriticos: string[]; pontosPotenciais: number };

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
                    {expandido === c.id && <GapsRow clienteId={c.id} />}
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

function GapsRow({ clienteId }: { clienteId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["partnercenter-customer-gaps", clienteId],
    queryFn: async () => {
      const res = await fetch(`/api/partnercenter/customers/${clienteId}`);
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<GapsResponse>;
    },
    retry: false,
  });

  return (
    <TableRow>
      <TableCell colSpan={2} className="bg-secondary/30">
        {isLoading && <p className="text-sm text-muted-foreground">Carregando licenças...</p>}
        {isError && <p className="text-sm text-destructive">Não foi possível carregar as licenças deste cliente.</p>}
        {data && (
          <div className="grid gap-3 py-2 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Produtos ativos</p>
              <div className="flex flex-wrap gap-2">
                {PRODUTOS.map((p) => {
                  const ativo = data.produtos.includes(p);
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
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Gaps e potencial</p>
              {data.gapsCriticos.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum gap crítico detectado.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {data.gapsCriticos.map((g) => (
                    <li key={g}>• {g}</li>
                  ))}
                </ul>
              )}
              <p className="mt-2 text-sm font-semibold text-success">+{data.pontosPotenciais} pts MAICPP potenciais</p>
            </div>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}
