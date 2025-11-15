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
    maxFileSize: 100 * 1024 * 1024, // 100MB (suporta vídeos)
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.log("Erro formidable:", err);
      return res.status(500).json({ error: "Erro ao processar arquivos" });
    }

    // Garantir que nome e mensagem sempre existem
    const nome = Array.isArray(fields.nome) ? fields.nome[0] : fields.nome || "Convidado";
    const mensagem = Array.isArray(fields.mensagem) ? fields.mensagem[0] : fields.mensagem || "";

    // Garantir que há arquivos
    if (!files.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const filesArray = Array.isArray(files.file) ? files.file : [files.file];
    const urls = [];

    for (const file of filesArray) {
      const filePath = file.filepath || file.path; // compatibilidade

      const upload = await cloudinary.uploader.upload(filePath, {
        resource_type: "auto",
        timeout: 120000, // 2 min para vídeos
      });

      urls.push(upload.secure_url);

      await FotoModel.create({
        nome,
        mensagem,
        url: upload.secure_url,
        tipo: upload.resource_type,
      });
    }

    res.status(200).json({ urls });
  });
}
