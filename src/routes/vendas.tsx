import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState, ErrorBlock, LoadingRows } from "@/components/common/StateBlocks";
import { AppShell } from "@/components/layout/AppShell";
import { SaleDetailDialog } from "@/components/sales/SaleDetailDialog";
import { SaleFormDialog } from "@/components/sales/SaleFormDialog";
import { Button } from "@/components/ui/button";
import { useDeleteSale, useRecipes, useSales } from "@/hooks/use-custeia";
import { formatCurrency, formatDate } from "@/lib/format";
import type { SaleWithItems } from "@/types/domain";

export const Route = createFileRoute("/vendas")({
  head: () => ({
    meta: [
      { title: "Vendas — Custeia" },
      {
        name: "description",
        content:
          "Registre as vendas do seu negócio, veja o valor total de cada uma e o resultado por venda.",
      },
      { property: "og:title", content: "Vendas — Custeia" },
      {
        property: "og:description",
        content: "Histórico de vendas com valores e resultado por venda.",
      },
    ],
  }),
  component: SalesPage,
});

function SalesPage() {
  const sales = useSales();
  const recipes = useRecipes();
  const deleteSale = useDeleteSale();

  const [formOpen, setFormOpen] = useState(false);
  const [detail, setDetail] = useState<SaleWithItems | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<SaleWithItems | undefined>(undefined);

  const hasRecipes = (recipes.data ?? []).length > 0;

  return (
    <AppShell>
      <PageHeader
        title="Vendas"
        description="Cada venda pode ter vários produtos. O total é calculado automaticamente."
        actions={
          <Button onClick={() => setFormOpen(true)} disabled={!hasRecipes}>
            Registrar venda
          </Button>
        }
      />

      {sales.isPending ? (
        <LoadingRows />
      ) : sales.isError ? (
        <ErrorBlock onRetry={() => void sales.refetch()} />
      ) : !hasRecipes ? (
        <EmptyState
          title="Cadastre produtos antes de registrar vendas."
          hint="A venda é composta pelos produtos que você já tem cadastrados."
        />
      ) : (sales.data ?? []).length === 0 ? (
        <EmptyState
          title="Você ainda não registrou nenhuma venda."
          hint="Informe a data, os produtos e as quantidades vendidas."
          action={<Button onClick={() => setFormOpen(true)}>Registrar venda</Button>}
        />
      ) : (
        <ul className="divide-y divide-border rounded border border-border bg-card">
          {(sales.data ?? []).map((sale) => {
            const itemCount = sale.items.reduce((sum, item) => sum + item.quantity, 0);
            return (
              <li key={sale.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                <div className="min-w-[8rem]">
                  <p className="tabular text-sm font-medium">{formatDate(sale.sale_date)}</p>
                  <p className="text-xs text-muted-foreground">
                    {itemCount} item{itemCount === 1 ? "" : "s"} ·{" "}
                    {sale.items.map((item) => item.recipe_name).join(", ")}
                  </p>
                </div>

                <p className="tabular ml-auto text-sm font-medium">
                  {formatCurrency(sale.total_amount)}
                </p>

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-[13px]"
                    onClick={() => setDetail(sale)}
                  >
                    Detalhes
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-[13px] text-muted-foreground hover:text-destructive"
                    onClick={() => setPendingDelete(sale)}
                    aria-label={`Excluir venda de ${formatDate(sale.sale_date)}`}
                  >
                    Excluir
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <SaleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        recipes={recipes.data ?? []}
      />

      <SaleDetailDialog sale={detail} onOpenChange={(open) => !open && setDetail(undefined)} />

      <ConfirmDeleteDialog
        open={pendingDelete !== undefined}
        onOpenChange={(open) => !open && setPendingDelete(undefined)}
        title="Excluir esta venda?"
        description={`A venda de ${
          pendingDelete ? formatDate(pendingDelete.sale_date) : ""
        } será removida do histórico e do cálculo do resultado.`}
        isPending={deleteSale.isPending}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteSale.mutate(pendingDelete.id, { onSettled: () => setPendingDelete(undefined) });
        }}
      />
    </AppShell>
  );
}
