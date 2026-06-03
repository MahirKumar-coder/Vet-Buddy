import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonPath = path.join(__dirname, "../server/src/data/seed-products.json");
const publicProductsDir = path.join(__dirname, "../public/products");

// Normalization function to find matching files
function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "") // remove all non-alphanumeric chars (dashes, dots, spaces)
    .replace(/tab(s)?/g, "")   // remove common words
    .replace(/syrup|syp/g, "")
    .replace(/injectable|inj/g, "")
    .replace(/rr/g, "r");      // handle iverraj vs iveraj
}

try {
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  const files = fs.readdirSync(publicProductsDir).filter(f => !f.startsWith("WhatsApp"));
  
  console.log(`Analyzing matches for ${data.products.length} products and ${files.length} physical files...\n`);

  const matches = {};
  const unmatchedFiles = new Set(files);
  const unmatchedProducts = [];

  data.products.forEach((p) => {
    const slugNorm = normalize(p.slug);
    const nameNorm = normalize(p.name);
    
    // Find a matching file
    let matchedFile = null;
    
    // 1. Try exact filename match with slug or name
    for (const file of files) {
      const fileBase = path.basename(file, path.extname(file));
      const fileNorm = normalize(fileBase);
      
      if (fileBase === p.slug || fileNorm === slugNorm || fileNorm === nameNorm) {
        matchedFile = file;
        break;
      }
    }
    
    if (matchedFile) {
      matches[p.slug] = matchedFile;
      unmatchedFiles.delete(matchedFile);
    } else {
      unmatchedProducts.push(p);
    }
  });

  console.log(`✅ Matched Products: ${Object.keys(matches).length}`);
  console.log(`❌ Unmatched Products: ${unmatchedProducts.length}`);
  console.log(`📁 Unused Files in public/products: ${unmatchedFiles.size}`);

  console.log("\n--- Matched List ---");
  Object.entries(matches).forEach(([slug, file]) => {
    console.log(`Slug: ${slug} -> File: ${file}`);
  });

  if (unmatchedFiles.size > 0) {
    console.log("\n--- Unused Files Details ---");
    Array.from(unmatchedFiles).forEach(f => console.log(`  ${f}`));
  }

  if (unmatchedProducts.length > 0) {
    console.log("\n--- Unmatched Products (First 10) ---");
    unmatchedProducts.slice(0, 10).forEach(p => console.log(`  Name: ${p.name} (slug: ${p.slug})`));
  }

} catch (e) {
  console.error(e);
}
