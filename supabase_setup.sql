-- ============================================
-- SETUP SUPABASE: Jalankan SQL ini di
-- Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Buat tabel siswa (sesuai format data Kelulusan.xlsx)
CREATE TABLE IF NOT EXISTS public.siswa (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  no                  INTEGER,
  nama_siswa          TEXT NOT NULL,
  nisn                TEXT NOT NULL UNIQUE,
  nis                 TEXT,
  jenis_kelamin       TEXT CHECK (jenis_kelamin IN ('Laki-laki', 'Perempuan')),
  tempat_tanggal_lahir TEXT,
  nama_ayah           TEXT,
  nama_ibu            TEXT,
  keterangan          TEXT NOT NULL DEFAULT 'LULUS' CHECK (keterangan IN ('LULUS', 'TIDAK LULUS')),
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- 2. Index untuk pencarian cepat
CREATE INDEX IF NOT EXISTS idx_siswa_nisn       ON public.siswa(nisn);
CREATE INDEX IF NOT EXISTS idx_siswa_nis        ON public.siswa(nis);
CREATE INDEX IF NOT EXISTS idx_siswa_nama_siswa ON public.siswa(nama_siswa);

-- 3. Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_siswa
  BEFORE UPDATE ON public.siswa
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.siswa ENABLE ROW LEVEL SECURITY;

-- Siapa saja bisa membaca (halaman publik)
CREATE POLICY "allow_public_read"
  ON public.siswa FOR SELECT
  TO anon, authenticated
  USING (true);

-- Hanya admin (authenticated) yang bisa insert/update/delete
CREATE POLICY "allow_authenticated_insert"
  ON public.siswa FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "allow_authenticated_update"
  ON public.siswa FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "allow_authenticated_delete"
  ON public.siswa FOR DELETE
  TO authenticated USING (true);

-- ============================================
-- DATA CONTOH (dari file Kelulusan.xlsx)
-- Hapus bagian ini sebelum production jika tidak diperlukan
-- ============================================

INSERT INTO public.siswa (no, nama_siswa, nisn, nis, jenis_kelamin, tempat_tanggal_lahir, nama_ayah, nama_ibu, keterangan) VALUES
(1,  'A. RAHMAT DINI',              '0129525365', '2705', 'Laki-laki',  'MADURA, 19 SEPTEMBER 2011',     'ABDUL MUTOLIB',              'JALEHA RATMIANA',            'LULUS'),
(2,  'ADELIA PERATIWI',             '0113694044', '2673', 'Perempuan',  'PALEMBANG, 8 DESEMBER 2011',    'MAIDI',                      'MARYANI',                    'LULUS'),
(3,  'AISYAH',                      '0116553767', '2677', 'Perempuan',  'PALEMBANG, 18 AGUSTUS 2011',    'KASIM',                      'ASINA',                      'LULUS'),
(4,  'ALDO SAPUTRA',                '0112031663', '2675', 'Laki-laki',  'ARISAN JAYA, 8 JANUARI 2011',   'SUHARDI',                    'SURYANTI',                   'LULUS'),
(5,  'ALVINO FERLIANSYAH',          '0112438075', '2676', 'Laki-laki',  'BATURAJA, 28 JULI 2011',        'HERI OKTA PRANSISKA',        'NUR INDAH SARI',             'LULUS'),
(6,  'ALYA SALSABILLA',             '0124275676', '2678', 'Perempuan',  'KAYU AGUNG, 29 MARET 2012',     'ANTON SANGON, S.Pd',         'ANDINI SAPUTRI, Am.Keb',     'LULUS'),
(7,  'AYSAH',                       '0118732542', '2679', 'Perempuan',  'PALEMBANG, 18 MARET 2011',      'RUSLAN EFENDI',              'SINARIAH',                   'LULUS'),
(8,  'BIMA PRATAMA',                '0125758735', '2680', 'Laki-laki',  'PALEMBANG, 10 JUNI 2012',       'BENI SAPUTRA',               'YENI HANDARI',               'LULUS'),
(9,  'CALVIN DAFA APRILLIO',        '0111213455', '2681', 'Laki-laki',  'PALEMBANG, 2 APRIL 2011',       'HENDRA',                     'RANTI',                      'LULUS'),
(10, 'DEWI RAHMAWATI',              '0113268687', '2682', 'Perempuan',  'TANJUNG ENIM, 19 MARET 2011',   'SUTARMIN',                   'MISMAYA',                    'LULUS'),
(11, 'DIMAS KURNIAWAN',             '3110040114', '2684', 'Laki-laki',  'PALEMBANG, 11 OKTOBER 2011',    'M. SOLEH',                   'SURLIYANТИ',                  'LULUS'),
(12, 'DINDA SEKAR WANGI',           '0083299889', '2685', 'Perempuan',  'BATURAJA, 21 NOVEMBER 2008',    'HASAN',                      'LENI MARLENA',               'LULUS'),
(13, 'FENTI HERMALIA',              '0105731528', '2687', 'Perempuan',  'PALEMBANG, 14 NOVEMBER 2010',   'HERMAN',                     'LISTINA',                    'LULUS'),
(14, 'HAIKAL BINTANG FAJRI',        '0112639303', '2688', 'Laki-laki',  'PALEMBANG, 09 NOVEMBER 2011',   'DARMEWI',                    'RUSMINI',                    'LULUS'),
(15, 'M. ASHARUDIN',                '0103762679', '2692', 'Laki-laki',  'PALEMBANG, 2 SEPTEMBER 2010',   'RIO SAHARUDIN',              'FITRI YANI',                 'LULUS'),
(16, 'M. DIRA ERHANSYAH',           '0124933124', '2693', 'Laki-laki',  'PALEMBANG, 13 JUNI 2012',       'FEBRIANTO',                  'HERTIKA DIANA',              'LULUS'),
(17, 'M. RAKHA KIRANA',             '0115906313', '2694', 'Laki-laki',  'PALEMBANG, 4 APRIL 2011',       'JIMMI KIRANA',               'LINDA NOPIANTI',             'LULUS'),
(18, 'M. RAMADHAN',                 '0101055680', '2835', 'Laki-laki',  'IBUL BESAR II, 31 AGUSTUS 2010','UMAR JANI',                  'SUMARLINA',                  'LULUS'),
(19, 'MUHAMAD RIDHO',               '0112543462', '2691', 'Laki-laki',  'IBUL BESAR II, 23 NOVEMBER 2011','SARIF ABDULAH',             'SOLHA',                      'LULUS'),
(20, 'MUHAMMAD BARA CAHYO SUSANTO', '0125602540', '2689', 'Laki-laki',  'PALEMBANG, 12 JANUARI 2012',    'LESI SETIAWAN',              'ANI MARLIA',                 'LULUS'),
(21, 'MUHAMMAD HUDA WIJAYA',        '115489227',  '2690', 'Laki-laki',  'PALEMBANG, 9 JULI 2011',        'KARNADI',                    'YUSMAREНА, S.Pd.I',           'LULUS'),
(22, 'MUHAMMAD ILHAM',              '0092544224', '2755', 'Laki-laki',  'INDRALAYA, 15 SEPTEMBER 2009',  'EKO SAPUTRO',                'SAMINA',                     'LULUS'),
(23, 'NEYSHA ADELYA',               '0112348237', '2695', 'Perempuan',  'PALEMBANG, 22 DESEMBER 2011',   'ABDUL WAHID ROMADHON',       'DANILAH',                    'LULUS'),
(24, 'OKTA MAULANA',                '0113354478', '2696', 'Laki-laki',  'PALEMBANG, 7 JANUARI 2011',     'SAHRIL',                     'JUAIRIAH',                   'LULUS'),
(25, 'PITRI',                       '0112286013', '2698', 'Perempuan',  'PALEMBANG, 01 SEPTEMBER 2011',  'DARMAN',                     'MARYANI',                    'LULUS'),
(26, 'PUTRI AYU',                   '0128491970', '2699', 'Perempuan',  'PALEMBANG, 11 APRIL 2012',      'AMRAN',                      'NURYANI',                    'LULUS'),
(27, 'RIRI ANGGRAINI',              '0112903329', '2700', 'Perempuan',  'PALEMBANG, 08 SEPTEMBER 2011',  'SARDI YANTO',                'MARLINA',                    'LULUS'),
(28, 'SIVA MEI RAHMA',              '0114029103', '2701', 'Perempuan',  'PALEMBANG, 5 MEI 2011',         'DODDY',                      'SRI HARTATI',                'LULUS'),
(29, 'SULAIMAN',                    '0106701101', '2702', 'Laki-laki',  'PALEMBANG, 27 OKTOBER 2010',    'AHMAD PAJRI',                'DESI NILA SARI',             'LULUS'),
(30, 'SYAHRIAL RAMDHANI',           '0118955639', '2703', 'Laki-laki',  'ULAK PIANGGU, 3 AGUSTUS 2011',  'BUDIMAN',                    'AINI',                       'LULUS'),
(31, 'VIOLANDA NINDITA',            '0115515515', '2704', 'Perempuan',  'PALEMBANG, 10 FEBRUARI 2011',   'HERIANTO',                   'NURJANAH',                   'LULUS')
ON CONFLICT (nisn) DO NOTHING;

-- ============================================
-- BUAT AKUN ADMIN
-- Supabase Dashboard > Authentication > Users > Add User
-- ============================================
