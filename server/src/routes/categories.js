import { Router } from "express";
import { getRealtimeDatabase } from "../config/firebase.js";
import { authAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const db = getRealtimeDatabase();
    const snapshot = await db.ref("categories").get();
    if (!snapshot.exists()) {
      return res.json([]);
    }
    
    const categories = Object.entries(snapshot.val())
      .map(([id, val]) => ({ id, ...val }))
      .filter((c) => c.active !== false)
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", authAdmin, async (req, res) => {
  try {
    const db = getRealtimeDatabase();
    const categoriesRef = db.ref("categories");
    const newCategoryRef = categoriesRef.push();
    
    const category = {
      ...req.body,
      active: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    await newCategoryRef.set(category);
    res.status(201).json({ id: newCategoryRef.key, ...category });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", authAdmin, async (req, res) => {
  try {
    const db = getRealtimeDatabase();
    const categoryRef = db.ref(`categories/${req.params.id}`);
    
    const updates = {
      ...req.body,
      updatedAt: Date.now(),
    };
    
    await categoryRef.update(updates);
    res.json({ id: req.params.id, ...updates });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", authAdmin, async (req, res) => {
  try {
    const db = getRealtimeDatabase();
    const categoryRef = db.ref(`categories/${req.params.id}`);
    
    await categoryRef.update({
      active: false,
      updatedAt: Date.now(),
    });
    
    res.json({ message: "Category deactivated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
