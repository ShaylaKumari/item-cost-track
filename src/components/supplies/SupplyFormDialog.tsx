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
import { useSaveSupply } from "@/hooks/use-custeia";
import { MEASUREMENT_UNITS, type Supply, type MeasurementUnit } from "@/types/domain";

const schema = z.object({
  name: z.string().trim().min(2, "Informe o nome do insumo."),
  unit: z.enum(MEASUREMENT_UNITS),
  quantity: z.coerce.number({ invalid_type_error: "Informe um número." }).positive("A quantidade deve ser maior que zero."),
  cost: z.coerce.number({ invalid_type_error: "Informe um número." }).min(0, "O custo não pode ser negativo."),
  notes: z.string().trim().max(200, "Máximo de 200 caracteres.").optional(),
});

type FormValues = z.input<typeof schema>;

interface SupplyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supply?: Supply | undefined;
}

const EMPTY: FormValues = { name: "", unit: "kg", quantity: "" as never, cost: "" as never, notes: "" };

export function SupplyFormDialog({
  open,
  onOpenChange,
  supply,
}: SupplyFormDialogProps) {
  const save = useSaveSupply();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });
  const { errors } = form.formState;

  useEffect(() => {
    if (!open) return;
    form.reset(
      supply
        ? {
            name: supply.name,
            unit: supply.unit,
            quantity: supply.quantity as never,
            cost: supply.cost as never,
            notes: supply.notes ?? "",
          }
        : EMPTY,
    );
  }, [open, supply, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const parsed = schema.parse(values);
    await save.mutateAsync({
      id: supply?.id,
      input: {
        name: parsed.name,
        unit: parsed.unit,
        quantity: parsed.quantity,
        cost: parsed.cost,
        notes: parsed.notes ? parsed.notes : null,
      },
    });
    onOpenChange(false);
  });

  const unit = form.watch("unit") as MeasurementUnit;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">
            {supply ? "Editar insumo" : "Novo insumo"}
          </DialogTitle>
          <DialogDescription>
            Informe a quantidade comprada e quanto ela custou. O custo por unidade é calculado
            automaticamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <Field id="name" label="Nome" error={errors.name?.message}>
            <Input id="name" autoComplete="off" {...form.register("name")} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="unit" label="Unidade" error={errors.unit?.message}>
              <Select
                value={unit}
                onValueChange={(value) => form.setValue("unit", value as MeasurementUnit)}
              >
                <SelectTrigger id="unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEASUREMENT_UNITS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              id="quantity"
              label="Quantidade"
              hint={`Em ${unit}`}
              error={errors.quantity?.message}
            >
              <Input id="quantity" type="number" step="any" min="0" {...form.register("quantity")} />
            </Field>

            <Field id="cost" label="Custo total (R$)" error={errors.cost?.message}>
              <Input id="cost" type="number" step="0.01" min="0" {...form.register("cost")} />
            </Field>
          </div>

          <Field id="notes" label="Observação (opcional)" error={errors.notes?.message}>
            <Textarea id="notes" rows={2} className="resize-none" {...form.register("notes")} />
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
