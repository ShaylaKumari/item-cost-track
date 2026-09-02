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
  if (!supply.purchase_quantity || supply.purchase_quantity <= 0) return 0;
  if (!Number.isFinite(supply.purchase_price)) return 0;
  return supply.purchase_price / supply.purchase_quantity;
}

/** Dimensão física de cada unidade suportada. */
const UNIT_DIMENSION: Record<MeasurementUnit, "mass" | "volume" | "count" | "package"> = {
  kg: "mass",
  g: "mass",
  L: "volume",
  ml: "volume",
  unidade: "count",
  pacote: "package",
};

/** Fator para a unidade base da dimensão (g, ml, unidade, pacote). */
const UNIT_FACTOR: Record<MeasurementUnit, number> = {
  kg: 1000,
  g: 1,
  L: 1000,
  ml: 1,
  unidade: 1,
  pacote: 1,
};

/** Erro de domínio para conversões entre unidades incompatíveis. */
export class UnitConversionError extends Error {
  constructor(
    public readonly fromUnit: MeasurementUnit,
    public readonly toUnit: MeasurementUnit,
  ) {
    super(`Não é possível converter de "${fromUnit}" para "${toUnit}".`);
    this.name = "UnitConversionError";
  }
}

/** Converte uma quantidade entre unidades da mesma dimensão. */
export function convertQuantity(
  quantity: number,
  fromUnit: MeasurementUnit,
  toUnit: MeasurementUnit,
): number {
  if (fromUnit === toUnit) return quantity;
  if (UNIT_DIMENSION[fromUnit] !== UNIT_DIMENSION[toUnit]) {
    throw new UnitConversionError(fromUnit, toUnit);
  }
  return (quantity * UNIT_FACTOR[fromUnit]) / UNIT_FACTOR[toUnit];
}

/** Custo da quantidade usada em uma receita, convertendo para a unidade de compra. */
export function recipeSupplyCost(
  supply: Supply,
  quantity: number,
  unit: MeasurementUnit,
): number {
  if (!quantity || !Number.isFinite(quantity)) return 0;
  const unitCost = supplyUnitCost(supply);
  if (!unitCost || !Number.isFinite(unitCost)) return 0;
  const converted = convertQuantity(quantity, unit, supply.purchase_unit);
  const cost = unitCost * converted;
  return Number.isFinite(cost) ? cost : 0;
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
