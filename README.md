# ifs24018-pabwe2026-sk-p9-fe-reactjs — Delcom Blog Frontend

Frontend SPA menggunakan React 19, Vite, Tailwind CSS, Vitest, dan React Testing Library. Frontend ini terpisah dari backend dan berkomunikasi melalui REST API.

## Menjalankan secara lokal

Pastikan backend sudah aktif di `http://localhost:8081`.

```powershell
Copy-Item .env.example .env
npm ci
npm run dev
```

Buka http://localhost:5174. Saat development, Vite meneruskan request `/api` ke backend `http://localhost:8081`.

## Pengujian dan build

```powershell
npm test
npm run build
```

Test command menjalankan Vitest dengan coverage. Ambang coverage di `vite.config.js` disetel 100% untuk statements, branches, functions, dan lines.

## Halaman dan fitur

- Beranda publik, pencarian artikel, filter kategori, dan detail artikel Markdown.
- Registrasi dan login pengguna.
- Workspace penulis: statistik, CRUD artikel, editor Markdown, publish/unpublish.
- AI generator untuk membuat draf artikel.
- Dashboard admin untuk memantau pengguna dan artikel.
- Mode terang/gelap dan tampilan responsif.

## Deployment

Untuk deployment, atur `VITE_API_BASE_URL` pada environment frontend ke URL backend milik sendiri. Jangan memakai URL deployment milik orang lain.
