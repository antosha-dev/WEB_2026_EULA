import { PrismaClient } from "@prisma/client";
import { getDishImageUrl } from "../src/data/dishImages.js";

const prisma = new PrismaClient();

async function main() {
  const dishes = await prisma.dish.findMany({ include: { category: true } });

  for (const dish of dishes) {
    const imageUrl = getDishImageUrl(dish.name, dish.category.name);
    await prisma.dish.update({
      where: { id: dish.id },
      data: { imageUrl }
    });
  }

  console.log(`Updated images for ${dishes.length} dishes.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
