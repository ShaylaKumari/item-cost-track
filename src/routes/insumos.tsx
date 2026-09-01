import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { PageHeader } from "@/components/common/PageHeader";
import { RowActions } from "@/components/common/RowActions";
import { EmptyState, ErrorBlock, LoadingRows } from "@/components/common/StateBlocks";
import { SupplyFormDialog } from "@/components/supplies/SupplyFormDialog";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDeleteSupply, useSupplies } from "@/hooks/use-custeia";
import { supplyUnitCost } from "@/lib/calculations";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { Supply } from "@/types/domain";

export const Route = createFileRoute("/insumos")({
  head: () => ({
    meta: [
      { title: "Insumos — Custeia" },
      {
        name: "description",
        content:
          "Cadastre os insumos do seu negócio com unidade, quantidade e custo para calcular o custo das receitas.",
      },
      { property: "og:title", content: "Insumos — Custeia" },
      {
        property: "og:description",
        content: "Controle o custo dos insumos usados nas suas receitas.",
      },
    ],
  }),
  component: SuppliesPage,
});

function SuppliesPage() {
  const supplies = useSupplies();
  const deleteSupply = useDeleteSupply();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Supply | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<Supply | undefined>(undefined);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return supplies.data ?? [];
    return (supplies.data ?? []).filter((item) => item.name.toLowerCase().includes(term));
  }, [supplies.data, search]);

  function openNew() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(supply: Supply) {
    setEditing(supply);
    setFormOpen(true);
  }

  return (
    <AppShell>
      <PageHeader
        title="Insumos"
        description="Tudo que você compra para produzir. O custo por unidade alimenta o cálculo das receitas."
        actions={<Button onClick={openNew}>Novo insumo</Button>}
      />

      <div className="mb-4 max-w-xs">
        <Input
          type="search"
          placeholder="Pesquisar insumo"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Pesquisar insumo"
        />
      </div>

      {supplies.isPending ? (
        <LoadingRows />
      ) : supplies.isError ? (
        <ErrorBlock onRetry={() => void supplies.refetch()} />
      ) : (supplies.data ?? []).length === 0 ? (
        <EmptyState
          title="Você ainda não cadastrou nenhum insumo."
          hint="Comece pelos itens que você compra com mais frequência, como farinha, açúcar e embalagens."
          action={<Button onClick={openNew}>Cadastrar insumo</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState title={`Nenhum insumo encontrado para "${search.trim()}".`} />
      ) : (
        <>
          {/* Desktop: tabela */}
          <div className="hidden overflow-hidden rounded border border-border bg-card md:block">
            <table className="w-full text-sm">
              <caption className="sr-only">Lista de insumos cadastrados</caption>
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Insumo
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Quantidade
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">
                    Custo da compra
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">
                    Custo por unidade
                  </th>
                  <th scope="col" className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <span className="font-medium">{item.name}</span>
                      {item.notes ? (
                        <span className="block text-xs text-muted-foreground">{item.notes}</span>
                      ) : null}
                    </td>
                    <td className="tabular px-4 py-3 text-muted-foreground">
                      {formatNumber(item.quantity)} {item.unit}
                    </td>
                    <td className="tabular px-4 py-3 text-right">{formatCurrency(item.cost)}</td>
                    <td className="tabular px-4 py-3 text-right">
                      {formatCurrency(supplyUnitCost(item))}
                      <span className="text-muted-foreground">/{item.unit}</span>
                    </td>
                    <td className="px-2 py-3">
                      <RowActions
                        itemLabel={item.name}
                        onEdit={() => openEdit(item)}
                        onDelete={() => setPendingDelete(item)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: lista */}
          <ul className="divide-y divide-border rounded border border-border bg-card md:hidden">
            {filtered.map((item) => (
              <li key={item.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(item.quantity)} {item.unit} · {formatCurrency(item.cost)}
                    </p>
                  </div>
                  <p className="tabular shrink-0 text-sm">
                    {formatCurrency(supplyUnitCost(item))}
                    <span className="text-muted-foreground">/{item.unit}</span>
                  </p>
                </div>
                <div className="mt-1">
                  <RowActions
                    itemLabel={item.name}
                    onEdit={() => openEdit(item)}
                    onDelete={() => setPendingDelete(item)}
                  />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <SupplyFormDialog open={formOpen} onOpenChange={setFormOpen} supply={editing} />

      <ConfirmDeleteDialog
        open={pendingDelete !== undefined}
        onOpenChange={(open) => !open && setPendingDelete(undefined)}
        title={`Excluir "${pendingDelete?.name ?? ""}"?`}
        description="O insumo será removido do cadastro. Receitas que já usam este insumo precisam ser ajustadas antes."
        isPending={deleteSupply.isPending}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteSupply.mutate(pendingDelete.id, {
            onSettled: () => setPendingDelete(undefined),
          });
        }}
      />
    </AppShell>
  );
}
