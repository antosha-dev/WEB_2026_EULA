-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'SNACK');

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT IF EXISTS "OrderItem_dishId_fkey";
ALTER TABLE "OrderItem" DROP CONSTRAINT IF EXISTS "OrderItem_orderId_fkey";
ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_userId_fkey";

-- DropTable
DROP TABLE IF EXISTS "OrderItem";
DROP TABLE IF EXISTS "Order";

-- DropEnum
DROP TYPE IF EXISTS "OrderStatus";

-- DropIndex
DROP INDEX IF EXISTS "MenuItem_menuId_dishId_key";

-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN "mealType" "MealType" NOT NULL DEFAULT 'LUNCH';

-- CreateIndex
CREATE UNIQUE INDEX "MenuItem_menuId_dishId_mealType_key" ON "MenuItem"("menuId", "dishId", "mealType");
