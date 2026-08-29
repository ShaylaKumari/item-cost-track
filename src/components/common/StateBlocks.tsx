import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border rounded border border-border bg-card">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 px-4 py-3.5">
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-4 w-1/5" />
          <Skeleton className="ml-auto h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export function ErrorBlock({
  message = "Não conseguimos carregar estas informações.",
  onRetry,
}: {
  message?: string | undefined;
  onRetry?: (() => void) | undefined;
}) {
  return (
    <div
      role="alert"
      className="rounded border border-destructive/30 bg-destructive/5 px-4 py-5 text-sm"
    >
      <p className="font-medium">{message}</p>
      <p className="mt-1 text-muted-foreground">
        Verifique sua conexão e tente novamente em alguns instantes.
      </p>
      {onRetry ? (
        <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          Tentar novamente
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string | undefined;
  action?: ReactNode;
}) {
  return (
    <div className="rounded border border-dashed border-border bg-card px-4 py-10 text-center">
      <p className="text-sm font-medium">{title}</p>
      {hint ? <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{hint}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
