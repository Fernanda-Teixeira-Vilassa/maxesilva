// === 🌸 Animação de pétalas ===
const canvas = document.getElementById("petalas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  const petals = Array.from({ length: 25 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 6 + 2,
    speed: Math.random() * 1 + 0.5,
    drift: Math.random() * 2 - 1
  }));

  function drawPetals() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(120,180,120,0.18)";
    petals.forEach(p => {
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.size, p.size / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      p.y += p.speed;
      p.x += p.drift;
      if (p.y > canvas.height) p.y = -10;
      if (p.x > canvas.width || p.x < 0) p.x = Math.random() * canvas.width;
    });
    requestAnimationFrame(drawPetals);
  }
  drawPetals();
}

// === 🌐 Definir a URL da API automaticamente ===
const API_URL = window.location.hostname.includes("127.0.0.1") || window.location.hostname.includes("localhost")
  ? "http://127.0.0.1:5000"  // backend local
  : "https://maxesilva-delta.vercel.app"; // URL do backend em produção (ajuste depois)

// === 📤 Envio de arquivos (index.html) ===
const form = document.getElementById("uploadForm");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value || "";
    const midias = document.getElementById("midia").files;
    const mensagem = document.getElementById("guestMessage").value || "";

    // validações cliente
    if (!midias.length) {
      alert("Por favor selecione ao menos um arquivo.");
      return;
    }
    if (midias.length > 10) {
      alert("Limite de 10 arquivos por envio.");
      return;
    }

    // tamanho máximo por arquivo 50MB (50 * 1024 * 1024)
    const MAX_BYTES = 50 * 1024 * 1024;
    for (let f of midias) {
      if (f.size > MAX_BYTES) {
        alert(`O arquivo ${f.name} excede 50MB. Remova-o e tente novamente.`);
        return;
      }
      if (!f.type.startsWith("image") && !f.type.startsWith("video")) {
        alert(`Formato não suportado: ${f.name}`);
        return;
      }
    }

    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("mensagem", mensagem);
    for (let file of midias) formData.append("midia", file);

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.erro || "Erro ao enviar arquivos.");
      }
      await res.json();
      alert("✅ Enviado com sucesso!");
      form.reset();
      carregarAlbumPreview();
    } catch (err) {
      console.error(err);
      alert("❌ Falha ao enviar. Tente novamente mais tarde.");
    }
  });
}

// === 🖼️ Carregar prévia do álbum (index.html) ===
async function carregarAlbumPreview() {
  const albumDiv = document.getElementById("albumPreview") || document.getElementById("album");
  if (!albumDiv) return;

  albumDiv.innerHTML = "Carregando...";
  try {
    const res = await fetch(`${API_URL}/midias`);
    if (!res.ok) throw new Error("Erro ao buscar mídias");
    const midias = await res.json();

    if (!midias.length) {
      albumDiv.innerHTML = "<p>Nenhuma mídia enviada ainda 💫</p>";
      return;
    }

    const items = midias.slice(0, 6).map(m => {
      if (m.tipo && m.tipo.startsWith("image")) {
        return `<img loading="lazy" src="${m.url}" alt="Foto de ${escapeHtml(m.nome || 'Convidado')}">`;
      } else {
        return `<video src="${m.url}" controls></video>`;
      }
    });

    albumDiv.innerHTML = items.join("");
  } catch (err) {
    console.error(err);
    albumDiv.innerHTML = "<p>Erro ao carregar mídias.</p>";
  }
}

// === 📸 Carregar álbum completo (album.html) ===
async function carregarAlbumCompleto() {
  const albumDiv = document.getElementById("album");
  if (!albumDiv) return;

  albumDiv.innerHTML = "Carregando...";
  try {
    const res = await fetch(`${API_URL}/midias`);
    if (!res.ok) throw new Error("Erro ao buscar mídias");
    const midias = await res.json();

    if (!midias.length) {
      albumDiv.innerHTML = "<p>Nenhuma foto ou vídeo ainda 💫</p>";
      return;
    }

    albumDiv.innerHTML = midias.map(m => {
      const credit = `<div style="font-size:0.8rem;color:#4b6043;padding:0.25rem 0;">${escapeHtml(m.nome || '')} ${m.mensagem ? '— ' + escapeHtml(m.mensagem) : ''}</div>`;
      if (m.tipo && m.tipo.startsWith("image")) {
        return `<div>${credit}<img loading="lazy" src="${m.url}" alt="Foto enviada por ${escapeHtml(m.nome || '')}"></div>`;
      } else {
        return `<div>${credit}<video src="${m.url}" controls></video></div>`;
      }
    }).join("");
  } catch (err) {
    console.error(err);
    albumDiv.innerHTML = "<p>Erro ao carregar álbum.</p>";
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

// === 🚀 Executa carregamento conforme a página ===
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  if (path.endsWith("index.html") || path === "/" || path.endsWith("/frontend/")) carregarAlbumPreview();
  if (path.endsWith("album.html") || window.location.href.includes("album.html")) carregarAlbumCompleto();
});
