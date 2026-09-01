import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { PageHeader } from "@/components/common/PageHeader";
import { RowActions } from "@/components/common/RowActions";
import { EmptyState, ErrorBlock, LoadingRows } from "@/components/common/StateBlocks";
import { AppShell } from "@/components/layout/AppShell";
import { RecipeFormDialog } from "@/components/recipes/RecipeFormDialog";
import { Button } from "@/components/ui/button";
import { useDeleteRecipe, useSupplies, useRecipes } from "@/hooks/use-custeia";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import type { RecipeWithCosts } from "@/types/domain";

export const Route = createFileRoute("/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos e precificação — Custeia" },
      {
        name: "description",
        content:
          "Monte receitas com seus insumos, veja o custo por unidade e defina o preço de venda com margem clara.",
      },
      { property: "og:title", content: "Produtos e precificação — Custeia" },
      {
        property: "og:description",
        content: "Custo, preço, lucro e margem de cada produto em uma única tela.",
      },
    ],
  }),
  component: RecipesPage,
});

function RecipesPage() {
  const recipes = useRecipes();
  const supplies = useSupplies();
  const deleteRecipe = useDeleteRecipe();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RecipeWithCosts | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<RecipeWithCosts | undefined>(undefined);
  const [expanded, setExpanded] = useState<string | null>(null);

  const hasSupplies = (supplies.data ?? []).length > 0;

  function openNew() {
    setEditing(undefined);
    setFormOpen(true);
  }

  return (
    <AppShell>
      <PageHeader
        title="Produtos"
        description="Cada produto é uma receita. O custo vem dos insumos; o preço de venda define seu lucro."
        actions={
          <Button onClick={openNew} disabled={!hasSupplies}>
            Novo produto
          </Button>
        }
      />

      {recipes.isPending ? (
        <LoadingRows rows={3} />
      ) : recipes.isError ? (
        <ErrorBlock onRetry={() => void recipes.refetch()} />
      ) : !hasSupplies ? (
        <EmptyState
          title="Cadastre insumos antes de criar um produto."
          hint="O custo da receita é calculado a partir dos insumos, então eles precisam existir primeiro."
        />
      ) : (recipes.data ?? []).length === 0 ? (
        <EmptyState
          title="Você ainda não cadastrou nenhum produto."
          hint="Crie uma receita informando o rendimento e os insumos utilizados."
          action={<Button onClick={openNew}>Cadastrar produto</Button>}
        />
      ) : (
        <ul className="space-y-3">
          {(recipes.data ?? []).map((recipe) => {
            const isOpen = expanded === recipe.id;
            return (
              <li key={recipe.id} className="rounded border border-border bg-card">
                <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <h2 className="font-medium">{recipe.name}</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Rende {formatNumber(recipe.yield_quantity)} {recipe.yield_unit} ·{" "}
                      {recipe.items.length} insumo{recipe.items.length === 1 ? "" : "s"}
                    </p>
                    {recipe.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">{recipe.description}</p>
                    ) : null}
                  </div>
                  <RowActions
                    itemLabel={recipe.name}
                    onEdit={() => {
                      setEditing(recipe);
                      setFormOpen(true);
                    }}
                    onDelete={() => setPendingDelete(recipe)}
                  />
                </div>

                <dl className="grid grid-cols-2 gap-y-3 border-t border-border px-4 py-3 sm:grid-cols-4">
                  <PriceCell label="Custo unitário" value={formatCurrency(recipe.unit_cost)} />
                  <PriceCell
                    label="Preço de venda"
                    value={recipe.selling_price === null ? "Não definido" : formatCurrency(recipe.selling_price)}
                    muted={recipe.selling_price === null}
                  />
                  <PriceCell
                    label="Lucro por unidade"
                    value={formatCurrency(recipe.unit_profit)}
                    tone={
                      recipe.unit_profit === null
                        ? undefined
                        : recipe.unit_profit >= 0
                          ? "positive"
                          : "negative"
                    }
                  />
                  <PriceCell
                    label="Margem"
                    value={formatPercent(recipe.margin)}
                    tone={
                      recipe.margin === null ? undefined : recipe.margin >= 0 ? "positive" : "negative"
                    }
                  />
                </dl>

                <div className="border-t border-border px-2 py-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-[13px]"
                    aria-expanded={isOpen}
                    onClick={() => setExpanded(isOpen ? null : recipe.id)}
                  >
                    {isOpen ? "Ocultar receita" : "Ver receita"}
                  </Button>
                </div>

                {isOpen ? (
                  <div className="border-t border-border px-4 py-3">
                    <table className="w-full text-sm">
                      <caption className="sr-only">Insumos de {recipe.name}</caption>
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                          <th scope="col" className="pb-2 font-medium">
                            Insumo
                          </th>
                          <th scope="col" className="pb-2 font-medium">
                            Quantidade
                          </th>
                          <th scope="col" className="pb-2 text-right font-medium">
                            Custo
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {recipe.items.map((item) => (
                          <tr key={item.id}>
                            <td className="py-2">{item.supply.name}</td>
                            <td className="tabular py-2 text-muted-foreground">
                              {formatNumber(item.quantity)} {item.supply.purchase_unit}
                            </td>
                            <td className="tabular py-2 text-right">
                              {formatCurrency(item.line_cost)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-border font-medium">
                          <td className="py-2" colSpan={2}>
                            Custo total da receita
                          </td>
                          <td className="tabular py-2 text-right">
                            {formatCurrency(recipe.total_cost)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <RecipeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        recipe={editing}
        supplies={supplies.data ?? []}
      />

      <ConfirmDeleteDialog
        open={pendingDelete !== undefined}
        onOpenChange={(open) => !open && setPendingDelete(undefined)}
        title={`Excluir "${pendingDelete?.name ?? ""}"?`}
        description="A receita e seus ingredientes serão removidos. Vendas já registradas impedem a exclusão."
        isPending={deleteRecipe.isPending}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteRecipe.mutate(pendingDelete.id, { onSettled: () => setPendingDelete(undefined) });
        }}
      />
    </AppShell>
  );
}

function PriceCell({
  label,
  value,
  tone,
  muted,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative" | undefined;
  muted?: boolean | undefined;
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={`tabular mt-0.5 text-sm font-medium ${
          muted
            ? "font-normal text-muted-foreground"
            : tone === "positive"
              ? "text-positive"
              : tone === "negative"
                ? "text-negative"
                : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
