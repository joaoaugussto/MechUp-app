import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Ordem importa por causa das relações (FK)
  await prisma.service.deleteMany();
  await prisma.car.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.shop.deleteMany();

  console.log("✅ Banco limpo (services/cars/clients/shops).");
}

main()
  .catch((err) => {
    console.error("❌ Falha ao limpar o banco:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

