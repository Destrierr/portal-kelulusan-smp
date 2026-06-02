# 🎓 Pengumuman Kelulusan Siswa

Aplikasi web pengumuman kelulusan siswa berbasis React + Tailwind + Supabase.

## Fitur
- 🌐 **Halaman publik** — siswa cek kelulusan dengan NISN, tanpa perlu login
- 🔐 **Admin panel** — CRUD data siswa, import dari Excel
- 📥 **Import Excel** — upload massal dengan template siap pakai
- ⚡ **Real-time** — data langsung dari Supabase
- 🚀 **Deploy Vercel** — siap deploy dalam hitungan menit

---

## Cara Setup (Step by Step)

### 1. Setup Supabase

1. Buat akun di [supabase.com](https://supabase.com) dan buat project baru
2. Buka **SQL Editor** di dashboard Supabase
3. Copy-paste seluruh isi file `supabase_setup.sql` dan klik **Run**
4. Buka **Authentication > Users > Add User** — buat akun admin (email + password)
5. Buka **Settings > API** — salin `Project URL` dan `anon public key`

### 2. Setup Project Lokal

```bash
# Clone / download project
cd pengumuman-kelulusan

# Install dependencies
npm install

# Salin file env dan isi dengan nilai dari Supabase
cp .env.example .env.local
```

Edit `.env.local`:
```
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGci...
REACT_APP_SCHOOL_NAME=SMA Negeri 1 Palembang
REACT_APP_SCHOOL_YEAR=2024/2025
```

```bash
# Jalankan development server
npm start
```

### 3. Deploy ke Vercel

1. Push project ke GitHub (pastikan `.env.local` ada di `.gitignore`)
2. Buka [vercel.com](https://vercel.com) dan import repository
3. Tambahkan **Environment Variables** di Vercel (sama seperti `.env.local`):
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
   - `REACT_APP_SCHOOL_NAME`
   - `REACT_APP_SCHOOL_YEAR`
4. Klik **Deploy** — selesai!

---

## Struktur Halaman

| URL | Akses | Keterangan |
|-----|-------|------------|
| `/` | Publik | Halaman cek kelulusan (input NISN) |
| `/login` | Publik | Login admin |
| `/admin` | Admin only | CRUD data siswa + import Excel |

---

## Format Import Excel

| Kolom | Wajib | Keterangan |
|-------|-------|------------|
| `nama` | ✅ | Nama lengkap siswa |
| `nisn` | ✅ | 10 digit NISN (unik) |
| `kelas` | ✅ | Contoh: XII IPA 1 |
| `jurusan` | — | Contoh: IPA, IPS, Bahasa |
| `status` | ✅ | `LULUS` atau `TIDAK LULUS` |
| `catatan` | — | Catatan tambahan |

> Download template langsung dari halaman Admin → tombol **Import Excel**

---

## Tech Stack
- **Frontend**: React 18, React Router v6, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Import**: SheetJS (xlsx)
- **Deploy**: Vercel
