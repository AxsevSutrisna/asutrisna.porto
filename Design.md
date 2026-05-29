# Rencana Refactoring Website ASUTRISNA.PORTO

## Overview

Refactoring ini bertujuan untuk meningkatkan visual design, konsistensi UI, readability, serta overall user experience pada website personal portfolio ASUTRISNA.PORTO tanpa mengganggu alur data dinamis yang saat ini dikelola dari dashboard admin.

Fokus utama refactoring:
- Modernisasi tampilan UI
- Konsistensi design system
- Meningkatkan readability text
- Implementasi style Neo Brutalism
- Penyederhanaan visual agar lebih clean dan professional
- Meningkatkan UX untuk recruiter, client, dan visitor
- Menjaga kompatibilitas dengan data yang datang dari Supabase dan dashboard admin

---

# Scope Refactoring

Yang akan dilakukan refactoring pada website:

- Style UI Website
- Typography / Font
- Warna dan Gradasi Text
- Component Design
- Card Design
- Button Design
- CTA (Call To Action)
- Section Layout
- Visual Consistency
- UI Element Styling
- Data-driven rendering untuk konten dari dashboard admin
- Empty state, loading state, dan fallback state untuk data Supabase

---

# Design Direction

## Neo Brutalism Style

Website akan di-refactor menggunakan full tema Neo Brutalism style.

Referensi style:
https://www.neobrutalism.dev/

### Karakteristik Design yang akan diterapkan

- Bold Border
- Hard Shadow
- Kontras warna yang jelas
- Flat color
- Minimal gradient
- Clean spacing
- Thick outline
- Playful but professional
- Interactive hover state
- Strong visual hierarchy

### Catatan Penting untuk Project Ini

Karena konten website dikelola secara dinamis dari dashboard admin, gaya Neo Brutalism harus diterapkan pada layer presentasi saja. Struktur data, field database, dan flow fetch data tidak boleh dipaksa berubah hanya demi visual.

Artinya:
- UI boleh dirombak
- Komponen boleh disederhanakan
- Layout boleh dibuat lebih tegas dan konsisten
- Tetapi mapping data dari Supabase tetap harus stabil
- Field yang di-edit dari dashboard harus tetap ditampilkan dengan jelas dan aman

---

# Typography System

Typography baru yang akan digunakan:

## Font Combination

### Heading
- Font: Space Grotesk

Digunakan untuk:
- Hero title
- Section heading
- CTA heading
- Card title
- Navigation title

Karakter:
- Modern
- Professional
- Techy
- Berkarakter unik, cocok untuk Neo Brutalism

---

### Body Text
- Font: DM Sans

Digunakan untuk:
- Paragraph
- Description
- Content text
- UI text
- Label

Karakter:
- Sangat readable
- Clean
- Profesional

---

### Code / Technical Text
- Font: JetBrains Mono

Digunakan untuk:
- Code snippet
- Tech stack
- Terminal section
- Technical showcase
- Developer-focused UI

Karakter:
- Developer-oriented
- Modern mono font
- Technical aesthetic

---

# Text & Color Refactoring

## Remove Gradient Text

### Current Problem
Penggunaan gradient pada text membuat:
- Text lebih sulit dibaca
- Kontras tidak stabil
- UX readability menurun
- Kurang accessibility-friendly

### Refactoring Plan
Semua gradient pada text akan dihilangkan.

Text akan menggunakan:
- Solid color
- High contrast typography
- Clean readability
- Accessibility-friendly color

### Prinsip Tambahan untuk Konten Dinamis

Karena banyak konten berasal dari dashboard admin, typography harus tetap kuat ketika:
- Judul terlalu panjang
- Deskripsi berbeda panjang antar item
- Tech stack bertambah atau berkurang
- Konten hero/about berubah sewaktu-waktu
- Data belum terisi penuh dari dashboard

Maka desain harus mendukung:
- Line clamp yang rapi
- Spacing yang adaptif
- Hierarki teks yang jelas
- Fallback text yang tetap enak dibaca

---

# UI Refactoring Plan

## Card Design

Card akan menggunakan:
- Thick border
- Hard shadow
- Flat background
- Rounded minimal radius
- Neo Brutalism hover effect

Card juga harus siap untuk data dinamis dengan karakter yang berbeda-beda:
- Project card dengan gambar, tech stack, dan link external
- Certificate card dengan fokus pada visual preview
- Comment card dengan konten user-generated yang panjangnya tidak selalu konsisten
- Experience card dengan banyak field seperti company, periode, location, dan tech stack

---

## Button Design

Button akan menggunakan:
- Bold border
- Strong hover interaction
- Hard shadow
- Active press animation
- Flat color palette

CTA dan action button harus tetap konsisten untuk aksi yang berasal dari data admin, seperti:
- Buka project detail
- Buka live demo
- Buka GitHub
- Download CV
- Kirim komentar
- Edit konten di dashboard

---

## CTA Section

CTA akan dibuat:
- Lebih menonjol
- High contrast
- Strong typography hierarchy
- Clear action-oriented design

CTA utama harus tetap relevan walaupun hero content, tombol, atau urutan section berubah dari dashboard.

---

## Navigation

Navigation akan di-refactor menjadi:
- Simpler
- Cleaner
- Consistent spacing
- Better active state
- Neo Brutalism style

Navigation juga harus mendukung alur halaman yang dinamis, termasuk:
- Route public
- Route project detail berbasis slug
- Login admin
- Dashboard protected route

---

## Section Layout

Perbaikan layout:
- Better spacing system
- More breathing space
- Better responsiveness
- Cleaner visual hierarchy
- Consistent section padding

Section layout harus memperhitungkan konten yang dikelola dari dashboard, sehingga:
- Urutan isi tidak bergantung pada hardcode layout yang kaku
- Section tetap bagus walaupun data kosong
- Layout tetap stabil ketika jumlah item bertambah atau berkurang
- Komponen list/grid tetap rapi ketika konten berubah secara realtime

---

# UX Improvement Goals

Refactoring ini bertujuan untuk meningkatkan:

- Readability
- Accessibility
- Visual consistency
- Professional appearance
- Modern developer branding
- User engagement
- Recruiter readability
- Responsive experience

## Data Flow Awareness

Sebelum refactoring visual, penting untuk menjaga flow data yang sekarang:

### Public Website
- Home, About, Portfolio, Work Experience, dan Project Detail membaca data dari Supabase
- Contact memakai FormSubmit untuk pengiriman pesan
- Komentar visitor tersimpan ke Supabase dan tampil di area komentar
- Theme global dibaca dari tabel `site_theme`

### Admin Dashboard
- Admin login lewat Supabase Auth
- Role admin divalidasi lewat tabel `profiles`
- CRUD konten dilakukan dari dashboard dan hasilnya langsung memengaruhi tampilan public site
- Beberapa section memakai realtime update atau localStorage fallback

### Implikasi untuk Refactoring
- Komponen harus dipisah antara data layer dan presentation layer
- UI tidak boleh mengubah struktur field data yang sudah dipakai dashboard
- Loading, empty, error, dan fallback state harus ikut didesain
- Jika ada perubahan layout, pastikan tetap cocok dengan data dinamis dari Supabase

---

# Visual Goals

Hasil akhir yang diharapkan:

- Professional but casual
- Modern developer portfolio
- Clean but unique
- Strong personal branding
- Easy to read
- Memorable UI
- Modern tech aesthetic
- Better first impression

---

# Final Theme Direction

Website akan memiliki kombinasi style:

- Neo Brutalism
- Modern Developer Portfolio
- Clean UI
- Strong Typography
- Flat Design
- Bold Interactive Components

## Refactoring Rules Khusus untuk Konten Dinamis

1. Jangan hardcode konten yang sudah dikelola dashboard.
2. Jangan ubah nama field data tanpa kebutuhan migrasi.
3. Pastikan komponen tetap aman saat data kosong atau tidak lengkap.
4. Jaga slug, routing, dan detail page agar konsisten.
5. Desain harus tetap rapi saat konten berubah dari dashboard tanpa perlu edit manual di frontend.
6. Semua list section harus tahan terhadap jumlah item yang berubah-ubah.
7. Fallback visual harus tetap terasa intentional, bukan seperti error state yang rusak.

---

# Expected Result

Setelah refactoring:
- Website terlihat lebih modern
- UX lebih nyaman
- Text lebih mudah dibaca
- Branding lebih kuat
- UI lebih konsisten
- Design lebih professional
- Portfolio lebih standout dibanding portfolio biasa
- Struktur visual tetap stabil walau konten diubah dari dashboard admin
- Data dinamis dari Supabase tetap tampil jelas, rapi, dan mudah dipelihara