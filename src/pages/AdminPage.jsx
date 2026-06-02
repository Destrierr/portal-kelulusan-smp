import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { getSiswa, createSiswa, updateSiswa, deleteSiswa, upsertSiswa, getSession, signOut, getSekolahInfo, updateSekolahInfo } from '../lib/supabase';

const EMPTY_FORM = {
  no: '', nama_siswa: '', nisn: '', nis: '',
  jenis_kelamin: 'Laki-laki', tempat_tanggal_lahir: '',
  nama_ayah: '', nama_ibu: '', keterangan: 'LULUS'
};

const ITEMS_PER_PAGE = 10;

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-gray-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-lg shadow-2xl shadow-green-950/5 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-gray-950 font-extrabold text-lg tracking-tight">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none bg-transparent border-none cursor-pointer">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SiswaForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(form);
    setLoading(false);
  };

  const inp = "w-full bg-gray-50/60 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50 transition-all duration-200 text-sm font-semibold tracking-tight";
  const lbl = "block text-gray-400 text-[10px] font-extrabold uppercase tracking-widest mb-1.5 text-left";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-sans">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>No</label>
          <input type="number" value={form.no} onChange={set('no')} placeholder="1" className={inp} />
        </div>
        <div>
          <label className={lbl}>Jenis Kelamin *</label>
          <select value={form.jenis_kelamin} onChange={set('jenis_kelamin')} className={inp + " cursor-pointer"}>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className={lbl}>Nama Siswa *</label>
          <input value={form.nama_siswa} onChange={set('nama_siswa')} placeholder="Nama lengkap" required className={inp} />
        </div>
        <div>
          <label className={lbl}>NISN *</label>
          <input value={form.nisn} onChange={set('nisn')} placeholder="0129525365" required maxLength={12} className={inp + " font-mono tracking-wider"} />
        </div>
        <div>
          <label className={lbl}>NIS</label>
          <input value={form.nis} onChange={set('nis')} placeholder="2705" className={inp + " font-mono tracking-wider"} />
        </div>
        <div className="col-span-2">
          <label className={lbl}>Tempat, Tanggal Lahir</label>
          <input value={form.tempat_tanggal_lahir} onChange={set('tempat_tanggal_lahir')} placeholder="PALEMBANG, 10 JUNI 2012" className={inp} />
        </div>
        <div>
          <label className={lbl}>Nama Ayah</label>
          <input value={form.nama_ayah} onChange={set('nama_ayah')} placeholder="Nama ayah" className={inp} />
        </div>
        <div>
          <label className={lbl}>Nama Ibu</label>
          <input value={form.nama_ibu} onChange={set('nama_ibu')} placeholder="Nama ibu" className={inp} />
        </div>
        <div className="col-span-2">
          <label className={lbl}>Keterangan *</label>
          <select value={form.keterangan} onChange={set('keterangan')} required className={inp + " cursor-pointer"}>
            <option value="LULUS">LULUS</option>
            <option value="TIDAK LULUS">TIDAK LULUS</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all text-xs font-bold bg-transparent cursor-pointer tracking-tight">
          Batal
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-40 text-white font-bold text-xs transition-all border-none cursor-pointer shadow-sm shadow-green-600/10 tracking-tight">
          {loading ? (
            <span><i className="fa-solid fa-circle-notch fa-spin mr-1.5"></i> Menyimpan...</span>
          ) : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [siswaList, setSiswaList] = useState([]);
  const [sekolahInfo, setSekolahInfo] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [importModal, setImportModal] = useState(false);
  const [importData, setImportData] = useState([]);
  const [importStatus, setImportStatus] = useState('');
  const [toast, setToast] = useState(null);
  const fileRef = useRef();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getSession().then(s => { if (!s) navigate('/login'); });
    fetchData();
    fetchInfo(); // Panggil data sekolah
  }, []);

  const fetchInfo = async () => {
    const { data } = await getSekolahInfo();
    setSekolahInfo(data);
  };

  const fetchData = async (q = '') => {
    setLoading(true);
    const { data } = await getSiswa(q);
    setSiswaList(data || []);
    setCurrentPage(1);
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(() => fetchData(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentSiswaItems = siswaList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(siswaList.length / ITEMS_PER_PAGE) || 1;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updated = Object.fromEntries(formData.entries());
    
    const { error } = await updateSekolahInfo(updated);
    if (error) { showToast(error.message, 'error'); return; }
    
    showToast('Informasi sekolah berhasil diperbarui');
    setShowSettings(false);
    fetchInfo();
  };

  const handleAdd = async (form) => {
    const { error } = await createSiswa(form);
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Data siswa berhasil ditambahkan');
    setShowAdd(false);
    fetchData(search);
  };

  const handleEdit = async (form) => {
    const { error } = await updateSiswa(editItem.id, form);
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Data siswa berhasil diperbarui');
    setEditItem(null);
    fetchData(search);
  };

  const handleDelete = async () => {
    const { error } = await deleteSiswa(deleteItem.id);
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Data siswa berhasil dihapus');
    setDeleteItem(null);
    fetchData(search);
  };

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

      const startIndex = rawData.findIndex(row => 
        row[0] && String(row[0]).replace(/[^0-9]/g, '').length > 0
      );

      if (startIndex === -1) {
        setImportStatus('Error: Data tidak ditemukan.');
        return;
      }

      // 1. Map data dan bersihkan field
      const normalized = rawData.slice(startIndex).map((row) => {
        const rawJK = String(row[5] || '').trim();
        let jk = 'Laki-laki';
        if (rawJK.toLowerCase().includes('p')) jk = 'Perempuan';

        return {
          no: parseInt(String(row[0]).replace(/[^0-9]/g, ''), 10) || 0,
          nisn: String(row[1] || '').replace(/['\s]/g, ''),
          nama_siswa: String(row[2] || '').trim(),
          tempat_tanggal_lahir: `${row[3] || ''}, ${row[4] || ''}`.replace(/^,|,$/g, '').trim(),
          jenis_kelamin: jk,
          nama_ayah: String(row[6] || '').trim(),
          nama_ibu: String(row[7] || '').trim(),
          keterangan: 'LULUS'
        };
      }).filter(r => r.nama_siswa !== '' && r.nisn !== '');

      // 2. Lakukan deduplikasi NISN (Hanya simpan NISN yang unik)
      const uniqueData = Array.from(
        new Map(normalized.map(item => [item.nisn, item])).values()
      );

      // 3. Update State hanya sekali dengan data yang sudah unik
      setImportData(uniqueData);
      
      const diff = normalized.length - uniqueData.length;
      setImportStatus(
        diff > 0 
          ? `${uniqueData.length} data dimuat (${diff} duplikat dihapus).` 
          : `${uniqueData.length} data berhasil dimuat.`
      );

    } catch (err) {
      console.error(err);
      setImportStatus('Error: Terjadi kesalahan saat membaca file.');
    }
  };
  reader.readAsBinaryString(file);
};

  const handleImport = async () => {
    if (!importData.length) return;
    setImportStatus('Mengasimilasi ke database...');
    const { error } = await upsertSiswa(importData);
    if (error) { setImportStatus('Error: ' + error.message); return; }
    showToast(`${importData.length} data sukses diimport`);
    setImportModal(false);
    setImportData([]);
    setImportStatus('');
    if (fileRef.current) fileRef.current.value = '';
    fetchData(search);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['No', 'Nama Siswa', 'NISN', 'NIS', 'Jenis Kelamin', 'Tempat Tanggal Lahir', 'Ayah', 'Ibu', 'Keterangan'],
      [1, 'A. RAHMAT DINI', '0129525365', '2705', 'Laki-laki', 'MADURA, 19 SEPTEMBER 2011', 'ABDUL MUTOLIB', 'JALEHA RATMIANA', 'LULUS'],
      [2, 'ADELIA PERATIWI', '0113694044', '2673', 'Perempuan', 'PALEMBANG, 8 DESEMBER 2011', 'MAIDI', 'MARYANI', 'LULUS'],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Siswa');
    XLSX.writeFile(wb, 'template_import_siswa.xlsx');
  };

  const lulus = siswaList.filter(s => s.keterangan === 'LULUS').length;
  const tidakLulus = siswaList.filter(s => s.keterangan === 'TIDAK LULUS').length;

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 antialiased font-sans pb-12">
      {/* Toast Feedback Notifikasi */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-xl text-xs font-bold text-white tracking-wide flex items-center gap-2
          ${toast.type === 'error' ? 'bg-red-600' : 'bg-gray-950'}`}>
          <i className={toast.type === 'error' ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-check'}></i>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header Admin */}
<header className="border-b border-gray-200/80 px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-30">
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 bg-green-50 text-green-600 border border-green-100 rounded-lg flex items-center justify-center text-sm shadow-sm">
      <i className="fa-solid fa-graduation-cap"></i>
    </div>
    <span className="font-black text-gray-950 tracking-tight text-sm md:text-base">Panel Otoritas</span>
  </div>
  
  <div className="flex items-center gap-4">
    {/* Tombol Pengaturan Baru */}
    <button onClick={() => setShowSettings(true)}
      className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-gray-500 text-xs font-bold transition-all cursor-pointer hover:border-gray-300 hover:text-gray-700 tracking-tight flex items-center gap-1.5">
      <i className="fa-solid fa-gear"></i> Pengaturan
    </button>
    
    <button onClick={async () => { await signOut(); navigate('/login'); }}
      className="px-3.5 py-2 rounded-xl border border-gray-200 bg-transparent hover:border-red-200 hover:bg-red-50 hover:text-red-600 text-gray-400 text-xs font-bold transition-all cursor-pointer tracking-tight flex items-center gap-1.5">
      <i className="fa-solid fa-arrow-right-from-bracket"></i> Keluar
    </button>
  </div>
</header>

      <main className="max-w-7xl mx-auto px-4 pt-10 space-y-8">
        
        {/* Ringkasan Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { label: 'Total Repositori Data', value: siswaList.length, icon: 'fa-solid fa-users', color: 'text-gray-900 bg-gray-100 border-gray-200' },
            { label: 'Siswa Dinyatakan Lulus', value: lulus, icon: 'fa-solid fa-user-check', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
            { label: 'Siswa Status Tertunda', value: tidakLulus, icon: 'fa-solid fa-user-slash', color: 'text-rose-600 bg-rose-50 border-rose-100' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{s.label}</div>
                <div className="text-3xl font-black text-gray-950 tracking-tight">{s.value}</div>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-base border ${s.color}`}>
                <i className={s.icon}></i>
              </div>
            </div>
          ))}
        </div>

        {/* Pencarian dan Tombol Tambah */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs"><i className="fa-solid fa-magnifying-glass"></i></span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama siswa, nomor NISN, atau kode NIS..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-50 transition-all text-xs font-semibold shadow-sm tracking-tight" />
          </div>
          <div className="flex gap-2.5">
            <button onClick={() => setImportModal(true)}
              className="px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer shadow-sm tracking-tight">
              <i className="fa-solid fa-file-excel text-emerald-600"></i> Import Excel
            </button>
            <button onClick={() => setShowAdd(true)}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs flex items-center gap-2 transition-all font-bold whitespace-nowrap border-none cursor-pointer shadow-md shadow-green-600/10 tracking-tight">
              <i className="fa-solid fa-plus text-[10px]"></i> Tambah Entri Siswa
            </button>
          </div>
        </div>

        {/* Tabel Utama */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="px-4 py-3.5">No</th>
                  <th className="px-4 py-3.5">Nama Siswa</th>
                  <th className="px-4 py-3.5">NISN</th>
                  <th className="px-4 py-3.5">NIS</th>
                  <th className="px-4 py-3.5">JK</th>
                  <th className="px-4 py-3.5">Tempat, Tgl Lahir</th>
                  <th className="px-4 py-3.5">Wali Ayah</th>
                  <th className="px-4 py-3.5">Wali Ibu</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-gray-600 tracking-tight">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-20 text-gray-400 font-bold text-xs tracking-wide">
                      <i className="fa-solid fa-circle-notch fa-spin mr-2 text-green-600 text-sm"></i> Mengakses sinkronisasi data...
                    </td>
                  </tr>
                ) : siswaList.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-20 text-gray-400 font-semibold">
                      <i className="fa-solid fa-triangle-exclamation mr-1.5 text-amber-500"></i> {search ? 'Tidak ada hasil yang cocok dengan kriteria' : 'Database kosong, silakan tambah atau import data.'}
                    </td>
                  </tr>
                ) : currentSiswaItems.map((s) => (
                  <tr key={s.id} className="hover:bg-green-50/20 transition-colors">
                    <td className="px-4 py-3.5 text-gray-400 font-bold">{s.no}</td>
                    <td className="px-4 py-3.5 font-black text-gray-950 whitespace-nowrap">{s.nama_siswa}</td>
                    <td className="px-4 py-3.5 font-mono text-gray-800 tracking-wide whitespace-nowrap">{s.nisn}</td>
                    <td className="px-4 py-3.5 font-mono text-gray-400">{s.nis || '-'}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${s.jenis_kelamin === 'Laki-laki' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-pink-50 text-pink-600 border border-pink-100'}`}>
                        {s.jenis_kelamin === 'Laki-laki' ? 'L' : 'P'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 max-w-[180px] truncate" title={s.tempat_tanggal_lahir}>{s.tempat_tanggal_lahir || '-'}</td>
                    <td className="px-4 py-3.5 text-gray-500 max-w-[120px] truncate" title={s.nama_ayah}>{s.nama_ayah || '-'}</td>
                    <td className="px-4 py-3.5 text-gray-500 max-w-[120px] truncate" title={s.nama_ibu}>{s.nama_ibu || '-'}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold border
                        ${s.keterangan === 'LULUS' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                        {s.keterangan}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setEditItem(s)}
                          className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:border-green-500 hover:text-green-600 text-gray-400 font-bold transition-all cursor-pointer text-[11px] flex items-center gap-1">
                          <i className="fa-regular fa-pen-to-square"></i> Edit
                        </button>
                        <button onClick={() => setDeleteItem(s)}
                          className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:border-red-500 hover:text-red-600 text-gray-400 font-bold transition-all cursor-pointer text-[11px] flex items-center gap-1">
                          <i className="fa-regular fa-trash-can"></i> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Navigasi Pagination */}
          {!loading && siswaList.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50">
              <div className="text-xs text-gray-400 font-bold tracking-tight">
                Menampilkan <span className="text-gray-800 font-extrabold">{indexOfFirstItem + 1}</span> - <span className="text-gray-800 font-extrabold">{Math.min(indexOfLastItem, siswaList.length)}</span> dari <span className="text-gray-800 font-extrabold">{siswaList.length}</span> Entri Siswa
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white text-xs font-bold transition-all cursor-pointer tracking-tight flex items-center gap-1"
                >
                  <i className="fa-solid fa-chevron-left text-[10px]"></i> Sebelumnya
                </button>
                
                <div className="flex items-center gap-1 px-1">
                  <span className="text-xs text-gray-400 font-bold tracking-tight">Halaman</span>
                  <span className="text-xs text-gray-900 font-black bg-white border border-gray-200 w-7 h-7 rounded-lg flex items-center justify-center shadow-sm">{currentPage}</span>
                  <span className="text-xs text-gray-400 font-bold tracking-tight">dari {totalPages}</span>
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white text-xs font-bold transition-all cursor-pointer tracking-tight flex items-center gap-1"
                >
                  Selanjutnya <i className="fa-solid fa-chevron-right text-[10px]"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal: Tambah Data */}
      {showAdd && <Modal title="Tambah Entri Siswa Baru" onClose={() => setShowAdd(false)}>
        <SiswaForm onSave={handleAdd} onCancel={() => setShowAdd(false)} />
      </Modal>}

      {/* Modal: Edit Data */}
      {editItem && <Modal title="Modifikasi Data Siswa" onClose={() => setEditItem(null)}>
        <SiswaForm initial={editItem} onSave={handleEdit} onCancel={() => setEditItem(null)} />
      </Modal>}

      {/* Modal: Konfirmasi Hapus */}
      {deleteItem && <Modal title="Konfirmasi Penghapusan" onClose={() => setDeleteItem(null)}>
        <p className="text-gray-500 mb-4 text-xs font-medium tracking-tight">Apakah Anda sepenuhnya yakin ingin menghapus data entri di bawah ini secara permanen dari server database?</p>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5 text-left">
          <p className="text-gray-950 font-black text-sm tracking-tight">{deleteItem.nama_siswa}</p>
          <p className="text-gray-400 text-xs font-mono mt-1">NISN: {deleteItem.nisn} · NIS: {deleteItem.nis || '-'}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setDeleteItem(null)}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 bg-transparent font-bold text-xs transition-all cursor-pointer tracking-tight">
            Batal
          </button>
          <button onClick={handleDelete}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs border-none transition-all cursor-pointer shadow-sm shadow-red-600/10 tracking-tight flex items-center justify-center gap-1.5">
            <i className="fa-regular fa-trash-can"></i> Hapus Permanen
          </button>
        </div>
      </Modal>}

      {/* Modal: Import Excel */}
      {importModal && <Modal title="Integrasi Berkas Excel" onClose={() => { setImportModal(false); setImportData([]); setImportStatus(''); }}>
        <div className="space-y-4 text-left">
          <div className="bg-green-50/60 border border-green-100 rounded-xl p-4 text-xs text-green-700 leading-relaxed font-semibold tracking-tight">
            <p className="font-extrabold uppercase tracking-widest text-[9px] text-green-800 mb-1.5">Struktur Tajuk Kolom Wajib:</p>
            <p className="font-mono text-[11px] text-green-600 bg-white/80 p-2 rounded-lg border border-green-100/50 overflow-x-auto whitespace-nowrap">No · Nama Siswa · NISN · NIS · Jenis Kelamin · Tempat Tanggal Lahir · Ayah · Ibu · Keterangan</p>
          </div>
          <button onClick={downloadTemplate}
            className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900 text-xs font-bold flex items-center justify-center gap-2 transition-all bg-white cursor-pointer tracking-tight">
            <i className="fa-regular fa-file-lines text-gray-400"></i> Unduh Dokumen Template Excel
          </button>
          <div className="space-y-1.5">
            <label className="block text-gray-400 text-[10px] font-extrabold uppercase tracking-widest">Unggah Berkas Spreadsheet (.xlsx / .xls)</label>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-500 text-xs font-bold file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-extrabold file:bg-gray-900 file:text-white hover:file:bg-gray-800 cursor-pointer tracking-tight" />
          </div>
          {importStatus && <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs font-bold text-gray-500 text-center tracking-tight">{importStatus}</div>}
          
          {importData.length > 0 && (
            <div className="max-h-44 overflow-y-auto border border-gray-200 rounded-xl bg-white shadow-inner">
              <table className="w-full text-[11px] text-left border-collapse">
                <thead className="sticky top-0 bg-gray-50 text-gray-400 font-extrabold text-[9px] uppercase tracking-wider border-b border-gray-200">
                  <tr>{['No','Nama','NISN','NIS','JK','Status'].map(h => <th key={h} className="px-3 py-2">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-semibold text-gray-500 tracking-tight">
                  {importData.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="px-3 py-2 text-gray-400 font-bold">{r.no}</td>
                      <td className="px-3 py-2 text-gray-950 font-black max-w-[120px] truncate">{r.nama_siswa}</td>
                      <td className="px-3 py-2 font-mono text-gray-800">{r.nisn}</td>
                      <td className="px-3 py-2 font-mono text-gray-400">{r.nis || '-'}</td>
                      <td className="px-3 py-2 text-gray-400">{r.jenis_kelamin === 'Laki-laki' ? 'L' : 'P'}</td>
                      <td className="px-3 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold border ${r.keterangan === 'LULUS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                          {r.keterangan}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setImportModal(false); setImportData([]); setImportStatus(''); }}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 bg-transparent text-xs font-bold transition-all cursor-pointer tracking-tight">Batal</button>
            <button onClick={handleImport} disabled={!importData.length}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-40 text-white font-bold text-xs transition-all border-none cursor-pointer shadow-md shadow-green-600/10 tracking-tight flex items-center justify-center gap-1.5">
              <i className="fa-solid fa-cloud-arrow-up"></i> Kirim {importData.length > 0 ? `(${importData.length} Entri)` : ''}
            </button>
          </div>
        </div>
      </Modal>}

      {/*  Modal Settings */}
      {showSettings && sekolahInfo && (
        <Modal title="Pengaturan Identitas Sekolah" onClose={() => setShowSettings(false)}>
          <form onSubmit={handleUpdateInfo} className="space-y-4">
            {[
              { label: 'Nama Sekolah', name: 'nama' },
              { label: 'Tahun Ajaran', name: 'tahun' },
              { label: 'Alamat', name: 'alamat' },
              { label: 'Telepon', name: 'telepon' },
              { label: 'WhatsApp', name: 'whatsapp' },
              { label: 'Email', name: 'email' },
            ].map(field => (
              <div key={field.name}>
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">{field.label}</label>
                <input name={field.name} defaultValue={sekolahInfo[field.name]} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold focus:border-green-500 focus:outline-none" />
              </div>
            ))}
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setShowSettings(false)} className="flex-1 py-2.5 border rounded-xl font-bold text-xs text-gray-400">Batal</button>
              <button type="submit" className="flex-1 py-2.5 bg-green-600 rounded-xl font-bold text-xs text-white">Simpan Perubahan</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}