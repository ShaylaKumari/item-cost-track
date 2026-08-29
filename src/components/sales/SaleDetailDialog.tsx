import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/format";
import type { SaleWithItems } from "@/types/domain";

interface SaleDetailDialogProps {
  sale: SaleWithItems | undefined;
  onOpenChange: (open: boolean) => void;
}

export function SaleDetailDialog({ sale, onOpenChange }: SaleDetailDialogProps) {
  return (
    <Dialog open={sale !== undefined} onOpenChange={onOpenChange}>
      <DialogContent className="rounded sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">
            Venda de {sale ? formatDate(sale.sale_date) : ""}
          </DialogTitle>
          <DialogDescription>
            Itens registrados nesta venda e o resultado estimado com base no custo atual das
            receitas.
          </DialogDescription>
        </DialogHeader>

        {sale ? (
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="pb-2 font-medium">
                    Produto
                  </th>
                  <th scope="col" className="pb-2 text-right font-medium">
                    Qtd.
                  </th>
                  <th scope="col" className="pb-2 text-right font-medium">
                    Preço
                  </th>
                  <th scope="col" className="pb-2 text-right font-medium">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sale.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2">{item.recipe_name}</td>
                    <td className="tabular py-2 text-right">{item.quantity}</td>
                    <td className="tabular py-2 text-right">{formatCurrency(item.unit_price)}</td>
                    <td className="tabular py-2 text-right">{formatCurrency(item.total_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <dl className="mt-4 space-y-1.5 border-t border-border pt-3 text-sm">
              <Row label="Valor da venda" value={formatCurrency(sale.total_amount)} />
              <Row label="Custo dos produtos" value={formatCurrency(sale.total_cost)} />
              <Row
                label="Resultado da venda"
                value={formatCurrency(sale.total_amount - sale.total_cost)}
                strong
              />
            </dl>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className={strong ? "font-medium" : "text-muted-foreground"}>{label}</dt>
      <dd className={`tabular ${strong ? "font-medium" : ""}`}>{value}</dd>
    </div>
  );
}
