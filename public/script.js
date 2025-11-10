document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("uploadForm");
  const inputMidia = document.getElementById("midia");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const arquivos = inputMidia.files;
    if (!arquivos.length) {
      alert("Escolha ao menos um arquivo!");
      return;
    }

    const formData = new FormData();
    for (const arquivo of arquivos) {
      formData.append("file", arquivo);
    }

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.url || Array.isArray(data)) {
        alert("Upload enviado com sucesso!");
      } else {
        alert("Erro ao enviar o arquivo.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro na conexão com o servidor.");
    }
  });
});
