// Helper Service for Si-LKP Waru v1.5 Data Management & Google Sheets Sync

export async function hashPasswordSHA256(text) {
  if (!text) return '';
  try {
    const msgUint8 = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    return text;
  }
}

export const INITIAL_PEGAWAI = [
  { id: '198504122008011002', name: 'Ahmad Fauzi, S.STP', nip: '19850412 200801 1 002', jabatan: 'Camat Waru', role: 'Atasan Langsung', passwordHash: '' },
  { id: '198809232011012005', name: 'Nurul Hidayah, S.E.', nip: '19880923 201101 2 005', jabatan: 'Sekretaris Kecamatan', role: 'Atasan Langsung', passwordHash: '' },
  { id: '199205152015031008', name: 'Hendra Wijaya, A.Md.', nip: '19920515 201503 1 008', jabatan: 'Pengelola Pelayanan Publik', role: 'ASN / Staf', passwordHash: '' },
  { id: '199511082019022011', name: 'Rina Astuti, S.IP.', nip: '19951108 201902 2 011', jabatan: 'Staf Administrasi Umum', role: 'ASN / Staf', passwordHash: '' },
];

export const INITIAL_REPORTS = [
  {
    id: 'LKH-20260924-001',
    tanggal: '2026-09-24',
    pegawaiId: '19920515 201503 1 008',
    namaPegawai: 'Hendra Wijaya, A.Md.',
    nip: '19920515 201503 1 008',
    jabatan: 'Pengelola Pelayanan Publik',
    detailKegiatan: [
      {
        id: 'k-1',
        jamMulai: '08:00',
        jamSelesai: '10:00',
        durasiJam: 2.0,
        kategori: 'Pelayanan Publik',
        deskripsi: 'Memproses pengajuan e-KTP dan Kartu Keluarga (KK) online warga Desa Sesulu sebanyak 10 berkas.',
        volume: 10,
        satuan: 'Berkas',
        fotoUrl: ''
      },
      {
        id: 'k-2',
        jamMulai: '10:30',
        jamSelesai: '12:00',
        durasiJam: 1.5,
        kategori: 'Administrasi',
        deskripsi: 'Mengarsip dan merekapitulasi dokumen keluhan warga di loket e-Pelayanan Waru.',
        volume: 1,
        satuan: 'Laporan',
        fotoUrl: ''
      }
    ],
    deskripsi: 'Memproses pengajuan e-KTP & Mengarsip dokumen keluhan warga',
    durasiJam: 3.5,
    lampiranUrl: '',
    status: 'DIVALIDASI',
    catatanAtasan: 'Laporan lengkap dan terverifikasi.',
    diverifikasiOleh: 'Ahmad Fauzi, S.STP (Camat)',
    waktuInput: '2026-09-24 12:15 WITA'
  },
  {
    id: 'LKH-20260924-002',
    tanggal: '2026-09-24',
    pegawaiId: '19951108 201902 2 011',
    namaPegawai: 'Rina Astuti, S.IP.',
    nip: '19951108 201902 2 011',
    jabatan: 'Staf Administrasi Umum',
    detailKegiatan: [
      {
        id: 'k-3',
        jamMulai: '09:00',
        jamSelesai: '11:00',
        durasiJam: 2.0,
        kategori: 'Administrasi',
        deskripsi: 'Penyusunan berkas undangan rapat koordinasi Musrenbangbang tingkat Kecamatan Waru.',
        volume: 1,
        satuan: 'Dokumen',
        fotoUrl: ''
      }
    ],
    deskripsi: 'Penyusunan berkas undangan rapat koordinasi Musrenbangbang',
    durasiJam: 2.0,
    lampiranUrl: '',
    status: 'PENDING',
    catatanAtasan: '',
    diverifikasiOleh: '',
    waktuInput: '2026-09-24 11:10 WITA'
  }
];

const LOCAL_STORAGE_REPORTS_KEY = 'si_lkp_waru_reports_v1_5';
const LOCAL_STORAGE_USERS_KEY = 'si_lkp_waru_users_v1_5';
const LOCAL_STORAGE_AUTH_KEY = 'si_lkp_waru_auth_v1_5';
const LOCAL_STORAGE_GS_URL_KEY = 'si_lkp_waru_gs_url_v1_5';

export function getReportsFromLocal() {
  if (typeof window === 'undefined') return INITIAL_REPORTS;
  const data = localStorage.getItem(LOCAL_STORAGE_REPORTS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_REPORTS_KEY, JSON.stringify(INITIAL_REPORTS));
    return INITIAL_REPORTS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_REPORTS;
  }
}

export function saveReportsToLocal(reports) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_REPORTS_KEY, JSON.stringify(reports));
}

export function getUsersFromLocal() {
  if (typeof window === 'undefined') return INITIAL_PEGAWAI;
  const data = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(INITIAL_PEGAWAI));
    return INITIAL_PEGAWAI;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_PEGAWAI;
  }
}

export function saveUsersToLocal(users) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
}

export function getAuthUserFromLocal() {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

export function setAuthUserToLocal(user) {
  if (typeof window === 'undefined') return;
  if (!user) {
    localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
  } else {
    localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(user));
  }
}

export function getGoogleSheetsUrl() {
  if (typeof window === 'undefined') return '';
  const hardcodedUrl = 'https://script.google.com/macros/s/AKfycbyZLCn9JvI-ujPgx1umIHA4Zcj7eMYPsCW5WXP1TStGWoTqp5opregiegbgWo7IlPPn/exec';
  return localStorage.getItem(LOCAL_STORAGE_GS_URL_KEY) || hardcodedUrl;
}

export function setGoogleSheetsUrl(url) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_GS_URL_KEY, url);
}

export function clearReportsInLocal() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_REPORTS_KEY, JSON.stringify([]));
}

export function clearUsersInLocal() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify([]));
}

export async function fetchFromGoogleSheets(webAppUrl) {
  try {
    const res = await fetch(`${webAppUrl}?action=getReports&t=${Date.now()}`);
    const json = await res.json();
    if (json.status === 'success' && Array.isArray(json.data)) {
      saveReportsToLocal(json.data);
      return json.data;
    }
  } catch (e) {
    console.error('Fetch GS reports error:', e);
  }
  return null;
}

export async function fetchUsersFromGoogleSheets(webAppUrl) {
  try {
    const res = await fetch(`${webAppUrl}?action=getUsers&t=${Date.now()}`);
    const json = await res.json();
    if (json.status === 'success' && Array.isArray(json.data)) {
      saveUsersToLocal(json.data);
      return json.data;
    }
  } catch (e) {
    console.error('Fetch GS users error:', e);
  }
  return null;
}

export async function pushToGoogleSheets(webAppUrl, action, data) {
  try {
    const res = await fetch(webAppUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, data })
    });
    return await res.json();
  } catch (e) {
    console.error('Push GS error:', e);
    return { status: 'error', message: e.toString() };
  }
}
