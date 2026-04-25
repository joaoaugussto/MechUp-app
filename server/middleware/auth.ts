import type { NextFunction, Request, Response } from "express";

import { verifyToken } from "../auth/jwt";
import { prisma } from "../prisma/client";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; email: string; name: string; shopId: string };
      tenant?: { id: string; name: string };
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
const authHeader = req.header("authorization");

if (!authHeader?.startsWith("Bearer ")) {
  return res.status(401).json({ error: "invalid_header" });
}

const token = authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "missing_token" });

  let claims: { sub: string; shopId: string; email: string };
  try {
    claims = verifyToken(token);
  } catch {
    return res.status(401).json({ error: "invalid_token" });
  }

  const user = await prisma.user.findUnique({
    where: { id: claims.sub },
    include: { shop: true },
  });

  if (!user || user.shopId !== claims.shopId) return res.status(401).json({ error: "invalid_user" });
  if (!user.shop.isActive) return res.status(403).json({ error: "shop_inactive" });

  req.user = { id: user.id, email: user.email, name: user.name, shopId: user.shopId };
  req.tenant = { id: user.shop.id, name: user.shop.name };

  next();
}


