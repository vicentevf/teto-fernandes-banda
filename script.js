/* =========================================================
   Teto Fernandes e Banda — front-end logic
   ========================================================= */

/* ---- CONFIG ---------------------------------------------------
   The agenda is read LIVE from a Google Sheet. To update the shows,
   just edit the sheet — no code changes needed.
   Sheet: "Teto Fernandes e Banda - Agenda"
   The sheet must be shared as "Anyone with the link → Viewer".
--------------------------------------------------------------- */
const SHEET_ID = "1piikAYpzJn1lhP7NgBUsImjXoEWMd0gGyD22SR9suVY";
const SHEET_GID = "0";
const AGENDA_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${SHEET_GID}`;

const GALLERY_IMAGES = [
  "assets/img/sobre1.jpg",
  "assets/img/sobre2.jpg",
  "assets/img/sobre3.jpg",
  "assets/img/sobre4.jpg",
  "assets/img/sobre6.jpg",
];

const MONTHS_PT = [
  "JAN",
  "FEV",
  "MAR",
  "ABR",
  "MAI",
  "JUN",
  "JUL",
  "AGO",
  "SET",
  "OUT",
  "NOV",
  "DEZ",
];

/* ---- HEADER: solid on scroll -------------------------------- */
const header = document.getElementById("header");
const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

/* ---- MOBILE NAV --------------------------------------------- */
const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");
const closeNav = () => {
  nav.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
};
navToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeNav));

/* ---- CURRENT YEAR ------------------------------------------- */
document.getElementById("year").textContent = new Date().getFullYear();

/* ---- HERO PARALLAX: imagem com profundidade + conteúdo flutua/desvanece --- */
(function heroParallax() {
  const img = document.querySelector(".hero-img");
  const content = document.querySelector(".hero-content");
  const hero = document.getElementById("hero");
  if (!img || !hero) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let ticking = false;
  const update = () => {
    const y = window.scrollY;
    const h = hero.offsetHeight || 1;
    if (y <= h) {
      img.style.transform = `translate3d(0, ${y * 0.09}px, 0) scale(1.18)`;
      if (content) {
        content.style.transform = `translateY(calc(7vh - ${y * 0.12}px))`;
        content.style.opacity = String(Math.max(0, 1 - y / (h * 0.75)));
      }
    }
    ticking = false;
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true },
  );
  update();
})();

/* ---- REVEAL ON SCROLL --------------------------------------- */
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15 },
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

/* ---- GALLERY ------------------------------------------------ */
(function buildGallery() {
  const wrap = document.getElementById("gallery");
  if (!wrap) return;
  GALLERY_IMAGES.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    img.loading = "lazy";
    img.alt = `Teto Fernandes e Banda — foto ${i + 1}`;
    wrap.appendChild(img);
  });
})();

/* ---- AGENDA: load + render from Google Sheet ---------------- */
function parseCSV(text) {
  // Minimal CSV parser that handles quoted fields and commas inside quotes.
  const rows = [];
  let row = [],
    field = "",
    inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") {
        row.push(field);
        field = "";
      } else if (c === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else if (c === "\r") {
        /* ignore */
      } else field += c;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function toEvents(rows) {
  if (!rows.length) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (name) => header.findIndex((h) => h.includes(name));
  const iData = idx("data");
  const iHora = idx("hora");
  const iCidade = idx("cidade");
  const iLocal = idx("local");
  const iIngressos = idx("ingresso");

  return rows
    .slice(1)
    .map((r) => ({
      date: (r[iData] || "").trim(),
      time: (r[iHora] || "").trim(),
      city: (r[iCidade] || "").trim(),
      venue: (r[iLocal] || "").trim(),
      tickets: (r[iIngressos] || "").trim(),
    }))
    .filter((e) => e.date && e.city);
}

function parseDate(str) {
  // Accepts YYYY-MM-DD or DD/MM/YYYY
  let m = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
  const d = new Date(str);
  return isNaN(d) ? null : d;
}

function renderEvents(events) {
  const wrap = document.getElementById("agenda");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = events
    .map((e) => ({ ...e, _d: parseDate(e.date) }))
    .filter((e) => e._d && e._d >= today)
    .sort((a, b) => a._d - b._d);

  if (!upcoming.length) {
    wrap.innerHTML = `<p class="agenda-state">Agenda no Ar em Breve! 🎤</p>`;
    return;
  }

  wrap.innerHTML = upcoming
    .map((e, i) => {
      const day = String(e._d.getDate()).padStart(2, "0");
      const month = MONTHS_PT[e._d.getMonth()];
      const year = e._d.getFullYear();
      const time = e.time ? ` · ${e.time}` : "";
      const sold = /esgot/i.test(e.tickets);
      const cta = /^https?:\/\//i.test(e.tickets)
        ? `<a class="btn btn-primary" href="${e.tickets}" target="_blank" rel="noopener">Ingressos</a>`
        : sold
          ? `<span class="badge-sold">Esgotado</span>`
          : `<span class="soon">Em breve</span>`;
      const nextTag = i === 0 ? `<span class="next-tag">Próximo</span>` : "";
      return `
        <article class="event${i === 0 ? " event--next" : ""}">
          <div class="event-date">
            <div class="event-day">${day}</div>
            <div class="event-month">${month}</div>
            <div class="event-year">${year}</div>
          </div>
          <div class="event-info">
            ${nextTag}
            <h3>${e.city}</h3>
            <p>${e.venue || ""}${time}</p>
          </div>
          <div class="event-cta">${cta}</div>
        </article>`;
    })
    .join("");
}

async function loadAgenda() {
  const state = document.getElementById("agendaState");
  try {
    const res = await fetch(AGENDA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const csv = await res.text();
    const events = toEvents(parseCSV(csv));
    renderEvents(events);
  } catch (err) {
    console.error("Erro ao carregar agenda:", err);
    if (state)
      state.textContent =
        "Não foi possível carregar a agenda agora. Tente novamente mais tarde.";
  }
}
loadAgenda();
