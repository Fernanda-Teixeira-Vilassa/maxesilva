document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = document.getElementById("fileInput").files[0];
  if (!file) return alert("Escolha um arquivo!");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData
  });
  const data = await res.json();

  if (data.url) alert("Upload enviado!");
  else alert("Erro ao enviar.");
});
