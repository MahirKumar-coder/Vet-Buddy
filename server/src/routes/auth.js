import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getAdminFromDB, getAdminByIdFromDB } from "../config/firebase.js";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await getAdminFromDB(email);
    
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const valid = await bcrypt.compare(password, admin.passwordHash || "");
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
    
    res.json({
      token,
      admin: { id: admin.id, email: admin.email, name: admin.name },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/me", async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await getAdminByIdFromDB(decoded.id);
    
    if (!admin) {
      return res.status(404).json({ message: "Admin user not found" });
    }
    
    // Remove sensitive field before sending response
    const adminResponse = { ...admin };
    delete adminResponse.passwordHash;
    
    res.json(adminResponse);
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

export default router;
