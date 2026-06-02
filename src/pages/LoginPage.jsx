import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { data, error: err } = await signIn(email, password);
    setLoading(false);
    
    if (err) {
      setError('Email atau password salah. Silakan coba lagi.');
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gradient-to-b from-green-50/20 via-white to-white relative overflow-hidden">
      
      {/* Efek Lingkaran Blur Latar Belakang - Identik dengan Hero SaaS halaman depan */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-green-200/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      {/* Tombol Kembali ke Beranda (Posisi Absolute Kiri Atas) */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 text-xs font-bold text-gray-400 hover:text-green-600 transition-colors flex items-center gap-1.5 bg-transparent border-none cursor-pointer"
      >
        <span>←</span> Kembali ke Beranda
      </button>

      {/* Kontainer Utama Form Login */}
      <div className="w-full max-w-sm relative">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center font-bold text-xl mx-auto mb-4 border border-green-100 shadow-sm shadow-green-600/5">
            🔑
          </div>
          <h1 className="text-gray-950 text-xl font-extrabold tracking-tight">
            Login Portal Admin
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Masuk untuk mengelola data kelulusan siswa
          </p>
        </div>

        {/* Kotak Form Putih Bersih (SaaS Style) */}
        <div className="bg-white border border-gray-200 rounded-2xl p-7 md:p-8 shadow-xl shadow-green-900/[0.02]">
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Input Email */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">
                Alamat Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@gmail.com"
                required
                className="w-full px-4 py-3 text-sm font-semibold text-gray-800 bg-gray-50/60 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50 transition duration-300 placeholder:text-gray-300 placeholder:font-normal"
              />
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">
                Kata Sandi
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 text-sm font-mono text-gray-800 bg-gray-50/60 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50 transition duration-300 tracking-widest placeholder:tracking-normal placeholder:text-gray-300"
              />
            </div>

            {/* Notifikasi Pesan Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-red-600 text-xs font-medium text-center">
                ⚠️ {error}
              </div>
            )}

            {/* Tombol Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-0.5 shadow-md shadow-green-600/10 cursor-pointer border-none"
            >
              {loading ? 'Loading...' : 'Masuk'}
            </button>
          </form>
        </div>

        {/* Footer Proteksi */}
        <p className="text-center text-[10px] text-gray-400 mt-6">
          🛡️ Sesi admin dilindungi oleh enkripsi gateway Supabase.
        </p>
      </div>
    </div>
  );
}