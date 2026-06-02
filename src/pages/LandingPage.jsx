import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSiswaByNisn, getStats, getSekolahInfo} from '../lib/supabase';
import ScrollAnimate from '../components/ScrollAnimate';

const SCHOOL_NAME = process.env.REACT_APP_SCHOOL_NAME || 'SMP MUHAMMADIYAH 08 PALEMBANG';
const SCHOOL_YEAR = process.env.REACT_APP_SCHOOL_YEAR || '2025/2026';

/* ─────────────────────────────────────────
   MAIN LANDING PAGE
───────────────────────────────────────── */
export default function LandingPage() {
  const [nisn, setNisn]       = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, lulus: 0, persen: '0%' });
  const [info, setInfo] = useState({});
  const handleCek = async (e) => {
    e.preventDefault();
    if (!nisn.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    const { data, error: err } = await getSiswaByNisn(nisn.trim());
    setLoading(false);

    if (err || !data) {
      setError('NISN tidak ditemukan. Pastikan nomor yang dimasukkan terdaftar dengan benar.');
    } else {
      setResult(data);
    }
  };

  useEffect(() => {
  getStats().then(s => setStats(s));
}, []);

useEffect(() => {
  getSekolahInfo().then(({ data }) => {
    if (data) setInfo(data);
  });
}, []);

  return (
    <div
      className="min-h-screen bg-white text-gray-800 overflow-x-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-10 h-16 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <a href="#" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L2 6.5V11.5L9 16L16 11.5V6.5L9 2Z"
                stroke="white" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
              <circle cx="9" cy="9" r="2" fill="white" />
            </svg>
          </div>
          <span className="text-sm font-bold text-gray-800 tracking-tight">
            SMP MUHAMMADIYAH 08 <span className="text-green-600">PALEMBANG</span>
          </span>
        </a>

        <ul className="hidden md:flex items-center gap-1 list-none m-0 p-0">
          {[
            { label: 'Beranda',        href: '#hero',           active: true },
            { label: 'Cek Kelulusan', href: '#cek-kelulusan' },
            { label: 'Tentang',        href: '#tentang' },
            { label: 'Kontak',         href: '#kontak' },
          ].map(({ label, href, active }) => (
            <li key={label}>
              <a
                href={href}
                className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors no-underline
                  ${active
                    ? 'text-green-700 bg-green-50'
                    : 'text-gray-500 hover:text-green-700 hover:bg-green-50'}`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors cursor-pointer border-none"
        >
          Portal Admin
        </button>
      </nav>

      {/* ── HERO SECTION ── */}
      <section
        id="hero"
        className="relative min-h-[85vh] flex flex-col items-center justify-center px-6 pt-24 pb-12 overflow-hidden bg-gradient-to-br from-green-50/70 via-emerald-50/30 to-white"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[400px] bg-green-200/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-green-50 border border-green-100 rounded-full text-[11px] font-bold text-green-700 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
            Selamat Datang di Portal Kelulusan Resmi
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-950 leading-[1.15] tracking-tight">
            Apresiasi Perjalanan Belajar <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500 font-normal">
              Siswa-Siswi Angkatan <span>{info.tahun}</span>
            </span>
          </h1>

          <p className="text-sm md:text-base text-gray-400 max-w-xl mx-auto leading-relaxed">
            Komitmen kami dalam menghadirkan informasi yang transparan dan akurat.
            Selamat kepada seluruh siswa yang telah menyelesaikan masa baktinya di {SCHOOL_NAME}.
          </p>

          <div className="pt-4">
            <a
              href="#cek-kelulusan"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-gray-900/10 no-underline"
            >
              Cek Hasil Kelulusan
            </a>
          </div>
        </div>
      </section>

      {/* ── CEK KELULUSAN SECTION ── */}
      <ScrollAnimate>
        <section id="cek-kelulusan" className="py-24 px-6 bg-white border-t border-gray-100">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

            {/* Left column — info */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
              <div className="space-y-3">
                <p className="text-xs font-bold tracking-widest text-green-700 uppercase">Sistem pengecekan Kelulusan</p>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                  Cek Status Kelulusan 
                </h2>
                <p className="text-sm text-gray-400 leading-relaxed">
                 Mari lihat hasil perjuangan belajar Anda di SMP Muhammadiyah 08 Palembang dengan memasukkan NISN di bawah ini.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200/60 rounded-2xl p-5 space-y-2">
                <div className="text-xs font-bold text-gray-800">🔒 DATA PRIBADI ANDA TIDAK AKAN DITAMPILKAN</div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Guna menjaga privasi dan keamanan data siswa, sistem ini hanya menampilkan nama dan status kelulusan berdasarkan NISN yang dimasukkan. Pastikan NISN yang Anda masukkan benar untuk mendapatkan hasil yang akurat.
                </p>
              </div>
            </div>

            {/* Right column — form + hasil */}
            <div className="lg:col-span-7 space-y-6 w-full">

              {/* Form card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-xl shadow-green-900/[0.02]">
                <p className="text-base font-bold text-gray-900 mb-1">Pencarian Hasil Kelulusan</p>
                <p className="text-xs text-gray-400 mb-6">Masukkan NISN Anda</p>

                <form onSubmit={handleCek} className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Nomor Induk Siswa Nasional (NISN)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-mono text-sm select-none">
                        NISN
                      </span>
                      <input
                        type="text"
                        maxLength={12}
                        value={nisn}
                        onChange={e => setNisn(e.target.value)}
                        className="w-full pl-14 pr-4 py-3.5 text-lg font-bold tracking-widest text-gray-800 bg-gray-50/60 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:bg-white transition duration-300"
                        
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-xs font-medium text-red-600 text-center">
                      ⚠️ {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !nisn.trim()}
                    className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 border-none cursor-pointer"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Memeriksa hasil...
                      </span>
                    ) : 'Cek Kelulusan'}
                  </button>
                </form>
              </div>

             
            </div>
          </div>
        </section>
      </ScrollAnimate>

      {/* ── STATS ── */}
      <ScrollAnimate>
        <div className="flex justify-center border-t border-b border-gray-100 bg-white/50 backdrop-blur-sm">
          {[
            { num: stats.total,  desc: 'Siswa Peserta' },
            { num: stats.persen, desc: 'Tingkat Kelulusan' },
            { num: '2026',       desc: 'Tahun Pengumuman' },
            { num: '24/7',       desc: 'Akses Online' },
          ].map((s, i, arr) => (
            <div
              key={s.desc}
              className={`flex-1 max-w-[200px] py-7 px-5 text-center group cursor-default
                ${i < arr.length - 1 ? 'border-r border-gray-100' : ''}`}
            >
              <p
                className="text-3xl font-semibold text-green-500 mb-1.5 group-hover:scale-110 transition-transform inline-block"
              >
                {s.num}
              </p>
              <p className="text-xs font-medium text-gray-400 group-hover:text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </ScrollAnimate>

      {/* ── FEATURES ── */}
      <ScrollAnimate>
        <section id="features" className="max-w-4xl mx-auto px-10 py-20">
          <p className="text-center text-xs font-bold tracking-widest text-green-700 uppercase mb-3">
            Kenapa Sistem Ini
          </p>
          <h2
            className="text-2xl md:text-3xl font-semibold text-gray-800 text-center mb-12"
          >
            Mudah, cepat, dan terpercaya
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: '⚡', title: 'Hasil Instan',     desc: 'Cek status kelulusan dalam hitungan detik tanpa perlu datang ke sekolah.' },
              { icon: '🔒', title: 'Aman & Terjamin',  desc: 'Data siswa dilindungi dan hanya dapat diakses menggunakan NISN yang valid.' },
              { icon: '📱', title: 'Akses Fleksibel',  desc: 'Bisa diakses lewat ponsel, tablet, maupun komputer kapan saja.' },
            ].map(f => (
              <div
                key={f.title}
                className="bg-white border border-gray-100 rounded-2xl p-7 hover:border-green-300 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <p className="text-sm font-bold text-gray-800 mb-2">{f.title}</p>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </ScrollAnimate>

      {/* ── TENTANG ── */}
      <ScrollAnimate>
        <section id="tentang" className="bg-gray-50 border-t border-b border-gray-100 py-20 px-6">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <p className="text-xs font-bold tracking-widest text-green-700 uppercase">Tentang Sistem</p>
            <h2
              className="text-2xl md:text-3xl font-semibold text-gray-800"
            >
              Mendigitalkan Pelayanan Informasi Sekolah
            </h2>
            <div className="h-0.5 w-12 bg-green-500 mx-auto rounded" />
            <p className="text-sm md:text-base text-gray-400 leading-relaxed pt-4 max-w-2xl mx-auto">
              Sistem Pengumuman Kelulusan Online ini dikembangkan secara resmi untuk memberikan
              pelayanan informasi yang cepat, transparan, dan akurat demi efisiensi waktu bersama.
            </p>
          </div>
        </section>
      </ScrollAnimate>

      {/* ── KONTAK ── */}
      <ScrollAnimate>
        <section id="kontak" className="max-w-4xl mx-auto px-6 md:px-10 py-20">
          <p className="text-xs font-bold tracking-widest text-green-700 uppercase mb-3 text-center md:text-left">
            Hubungi Kami
          </p>
          <h2
            className="text-2xl md:text-3xl font-semibold text-gray-800 mb-12 text-center md:text-left"
          >
            Pusat Bantuan & Lokasi Sekolah
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-sm">
              <p className="text-base font-bold text-gray-800 mb-2">Pusat Layanan Informasi</p>
              <p className="text-xs text-gray-400 mb-6">
                Apabila terdapat kendala teknis sistem silakan hubungi kepanitiaan kelulusan:
              </p>
              <ul className="space-y-4 list-none p-0">
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">📞</div>
                  <div>
                    <p className="text-xs text-gray-400 m-0">Layanan Telepon Kantor</p>
                    <span className="text-sm font-semibold text-gray-700">{info.telepon}</span>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">💬</div>
                  <div>
                    <p className="text-xs text-gray-400 m-0">WhatsApp</p>
                    <span className="text-sm font-semibold text-gray-700">{info.whatsapp}</span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-sm">
              <p className="text-base font-bold text-gray-800 mb-2">Alamat Institusi Resmi</p>
              <p className="text-sm font-semibold text-gray-700 mb-2">{info.nama || 'Nama Sekolah'}</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                {info.alamat || 'Jl. Contoh Alamat No.123, Palembang, Sumatera Selatan'}<br />
              </p>
            </div>
          </div>
        </section>
      </ScrollAnimate>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 px-10 py-7 flex justify-between items-center">
        <span className="text-sm text-gray-400">© {new Date().getFullYear()} {info.nama || 'Nama Sekolah'}</span>
        <div className="flex gap-5">
          {['Kebijakan Privasi', 'Bantuan'].map(l => (
            <a key={l} href="#" className="text-sm text-gray-400 hover:text-green-600 transition-colors no-underline">
              {l}
            </a>
          ))}
        </div>
      </footer>

      {/* ── MODAL HASIL KELULUSAN */}
      {result && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop dengan blur yang lebih halus */}
          <div 
            className="absolute inset-0 bg-transparent/40 backdrop-blur-md" 
            onClick={() => { setResult(null); setNisn(''); }} 
          />
          
          {/* Modal Container: Dibuat lebih tipis dan bersih */}
          <div className="relative bg-white border border-gray-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-300">
            
            {/* Header Minimalis */}
            <div className="px-6 pt-6 flex justify-between items-start">
              <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                Status Kelulusan
              </span>
              <button 
                onClick={() => { setResult(null); setNisn(''); }}
                className="text-gray-300 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Konten Utama */}
            <div className="p-6 text-center">
              <div className="mb-6">
                <p className="text-xs text-gray-400 mb-1">Nama Siswa</p>
                <h3 className="text-xl font-semibold text-gray-900">{result.nama_siswa}</h3>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-xs text-gray-400">NISN</span>
                  <span className="text-xs font-medium text-gray-700">{result.nisn}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-xs text-gray-400">Status</span>
                  <span className={`text-xs font-bold ${result.keterangan === 'LULUS' ? 'text-green-600' : 'text-rose-600'}`}>
                    {result.keterangan}
                  </span>
                </div>
              </div>

              {/* Status Box Minimalis */}
              <div className={`py-4 rounded-xl ${result.keterangan === 'LULUS' ? 'bg-green-100' : 'bg-rose-50/50'}`}>
                <p className={`text-xs font-medium ${result.keterangan === 'LULUS' ? 'text-green-700' : 'text-rose-700'}`}>
                  {result.keterangan === 'LULUS' 
                    ? 'Selamat, Anda dinyatakan lulus.' 
                    : 'Mohon hubungi pihak sekolah.'}
                </p>
              </div>
            </div>

            {/* Action Area */}
            <div className="px-6 pb-6 grid grid-cols-1 gap-3">
              {/* <button
                onClick={() => window.print()}
                className="py-2.5 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-all"
              >
                Simpan SKL
              </button> */}
              <button
                onClick={() => { setResult(null); setNisn(''); }}
                className="py-2.5 text-xs font-medium text-white bg-black rounded-lg hover:bg-black/80 transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
  
    </div>
  );
}