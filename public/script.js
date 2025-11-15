// ===============================================
// ENVIO DE ARQUIVOS
// ===============================================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("uploadForm");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nome = document.getElementById("nome").value || "Convidado";
      const mensagem = document.getElementById("guestMessage").value || "";
      const midias = document.getElementById("midia").files;

      if (!midias.length) {
        alert("Selecione pelo menos 1 arquivo!");
        return;
      }

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

        if (!res.ok) {
          const txt = await res.text();
          console.error("Erro da API:", txt);
          alert("Erro ao enviar os arquivos.");
          return;
        }

        const data = await res.json();

        if (data.urls) {
          alert("✨ Upload enviado com sucesso!");
          location.reload();
        } else {
          alert("Erro inesperado ao enviar mídia.");
        }

      } catch (err) {
        console.error(err);
        alert("Erro de conexão com o servidor.");
      }

      form.querySelector("button").innerText = "Enviar Arquivos";
      form.querySelector("button").disabled = false;
    });
  }

  // IDENTIFICA SE O ÁLBUM DEVE SER CARREGADO OU NÃO
  const album = document.getElementById("album");
  if (album && !album.dataset.hide) {
    carregarAlbum(); // só carrega se NÃO tiver data-hide="true"
  }
});

// ===============================================
// FUNÇÃO PARA CARREGAR FOTOS E VÍDEOS
// ===============================================

async function carregarAlbum() {
  const album = document.getElementById("album");

  album.innerHTML = "<p>Carregando fotos...</p>";

  try {
    const res = await fetch("/api/list");

    if (!res.ok) {
      album.innerHTML = "<p>Erro ao carregar o álbum.</p>";
      return;
    }

    const fotos = await res.json();

    album.innerHTML = "";

    if (!fotos.length) {
      album.innerHTML = "<p>Nenhuma foto enviada ainda.</p>";
      return;
    }

    fotos.forEach((item) => {
      if (item.tipo === "video") {
        album.innerHTML += `
          <video src="${item.url}" controls 
          style="border-radius: 12px; width: 100%; height: 200px; object-fit: cover;"></video>
        `;
      } else {
        album.innerHTML += `
          <img src="${item.url}" alt="Foto enviada"
          style="border-radius: 12px; width: 100%; height: 200px; object-fit: cover;" />
        `;
      }
    });

  } catch (err) {
    console.error("Erro ao carregar álbum:", err);
    album.innerHTML = "<p>Erro ao carregar álbum.</p>";
  }
}
