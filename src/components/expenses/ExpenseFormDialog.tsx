import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Field } from "@/components/common/Field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSaveExpense } from "@/hooks/use-custeia";
import { todayISO } from "@/lib/format";
import { EXPENSE_CATEGORIES, type Expense, type ExpenseCategory } from "@/types/domain";

const schema = z.object({
  description: z.string().trim().min(2, "Descreva a despesa."),
  category: z.enum(EXPENSE_CATEGORIES),
  amount: z.coerce.number().positive("O valor deve ser maior que zero."),
  date: z.string().min(1, "Informe a data."),
  notes: z.string().trim().max(200, "Máximo de 200 caracteres.").optional(),
});

type FormValues = z.input<typeof schema>;

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense | undefined;
}

export function ExpenseFormDialog({ open, onOpenChange, expense }: ExpenseFormDialogProps) {
  const save = useSaveExpense();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: "",
      category: "Outros",
      amount: "" as never,
      date: todayISO(),
      notes: "",
    },
  });
  const { errors } = form.formState;

  useEffect(() => {
    if (!open) return;
    form.reset(
      expense
        ? {
            description: expense.description,
            category: expense.category,
            amount: expense.amount as never,
            date: expense.expense_date.slice(0, 10),
            notes: expense.notes ?? "",
          }
        : {
            description: "",
            category: "Outros",
            amount: "" as never,
            date: todayISO(),
            notes: "",
          },
    );
  }, [open, expense, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const parsed = schema.parse(values);
    await save.mutateAsync({
      id: expense?.id,
      input: {
        description: parsed.description,
        category: parsed.category,
        amount: parsed.amount,
        expense_date: parsed.date,
        notes: parsed.notes ? parsed.notes : null,
      },
    });
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">
            {expense ? "Editar despesa" : "Nova despesa"}
          </DialogTitle>
          <DialogDescription>
            Despesas do negócio, como aluguel e energia. Insumos usados nas receitas não entram
            aqui.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <Field id="description" label="Descrição" error={errors.description?.message}>
            <Input id="description" autoComplete="off" {...form.register("description")} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="category" label="Categoria" error={errors.category?.message}>
              <Select
                value={form.watch("category") as ExpenseCategory}
                onValueChange={(value) => form.setValue("category", value as ExpenseCategory)}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field id="amount" label="Valor (R$)" error={errors.amount?.message}>
              <Input id="amount" type="number" step="0.01" min="0" {...form.register("amount")} />
            </Field>

            <Field id="date" label="Data" error={errors.date?.message}>
              <Input id="date" type="date" {...form.register("date")} />
            </Field>
          </div>

          <Field id="expense-notes" label="Observação (opcional)" error={errors.notes?.message}>
            <Textarea
              id="expense-notes"
              rows={2}
              className="resize-none"
              {...form.register("notes")}
            />
          </Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
