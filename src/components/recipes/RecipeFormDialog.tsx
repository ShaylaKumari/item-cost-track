import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
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
import { useSaveRecipe } from "@/hooks/use-custeia";
import { areUnitsCompatible, compatibleUnits, recipeSupplyCost } from "@/lib/calculations";
import { formatCurrency } from "@/lib/format";
import {
  MEASUREMENT_UNITS,
  type Supply,
  type MeasurementUnit,
  type RecipeWithCosts,
} from "@/types/domain";

const INCOMPATIBLE_UNIT_MESSAGE = "Não é possível utilizar essa unidade para este insumo.";

function buildSchema(supplies: Supply[]) {
  return z.object({
    name: z.string().trim().min(2, "Informe o nome do produto."),
    description: z.string().trim().max(300).optional(),
    yield_quantity: z.coerce.number().positive("O rendimento deve ser maior que zero."),
    yield_unit: z.enum(MEASUREMENT_UNITS),
    selling_price: z
      .union([z.literal(""), z.coerce.number().min(0, "O preço não pode ser negativo.")])
      .optional(),
    items: z
      .array(
        z
          .object({
            supply_id: z.string().min(1, "Selecione um insumo."),
            quantity: z.coerce.number().positive("Quantidade inválida."),
            unit: z.enum(MEASUREMENT_UNITS),
          })
          .superRefine((item, ctx) => {
            const supply = supplies.find((option) => option.id === item.supply_id);
            if (!supply) return;
            if (!areUnitsCompatible(item.unit, supply.purchase_unit)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["unit"],
                message: INCOMPATIBLE_UNIT_MESSAGE,
              });
            }
          }),
      )
      .min(1, "Adicione pelo menos um insumo à receita."),
  });
}

type FormValues = z.input<ReturnType<typeof buildSchema>>;

interface RecipeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipe?: RecipeWithCosts | undefined;
  supplies: Supply[];
}

const EMPTY: FormValues = {
  name: "",
  description: "",
  yield_quantity: "" as never,
  yield_unit: "unidade",
  selling_price: "",
  items: [{ supply_id: "", quantity: "" as never, unit: "unidade" }],
};

export function RecipeFormDialog({
  open,
  onOpenChange,
  recipe,
  supplies,
}: RecipeFormDialogProps) {
  const save = useSaveRecipe();
  const schema = useMemo(() => buildSchema(supplies), [supplies]);
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });
  const items = useFieldArray({ control: form.control, name: "items" });
  const { errors } = form.formState;

  useEffect(() => {
    if (!open) return;
    form.reset(
      recipe
        ? {
            name: recipe.name,
            description: recipe.description ?? "",
            yield_quantity: recipe.yield_quantity as never,
            yield_unit: recipe.yield_unit,
            selling_price: (recipe.selling_price ?? "") as never,
            items: recipe.items.map((item) => ({
              supply_id: item.supply_id,
              quantity: item.quantity as never,
              unit: item.unit,
            })),
          }
        : EMPTY,
    );
  }, [open, recipe, form]);

  const watchedItems = form.watch("items") ?? [];
  const yieldQuantity = Number(form.watch("yield_quantity")) || 0;

  /** Ao trocar o insumo, garante que a unidade selecionada continue compatível. */
  function handleSupplyChange(index: number, supplyId: string) {
    form.setValue(`items.${index}.supply_id`, supplyId, { shouldValidate: true });
    const supply = supplies.find((option) => option.id === supplyId);
    if (!supply) return;
    const current = form.getValues(`items.${index}.unit`);
    if (!current || !areUnitsCompatible(current, supply.purchase_unit)) {
      form.setValue(`items.${index}.unit`, supply.purchase_unit, { shouldValidate: true });
    }
  }

  const totalCost = watchedItems.reduce((sum, line) => {
    const supply = supplies.find((option) => option.id === line?.supply_id);
    const quantity = Number(line?.quantity);
    const unit = line?.unit as MeasurementUnit | undefined;
    if (!supply || !unit || !Number.isFinite(quantity)) return sum;
    if (!areUnitsCompatible(unit, supply.purchase_unit)) return sum;
    return sum + recipeSupplyCost(supply, quantity, unit);
  }, 0);
  const unitCost = yieldQuantity > 0 ? totalCost / yieldQuantity : 0;

  const onSubmit = form.handleSubmit(async (values) => {
    const parsed = schema.parse(values);
    await save.mutateAsync({
      id: recipe?.id,
      input: {
        name: parsed.name,
        description: parsed.description ? parsed.description : null,
        yield_quantity: parsed.yield_quantity,
        yield_unit: parsed.yield_unit,
        selling_price:
          parsed.selling_price === "" || parsed.selling_price === undefined
            ? null
            : parsed.selling_price,
        items: parsed.items.map((item) => ({
          supply_id: item.supply_id,
          quantity: item.quantity,
          unit: item.unit,
        })),
      },
    });
    onOpenChange(false);
  });


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-base">
            {recipe ? "Editar produto" : "Novo produto"}
          </DialogTitle>
          <DialogDescription>
            Monte a receita com os insumos cadastrados. O custo é calculado a partir do custo por
            unidade de cada insumo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <Field id="recipe-name" label="Nome" error={errors.name?.message}>
            <Input id="recipe-name" autoComplete="off" {...form.register("name")} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              id="yield_quantity"
              label="Rendimento"
              error={errors.yield_quantity?.message}
            >
              <Input
                id="yield_quantity"
                type="number"
                step="any"
                min="0"
                {...form.register("yield_quantity")}
              />
            </Field>

            <Field id="yield_unit" label="Unidade do rendimento">
              <Select
                value={form.watch("yield_unit") as MeasurementUnit}
                onValueChange={(value) => form.setValue("yield_unit", value as MeasurementUnit)}
              >
                <SelectTrigger id="yield_unit">
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
              id="selling_price"
              label="Preço de venda (R$)"
              hint="Por unidade. Pode ficar em branco."
              error={errors.selling_price?.message as string | undefined}
            >
              <Input
                id="selling_price"
                type="number"
                step="0.01"
                min="0"
                {...form.register("selling_price")}
              />
            </Field>
          </div>

          <Field id="description" label="Descrição (opcional)">
            <Textarea
              id="description"
              rows={2}
              className="resize-none"
              {...form.register("description")}
            />
          </Field>

          <fieldset className="rounded border border-border">
            <legend className="ml-3 px-1 text-[13px] font-medium">Insumos</legend>
            <div className="space-y-3 p-3">
              {items.fields.map((fieldItem, index) => (
                <div key={fieldItem.id} className="flex flex-wrap items-start gap-2">
                  <div className="min-w-[10rem] flex-1">
                    <Select
                      value={form.watch(`items.${index}.supply_id`)}
                      onValueChange={(value) =>
                        form.setValue(`items.${index}.supply_id`, value, {
                          shouldValidate: true,
                        })
                      }
                    >
                      <SelectTrigger aria-label={`Insumo ${index + 1}`}>
                        <SelectValue placeholder="Selecione o insumo" />
                      </SelectTrigger>
                      <SelectContent>
                        {supplies.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name} ({option.purchase_unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.items?.[index]?.supply_id ? (
                      <p role="alert" className="mt-1 text-xs text-destructive">
                        {errors.items[index]?.supply_id?.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="w-28">
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="Qtd."
                      aria-label={`Quantidade do insumo ${index + 1}`}
                      {...form.register(`items.${index}.quantity`)}
                    />
                    {errors.items?.[index]?.quantity ? (
                      <p role="alert" className="mt-1 text-xs text-destructive">
                        {errors.items[index]?.quantity?.message}
                      </p>
                    ) : null}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 text-[13px] text-muted-foreground hover:text-destructive"
                    onClick={() => items.remove(index)}
                    disabled={items.fields.length === 1}
                    aria-label={`Remover insumo ${index + 1}`}
                  >
                    Remover
                  </Button>
                </div>
              ))}

              {typeof errors.items?.message === "string" ? (
                <p role="alert" className="text-xs text-destructive">
                  {errors.items.message}
                </p>
              ) : null}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => items.append({ supply_id: "", quantity: "" as never })}
              >
                Adicionar insumo
              </Button>
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-x-8 gap-y-1 border-t border-border pt-3 text-sm">
            <p>
              <span className="text-muted-foreground">Custo da receita: </span>
              <span className="tabular font-medium">{formatCurrency(totalCost)}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Custo por unidade: </span>
              <span className="tabular font-medium">{formatCurrency(unitCost)}</span>
            </p>
          </div>

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
