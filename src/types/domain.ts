/**
 * Domain model for Custeia.
 *
 * 7 entidades oficiais: users, supplies, recipes, recipe_supplies, sales,
 * sale_items, expenses. Os nomes de campos usam snake_case de propósito para
 * espelhar 1:1 as futuras tabelas do backend.
 */

export type ISODateString = string; // "2026-08-29" or full ISO timestamp

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: ISODateString;
}

/** Unidades de medida suportadas para insumos, receitas e rendimentos. */
export const MEASUREMENT_UNITS = ["kg", "g", "L", "ml", "unidade", "pacote"] as const;
export type MeasurementUnit = (typeof MEASUREMENT_UNITS)[number];

/** Insumo comprado pelo negócio. */
export interface Supply {
  id: string;
  user_id: string;
  name: string;
  /** Quantidade comprada, na unidade de compra. */
  purchase_quantity: number;
  purchase_unit: MeasurementUnit;
  /** Valor pago pela quantidade comprada. */
  purchase_price: number;
  notes: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Recipe {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  yield_quantity: number;
  yield_unit: MeasurementUnit;
  selling_price: number | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/** Quantidade de um insumo utilizada em uma receita. */
export interface RecipeSupply {
  id: string;
  recipe_id: string;
  supply_id: string;
  /** Quantidade usada na receita, na unidade abaixo. */
  quantity: number;
  /** Pode diferir da unidade de compra do insumo (conversão virá depois). */
  unit: MeasurementUnit;
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
  user_id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  expense_date: ISODateString;
  notes: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Sale {
  id: string;
  user_id: string;
  sale_date: ISODateString;
  total_price: number;
  created_at: ISODateString;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  recipe_id: string;
  quantity: number;
  /** Preço praticado no momento da venda (preservação histórica). */
  unit_price: number;
  total_price: number;
}

/* ---------- Tipos compostos usados pela interface ---------- */

export interface RecipeSupplyLine extends RecipeSupply {
  supply: Supply;
  /** Custo da quantidade usada na receita. */
  line_cost: number;
}

export interface RecipeWithCosts extends Recipe {
  items: RecipeSupplyLine[];
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

export type SupplyInput = Pick<
  Supply,
  "name" | "purchase_quantity" | "purchase_unit" | "purchase_price" | "notes"
>;

export interface RecipeInput {
  name: string;
  description: string | null;
  yield_quantity: number;
  yield_unit: MeasurementUnit;
  selling_price: number | null;
  items: Array<{ supply_id: string; quantity: number; unit: MeasurementUnit }>;
}

export type ExpenseInput = Pick<
  Expense,
  "description" | "category" | "amount" | "expense_date" | "notes"
>;

export interface SaleInput {
  sale_date: ISODateString;
  items: Array<{ recipe_id: string; quantity: number; unit_price: number }>;
}
