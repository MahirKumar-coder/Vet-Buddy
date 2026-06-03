import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { getRealtimeDatabase } from "../config/firebase.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedData = JSON.parse(
  readFileSync(join(__dirname, "../data/seed-products.json"), "utf-8")
);

dotenv.config();

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

  // 2. Seed Categories
  const categoryMap = {};
  for (const c of seedData.categories) {
    // Use slug as the Firebase key
    const categoryKey = c.slug;
    const categoryData = {
      ...c,
      active: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    await db.ref(`categories/${categoryKey}`).set(categoryData);
    categoryMap[c.slug] = categoryKey;
  }
  console.log(`✅ Categories seeded: ${seedData.categories.length}`);

  // 3. Seed Products
  for (const p of seedData.products) {
    // Use slug as the Firebase key
    const productKey = p.slug;
    const productData = {
      ...p,
      category: categoryMap[p.categorySlug] || p.categorySlug,
      active: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    await db.ref(`products/${productKey}`).set(productData);
  }
  console.log(`✅ Products seeded: ${seedData.products.length}`);

  // 4. Seed Coupons
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
