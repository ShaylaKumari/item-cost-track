import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
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
import { ingredientUnitCost } from "@/lib/calculations";
import { formatCurrency } from "@/lib/format";
import {
  MEASUREMENT_UNITS,
  type Ingredient,
  type MeasurementUnit,
  type RecipeWithCosts,
} from "@/types/domain";

const schema = z.object({
  name: z.string().trim().min(2, "Informe o nome do produto."),
  description: z.string().trim().max(300).optional(),
  yield_quantity: z.coerce.number().positive("O rendimento deve ser maior que zero."),
  yield_unit: z.enum(MEASUREMENT_UNITS),
  selling_price: z
    .union([z.literal(""), z.coerce.number().min(0, "O preço não pode ser negativo.")])
    .optional(),
  items: z
    .array(
      z.object({
        ingredient_id: z.string().min(1, "Selecione um insumo."),
        quantity: z.coerce.number().positive("Quantidade inválida."),
      }),
    )
    .min(1, "Adicione pelo menos um insumo à receita."),
});

type FormValues = z.input<typeof schema>;

interface RecipeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipe?: RecipeWithCosts | undefined;
  ingredients: Ingredient[];
}

const EMPTY: FormValues = {
  name: "",
  description: "",
  yield_quantity: "" as never,
  yield_unit: "unidade",
  selling_price: "",
  items: [{ ingredient_id: "", quantity: "" as never }],
};

export function RecipeFormDialog({
  open,
  onOpenChange,
  recipe,
  ingredients,
}: RecipeFormDialogProps) {
  const save = useSaveRecipe();
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
              ingredient_id: item.ingredient_id,
              quantity: item.quantity as never,
            })),
          }
        : EMPTY,
    );
  }, [open, recipe, form]);

  const watchedItems = form.watch("items") ?? [];
  const yieldQuantity = Number(form.watch("yield_quantity")) || 0;

  const totalCost = watchedItems.reduce((sum, line) => {
    const ingredient = ingredients.find((option) => option.id === line?.ingredient_id);
    const quantity = Number(line?.quantity);
    if (!ingredient || !Number.isFinite(quantity)) return sum;
    return sum + ingredientUnitCost(ingredient) * quantity;
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
        items: parsed.items,
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
            <legend className="ml-3 px-1 text-[13px] font-medium">Ingredientes</legend>
            <div className="space-y-3 p-3">
              {items.fields.map((fieldItem, index) => (
                <div key={fieldItem.id} className="flex flex-wrap items-start gap-2">
                  <div className="min-w-[10rem] flex-1">
                    <Select
                      value={form.watch(`items.${index}.ingredient_id`)}
                      onValueChange={(value) =>
                        form.setValue(`items.${index}.ingredient_id`, value, {
                          shouldValidate: true,
                        })
                      }
                    >
                      <SelectTrigger aria-label={`Insumo ${index + 1}`}>
                        <SelectValue placeholder="Selecione o insumo" />
                      </SelectTrigger>
                      <SelectContent>
                        {ingredients.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name} ({option.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.items?.[index]?.ingredient_id ? (
                      <p role="alert" className="mt-1 text-xs text-destructive">
                        {errors.items[index]?.ingredient_id?.message}
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
                onClick={() => items.append({ ingredient_id: "", quantity: "" as never })}
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
