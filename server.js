import "dotenv/config"; // carrega .env
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import uploadHandler from "./api/upload.js";
import listHandler from "./api/list.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, "public")));

// rotas de API usando os mesmos handlers da Vercel
app.post("/api/upload", (req, res) => {
  return uploadHandler(req, res);
});

app.get("/api/list", (req, res) => {
  return listHandler(req, res);
});

// iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`➡ Abrir em: http://localhost:${PORT}`);
});
