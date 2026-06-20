# Teto Fernandes e Banda — Landing Page

Static landing page (HTML/CSS/JS, no build step). The **shows agenda is loaded live from a Google Sheet**, so you can update gigs without touching the code.

## Structure

```
teto-fernandes-banda/
├── index.html        # Header, Hero, Shows, Sobre, Música/Contato
├── styles.css        # Dark theme, amber accent (change --accent in :root)
├── script.js         # Mobile nav, scroll reveal, live agenda loader
└── assets/img/        # logo.jpg + band photos (band1..5.jpg)
```

Sections: **Header** (sticky nav) · **Hero** · **Shows** (live agenda) · **Sobre** + photo gallery · **Música & Contato** (Spotify embed + footer).

---

## ⚠️ One-time setup: make the agenda sheet public (required)

The agenda reads from this Google Sheet (in your Drive):
**"Teto Fernandes e Banda - Agenda"** — ID `1piikAYpzJn1lhP7NgBUsImjXoEWMd0gGyD22SR9suVY`

For the website to read it, share it as **view-only to anyone**:

1. Open the sheet → **Compartilhar / Share**.
2. Under *Acesso geral / General access*, choose **"Qualquer pessoa com o link" → "Leitor / Viewer"**.
3. Save. (No one can edit it — only you, the owner.)

That's it. The site fetches the sheet's published CSV automatically.

## Updating the shows (no code needed)

Open the sheet and edit the rows. Columns:

| Data | Hora | Cidade | Local | Ingressos |
|------|------|--------|-------|-----------|
| 2026-07-18 | 21:00 | São Paulo | Bar do Zé | https://link-dos-ingressos |

- **Data**: use `AAAA-MM-DD` (ex. `2026-07-18`) or `DD/MM/AAAA`.
- **Ingressos**: a full link (`https://...`) shows an **"Ingressos"** button; leave it blank to show **"Em breve"**.
- **Past dates disappear automatically.** Upcoming shows are sorted by date.

Changes appear on the site within minutes (Google caches the CSV briefly).

---

## Deploy to GitHub Pages

1. Create a new repo on GitHub (e.g. `teto-fernandes-banda`).
2. From this folder:
   ```bash
   git init
   git add .
   git commit -m "Landing page Teto Fernandes e Banda"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/teto-fernandes-banda.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Source: `main` / root → Save**.
4. Your site goes live at `https://SEU-USUARIO.github.io/teto-fernandes-banda/`.

To preview locally first, run any static server in this folder, e.g.:
```bash
python -m http.server 8000
```
then open http://localhost:8000.

---

## Things to personalize (search the code for these)

- **Spotify player**: in `index.html`, replace the `<iframe src="...">` with the band's real Spotify/YouTube embed link.
- **Social links**: Instagram / YouTube / Spotify `href`s in `index.html` (header + footer).
- **Contato**: email and WhatsApp number in the footer (`mailto:` and `wa.me/55...`).
- **Bio text**: the "Sobre" section paragraphs in `index.html`.
- **Accent color**: `--accent` in `styles.css` (currently amber `#f2c14e`).

## Notes on assets

- `logo.jpg` is the band logo on a dark background; the site uses `mix-blend-mode: screen` so the dark box disappears on the page. If you later get a **transparent PNG or SVG** logo, drop it in and update the `src`s for a cleaner result at any size.
- Photos were downscaled for web performance. Originals remain in the band's Google Drive folder.
