/**
 * MOCK DATA — dados fictícios de uma pequena confeitaria.
 * Serve apenas para demonstrar as telas enquanto o backend não existe.
 * Ao conectar o Supabase, este arquivo pode ser removido por completo.
 */
import type {
  Business,
  Expense,
  Ingredient,
  Recipe,
  RecipeIngredient,
  Sale,
  SaleItem,
} from "@/types/domain";

const now = "2026-08-01T09:00:00.000Z";

export const MOCK_BUSINESS: Business = {
  id: "biz-1",
  name: "Confeitaria Dona Alzira",
  created_at: now,
  updated_at: now,
};

const ts = { created_at: now, updated_at: now };

export const MOCK_INGREDIENTS: Ingredient[] = [
  { id: "ing-1", business_id: "biz-1", name: "Farinha de trigo", unit: "kg", quantity: 10, cost: 48.9, notes: null, ...ts },
  { id: "ing-2", business_id: "biz-1", name: "Açúcar refinado", unit: "kg", quantity: 8, cost: 36.0, notes: null, ...ts },
  { id: "ing-3", business_id: "biz-1", name: "Chocolate meio amargo", unit: "kg", quantity: 5, cost: 189.5, notes: "Barra 1kg, marca Sicao", ...ts },
  { id: "ing-4", business_id: "biz-1", name: "Manteiga sem sal", unit: "kg", quantity: 4, cost: 148.0, notes: null, ...ts },
  { id: "ing-5", business_id: "biz-1", name: "Ovos", unit: "unidade", quantity: 60, cost: 42.0, notes: "Cartela de 30", ...ts },
  { id: "ing-6", business_id: "biz-1", name: "Leite condensado", unit: "unidade", quantity: 12, cost: 78.0, notes: "Lata 395g", ...ts },
  { id: "ing-7", business_id: "biz-1", name: "Embalagem individual", unit: "unidade", quantity: 300, cost: 96.0, notes: null, ...ts },
  { id: "ing-8", business_id: "biz-1", name: "Gás de cozinha", unit: "unidade", quantity: 1, cost: 120.0, notes: "Botijão 13kg", ...ts },
];

export const MOCK_RECIPES: Recipe[] = [
  {
    id: "rec-1",
    business_id: "biz-1",
    name: "Brownie tradicional",
    description: "Assadeira 30x20 cortada em 20 pedaços.",
    yield_quantity: 20,
    yield_unit: "unidade",
    selling_price: 8.5,
    ...ts,
  },
  {
    id: "rec-2",
    business_id: "biz-1",
    name: "Bolo de chocolate 1kg",
    description: null,
    yield_quantity: 1,
    yield_unit: "unidade",
    selling_price: 78.0,
    ...ts,
  },
  {
    id: "rec-3",
    business_id: "biz-1",
    name: "Brigadeiro gourmet",
    description: "Rende cerca de 40 unidades de 20g.",
    yield_quantity: 40,
    yield_unit: "unidade",
    selling_price: 3.5,
    ...ts,
  },
];

export const MOCK_RECIPE_INGREDIENTS: RecipeIngredient[] = [
  { id: "ri-1", recipe_id: "rec-1", ingredient_id: "ing-1", quantity: 0.5 },
  { id: "ri-2", recipe_id: "rec-1", ingredient_id: "ing-3", quantity: 0.3 },
  { id: "ri-3", recipe_id: "rec-1", ingredient_id: "ing-2", quantity: 0.2 },
  { id: "ri-4", recipe_id: "rec-1", ingredient_id: "ing-4", quantity: 0.2 },
  { id: "ri-5", recipe_id: "rec-1", ingredient_id: "ing-5", quantity: 4 },
  { id: "ri-6", recipe_id: "rec-1", ingredient_id: "ing-7", quantity: 20 },

  { id: "ri-7", recipe_id: "rec-2", ingredient_id: "ing-1", quantity: 0.4 },
  { id: "ri-8", recipe_id: "rec-2", ingredient_id: "ing-3", quantity: 0.25 },
  { id: "ri-9", recipe_id: "rec-2", ingredient_id: "ing-2", quantity: 0.3 },
  { id: "ri-10", recipe_id: "rec-2", ingredient_id: "ing-5", quantity: 5 },
  { id: "ri-11", recipe_id: "rec-2", ingredient_id: "ing-4", quantity: 0.15 },

  { id: "ri-12", recipe_id: "rec-3", ingredient_id: "ing-6", quantity: 3 },
  { id: "ri-13", recipe_id: "rec-3", ingredient_id: "ing-3", quantity: 0.15 },
  { id: "ri-14", recipe_id: "rec-3", ingredient_id: "ing-4", quantity: 0.05 },
  { id: "ri-15", recipe_id: "rec-3", ingredient_id: "ing-7", quantity: 40 },
];

export const MOCK_SALES: Sale[] = [
  { id: "sale-1", business_id: "biz-1", sale_date: "2026-08-04", total_amount: 178.0, created_at: now },
  { id: "sale-2", business_id: "biz-1", sale_date: "2026-08-08", total_amount: 119.0, created_at: now },
  { id: "sale-3", business_id: "biz-1", sale_date: "2026-08-12", total_amount: 296.0, created_at: now },
  { id: "sale-4", business_id: "biz-1", sale_date: "2026-08-17", total_amount: 85.0, created_at: now },
  { id: "sale-5", business_id: "biz-1", sale_date: "2026-08-21", total_amount: 234.0, created_at: now },
  { id: "sale-6", business_id: "biz-1", sale_date: "2026-08-26", total_amount: 157.0, created_at: now },
];

export const MOCK_SALE_ITEMS: SaleItem[] = [
  { id: "si-1", sale_id: "sale-1", recipe_id: "rec-1", quantity: 8, unit_price: 8.5, total_amount: 68.0 },
  { id: "si-2", sale_id: "sale-1", recipe_id: "rec-2", quantity: 1, unit_price: 78.0, total_amount: 78.0 },
  { id: "si-3", sale_id: "sale-1", recipe_id: "rec-3", quantity: 8, unit_price: 4.0, total_amount: 32.0 },

  { id: "si-4", sale_id: "sale-2", recipe_id: "rec-1", quantity: 10, unit_price: 8.5, total_amount: 85.0 },
  { id: "si-5", sale_id: "sale-2", recipe_id: "rec-3", quantity: 10, unit_price: 3.4, total_amount: 34.0 },

  { id: "si-6", sale_id: "sale-3", recipe_id: "rec-2", quantity: 3, unit_price: 78.0, total_amount: 234.0 },
  { id: "si-7", sale_id: "sale-3", recipe_id: "rec-1", quantity: 8, unit_price: 7.75, total_amount: 62.0 },

  { id: "si-8", sale_id: "sale-4", recipe_id: "rec-1", quantity: 10, unit_price: 8.5, total_amount: 85.0 },

  { id: "si-9", sale_id: "sale-5", recipe_id: "rec-2", quantity: 2, unit_price: 78.0, total_amount: 156.0 },
  { id: "si-10", sale_id: "sale-5", recipe_id: "rec-3", quantity: 20, unit_price: 3.9, total_amount: 78.0 },

  { id: "si-11", sale_id: "sale-6", recipe_id: "rec-1", quantity: 12, unit_price: 8.5, total_amount: 102.0 },
  { id: "si-12", sale_id: "sale-6", recipe_id: "rec-3", quantity: 15, unit_price: 3.666, total_amount: 55.0 },
];

export const MOCK_EXPENSES: Expense[] = [
  { id: "exp-1", business_id: "biz-1", description: "Botijão de gás", category: "Gás", amount: 120.0, date: "2026-08-03", notes: null, ...ts },
  { id: "exp-2", business_id: "biz-1", description: "Conta de energia", category: "Energia", amount: 186.4, date: "2026-08-10", notes: "Referente a julho", ...ts },
  { id: "exp-3", business_id: "biz-1", description: "Entregas por aplicativo", category: "Transporte", amount: 74.0, date: "2026-08-14", notes: null, ...ts },
  { id: "exp-4", business_id: "biz-1", description: "Aluguel do espaço", category: "Aluguel", amount: 450.0, date: "2026-08-05", notes: null, ...ts },
  { id: "exp-5", business_id: "biz-1", description: "Sacolas personalizadas", category: "Embalagem", amount: 89.9, date: "2026-08-19", notes: "100 unidades", ...ts },
  { id: "exp-6", business_id: "biz-1", description: "Impulsionamento no Instagram", category: "Marketing", amount: 60.0, date: "2026-08-22", notes: null, ...ts },
];
