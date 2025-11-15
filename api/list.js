import { connectDB, FotoModel } from "../lib/db.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Método não permitido" });
    }

    await connectDB();

    const fotos = await FotoModel.find().sort({ createdAt: -1 });

    res.setHeader("Cache-Control", "no-store");

    return res.status(200).json(fotos);

  } catch (error) {
    console.error("Erro na rota /api/list:", error);
    return res.status(500).json({ error: "Erro ao carregar álbum" });
  }
}
