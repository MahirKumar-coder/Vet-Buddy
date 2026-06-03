import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonPath = path.join(__dirname, "../server/src/data/seed-products.json");
const publicProductsDir = path.join(__dirname, "../public/products");

// Normalization function to match filenames
function normalize(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/tab(s)?/g, "")
    .replace(/syrup|syp/g, "")
    .replace(/injectable|inj/g, "")
    .replace(/rr/g, "r");
}

try {
  const seedData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  const publicFiles = fs.readdirSync(publicProductsDir).filter(f => !f.startsWith("WhatsApp"));
  
  console.log(`Original product count: ${seedData.products.length}`);
  console.log(`Physical files found: ${publicFiles.length}`);

  const filteredProducts = [];
  const matchedFiles = new Set();

  seedData.products.forEach((p) => {
    const slugNorm = normalize(p.slug);
    const nameNorm = normalize(p.name);
    let matchedFile = null;

    // A. Check for matching file
    for (const file of publicFiles) {
      const fileBase = path.basename(file, path.extname(file));
      const fileNorm = normalize(fileBase);
      
      if (fileBase === p.slug || fileNorm === slugNorm || fileNorm === nameNorm) {
        matchedFile = file;
        break;
      }
    }

    // B. Fallback to check original images field
    if (!matchedFile && p.images && p.images.length > 0) {
      const firstImg = p.images[0];
      let filename = "";
      if (firstImg.startsWith("http://") || firstImg.startsWith("https://")) {
        try {
          const url = new URL(firstImg);
          filename = path.basename(url.pathname);
        } catch (e) {
          filename = path.basename(firstImg);
        }
      } else {
        filename = path.basename(firstImg);
      }

      if (publicFiles.includes(filename)) {
        matchedFile = filename;
      }
    }

    if (matchedFile) {
      // Keep product and update its image path to the local one
      filteredProducts.push({
        ...p,
        images: [`/products/${matchedFile}`]
      });
      matchedFiles.add(matchedFile);
    } else {
      console.log(`❌ Removing unmatched product: ${p.name} (${p.slug})`);
    }
  });

  console.log(`\nFiltered product count: ${filteredProducts.length}`);
  console.log(`Unmatched image files in public/products: ${publicFiles.length - matchedFiles.size}`);

  // Update seedData and write back to file
  seedData.products = filteredProducts;
  fs.writeFileSync(jsonPath, JSON.stringify(seedData, null, 2), "utf-8");
  console.log(`\n✅ Saved updated product list to ${jsonPath}`);

} catch (error) {
  console.error("Error filtering products:", error);
}
