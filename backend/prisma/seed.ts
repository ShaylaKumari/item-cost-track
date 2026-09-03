/**
 * Seed mínimo: 1 usuário, insumos, 2 receitas, relações, vendas e despesas.
 * Requer DATABASE_URL válida e migration aplicada.
 */
import { PrismaClient, MeasurementUnit } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "alzira@custeia.app" },
    update: {},
    create: { name: "Alzira Nogueira", email: "alzira@custeia.app" },
  });

  const supplies = await Promise.all(
    [
      { name: "Farinha de trigo", purchaseQuantity: 10, purchaseUnit: MeasurementUnit.kg, purchasePrice: 48.9 },
      { name: "Açúcar refinado", purchaseQuantity: 8, purchaseUnit: MeasurementUnit.kg, purchasePrice: 36 },
      { name: "Chocolate meio amargo", purchaseQuantity: 5, purchaseUnit: MeasurementUnit.kg, purchasePrice: 189.5 },
      { name: "Ovos", purchaseQuantity: 60, purchaseUnit: MeasurementUnit.unidade, purchasePrice: 42 },
    ].map((data) => prisma.supply.create({ data: { ...data, userId: user.id } })),
  );

  const brownie = await prisma.recipe.create({
    data: {
      userId: user.id,
      name: "Brownie tradicional",
      description: "Assadeira 30x20 cortada em 20 pedaços.",
      yieldQuantity: 20,
      yieldUnit: MeasurementUnit.unidade,
      sellingPrice: 8.5,
      supplies: {
        create: [
          { supplyId: supplies[0]!.id, quantity: 500, unit: MeasurementUnit.g },
          { supplyId: supplies[2]!.id, quantity: 300, unit: MeasurementUnit.g },
          { supplyId: supplies[3]!.id, quantity: 4, unit: MeasurementUnit.unidade },
        ],
      },
    },
  });

  const bolo = await prisma.recipe.create({
    data: {
      userId: user.id,
      name: "Bolo de chocolate 1kg",
      yieldQuantity: 1,
      yieldUnit: MeasurementUnit.unidade,
      sellingPrice: 78,
      supplies: {
        create: [
          { supplyId: supplies[0]!.id, quantity: 0.4, unit: MeasurementUnit.kg },
          { supplyId: supplies[1]!.id, quantity: 300, unit: MeasurementUnit.g },
        ],
      },
    },
  });

  await prisma.sale.create({
    data: {
      userId: user.id,
      soldAt: new Date("2026-08-04T00:00:00.000Z"),
      totalPrice: 146,
      items: {
        create: [
          { recipeId: brownie.id, quantity: 8, unitPrice: 8.5 },
          { recipeId: bolo.id, quantity: 1, unitPrice: 78 },
        ],
      },
    },
  });

  await prisma.sale.create({
    data: {
      userId: user.id,
      soldAt: new Date("2026-08-12T00:00:00.000Z"),
      totalPrice: 85,
      items: { create: [{ recipeId: brownie.id, quantity: 10, unitPrice: 8.5 }] },
    },
  });

  await prisma.expense.createMany({
    data: [
      { userId: user.id, description: "Botijão de gás", amount: 120, expenseDate: new Date("2026-08-03") },
      { userId: user.id, description: "Conta de energia", amount: 186.4, expenseDate: new Date("2026-08-10") },
    ],
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
