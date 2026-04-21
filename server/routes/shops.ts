import crypto from "crypto";
import { Router } from "express";

import { prisma } from "../prisma/client";

const router = Router();

// Criação de tenant (oficina) protegida por secret de setup.
// Use para provisionar novas oficinas em produção.
router.post("/", async (req, res) => {
  const setupSecret = req.header("x-setup-secret");
  const expected =
    process.env.SETUP_SECRET || (process.env.NODE_ENV !== "production" ? "dev-setup" : undefined);
  if (!expected || setupSecret !== expected) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const name = typeof req.body?.name === "string" && req.body.name.trim() ? req.body.name.trim() : "Nova oficina";
  const apiKey = crypto.randomBytes(24).toString("hex");

  const shop = await prisma.shop.create({ data: { name, apiKey } });

  return res.status(201).json({ id: shop.id, name: shop.name, apiKey: shop.apiKey });
});

export default router;

