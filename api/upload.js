import formidable from "formidable";
import cloudinary from "../lib/cloudinary.js";
import { connectDB, FotoModel } from "../lib/db.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Método não permitido" });

  await connectDB();

  const form = formidable({
    multiples: true,
    keepExtensions: true,
    maxFileSize: 100 * 1024 * 1024 // suporta vídeos grandes
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.log("Erro formidable:", err);
      return res.status(500).json({ error: "Erro ao processar arquivos" });
    }

    // Campos opcionais
    const nome = Array.isArray(fields.nome) ? fields.nome[0] : fields.nome || "";
    const mensagem = Array.isArray(fields.mensagem) ? fields.mensagem[0] : fields.mensagem || "";

    // Arquivos opcionais
    const filesArray = files.file
      ? (Array.isArray(files.file) ? files.file : [files.file])
      : [];

    const urls = [];

    // ======================================
    // ✔ Caso tenha arquivos → enviar ao Cloudinary
    // ======================================
    if (filesArray.length > 0) {
      for (const file of filesArray) {
        const filePath = file.filepath || file.path;

        const upload = await cloudinary.uploader.upload(filePath, {
          resource_type: "auto",
          timeout: 120000
        });

        urls.push(upload.secure_url);

        await FotoModel.create({
          nome,
          mensagem,
          url: upload.secure_url,
          tipo: upload.resource_type
        });
      }

      return res.status(200).json({ success: true, urls });
    }

    // ======================================
    // ✔ Caso NÃO tenha arquivos → salva só texto
    // ======================================
    await FotoModel.create({
      nome,
      mensagem,
      url: null,
      tipo: "texto"
    });

    return res.status(200).json({ success: true, urls: [] });
  });
}
