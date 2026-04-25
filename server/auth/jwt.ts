import jwt from "jsonwebtoken";

export type JwtClaims = {
  sub: string; // userId
  shopId: string;
  email: string;
};

const JWT_SECRET = process.env.JWT_SECRET;
// Em produção isso é obrigatório. No dev, você pode setar no .env.
// Mantemos um fallback só para não explodir em ambiente local.
// eslint-disable-next-line no-console
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET não definido em produção");
}

export function signToken(claims: JwtClaims) {
  return jwt.sign(claims, JWT_SECRET || "dev-jwt-secret", { expiresIn: "30d" });
}

export function verifyToken(token: string): JwtClaims {
  return jwt.verify(token, JWT_SECRET || "dev-jwt-secret") as JwtClaims;
}

