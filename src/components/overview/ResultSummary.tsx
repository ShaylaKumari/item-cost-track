import { formatCurrency, formatPercent } from "@/lib/format";
import type { PeriodResult } from "@/types/domain";

/**
 * Resultado do período em forma de conta, não de cards:
 * vendas − custo dos produtos − despesas = resultado.
 */
export function ResultSummary({ result }: { result: PeriodResult }) {
  const rows = [
    { label: "Vendas", value: result.revenue, sign: "" },
    { label: "Custo dos produtos vendidos", value: result.productCost, sign: "−" },
    { label: "Despesas", value: result.expenses, sign: "−" },
  ];

  return (
    <section aria-label="Resultado do período" className="rounded border border-border bg-card">
      <dl className="divide-y divide-border">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-4 px-4 py-3">
            <dt className="text-sm text-muted-foreground">{row.label}</dt>
            <dd className="tabular text-sm">
              {row.sign}
              {formatCurrency(row.value)}
            </dd>
          </div>
        ))}

        <div className="flex items-baseline justify-between gap-4 bg-secondary/60 px-4 py-3.5">
          <dt className="text-sm font-medium">Resultado</dt>
          <dd className="text-right">
            <span
              className={`tabular text-lg font-semibold ${
                result.result >= 0 ? "text-positive" : "text-negative"
              }`}
            >
              {formatCurrency(result.result)}
            </span>
            <span className="ml-2 text-xs text-muted-foreground">
              margem {formatPercent(result.margin)}
            </span>
          </dd>
        </div>
      </dl>
    </section>
  );
}
