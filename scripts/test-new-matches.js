import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonPath = path.join(__dirname, "../server/src/data/seed-products.json");
const publicProductsDir = path.join(__dirname, "../public/products");

function normalize(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/venttura/g, "")
    .replace(/pro/g, "")
    .replace(/[^a-z0-9]/g, "")
    .replace(/tab(s)?/g, "")
    .replace(/syrup|syp/g, "")
    .replace(/injectable|inj/g, "")
    .replace(/rr/g, "r")
    .replace(/mm/g, "m");
}

try {
  const seedData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  const publicFiles = fs.readdirSync(publicProductsDir).filter(f => !f.startsWith("WhatsApp"));

  let matchedCount = 0;
  const matchDetails = [];

  seedData.products.forEach((p) => {
    const slugNorm = normalize(p.slug);
    const nameNorm = normalize(p.name);
    
    let bestMatch = null;
    let bestMatchLen = 0;

    for (const file of publicFiles) {
      const fileBase = path.basename(file, path.extname(file));
      const fileNorm = normalize(fileBase);
      
      if (fileBase === p.slug || fileNorm === slugNorm || fileNorm === nameNorm) {
        bestMatch = file;
        break;
      }
      
      if (fileNorm.length > 0 && (slugNorm.includes(fileNorm) || nameNorm.includes(fileNorm))) {
        if (fileNorm.length > bestMatchLen) {
          bestMatch = file;
          bestMatchLen = fileNorm.length;
        }
      }
    }

    if (bestMatch) {
      matchedCount++;
      matchDetails.push({ name: p.name, slug: p.slug, file: bestMatch });
    } else {
      matchDetails.push({ name: p.name, slug: p.slug, file: "❌ NO MATCH" });
    }
  });

  console.log(`Matched ${matchedCount} / ${seedData.products.length} products`);
  console.log("\n--- Match Results ---");
  matchDetails.forEach((m) => {
    console.log(`Product: ${m.name} (${m.slug}) -> ${m.file}`);
  });

} catch (error) {
  console.error(error);
}
