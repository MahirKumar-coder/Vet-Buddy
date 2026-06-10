import { Router } from "express";
import { getRealtimeDatabase } from "../config/firebase.js";
import { authAdmin } from "../middleware/auth.js";
import { getCache, setCache, clearCachePattern } from "../config/redis.js";

const router = Router();

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// GET / - List all products with filtering, sorting, and pagination
router.get("/", async (req, res) => {
  try {
    const {
      category,
      breed,
      search,
      sort = "newest",
      page = 1,
      limit = 12,
      minPrice,
      maxPrice,
      bestSeller,
    } = req.query;

    const db = getRealtimeDatabase();
    
    // Fetch products (from cache or Firebase)
    let productsVal = await getCache("products:raw");
    if (!productsVal) {
      const productsSnapshot = await db.ref("products").get();
      if (!productsSnapshot.exists()) {
        return res.json({
          products: [],
          pagination: { page: Number(page), limit: Number(limit), total: 0, pages: 0 },
        });
      }
      productsVal = productsSnapshot.val();
      await setCache("products:raw", productsVal, 3600); // Cache for 1 hour
    }

    let productList = Object.entries(productsVal).map(([id, val]) => ({
      id,
      _id: id,
      ...val,
    }));

    // Fetch categories for population mapping (from cache or Firebase)
    let categoriesVal = await getCache("categories:raw");
    if (!categoriesVal) {
      const categoriesSnapshot = await db.ref("categories").get();
      categoriesVal = categoriesSnapshot.exists() ? categoriesSnapshot.val() : {};
      await setCache("categories:raw", categoriesVal, 3600); // Cache for 1 hour
    }

    const categoriesMap = {};
    Object.entries(categoriesVal).forEach(([id, val]) => {
      categoriesMap[id] = { id, name: val.name, slug: val.slug };
    });

    // Populate category field & active filter
    productList = productList.map((p) => {
      const populatedCat = categoriesMap[p.category] || null;
      return { ...p, category: populatedCat };
    }).filter((p) => p.active !== false);

    // Apply Filters
    if (category) {
      productList = productList.filter(
        (p) => p.categorySlug === category || (p.category && p.category.slug === category)
      );
    }
    if (breed) {
      const b = breed.toLowerCase();
      productList = productList.filter((p) => p.breed?.toLowerCase() === b);
    }
    if (bestSeller === "true") {
      productList = productList.filter((p) => p.isBestSeller === true);
    }
    if (minPrice || maxPrice) {
      productList = productList.filter((p) => {
        const price = Number(p.price || 0);
        if (minPrice && price < Number(minPrice)) return false;
        if (maxPrice && price > Number(maxPrice)) return false;
        return true;
      });
    }
    if (search) {
      const q = search.toLowerCase();
      productList = productList.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          (Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Apply Sorting
    if (sort === "price_asc") {
      productList.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sort === "price_desc") {
      productList.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sort === "rating") {
      productList.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else {
      // newest by default
      productList.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
    }

    // Pagination
    const total = productList.length;
    const skip = (Number(page) - 1) * Number(limit);
    const paginatedProducts = productList.slice(skip, skip + Number(limit));

    res.json({
      products: paginatedProducts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /:slug - Get single product by slug or id
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Check cache first
    const cachedProduct = await getCache(`products:detail:${slug}`);
    if (cachedProduct) {
      return res.json(cachedProduct);
    }

    const db = getRealtimeDatabase();
    
    let productsVal = await getCache("products:raw");
    if (!productsVal) {
      const productsSnapshot = await db.ref("products").get();
      if (!productsSnapshot.exists()) {
        return res.status(404).json({ message: "Product not found" });
      }
      productsVal = productsSnapshot.val();
      await setCache("products:raw", productsVal, 3600);
    }

    const productList = Object.entries(productsVal).map(([id, val]) => ({
      id,
      _id: id,
      ...val,
    }));

    // Find product matching id or slug
    const product = productList.find(
      (p) => (p.slug === slug || p.id === slug) && p.active !== false
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Populate category
    if (product.category) {
      let categoriesVal = await getCache("categories:raw");
      if (!categoriesVal) {
        const categoriesSnapshot = await db.ref("categories").get();
        categoriesVal = categoriesSnapshot.exists() ? categoriesSnapshot.val() : {};
        await setCache("categories:raw", categoriesVal, 3600);
      }
      const catVal = categoriesVal[product.category];
      if (catVal) {
        product.category = { id: product.category, name: catVal.name, slug: catVal.slug };
      }
    }

    await setCache(`products:detail:${slug}`, product, 3600); // Cache for 1 hour

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST / - Create product
router.post("/", authAdmin, async (req, res) => {
  try {
    const db = getRealtimeDatabase();
    const productsRef = db.ref("products");
    const newProductRef = productsRef.push();
    
    const data = { ...req.body };
    if (!data.slug) {
      data.slug = slugify(data.name || "");
    }
    
    const product = {
      ...data,
      active: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await newProductRef.set(product);
    
    // Invalidate product caches
    await clearCachePattern("products:*");

    res.status(201).json({ id: newProductRef.key, _id: newProductRef.key, ...product });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /:id - Update product
router.put("/:id", authAdmin, async (req, res) => {
  try {
    const db = getRealtimeDatabase();
    const productRef = db.ref(`products/${req.params.id}`);
    
    const updates = {
      ...req.body,
      updatedAt: Date.now(),
    };

    await productRef.update(updates);
    
    // Invalidate product caches
    await clearCachePattern("products:*");

    res.json({ id: req.params.id, _id: req.params.id, ...updates });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /:id - Soft delete product
router.delete("/:id", authAdmin, async (req, res) => {
  try {
    const db = getRealtimeDatabase();
    const productRef = db.ref(`products/${req.params.id}`);
    
    await productRef.update({
      active: false,
      updatedAt: Date.now(),
    });
    
    // Invalidate product caches
    await clearCachePattern("products:*");
    
    res.json({ message: "Product deactivated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
