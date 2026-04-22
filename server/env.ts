import fs from "fs";
import path from "path";
import { config } from "dotenv";

// Carrega `.env` na raiz do projeto antes de qualquer rota/Prisma (Node não lê .env automaticamente).
const envPath = path.resolve(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  config({ path: envPath });
} else if (process.env.NODE_ENV !== "test") {
  // eslint-disable-next-line no-console
  console.warn(`[env] Arquivo .env não encontrado em ${envPath} (use variáveis do sistema ou crie o arquivo).`);
}
