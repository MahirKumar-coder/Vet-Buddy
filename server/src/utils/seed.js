import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { getRealtimeDatabase } from "../config/firebase.js";
import { readFileSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join, basename, extname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedData = JSON.parse(
  readFileSync(join(__dirname, "../data/seed-products.json"), "utf-8")
);

dotenv.config();

// Helper to normalize strings for robust image matching
function normalize(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/venttura/g, "")
    .replace(/pro/g, "")
    .replace(/[^a-z0-9]/g, "") // Remove all non-alphanumeric chars
    .replace(/tab(s)?/g, "")   // Remove common words like tab/tabs
    .replace(/syrup|syp/g, "") // Remove syrup/syp
    .replace(/injectable|inj/g, "")
    .replace(/rr/g, "r")      // Handle spelling variations like iverraj/iveraj
    .replace(/mm/g, "m");      // Handle spelling variations like ammino/amino
}

async function seed() {
  console.log("🔥 Starting Firebase Realtime Database Seeding...");
  const db = getRealtimeDatabase();

  // 1. Seed Admin User
  const email = (process.env.ADMIN_EMAIL || "admin@vetbuddy.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Admin@123";
  const hash = await bcrypt.hash(password, 10);

  const adminsSnapshot = await db.ref("admins").get();
  let adminKey = "default_admin";
  
  if (adminsSnapshot.exists()) {
    const adminEntry = Object.entries(adminsSnapshot.val()).find(
      ([, a]) => a.email?.toLowerCase() === email
    );
    if (adminEntry) {
      adminKey = adminEntry[0];
    }
  }

  await db.ref(`admins/${adminKey}`).set({
    email,
    passwordHash: hash,
    name: "Vet Buddy Admin",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  console.log(`✅ Admin account seeded: ${email}`);

  // Remove existing catalog data to start clean
  console.log("🧹 Wiping old products and categories nodes from Firebase Realtime DB...");
  await db.ref("products").remove();
  await db.ref("categories").remove();

  // Get physical image files in public/products
  const publicProductsDir = join(__dirname, "../../../public/products");
  let publicFiles = [];
  try {
    publicFiles = readdirSync(publicProductsDir).filter(f => !f.startsWith("WhatsApp"));
    console.log(`📁 Found ${publicFiles.length} physical files in public/products/`);
  } catch (e) {
    console.warn("⚠️ Could not read public/products folder:", e.message);
  }

  // 2. Seed Products
  let matchedCount = 0;
  for (const p of seedData.products) {
    const productKey = p.slug;
    
    // Resolve correct image
    let productImages = ["/products/placeholder.png"];
    const slugNorm = normalize(p.slug);
    const nameNorm = normalize(p.name);
    let foundMatch = false;

    // A. Match physical file by slug, normalized name, or substring
    let bestMatch = null;
    let bestMatchLen = 0;

    for (const file of publicFiles) {
      const fileBase = basename(file, extname(file));
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
      productImages = [`/products/${bestMatch}`];
      foundMatch = true;
    }

    // B. Fallback: parse user's seed-products.json images if physical match not found
    if (!foundMatch && p.images && p.images.length > 0) {
      const firstImg = p.images[0];
      let filename = "";
      if (firstImg.startsWith("http://") || firstImg.startsWith("https://")) {
        try {
          const url = new URL(firstImg);
          filename = basename(url.pathname);
        } catch (e) {
          filename = basename(firstImg);
        }
      } else {
        filename = basename(firstImg);
      }

      if (publicFiles.includes(filename)) {
        productImages = [`/products/${filename}`];
        foundMatch = true;
      }
    }

    if (foundMatch) {
      matchedCount++;
    }

    const productData = {
      ...p,
      categorySlug: "",
      category: null,
      images: productImages,
      active: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    await db.ref(`products/${productKey}`).set(productData);
  }
  console.log(`✅ Products seeded: ${seedData.products.length} (Matched images: ${matchedCount})`);

  // 3. Seed Coupons
  for (const c of seedData.coupons) {
    const couponKey = c.code.toUpperCase();
    const couponData = {
      ...c,
      code: c.code.toUpperCase(),
      usedCount: 0,
      active: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    await db.ref(`coupons/${couponKey}`).set(couponData);
  }
  console.log(`✅ Coupons seeded: ${seedData.coupons.length}`);

  console.log("\n⭐️ Firebase Database seeding completed successfully!\n");
  process.exit(0);
}

seed().catch((e) => {
  console.error("❌ Seeding failed:", e);
  process.exit(1);
});
