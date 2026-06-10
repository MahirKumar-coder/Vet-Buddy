import XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read Excel file
const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node excel-to-json.js <path-to-excel-file>");
  process.exit(1);
}

const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

console.log(`📊 Found ${data.length} rows in Excel`);
console.log("Sample data:", data[0]);

// Convert to seed format
const products = data
  .filter((row) => row["Drug Name"] || row.name || row.Name) // Filter empty rows
  .map((row, idx) => {
    const name = row["Drug Name"] || row.name || row.Name || `Product ${idx + 1}`;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const price = Number(row["Unit Price (MRP)"] || row.price || row.Price || 0);
    const stock = Number(row["Stock Quantity"] || row.stock || row.Stock || 0);

    return {
      name,
      slug,
      description: `Veterinary medicine - ${name}. Prescription strength medication for pets.`,
      categorySlug: "medicines",
      breed: "",
      images: ["https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80"],
      price,
      compareAtPrice: Math.round(price * 1.15), // 15% markup for compare price
      stock,
      rating: 4.5,
      reviewCount: Math.floor(Math.random() * 50) + 10,
      isBestSeller: stock > 20,
      tags: ["medicine", "pet-health", "veterinary"],
    };
  });

const output = {
  categories: [
    { name: "Dog Food", slug: "dog-food", icon: "dog" },
    { name: "Cat Food", slug: "cat-food", icon: "cat" },
    { name: "Pet Toys", slug: "pet-toys", icon: "toy" },
    { name: "Medicines", slug: "medicines", icon: "pill" },
    { name: "Grooming", slug: "grooming", icon: "brush" },
    { name: "Accessories", slug: "accessories", icon: "collar" },
    { name: "Vaccines", slug: "vaccines", icon: "syringe" },
  ],
  products,
  coupons: [
    {
      code: "WELCOME10",
      discount: 10,
      discountType: "percentage",
      description: "Welcome discount",
      maxUses: 100,
      minOrderValue: 500,
    },
  ],
};

const outputPath = path.join(__dirname, "../server/src/data/seed-products.json");
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`\n✅ Converted ${products.length} products`);
console.log(`📁 Saved to: ${outputPath}`);
console.log("\n🚀 Next step: Run 'npm run seed' in server folder\n");
