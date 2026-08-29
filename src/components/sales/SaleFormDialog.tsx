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
import { useCreateSale } from "@/hooks/use-custeia";
import { formatCurrency, todayISO } from "@/lib/format";
import type { RecipeWithCosts } from "@/types/domain";

const schema = z.object({
  sale_date: z.string().min(1, "Informe a data da venda."),
  items: z
    .array(
      z.object({
        recipe_id: z.string().min(1, "Selecione um produto."),
        quantity: z.coerce.number().positive("Quantidade inválida."),
        unit_price: z.coerce.number().min(0, "Preço inválido."),
      }),
    )
    .min(1, "Adicione pelo menos um produto."),
});

type FormValues = z.input<typeof schema>;

interface SaleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipes: RecipeWithCosts[];
}

export function SaleFormDialog({ open, onOpenChange, recipes }: SaleFormDialogProps) {
  const createSale = useCreateSale();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      sale_date: todayISO(),
      items: [{ recipe_id: "", quantity: 1 as never, unit_price: "" as never }],
    },
  });
  const items = useFieldArray({ control: form.control, name: "items" });
  const { errors } = form.formState;

  useEffect(() => {
    if (!open) return;
    form.reset({
      sale_date: todayISO(),
      items: [{ recipe_id: "", quantity: 1 as never, unit_price: "" as never }],
    });
  }, [open, form]);

  const watched = form.watch("items") ?? [];
  const total = watched.reduce((sum, line) => {
    const quantity = Number(line?.quantity);
    const price = Number(line?.unit_price);
    if (!Number.isFinite(quantity) || !Number.isFinite(price)) return sum;
    return sum + quantity * price;
  }, 0);

  const onSubmit = form.handleSubmit(async (values) => {
    const parsed = schema.parse(values);
    await createSale.mutateAsync(parsed);
    onOpenChange(false);
  });

  /** Ao escolher o produto, sugere o preço de venda cadastrado. */
  function selectRecipe(index: number, recipeId: string) {
    form.setValue(`items.${index}.recipe_id`, recipeId, { shouldValidate: true });
    const recipe = recipes.find((option) => option.id === recipeId);
    if (recipe?.selling_price != null && !form.getValues(`items.${index}.unit_price`)) {
      form.setValue(`items.${index}.unit_price`, recipe.selling_price as never);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-base">Registrar venda</DialogTitle>
          <DialogDescription>
            O preço sugerido vem do cadastro do produto, mas você pode ajustá-lo nesta venda.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <Field
            id="sale_date"
            label="Data"
            error={errors.sale_date?.message}
            className="max-w-[12rem]"
          >
            <Input id="sale_date" type="date" {...form.register("sale_date")} />
          </Field>

          <fieldset className="rounded border border-border">
            <legend className="ml-3 px-1 text-[13px] font-medium">Produtos vendidos</legend>
            <div className="space-y-3 p-3">
              {items.fields.map((fieldItem, index) => (
                <div key={fieldItem.id} className="flex flex-wrap items-start gap-2">
                  <div className="min-w-[9rem] flex-1">
                    <Select
                      value={form.watch(`items.${index}.recipe_id`)}
                      onValueChange={(value) => selectRecipe(index, value)}
                    >
                      <SelectTrigger aria-label={`Produto ${index + 1}`}>
                        <SelectValue placeholder="Selecione o produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {recipes.map((recipe) => (
                          <SelectItem key={recipe.id} value={recipe.id}>
                            {recipe.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.items?.[index]?.recipe_id ? (
                      <p role="alert" className="mt-1 text-xs text-destructive">
                        {errors.items[index]?.recipe_id?.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="w-20">
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      placeholder="Qtd."
                      aria-label={`Quantidade do produto ${index + 1}`}
                      {...form.register(`items.${index}.quantity`)}
                    />
                    {errors.items?.[index]?.quantity ? (
                      <p role="alert" className="mt-1 text-xs text-destructive">
                        {errors.items[index]?.quantity?.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="w-28">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Preço"
                      aria-label={`Preço unitário do produto ${index + 1}`}
                      {...form.register(`items.${index}.unit_price`)}
                    />
                    {errors.items?.[index]?.unit_price ? (
                      <p role="alert" className="mt-1 text-xs text-destructive">
                        {errors.items[index]?.unit_price?.message}
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
                    aria-label={`Remover produto ${index + 1}`}
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
                onClick={() =>
                  items.append({ recipe_id: "", quantity: 1 as never, unit_price: "" as never })
                }
              >
                Adicionar produto
              </Button>
            </div>
          </fieldset>

          <p className="border-t border-border pt-3 text-sm">
            <span className="text-muted-foreground">Total da venda: </span>
            <span className="tabular font-medium">{formatCurrency(total)}</span>
          </p>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createSale.isPending}>
              {createSale.isPending ? "Registrando…" : "Registrar venda"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
