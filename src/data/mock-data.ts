/**
 * MOCK DATA — dados fictícios de uma pequena confeitaria.
 * Serve apenas para demonstrar as telas enquanto o backend não existe.
 * Todos os registros pertencem ao usuário MOCK_USER (user_id).
 */
import type {
  Expense,
  Recipe,
  RecipeSupply,
  Sale,
  SaleItem,
  Supply,
  User,
} from "@/types/domain";

const now = "2026-08-01T09:00:00.000Z";

export const MOCK_USER: User = {
  id: "user-1",
  name: "Alzira Nogueira",
  email: "alzira@custeia.app",
  created_at: now,
};

export const MOCK_USERS: User[] = [MOCK_USER];

const USER_ID = MOCK_USER.id;
const ts = { created_at: now, updated_at: now };

export const MOCK_SUPPLIES: Supply[] = [
  { id: "sup-1", user_id: USER_ID, name: "Farinha de trigo", purchase_unit: "kg", purchase_quantity: 10, purchase_price: 48.9, notes: null, ...ts },
  { id: "sup-2", user_id: USER_ID, name: "Açúcar refinado", purchase_unit: "kg", purchase_quantity: 8, purchase_price: 36.0, notes: null, ...ts },
  { id: "sup-3", user_id: USER_ID, name: "Chocolate meio amargo", purchase_unit: "kg", purchase_quantity: 5, purchase_price: 189.5, notes: "Barra 1kg, marca Sicao", ...ts },
  { id: "sup-4", user_id: USER_ID, name: "Manteiga sem sal", purchase_unit: "kg", purchase_quantity: 4, purchase_price: 148.0, notes: null, ...ts },
  { id: "sup-5", user_id: USER_ID, name: "Ovos", purchase_unit: "unidade", purchase_quantity: 60, purchase_price: 42.0, notes: "Cartela de 30", ...ts },
  { id: "sup-6", user_id: USER_ID, name: "Leite condensado", purchase_unit: "unidade", purchase_quantity: 12, purchase_price: 78.0, notes: "Lata 395g", ...ts },
  { id: "sup-7", user_id: USER_ID, name: "Embalagem individual", purchase_unit: "unidade", purchase_quantity: 300, purchase_price: 96.0, notes: null, ...ts },
  { id: "sup-8", user_id: USER_ID, name: "Gás de cozinha", purchase_unit: "unidade", purchase_quantity: 1, purchase_price: 120.0, notes: "Botijão 13kg", ...ts },
];

export const MOCK_RECIPES: Recipe[] = [
  {
    id: "rec-1",
    user_id: USER_ID,
    name: "Brownie tradicional",
    description: "Assadeira 30x20 cortada em 20 pedaços.",
    yield_quantity: 20,
    yield_unit: "unidade",
    selling_price: 8.5,
    ...ts,
  },
  {
    id: "rec-2",
    user_id: USER_ID,
    name: "Bolo de chocolate 1kg",
    description: null,
    yield_quantity: 1,
    yield_unit: "unidade",
    selling_price: 78.0,
    ...ts,
  },
  {
    id: "rec-3",
    user_id: USER_ID,
    name: "Brigadeiro gourmet",
    description: "Rende cerca de 40 unidades de 20g.",
    yield_quantity: 40,
    yield_unit: "unidade",
    selling_price: 3.5,
    ...ts,
  },
];

export const MOCK_RECIPE_SUPPLIES: RecipeSupply[] = [
  { id: "rs-1", recipe_id: "rec-1", supply_id: "sup-1", quantity: 500, unit: "g" },
  { id: "rs-2", recipe_id: "rec-1", supply_id: "sup-3", quantity: 300, unit: "g" },
  { id: "rs-3", recipe_id: "rec-1", supply_id: "sup-2", quantity: 200, unit: "g" },
  { id: "rs-4", recipe_id: "rec-1", supply_id: "sup-4", quantity: 200, unit: "g" },
  { id: "rs-5", recipe_id: "rec-1", supply_id: "sup-5", quantity: 4, unit: "unidade" },
  { id: "rs-6", recipe_id: "rec-1", supply_id: "sup-7", quantity: 20, unit: "unidade" },

  { id: "rs-7", recipe_id: "rec-2", supply_id: "sup-1", quantity: 0.4, unit: "kg" },
  { id: "rs-8", recipe_id: "rec-2", supply_id: "sup-3", quantity: 0.25, unit: "kg" },
  { id: "rs-9", recipe_id: "rec-2", supply_id: "sup-2", quantity: 0.3, unit: "kg" },
  { id: "rs-10", recipe_id: "rec-2", supply_id: "sup-5", quantity: 5, unit: "unidade" },
  { id: "rs-11", recipe_id: "rec-2", supply_id: "sup-4", quantity: 0.15, unit: "kg" },

  { id: "rs-12", recipe_id: "rec-3", supply_id: "sup-6", quantity: 3, unit: "unidade" },
  { id: "rs-13", recipe_id: "rec-3", supply_id: "sup-3", quantity: 0.15, unit: "kg" },
  { id: "rs-14", recipe_id: "rec-3", supply_id: "sup-4", quantity: 0.05, unit: "kg" },
  { id: "rs-15", recipe_id: "rec-3", supply_id: "sup-7", quantity: 40, unit: "unidade" },
];

export const MOCK_SALES: Sale[] = [
  { id: "sale-1", user_id: USER_ID, sale_date: "2026-08-04", total_price: 178.0, created_at: now },
  { id: "sale-2", user_id: USER_ID, sale_date: "2026-08-08", total_price: 119.0, created_at: now },
  { id: "sale-3", user_id: USER_ID, sale_date: "2026-08-12", total_price: 296.0, created_at: now },
  { id: "sale-4", user_id: USER_ID, sale_date: "2026-08-17", total_price: 85.0, created_at: now },
  { id: "sale-5", user_id: USER_ID, sale_date: "2026-08-21", total_price: 234.0, created_at: now },
  { id: "sale-6", user_id: USER_ID, sale_date: "2026-08-26", total_price: 157.0, created_at: now },
];

export const MOCK_SALE_ITEMS: SaleItem[] = [
  { id: "si-1", sale_id: "sale-1", recipe_id: "rec-1", quantity: 8, unit_price: 8.5, total_price: 68.0 },
  { id: "si-2", sale_id: "sale-1", recipe_id: "rec-2", quantity: 1, unit_price: 78.0, total_price: 78.0 },
  { id: "si-3", sale_id: "sale-1", recipe_id: "rec-3", quantity: 8, unit_price: 4.0, total_price: 32.0 },

  { id: "si-4", sale_id: "sale-2", recipe_id: "rec-1", quantity: 10, unit_price: 8.5, total_price: 85.0 },
  { id: "si-5", sale_id: "sale-2", recipe_id: "rec-3", quantity: 10, unit_price: 3.4, total_price: 34.0 },

  { id: "si-6", sale_id: "sale-3", recipe_id: "rec-2", quantity: 3, unit_price: 78.0, total_price: 234.0 },
  { id: "si-7", sale_id: "sale-3", recipe_id: "rec-1", quantity: 8, unit_price: 7.75, total_price: 62.0 },

  { id: "si-8", sale_id: "sale-4", recipe_id: "rec-1", quantity: 10, unit_price: 8.5, total_price: 85.0 },

  { id: "si-9", sale_id: "sale-5", recipe_id: "rec-2", quantity: 2, unit_price: 78.0, total_price: 156.0 },
  { id: "si-10", sale_id: "sale-5", recipe_id: "rec-3", quantity: 20, unit_price: 3.9, total_price: 78.0 },

  { id: "si-11", sale_id: "sale-6", recipe_id: "rec-1", quantity: 12, unit_price: 8.5, total_price: 102.0 },
  { id: "si-12", sale_id: "sale-6", recipe_id: "rec-3", quantity: 15, unit_price: 3.666, total_price: 55.0 },
];

export const MOCK_EXPENSES: Expense[] = [
  { id: "exp-1", user_id: USER_ID, description: "Botijão de gás", category: "Gás", amount: 120.0, expense_date: "2026-08-03", notes: null, ...ts },
  { id: "exp-2", user_id: USER_ID, description: "Conta de energia", category: "Energia", amount: 186.4, expense_date: "2026-08-10", notes: "Referente a julho", ...ts },
  { id: "exp-3", user_id: USER_ID, description: "Entregas por aplicativo", category: "Transporte", amount: 74.0, expense_date: "2026-08-14", notes: null, ...ts },
  { id: "exp-4", user_id: USER_ID, description: "Aluguel do espaço", category: "Aluguel", amount: 450.0, expense_date: "2026-08-05", notes: null, ...ts },
  { id: "exp-5", user_id: USER_ID, description: "Sacolas personalizadas", category: "Embalagem", amount: 89.9, expense_date: "2026-08-19", notes: "100 unidades", ...ts },
  { id: "exp-6", user_id: USER_ID, description: "Impulsionamento no Instagram", category: "Marketing", amount: 60.0, expense_date: "2026-08-22", notes: null, ...ts },
];
