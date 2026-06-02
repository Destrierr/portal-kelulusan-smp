import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const getSiswa = async (search = '') => {
  let query = supabase.from('siswa').select('*').order('no', { ascending: true });
  if (search) {
    query = query.or(`nama_siswa.ilike.%${search}%,nisn.ilike.%${search}%,nis.ilike.%${search}%`);
  }
  const { data, error } = await query;
  return { data, error };
};

export const getSiswaByNisn = async (nisn) => {
  try {
    console.time('supabase-query');

    const { data, error } = await supabase
      .from('siswa')
      .select('nama_siswa, nisn, nis, jenis_kelamin, tempat_tanggal_lahir, nama_ayah, nama_ibu, keterangan')
      .eq('nisn', nisn)
      .maybeSingle();

    console.timeEnd('supabase-query');

    if (error) {
      console.error('Supabase Error:', error.message);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Network/Catch Error:', err);
    return { data: null, error: err };
  }
};

export const createSiswa = async (siswa) => {
  const { data, error } = await supabase.from('siswa').insert([siswa]).select();
  return { data, error };
};

export const updateSiswa = async (id, siswa) => {
  const { data, error } = await supabase.from('siswa').update(siswa).eq('id', id).select();
  return { data, error };
};

export const deleteSiswa = async (id) => {
  const { error } = await supabase.from('siswa').delete().eq('id', id);
  return { error };
};

export const upsertSiswa = async (rows) => {
  const { data, error } = await supabase
    .from('siswa')
    .upsert(rows, { onConflict: 'nisn' })
    .select();
  return { data, error };
};

export const getStats = async () => {
  const { data, error } = await supabase
    .from('siswa')
    .select('keterangan');

  if (error) return { total: 0, lulus: 0, persen: '0%' };

  const total = data.length;
  const lulus = data.filter(s => s.keterangan === 'LULUS').length;
  const persen = total > 0 ? Math.round((lulus / total) * 100) + '%' : '0%';

  return { total, lulus, persen };
};

export const getSekolahInfo = async () => {
  const { data, error } = await supabase
    .from('sekolah_info')
    .select('*')
    .eq('id', 1)
    .single();
  return { data, error };
};

export const updateSekolahInfo = async (info) => {
  const { data, error } = await supabase
    .from('sekolah_info')
    .update(info)
    .eq('id', 1)
    .select()
    .single();
  return { data, error };
};