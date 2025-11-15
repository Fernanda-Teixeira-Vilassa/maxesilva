import "dotenv/config";      // <-- ADICIONE ESTA LINHA
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("❌ MONGO_URI não encontrado no .env");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI, {
        dbName: "maxsilva_album",
        connectTimeoutMS: 30000,
        socketTimeoutMS: 30000,
      })
      .then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

const FotoSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    mensagem: { type: String },
    url: { type: String, required: true },
    tipo: { type: String },
  },
  { timestamps: true }
);

export const FotoModel =
  mongoose.models.Foto || mongoose.model("Foto", FotoSchema);
