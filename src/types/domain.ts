/**
 * Domain model for Custeia.
 *
 * These types mirror 1:1 the future Supabase tables (snake_case columns kept
 * on purpose) so the mock repository can later be swapped for real queries
 * without touching the UI.
 */

export type ISODateString = string; // "2026-08-29" or full ISO timestamp

export interface Business {
  id: string;
  name: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/** Unidades de medida suportadas para insumos e rendimentos. */
export const MEASUREMENT_UNITS = ["kg", "g", "L", "ml", "unidade", "pacote"] as const;
export type MeasurementUnit = (typeof MEASUREMENT_UNITS)[number];

export interface Ingredient {
  id: string;
  business_id: string;
  name: string;
  unit: MeasurementUnit;
  /** Quantidade disponível, na unidade do insumo. */
  quantity: number;
  /** Custo da quantidade disponível (custo total da compra). */
  cost: number;
  notes: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Recipe {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  yield_quantity: number;
  yield_unit: MeasurementUnit;
  selling_price: number | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  /** Quantidade usada na receita, na unidade do insumo. */
  quantity: number;
}

export const EXPENSE_CATEGORIES = [
  "Gás",
  "Energia",
  "Água",
  "Transporte",
  "Embalagem",
  "Aluguel",
  "Equipamento",
  "Marketing",
  "Outros",
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export interface Expense {
  id: string;
  business_id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  date: ISODateString;
  notes: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Sale {
  id: string;
  business_id: string;
  sale_date: ISODateString;
  total_amount: number;
  created_at: ISODateString;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  recipe_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
}

/* ---------- Tipos compostos usados pela interface ---------- */

export interface RecipeIngredientLine extends RecipeIngredient {
  ingredient: Ingredient;
  /** Custo da quantidade usada na receita. */
  line_cost: number;
}

export interface RecipeWithCosts extends Recipe {
  items: RecipeIngredientLine[];
  total_cost: number;
  unit_cost: number;
  unit_profit: number | null;
  margin: number | null;
}

export interface SaleItemLine extends SaleItem {
  recipe_name: string;
  /** Custo unitário do produto no momento da consulta (mock: custo atual). */
  unit_cost: number;
}

export interface SaleWithItems extends Sale {
  items: SaleItemLine[];
  /** Custo dos produtos vendidos nesta venda. */
  total_cost: number;
}

export interface Period {
  from: ISODateString;
  to: ISODateString;
}

export interface PeriodResult {
  revenue: number;
  productCost: number;
  expenses: number;
  result: number;
  margin: number | null;
  salesCount: number;
  daily: Array<{ date: ISODateString; revenue: number; result: number }>;
}

/* ---------- Payloads de escrita ---------- */

export type IngredientInput = Pick<
  Ingredient,
  "name" | "unit" | "quantity" | "cost" | "notes"
>;

export interface RecipeInput {
  name: string;
  description: string | null;
  yield_quantity: number;
  yield_unit: MeasurementUnit;
  selling_price: number | null;
  items: Array<{ ingredient_id: string; quantity: number }>;
}

export type ExpenseInput = Pick<
  Expense,
  "description" | "category" | "amount" | "date" | "notes"
>;

export interface SaleInput {
  sale_date: ISODateString;
  items: Array<{ recipe_id: string; quantity: number; unit_price: number }>;
}
