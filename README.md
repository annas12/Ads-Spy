# Ads Spy

MVP dashboard untuk riset iklan Meta dengan filter keyword, halaman, negara, status, media, platform, tanggal tayang, dan umur iklan.

## Arsitektur

- Frontend: React + Vite + TypeScript
- Backend: Cloudflare Worker
- Database-ready: Cloudflare D1
- Data source: Meta Ad Library API (sesuai cakupan resmi Meta) + collector publik di fase berikutnya

## Menjalankan frontend

```bash
npm install
npm run dev
```

## Menjalankan Worker

```bash
cd worker
npm install
npx wrangler dev
```

Salin `worker/.dev.vars.example` menjadi `worker/.dev.vars` dan isi access token Meta.

## Status MVP

- Dashboard pencarian
- Filter keyword, page ID, negara, status, media, platform, rentang tanggal, minimum umur iklan
- Sorting hasil
- Winner Score awal
- Mock data otomatis bila API backend belum dikonfigurasi
- Endpoint Worker `/api/search`

> Catatan: Meta Ad Library API tidak menyediakan seluruh iklan komersial Indonesia. Karena itu arsitektur dibuat agar nantinya dapat menerima source lain tanpa mengubah UI utama.
