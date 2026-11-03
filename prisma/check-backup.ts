
import * as fs from "fs/promises";
import * as path from "path";

async function main() {
  const filePath = path.join(
    process.cwd(),
    "prisma",
    "local-backup.json"
  );

  const content = await fs.readFile(filePath, "utf-8");
  const data = JSON.parse(content);

  const missingId = "cmr7i2fxu000ljni9bgzfj7kb";

  const product = data.products.find(
    (p: any) => p.id === missingId
  );

  const images = data.productImages.filter(
    (img: any) => img.productId === missingId
  );

  console.log("\n========== PRODUCT ==========");
  console.log(product ?? "PRODUCT NOT FOUND IN BACKUP");

  console.log("\n========== IMAGES ==========");
  console.log(JSON.stringify(images, null, 2));

  console.log("\n========== TOTALS ==========");
  console.log("Products:", data.products.length);
  console.log("Product Images:", data.productImages.length);
}

main().catch(console.error);
