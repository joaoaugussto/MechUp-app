import bcrypt from "bcryptjs";
import { Router } from "express";

import { signToken } from "../auth/jwt";
import { authMiddleware } from "../middleware/auth";
import { prisma } from "../prisma/client";

const router = Router();

// Registro de usuário (provisionamento) protegido por SETUP_SECRET
// Para criar o primeiro usuário de uma oficina, informe a apiKey da Shop.
router.post("/register", async (req, res) => {
  const setupSecret = req.header("x-setup-secret");
  const expected =
    process.env.SETUP_SECRET || (process.env.NODE_ENV !== "production" ? "dev-setup" : undefined);
  if (!expected || setupSecret !== expected) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const { shopApiKey, name, email, password } = req.body ?? {};
  if (typeof shopApiKey !== "string" || typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "invalid_body" });
  }

  const shop = await prisma.shop.findUnique({ where: { apiKey: shopApiKey } });
  if (!shop) return res.status(400).json({ error: "invalid_shop" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { shopId: shop.id, name: name.trim(), email: email.trim().toLowerCase(), passwordHash },
  });

  return res.status(201).json({ id: user.id, shopId: user.shopId, email: user.email, name: user.name });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "invalid_body" });
  }

  const emailNorm = email.trim().toLowerCase();
  const candidates = await prisma.user.findMany({
    where: { email: emailNorm },
    include: { shop: true },
  });

  if (!candidates.length) {
    return res.status(401).json({ error: "invalid_credentials" });
  }

  let user: (typeof candidates)[0] | null = null;
  for (const row of candidates) {
    const ok = await bcrypt.compare(password, row.passwordHash);
    if (ok) {
      user = row;
      break;
    }
  }

  if (!user) {
    return res.status(401).json({ error: "invalid_credentials" });
  }

  if (!user.shop.isActive) {
    return res.status(403).json({ error: "shop_inactive" });
  }

  const token = signToken({ sub: user.id, shopId: user.shopId, email: user.email });
  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, shopId: user.shopId },
    shop: { id: user.shop.id, name: user.shop.name },
  });
});

router.get("/me", authMiddleware, async (req, res) => {
  return res.json({
    user: req.user,
    shop: req.tenant,
  });
});

export default router;

