import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonPath = path.join(__dirname, "../server/src/data/seed-products.json");

const ventturaProducts = [
  { name: "Venttura Amino+ 150 ml", price: 375.00 },
  { name: "Venttura Amino+ 250 ml", price: 500.00 },
  { name: "Venttura Ferro+ 150 ml", price: 265.00 },
  { name: "Venttura Immuno+ 100 ml", price: 465.00 },
  { name: "Venttura Omega+ 150 ml", price: 460.00 },
  { name: "Venttura Omega+ 250 ml", price: 700.00 },
  { name: "Venttura Omega+ 500 ml", price: 1245.00 },
  { name: "Venttura Livo+ 150 ml", price: 270.00 },
  { name: "Venttura Livo+ 250 ml", price: 410.00 },
  { name: "Venttura Calci+ Pro 45 Tabs", price: 460.00 },
  { name: "Venttura Calci+ Pro 90 Tabs", price: 795.00 },
  { name: "Venttura Flexi+ 45 Tabs", price: 990.00 },
  { name: "Venttura Flexi+ 90 Tabs", price: 1500.00 },
  { name: "Venttura Fur+ 45 Tabs", price: 570.00 },
  { name: "Venttura Fur+ 90 Tabs", price: 990.00 },
  { name: "Venttura Lacto+ 45 Tab", price: 300.00 },
  { name: "Venttura Lacto+ 90 Tab", price: 500.00 },
  { name: "Venttura Nutri+ 45 Tabs", price: 500.00 },
  { name: "Venttura Nutri+ 90 Tabs", price: 875.00 },
  { name: "Venttura Inhancer 340 gm", price: 4200.00 },
  { name: "Venttura Amino+ Cat 100 ml", price: 480.00 },
  { name: "Venttura Ferro+ Cat 100 ml", price: 444.00 },
  { name: "Venttura Omega+ Cat 100 ml", price: 480.00 },
  { name: "Venttura Livo+ Cat 100 ml", price: 450.00 },
  { name: "Venttura Immuno+ Cat 100 ml", price: 510.00 }
];

try {
  const seedData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  
  const newProducts = ventturaProducts.map(item => {
    const slug = item.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    return {
      name: item.name,
      slug: slug,
      description: `${item.name}. Premium veterinary healthcare supplement from Venttura Bioceuticals.`,
      categorySlug: "medicines",
      breed: "",
      images: [
        "/products/placeholder.png"
      ],
      price: item.price,
      compareAtPrice: Math.round(item.price * 1.15), // 15% markup for compare price
      stock: 10,
      rating: 4.5,
      reviewCount: Math.floor(Math.random() * 20) + 5,
      isBestSeller: false,
      tags: ["medicine", "supplement", "pet-health", "venttura"]
    };
  });

  // Check for duplicates
  const existingSlugs = new Set(seedData.products.map(p => p.slug));
  const uniqueNewProducts = newProducts.filter(p => {
    if (existingSlugs.has(p.slug)) {
      console.log(`⚠️ Product with slug '${p.slug}' already exists. Skipping.`);
      return false;
    }
    return true;
  });

  seedData.products = [...seedData.products, ...uniqueNewProducts];
  
  fs.writeFileSync(jsonPath, JSON.stringify(seedData, null, 2), "utf-8");
  console.log(`✅ Successfully added ${uniqueNewProducts.length} new Venttura products to seed-products.json.`);
  console.log(`Total products now in JSON: ${seedData.products.length}`);
} catch (error) {
  console.error("Error updating seed-products.json:", error);
}
