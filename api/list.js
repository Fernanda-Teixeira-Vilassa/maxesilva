import { connectDB, FotoModel } from "../lib/db.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Método não permitido" });
    }

    await connectDB();

    // Buscar todas as fotos, mais novas primeiro
    const fotos = await FotoModel.find().sort({ createdAt: -1 });

    // Evitar cache da Vercel (carregar sempre o álbum atualizado)
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).json(fotos);

  } catch (error) {
    console.error("Erro na rota /api/list:", error);
    return res.status(500).json({ error: "Erro ao carregar álbum" });
  }
}
