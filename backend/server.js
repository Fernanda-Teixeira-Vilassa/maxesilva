import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import url from "url";
import fs from "fs";
import Midia from "./models/Midia.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// === 🔗 Conexão com MongoDB ===
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado ao MongoDB"))
  .catch((err) => console.error("❌ Erro MongoDB:", err));

// === ☁️ Configuração do Cloudinary ===
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// === 💾 Configuração do multer (armazenamento local temporário) ===
const upload = multer({ dest: "uploads/" });

// === 📤 Rota de upload (usa multer + Cloudinary diretamente) ===
app.post("/upload", upload.array("midia", 10), async (req, res) => {
  try {
    const { nome = "Convidado", mensagem = "" } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ erro: "Nenhum arquivo enviado" });
    }

    const resultados = [];

    for (const file of req.files) {
      // Envia para o Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "casamento-max-silva",
        resource_type: "auto", // aceita imagem e vídeo
      });

      // Remove arquivo local temporário
      fs.unlinkSync(file.path);

      // Salva no MongoDB
      const novaMidia = new Midia({
        nome,
        mensagem,
        url: result.secure_url,
        tipo: file.mimetype,
      });
      await novaMidia.save();

      resultados.push(novaMidia);
    }

    res.status(200).json({ sucesso: true, midias: resultados });
  } catch (error) {
    console.error("Erro no upload:", error);
    res.status(500).json({ erro: "Erro ao enviar arquivos." });
  }
});

// === 📸 Rota para listar mídias ===
app.get("/midias", async (req, res) => {
  try {
    const midias = await Midia.find().sort({ dataEnvio: -1 });
    res.json(midias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar mídias." });
  }
});

// === 🌐 Servir frontend estaticamente ===
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`💚 Servidor rodando na porta ${PORT}`));
