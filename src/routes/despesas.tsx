import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { PageHeader } from "@/components/common/PageHeader";
import { RowActions } from "@/components/common/RowActions";
import { EmptyState, ErrorBlock, LoadingRows } from "@/components/common/StateBlocks";
import { ExpenseFormDialog } from "@/components/expenses/ExpenseFormDialog";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDeleteExpense, useExpenses } from "@/hooks/use-custeia";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Expense } from "@/types/domain";

export const Route = createFileRoute("/despesas")({
  head: () => ({
    meta: [
      { title: "Despesas — Custeia" },
      {
        name: "description",
        content:
          "Registre despesas como aluguel, energia e transporte, separadas dos custos das receitas.",
      },
      { property: "og:title", content: "Despesas — Custeia" },
      {
        property: "og:description",
        content: "Despesas do negócio organizadas por categoria e período.",
      },
    ],
  }),
  component: ExpensesPage,
});

function ExpensesPage() {
  const expenses = useExpenses();
  const deleteExpense = useDeleteExpense();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<Expense | undefined>(undefined);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = expenses.data ?? [];
    if (!term) return list;
    return list.filter(
      (expense) =>
        expense.description.toLowerCase().includes(term) ||
        expense.category.toLowerCase().includes(term),
    );
  }, [expenses.data, search]);

  const total = filtered.reduce((sum, expense) => sum + expense.amount, 0);

  function openNew() {
    setEditing(undefined);
    setFormOpen(true);
  }

  return (
    <AppShell>
      <PageHeader
        title="Despesas"
        description="Gastos do negócio que não fazem parte da receita de um produto."
        actions={<Button onClick={openNew}>Nova despesa</Button>}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="max-w-xs flex-1">
          <Input
            type="search"
            placeholder="Pesquisar por descrição ou categoria"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Pesquisar despesa"
          />
        </div>
        {filtered.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            Total listado: <span className="tabular font-medium text-foreground">{formatCurrency(total)}</span>
          </p>
        ) : null}
      </div>

      {expenses.isPending ? (
        <LoadingRows />
      ) : expenses.isError ? (
        <ErrorBlock onRetry={() => void expenses.refetch()} />
      ) : (expenses.data ?? []).length === 0 ? (
        <EmptyState
          title="Você ainda não registrou nenhuma despesa."
          hint="Inclua gastos recorrentes como aluguel, energia e gás para chegar ao resultado real."
          action={<Button onClick={openNew}>Registrar despesa</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState title={`Nenhuma despesa encontrada para "${search.trim()}".`} />
      ) : (
        <ul className="divide-y divide-border rounded border border-border bg-card">
          {filtered.map((expense) => (
            <li key={expense.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
              <div className="min-w-[10rem] flex-1">
                <p className="text-sm font-medium">{expense.description}</p>
                <p className="text-xs text-muted-foreground">
                  {expense.category} · {formatDate(expense.expense_date)}
                  {expense.notes ? ` · ${expense.notes}` : ""}
                </p>
              </div>
              <p className="tabular text-sm font-medium">{formatCurrency(expense.amount)}</p>
              <RowActions
                itemLabel={expense.description}
                onEdit={() => {
                  setEditing(expense);
                  setFormOpen(true);
                }}
                onDelete={() => setPendingDelete(expense)}
              />
            </li>
          ))}
        </ul>
      )}

      <ExpenseFormDialog open={formOpen} onOpenChange={setFormOpen} expense={editing} />

      <ConfirmDeleteDialog
        open={pendingDelete !== undefined}
        onOpenChange={(open) => !open && setPendingDelete(undefined)}
        title={`Excluir "${pendingDelete?.description ?? ""}"?`}
        description="A despesa será removida e deixará de compor o resultado do período."
        isPending={deleteExpense.isPending}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteExpense.mutate(pendingDelete.id, { onSettled: () => setPendingDelete(undefined) });
        }}
      />
    </AppShell>
  );
}
