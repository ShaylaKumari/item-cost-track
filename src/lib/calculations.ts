import type {
  Ingredient,
  Recipe,
  RecipeIngredient,
  RecipeIngredientLine,
  RecipeWithCosts,
} from "@/types/domain";

/** Custo por unidade de medida do insumo (ex.: R$/kg). */
export function ingredientUnitCost(ingredient: Ingredient): number {
  if (!ingredient.quantity) return 0;
  return ingredient.cost / ingredient.quantity;
}

/** Junta receita + insumos e calcula custos totais, unitários e margem. */
export function buildRecipeWithCosts(
  recipe: Recipe,
  links: RecipeIngredient[],
  ingredients: Ingredient[],
): RecipeWithCosts {
  const byId = new Map(ingredients.map((i) => [i.id, i]));

  const items = links
    .filter((link) => byId.has(link.ingredient_id))
    .map<RecipeIngredientLine>((link) => {
      const ingredient = byId.get(link.ingredient_id)!;
      return {
        ...link,
        ingredient,
        line_cost: ingredientUnitCost(ingredient) * link.quantity,
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
