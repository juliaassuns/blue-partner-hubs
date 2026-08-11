import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { Semaforo } from "@/lib/data/dataset";

export function PageHeader({
  titulo,
  descricao,
  acoes,
}: {
  titulo: string;
  descricao?: string;
  acoes?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
        {descricao && <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>}
      </div>
      {acoes}
    </div>
  );
}

export function KpiCard({
  label,
  valor,
  detalhe,
  icone,
  tom = "default",
}: {
  label: string;
  valor: ReactNode;
  detalhe?: string;
  icone?: ReactNode;
  tom?: "default" | "success" | "warning" | "danger";
}) {
  const tomClass = {
    default: "text-foreground",
    success: "text-success",
    warning: "text-warning",
    danger: "text-destructive",
  }[tom];

  return (
    <Card className="border-border/70 shadow-[var(--shadow-card)]">
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className={cn("mt-2 text-2xl font-semibold tabular-nums", tomClass)}>{valor}</p>
          {detalhe && <p className="mt-1 truncate text-xs text-muted-foreground">{detalhe}</p>}
        </div>
        {icone && <div className="rounded bg-secondary p-2 text-primary">{icone}</div>}
      </CardContent>
    </Card>
  );
}

const semaforoStyles: Record<Semaforo, string> = {
  verde: "bg-success/15 text-success border-success/30",
  amarelo: "bg-warning/15 text-warning border-warning/30",
  vermelho: "bg-destructive/15 text-destructive border-destructive/30",
};

export function SemaforoBadge({ nivel, texto }: { nivel: Semaforo; texto?: string }) {
  const label = texto ?? { verde: "No alvo", amarelo: "Atenção", vermelho: "Crítico" }[nivel];
  return (
    <Badge variant="outline" className={cn("gap-1.5 font-medium", semaforoStyles[nivel])}>
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </Badge>
  );
}

export function ScoreBar({
  valor,
  meta,
  nivel,
}: {
  valor: number;
  meta: number;
  nivel: Semaforo;
}) {
  const indicator = {
    verde: "[&>div]:bg-success",
    amarelo: "[&>div]:bg-warning",
    vermelho: "[&>div]:bg-destructive",
  }[nivel];
  return (
    <div className="space-y-1.5">
      <Progress value={Math.min(100, (valor / meta) * 100)} className={cn("h-2", indicator)} />
      <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
        <span>{valor} pts</span>
        <span>meta {meta}</span>
      </div>
    </div>
  );
}

export function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    Ativa: "bg-success",
    Ativo: "bg-success",
    Atenção: "bg-warning",
    "Renovação próxima": "bg-warning",
    Expirando: "bg-warning",
    Inativa: "bg-destructive",
    "Em risco": "bg-destructive",
    Expirada: "bg-destructive",
    Válida: "bg-success",
    Conquistada: "bg-success",
    "Em andamento": "bg-warning",
    "Não iniciada": "bg-muted-foreground",
    "Não utilizado": "bg-muted-foreground",
  };
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span className={cn("size-2 rounded-full", map[status] ?? "bg-muted-foreground")} />
      {status}
    </span>
  );
}

export const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  color: "var(--popover-foreground)",
  fontSize: 12,
};
