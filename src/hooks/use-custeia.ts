import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { repository } from "@/data/repository";
import type {
  ExpenseInput,
  IngredientInput,
  Period,
  RecipeInput,
  SaleInput,
} from "@/types/domain";

export const queryKeys = {
  business: ["business"] as const,
  ingredients: ["ingredients"] as const,
  recipes: ["recipes"] as const,
  sales: ["sales"] as const,
  expenses: ["expenses"] as const,
  result: (period: Period) => ["result", period.from, period.to] as const,
};

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

/** Invalida tudo que depende de custos/valores após uma escrita. */
function useInvalidateAll() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries();
  };
}

export function useBusiness() {
  return useQuery({ queryKey: queryKeys.business, queryFn: () => repository.getBusiness() });
}

export function useIngredients() {
  return useQuery({ queryKey: queryKeys.ingredients, queryFn: () => repository.listIngredients() });
}

export function useRecipes() {
  return useQuery({ queryKey: queryKeys.recipes, queryFn: () => repository.listRecipes() });
}

export function useSales() {
  return useQuery({ queryKey: queryKeys.sales, queryFn: () => repository.listSales() });
}

export function useExpenses() {
  return useQuery({ queryKey: queryKeys.expenses, queryFn: () => repository.listExpenses() });
}

export function usePeriodResult(period: Period) {
  return useQuery({
    queryKey: queryKeys.result(period),
    queryFn: () => repository.getPeriodResult(period),
  });
}

/* ---------------------------- Insumos ---------------------------- */

export function useSaveIngredient() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string | undefined; input: IngredientInput }) =>
      id ? repository.updateIngredient(id, input) : repository.createIngredient(input),
    onSuccess: (_data, variables) => {
      invalidate();
      toast.success(variables.id ? "Insumo atualizado." : "Insumo cadastrado.");
    },
    onError: (error) => toast.error(errorMessage(error, "Não foi possível salvar o insumo.")),
  });
}

export function useDeleteIngredient() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (id: string) => repository.deleteIngredient(id),
    onSuccess: () => {
      invalidate();
      toast.success("Insumo excluído.");
    },
    onError: (error) => toast.error(errorMessage(error, "Não foi possível excluir o insumo.")),
  });
}

/* --------------------------- Produtos ---------------------------- */

export function useSaveRecipe() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string | undefined; input: RecipeInput }) =>
      id ? repository.updateRecipe(id, input) : repository.createRecipe(input),
    onSuccess: (_data, variables) => {
      invalidate();
      toast.success(variables.id ? "Produto atualizado." : "Produto cadastrado.");
    },
    onError: (error) => toast.error(errorMessage(error, "Não foi possível salvar o produto.")),
  });
}

export function useDeleteRecipe() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (id: string) => repository.deleteRecipe(id),
    onSuccess: () => {
      invalidate();
      toast.success("Produto excluído.");
    },
    onError: (error) => toast.error(errorMessage(error, "Não foi possível excluir o produto.")),
  });
}

/* ---------------------------- Vendas ----------------------------- */

export function useCreateSale() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (input: SaleInput) => repository.createSale(input),
    onSuccess: () => {
      invalidate();
      toast.success("Venda registrada.");
    },
    onError: (error) => toast.error(errorMessage(error, "Não foi possível registrar a venda.")),
  });
}

export function useDeleteSale() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (id: string) => repository.deleteSale(id),
    onSuccess: () => {
      invalidate();
      toast.success("Venda excluída.");
    },
    onError: (error) => toast.error(errorMessage(error, "Não foi possível excluir a venda.")),
  });
}

/* --------------------------- Despesas ---------------------------- */

export function useSaveExpense() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string | undefined; input: ExpenseInput }) =>
      id ? repository.updateExpense(id, input) : repository.createExpense(input),
    onSuccess: (_data, variables) => {
      invalidate();
      toast.success(variables.id ? "Despesa atualizada." : "Despesa registrada.");
    },
    onError: (error) => toast.error(errorMessage(error, "Não foi possível salvar a despesa.")),
  });
}

export function useDeleteExpense() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (id: string) => repository.deleteExpense(id),
    onSuccess: () => {
      invalidate();
      toast.success("Despesa excluída.");
    },
    onError: (error) => toast.error(errorMessage(error, "Não foi possível excluir a despesa.")),
  });
}
