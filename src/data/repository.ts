/**
 * CAMADA DE ACESSO A DADOS
 *
 * A interface `CusteiaRepository` é o único contrato que as páginas conhecem.
 * Hoje existe apenas a implementação em memória (`mockRepository`).
 *
 * TODO(Supabase): criar `supabase-repository.ts` implementando esta mesma
 * interface com queries reais (tabelas: businesses, ingredients, recipes,
 * recipe_ingredients, sales, sale_items, expenses) e trocar a linha de
 * exportação no final deste arquivo. Nenhuma página precisa ser alterada.
 */
import { buildRecipeWithCosts, isWithinPeriod, ingredientUnitCost } from "@/lib/calculations";
import {
  MOCK_BUSINESS,
  MOCK_EXPENSES,
  MOCK_INGREDIENTS,
  MOCK_RECIPES,
  MOCK_RECIPE_INGREDIENTS,
  MOCK_SALES,
  MOCK_SALE_ITEMS,
} from "@/data/mock-data";
import type {
  Business,
  Expense,
  ExpenseInput,
  Ingredient,
  IngredientInput,
  Period,
  PeriodResult,
  Recipe,
  RecipeIngredient,
  RecipeInput,
  RecipeWithCosts,
  Sale,
  SaleInput,
  SaleItem,
  SaleWithItems,
} from "@/types/domain";

export interface CusteiaRepository {
  getBusiness(): Promise<Business>;

  listIngredients(): Promise<Ingredient[]>;
  createIngredient(input: IngredientInput): Promise<Ingredient>;
  updateIngredient(id: string, input: IngredientInput): Promise<Ingredient>;
  deleteIngredient(id: string): Promise<void>;

  listRecipes(): Promise<RecipeWithCosts[]>;
  getRecipe(id: string): Promise<RecipeWithCosts>;
  createRecipe(input: RecipeInput): Promise<Recipe>;
  updateRecipe(id: string, input: RecipeInput): Promise<Recipe>;
  deleteRecipe(id: string): Promise<void>;

  listSales(): Promise<SaleWithItems[]>;
  createSale(input: SaleInput): Promise<Sale>;
  deleteSale(id: string): Promise<void>;

  listExpenses(): Promise<Expense[]>;
  createExpense(input: ExpenseInput): Promise<Expense>;
  updateExpense(id: string, input: ExpenseInput): Promise<Expense>;
  deleteExpense(id: string): Promise<void>;

  getPeriodResult(period: Period): Promise<PeriodResult>;
}

/* -------------------------------------------------------------------------- */
/* Implementação mock em memória                                              */
/* -------------------------------------------------------------------------- */

const LATENCY_MS = 220;

const db = {
  business: { ...MOCK_BUSINESS },
  ingredients: [...MOCK_INGREDIENTS],
  recipes: [...MOCK_RECIPES],
  recipeIngredients: [...MOCK_RECIPE_INGREDIENTS],
  sales: [...MOCK_SALES],
  saleItems: [...MOCK_SALE_ITEMS],
  expenses: [...MOCK_EXPENSES],
};

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
}

function id(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function stamps() {
  const at = new Date().toISOString();
  return { created_at: at, updated_at: at };
}

function recipeWithCosts(recipe: Recipe): RecipeWithCosts {
  const links = db.recipeIngredients.filter((l) => l.recipe_id === recipe.id);
  return buildRecipeWithCosts(recipe, links, db.ingredients);
}

function unitCostOf(recipeId: string): number {
  const recipe = db.recipes.find((r) => r.id === recipeId);
  return recipe ? recipeWithCosts(recipe).unit_cost : 0;
}

function saleWithItems(sale: Sale): SaleWithItems {
  const items = db.saleItems
    .filter((item) => item.sale_id === sale.id)
    .map((item) => ({
      ...item,
      recipe_name: db.recipes.find((r) => r.id === item.recipe_id)?.name ?? "Produto removido",
      unit_cost: unitCostOf(item.recipe_id),
    }));

  return {
    ...sale,
    items,
    total_cost: items.reduce((sum, item) => sum + item.unit_cost * item.quantity, 0),
  };
}

export const mockRepository: CusteiaRepository = {
  getBusiness: () => delay({ ...db.business }),

  listIngredients: () =>
    delay([...db.ingredients].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))),

  createIngredient: (input) => {
    const ingredient: Ingredient = {
      id: id("ing"),
      business_id: db.business.id,
      ...input,
      ...stamps(),
    };
    db.ingredients = [...db.ingredients, ingredient];
    return delay(ingredient);
  },

  updateIngredient: (idToUpdate, input) => {
    const current = db.ingredients.find((i) => i.id === idToUpdate);
    if (!current) return Promise.reject(new Error("Insumo não encontrado."));
    const updated: Ingredient = { ...current, ...input, updated_at: new Date().toISOString() };
    db.ingredients = db.ingredients.map((i) => (i.id === idToUpdate ? updated : i));
    return delay(updated);
  },

  deleteIngredient: (idToDelete) => {
    const usedIn = db.recipeIngredients.filter((l) => l.ingredient_id === idToDelete);
    if (usedIn.length > 0) {
      return Promise.reject(
        new Error("Este insumo é usado em uma receita. Remova-o da receita antes de excluir."),
      );
    }
    db.ingredients = db.ingredients.filter((i) => i.id !== idToDelete);
    return delay(undefined);
  },

  listRecipes: () =>
    delay(
      [...db.recipes]
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
        .map(recipeWithCosts),
    ),

  getRecipe: (recipeId) => {
    const recipe = db.recipes.find((r) => r.id === recipeId);
    if (!recipe) return Promise.reject(new Error("Produto não encontrado."));
    return delay(recipeWithCosts(recipe));
  },

  createRecipe: (input) => {
    const recipe: Recipe = {
      id: id("rec"),
      business_id: db.business.id,
      name: input.name,
      description: input.description,
      yield_quantity: input.yield_quantity,
      yield_unit: input.yield_unit,
      selling_price: input.selling_price,
      ...stamps(),
    };
    db.recipes = [...db.recipes, recipe];
    db.recipeIngredients = [
      ...db.recipeIngredients,
      ...input.items.map<RecipeIngredient>((item) => ({
        id: id("ri"),
        recipe_id: recipe.id,
        ingredient_id: item.ingredient_id,
        quantity: item.quantity,
      })),
    ];
    return delay(recipe);
  },

  updateRecipe: (recipeId, input) => {
    const current = db.recipes.find((r) => r.id === recipeId);
    if (!current) return Promise.reject(new Error("Produto não encontrado."));
    const updated: Recipe = {
      ...current,
      name: input.name,
      description: input.description,
      yield_quantity: input.yield_quantity,
      yield_unit: input.yield_unit,
      selling_price: input.selling_price,
      updated_at: new Date().toISOString(),
    };
    db.recipes = db.recipes.map((r) => (r.id === recipeId ? updated : r));
    db.recipeIngredients = [
      ...db.recipeIngredients.filter((l) => l.recipe_id !== recipeId),
      ...input.items.map<RecipeIngredient>((item) => ({
        id: id("ri"),
        recipe_id: recipeId,
        ingredient_id: item.ingredient_id,
        quantity: item.quantity,
      })),
    ];
    return delay(updated);
  },

  deleteRecipe: (recipeId) => {
    const sold = db.saleItems.some((item) => item.recipe_id === recipeId);
    if (sold) {
      return Promise.reject(
        new Error("Este produto já possui vendas registradas e não pode ser excluído."),
      );
    }
    db.recipes = db.recipes.filter((r) => r.id !== recipeId);
    db.recipeIngredients = db.recipeIngredients.filter((l) => l.recipe_id !== recipeId);
    return delay(undefined);
  },

  listSales: () =>
    delay(
      [...db.sales]
        .sort((a, b) => b.sale_date.localeCompare(a.sale_date))
        .map(saleWithItems),
    ),

  createSale: (input) => {
    const saleId = id("sale");
    const items = input.items.map<SaleItem>((item) => ({
      id: id("si"),
      sale_id: saleId,
      recipe_id: item.recipe_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_amount: item.quantity * item.unit_price,
    }));
    const sale: Sale = {
      id: saleId,
      business_id: db.business.id,
      sale_date: input.sale_date,
      total_amount: items.reduce((sum, item) => sum + item.total_amount, 0),
      created_at: new Date().toISOString(),
    };
    db.sales = [...db.sales, sale];
    db.saleItems = [...db.saleItems, ...items];
    return delay(sale);
  },

  deleteSale: (saleId) => {
    db.sales = db.sales.filter((s) => s.id !== saleId);
    db.saleItems = db.saleItems.filter((item) => item.sale_id !== saleId);
    return delay(undefined);
  },

  listExpenses: () =>
    delay([...db.expenses].sort((a, b) => b.date.localeCompare(a.date))),

  createExpense: (input) => {
    const expense: Expense = {
      id: id("exp"),
      business_id: db.business.id,
      ...input,
      ...stamps(),
    };
    db.expenses = [...db.expenses, expense];
    return delay(expense);
  },

  updateExpense: (expenseId, input) => {
    const current = db.expenses.find((e) => e.id === expenseId);
    if (!current) return Promise.reject(new Error("Despesa não encontrada."));
    const updated: Expense = { ...current, ...input, updated_at: new Date().toISOString() };
    db.expenses = db.expenses.map((e) => (e.id === expenseId ? updated : e));
    return delay(updated);
  },

  deleteExpense: (expenseId) => {
    db.expenses = db.expenses.filter((e) => e.id !== expenseId);
    return delay(undefined);
  },

  getPeriodResult: ({ from, to }) => {
    const sales = db.sales
      .filter((sale) => isWithinPeriod(sale.sale_date, from, to))
      .map(saleWithItems);
    const expenses = db.expenses.filter((expense) => isWithinPeriod(expense.date, from, to));

    const revenue = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const productCost = sales.reduce((sum, sale) => sum + sale.total_cost, 0);
    const expenseTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const result = revenue - productCost - expenseTotal;

    const byDate = new Map<string, { revenue: number; result: number }>();
    for (const sale of sales) {
      const key = sale.sale_date.slice(0, 10);
      const entry = byDate.get(key) ?? { revenue: 0, result: 0 };
      entry.revenue += sale.total_amount;
      entry.result += sale.total_amount - sale.total_cost;
      byDate.set(key, entry);
    }

    return delay<PeriodResult>({
      revenue,
      productCost,
      expenses: expenseTotal,
      result,
      margin: revenue > 0 ? result / revenue : null,
      salesCount: sales.length,
      daily: [...byDate.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, value]) => ({ date, ...value })),
    });
  },
};

export { ingredientUnitCost };

/** Ponto único de troca mock → Supabase. */
export const repository: CusteiaRepository = mockRepository;
