import type {
  MeasurementUnit,
  Recipe,
  RecipeSupply,
  RecipeSupplyLine,
  RecipeWithCosts,
  Supply,
} from "@/types/domain";

/** Custo por unidade de compra do insumo (ex.: R$/kg). */
export function supplyUnitCost(supply: Supply): number {
  if (!supply.purchase_quantity) return 0;
  return supply.purchase_price / supply.purchase_quantity;
}

/**
 * Custo da quantidade usada em uma receita.
 *
 * TODO: a conversão entre unidades (ex.: 300 g de um insumo comprado em kg)
 * será implementada em uma etapa posterior. Por enquanto assume-se que a
 * unidade da receita corresponde à unidade de compra.
 */
export function recipeSupplyCost(
  supply: Supply,
  quantity: number,
  _unit: MeasurementUnit,
): number {
  return supplyUnitCost(supply) * quantity;
}

/** Junta receita + insumos e calcula custos totais, unitários e margem. */
export function buildRecipeWithCosts(
  recipe: Recipe,
  links: RecipeSupply[],
  supplies: Supply[],
): RecipeWithCosts {
  const byId = new Map(supplies.map((s) => [s.id, s]));

  const items = links
    .filter((link) => byId.has(link.supply_id))
    .map<RecipeSupplyLine>((link) => {
      const supply = byId.get(link.supply_id)!;
      return {
        ...link,
        supply,
        line_cost: recipeSupplyCost(supply, link.quantity, link.unit),
      };
    });

  const total_cost = items.reduce((sum, item) => sum + item.line_cost, 0);
  const unit_cost = recipe.yield_quantity > 0 ? total_cost / recipe.yield_quantity : 0;
  const price = recipe.selling_price;

  return {
    ...recipe,
    items,
    total_cost,
    unit_cost,
    unit_profit: price === null ? null : price - unit_cost,
    margin: price === null || price === 0 ? null : (price - unit_cost) / price,
  };
}

export function isWithinPeriod(date: string, from: string, to: string): boolean {
  const day = date.slice(0, 10);
  return day >= from && day <= to;
}
