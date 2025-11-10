import formidable from "formidable";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

import Midia from "../backend/models/Midia.js";

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Conectar ao MongoDB
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
}

// Função principal (serverless)
export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    await connectDB();

    const form = formidable({ multiples: false });
    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).json({ error: "Erro ao processar upload" });

      const file = files.file[0];
      const upload = await cloudinary.uploader.upload(file.filepath, {
        folder: "max-e-silva"
      });

      const midia = await Midia.create({
        url: upload.secure_url,
        tipo: upload.resource_type
      });

      res.status(200).json(midia);
    });
  } else {
    res.status(405).json({ error: "Método não permitido" });
  }
}
