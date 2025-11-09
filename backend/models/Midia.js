import mongoose from "mongoose";

const midiaSchema = new mongoose.Schema({
  nome: { type: String, default: "Convidado" },
  mensagem: { type: String, default: "" },
  url: { type: String, required: true },
  tipo: { type: String, required: true },
  dataEnvio: { type: Date, default: Date.now }
});

const Midia = mongoose.models.Midia || mongoose.model("Midia", midiaSchema);
export default Midia;
