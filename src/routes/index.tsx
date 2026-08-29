import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { PeriodSelect, resolvePeriod, type PeriodPreset } from "@/components/overview/PeriodSelect";
import { ResultSummary } from "@/components/overview/ResultSummary";
import { SalesTrend } from "@/components/overview/SalesTrend";
import { ErrorBlock, LoadingRows } from "@/components/common/StateBlocks";
import { Button } from "@/components/ui/button";
import { usePeriodResult, useSales } from "@/hooks/use-custeia";
import { formatCurrency, formatDate } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Custeia — custo, preço e resultado do seu negócio" },
      {
        name: "description",
        content:
          "O Custeia mostra quanto custa produzir, por quanto vender e qual foi o resultado do período para pequenos negócios.",
      },
      { property: "og:title", content: "Custeia — custo, preço e resultado" },
      {
        property: "og:description",
        content: "Controle de custos, precificação, vendas e despesas para pequenos negócios.",
      },
    ],
  }),
  component: OverviewPage,
});

function OverviewPage() {
  const [preset, setPreset] = useState<PeriodPreset>("currentMonth");
  const period = useMemo(() => resolvePeriod(preset), [preset]);
  const result = usePeriodResult(period);
  const sales = useSales();

  const recentSales = (sales.data ?? []).slice(0, 5);

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Visão geral</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate(period.from)} a {formatDate(period.to)}
          </p>
        </div>
        <PeriodSelect value={preset} onChange={setPreset} />
      </div>

      {result.isPending ? (
        <LoadingRows rows={4} />
      ) : result.isError ? (
        <ErrorBlock onRetry={() => void result.refetch()} />
      ) : result.data.salesCount === 0 && result.data.expenses === 0 ? (
        <div className="rounded border border-dashed border-border bg-card px-4 py-10 text-center">
          <p className="text-sm font-medium">Nenhum movimento neste período.</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Registre vendas e despesas para acompanhar o resultado, ou escolha outro período.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button asChild size="sm">
              <Link to="/vendas">Registrar venda</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/despesas">Registrar despesa</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <ResultSummary result={result.data} />
          <p className="mt-2 text-xs text-muted-foreground">
            {result.data.salesCount} venda{result.data.salesCount === 1 ? "" : "s"} no período. O
            custo dos produtos usa o custo atual das receitas.
          </p>

          <SalesTrend daily={result.data.daily} />

          {recentSales.length > 0 ? (
            <section aria-label="Últimas vendas" className="mt-8">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-sm font-medium">Últimas vendas</h2>
                <Link to="/vendas" className="text-[13px] text-primary underline-offset-4 hover:underline">
                  Ver todas
                </Link>
              </div>
              <ul className="mt-3 divide-y divide-border rounded border border-border bg-card">
                {recentSales.map((sale) => (
                  <li key={sale.id} className="flex items-center justify-between gap-4 px-4 py-2.5">
                    <span className="tabular text-sm">{formatDate(sale.sale_date)}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {sale.items.map((item) => item.recipe_name).join(", ")}
                    </span>
                    <span className="tabular text-sm font-medium">
                      {formatCurrency(sale.total_amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </AppShell>
  );
}
