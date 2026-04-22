import bcrypt from "bcryptjs";
import { Router } from "express";

import { prisma } from "../prisma/client";

const router = Router();

router.get("/shops", async (req, res) => {
  const shops = await prisma.shop.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          users: true,
          clients: true,
          cars: true,
          services: true,
        },
      },
    },
  });

  res.json(shops);
});

router.patch("/shops/:id/active", async (req, res) => {
  const isActive = Boolean(req.body?.isActive);
  const shop = await prisma.shop.update({
    where: { id: req.params.id },
    data: { isActive },
  });
  res.json({ id: shop.id, isActive: shop.isActive });
});

router.post("/shops/:id/reset-password", async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const newPassword = String(req.body?.newPassword || "");
  if (!email || newPassword.length < 6) {
    return res.status(400).json({ error: "invalid_body" });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  const updated = await prisma.user.updateMany({
    where: { shopId: req.params.id, email },
    data: { passwordHash },
  });

  if (updated.count === 0) return res.status(404).json({ error: "user_not_found" });
  res.json({ success: true, updated: updated.count });
});

router.post("/shops/:id/users", async (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  if (!name || !email || password.length < 6) {
    return res.status(400).json({ error: "invalid_body" });
  }

  const existing = await prisma.user.findFirst({ where: { email } });
  if (existing) return res.status(409).json({ error: "email_already_in_use" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { shopId: req.params.id, name, email, passwordHash },
  });

  res.status(201).json({ id: user.id, shopId: user.shopId, name: user.name, email: user.email });
});

export default router;

