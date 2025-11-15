// ===============================================
// ENVIO OPCIONAL DE NOME / MENSAGEM / ARQUIVOS
// ===============================================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("uploadForm");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nome = document.getElementById("nome").value || "";
      const mensagem = document.getElementById("guestMessage").value || "";
      const midias = document.getElementById("midia").files;

      form.querySelector("button").innerText = "Enviando...";
      form.querySelector("button").disabled = true;

      const formData = new FormData();
      formData.append("nome", nome);
      formData.append("mensagem", mensagem);

      for (const arquivo of midias) {
        formData.append("file", arquivo);
      }

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          alert("Erro ao enviar.");
          return;
        }

        alert("✨ Envio realizado com sucesso!");
        location.reload();

      } catch (err) {
        console.error(err);
        alert("Erro de conexão.");
      }

      form.querySelector("button").innerText = "Enviar";
      form.querySelector("button").disabled = false;
    });
  }

  const album = document.getElementById("album");
  if (album && !album.dataset.hide) {
    carregarAlbum();
  }
});

// ===============================================
// CARREGAR ÁLBUM (MÍDIA + TEXTO)
// ===============================================

async function carregarAlbum() {
  const album = document.getElementById("album");
  album.innerHTML = "<p>Carregando...</p>";

  try {
    const res = await fetch("/api/list");

    if (!res.ok) {
      album.innerHTML = "<p>Erro ao carregar o álbum.</p>";
      return;
    }

    const itens = await res.json();

    album.innerHTML = "";

    if (!itens.length) {
      album.innerHTML = "<p>Nenhum envio registrado ainda.</p>";
      return;
    }

    itens.forEach((item) => {
      album.innerHTML += `
        <div style="
          background: #ffffffd9;
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 15px;
          box-shadow: 0 3px 8px rgba(0,0,0,0.15);
        ">

          ${item.nome ? `<p style="font-weight: bold; margin-bottom: 5px;">📌 ${item.nome}</p>` : ""}

          ${item.mensagem ? `<p style="margin-bottom: 10px;">💬 ${item.mensagem}</p>` : ""}

          ${
            item.url
              ? (
                  item.tipo === "video"
                    ? `<video src="${item.url}" controls style="width: 100%; border-radius: 12px; height: 200px; object-fit: cover;"></video>`
                    : `<img src="${item.url}" style="width: 100%; border-radius: 12px; height: 200px; object-fit: cover;" />`
                )
              : `<p style="opacity: 0.6; font-style: italic;">(Sem mídia enviada)</p>`
          }
        </div>
      `;
    });

  } catch (err) {
    console.error("Erro ao carregar álbum:", err);
    album.innerHTML = "<p>Erro ao carregar o álbum.</p>";
  }
}
