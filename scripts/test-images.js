import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonPath = path.join(__dirname, "../server/src/data/seed-products.json");
const publicProductsDir = path.join(__dirname, "../public/products");

try {
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  console.log(`Loaded ${data.products.length} products from seed-products.json`);
  
  const publicFiles = new Set(fs.readdirSync(publicProductsDir));
  console.log(`Found ${publicFiles.size} files in public/products`);

  const missingFiles = [];
  const imagePaths = [];

  data.products.forEach((p) => {
    const imgs = p.images || [];
    imgs.forEach((img) => {
      imagePaths.push({ name: p.name, slug: p.slug, path: img });
      // Extract filename from URL or path
      let filename = img;
      if (img.startsWith("http://") || img.startsWith("https://")) {
        try {
          const url = new URL(img);
          filename = path.basename(url.pathname);
        } catch (e) {
          filename = path.basename(img);
        }
      } else {
        filename = path.basename(img);
      }
      
      if (!publicFiles.has(filename)) {
        missingFiles.push({ name: p.name, slug: p.slug, imagePath: img, filename });
      }
    });
  });

  console.log("\n--- Sample Image Paths in JSON ---");
  imagePaths.slice(0, 10).forEach((ip) => {
    console.log(`Product: ${ip.name} (${ip.slug}) -> Image: ${ip.path}`);
  });

  console.log(`\n--- Statistics ---`);
  console.log(`Total images checked: ${imagePaths.length}`);
  console.log(`Total missing images: ${missingFiles.length}`);

  if (missingFiles.length > 0) {
    console.log("\n--- Missing Images Details (First 15) ---");
    missingFiles.slice(0, 15).forEach((m) => {
      console.log(`Product: ${m.name} (${m.slug})`);
      console.log(`  JSON Path: ${m.imagePath}`);
      console.log(`  Expected Filename: ${m.filename}`);
    });
  }
} catch (error) {
  console.error("Error reading files:", error);
}
