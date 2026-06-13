import { UserModel } from "../models/userModel.js";

function getInitials(user) {
 if (!user) return "ZU";

 const first = (user.firstName || "").trim();
 const last = (user.lastName || "").trim();

 if (first && last) {
  return `${first[0]}${last[0]}`.toUpperCase();
 }

 if (user.name) {
  const parts = user.name.trim().split(/\s+/);
  if (parts.length >= 2) {
   return `${parts[0][0]}${parts.at(-1)[0]}`.toUpperCase();
  }
  return parts[0][0].toUpperCase();
 }

 return "ZU";
}

function getTopbarConfig(page) {
 const map = {
  hoje: {
   title: "Olá",
   subtitle: "Que bom te ver por aqui.<br />Como está a tua mente hoje?",
   showBell: true,
  },
  exercicios: {
   title: "Exercícios",
   subtitle: "Escolhe práticas para respiração, foco e relaxamento.",
   showBell: false,
  },
  comunidade: {
   title: "Comunidade",
   subtitle: "Liga-te a pessoas com objetivos semelhantes.",
   showBell: false,
  },
  insights: {
   title: "Insights",
   subtitle: "Padrões de humor, consistência e progresso.",
   showBell: false,
  },
  perfil: {
   title: "Perfil",
   subtitle: "Gere a tua conta e acompanha o teu progresso.",
   showBell: false,
  },
  settings: {
   title: "Configurações",
   subtitle: "Ajusta preferências e opções da tua conta.",
   showBell: false,
  },
  ajuda: {
   title: "Ajuda",
   subtitle: "Encontra respostas rápidas e suporte.",
   showBell: false,
  },
 };

 return (
  map[page] || {
   title: "Zenify",
   subtitle: "A tua área pessoal.",
   showBell: false,
  }
 );
}

function renderBell() {
 return `
    <button class="notif-btn" aria-label="Notificações" type="button">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
    </button>
  `;
}

export function mountTopbar() {
 const host = document.querySelector("[data-zenify-topbar]");
 if (!host) return;

 const page = document.body.dataset.zenifyPage || "";
 const user = UserModel.getSession();
 const initials = getInitials(user);
 const config = getTopbarConfig(page);

 host.classList.add("topbar");
 host.innerHTML = `
    <div class="topbar-greeting">
      <h1>${config.title}</h1>
      <p>${config.subtitle}</p>
    </div>

    <div class="topbar-actions">
      ${config.showBell ? renderBell() : ""}

      <a href="perfil.html" class="avatar-btn" aria-label="Perfil">
        <div class="avatar">${initials}</div>
        <span>${initials}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </a>
    </div>
  `;
}

mountTopbar();
