import { formatCurrency, formatShortDate } from "@/lib/format";
import type { PeriodResult } from "@/types/domain";

/**
 * Evolução das vendas em barras simples. Só faz sentido a partir de três dias
 * com venda; abaixo disso a lista de vendas já comunica melhor.
 */
export function SalesTrend({ daily }: { daily: PeriodResult["daily"] }) {
  if (daily.length < 3) return null;

  const max = Math.max(...daily.map((day) => day.revenue));

  return (
    <section aria-label="Evolução das vendas no período" className="mt-8">
      <h2 className="text-sm font-medium">Vendas por dia</h2>
      <ul className="mt-3 space-y-1.5">
        {daily.map((day) => (
          <li key={day.date} className="flex items-center gap-3 text-xs">
            <span className="tabular w-10 shrink-0 text-muted-foreground">
              {formatShortDate(day.date)}
            </span>
            <span className="h-2.5 min-w-px flex-1">
              <span
                className="block h-2.5 bg-primary/80"
                style={{ width: `${max > 0 ? (day.revenue / max) * 100 : 0}%` }}
              />
            </span>
            <span className="tabular w-24 shrink-0 text-right">{formatCurrency(day.revenue)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
