/**
 * Helper Module for Si-LKP Waru Hierarchical Validation & Data Scoping
 * 
 * Aturan Struktural Hirarki Kecamatan Waru:
 * 1. Camat memvalidasi Sekcam & Kasi
 * 2. Sekcam memvalidasi Kasubbag & Staf Sekretariat
 * 3. Kasi memvalidasi Staf di seksinya masing-masing
 * 4. Kasubbag memvalidasi Staf di subbagiannya masing-masing
 * 5. Pegawai yang memilih Atasan Validasi spesifik divalidasi oleh atasan tersebut
 * 6. Bawahan TIDAK BISA memvalidasi atasan
 * 7. Staf HANYA melihat datanya sendiri; Atasan HANYA melihat bawahannya langsung
 */

export function getRankLevel(user) {
  if (!user) return 0;
  const role = String(user.role || '').toLowerCase();
  const jabatan = String(user.jabatan || '').toLowerCase();
  let peran = String(user.peranStruktur || '').toLowerCase();

  // Clean explanatory phrases like "(divalidasi ...)" from peran
  // e.g. "(Divalidasi Sekcam)" describes WHO validates the user, not that the user IS Sekcam!
  peran = peran.replace(/divalidasi\s+[a-z0-9\s/_-]+/gi, '');

  const combined = (' ' + role + ' ' + jabatan + ' ' + peran + ' ').replace(/[.,/()_-]/g, ' ');

  // Superadmin IT (Role 'Admin', bukan Camat)
  if (role === 'admin' && !/\bcamat\b/.test(combined)) {
    return 6;
  }
  // Camat Level (Level 5): Harus kata 'camat' utuh, bukan kata 'kecamatan'
  if (/\bcamat\b/.test(combined) && !/\bsekcam\b/.test(combined) && !combined.includes('sekretaris')) {
    return 5;
  }
  // Kasubbag Level (Level 2): Prioritaskan Kasubbag jika jabatan adalah Kasubbag/Kasubag
  // Mencegah Kasubbag yang memiliki catatan "(Divalidasi Sekcam)" atau "Rangkap: Kasi" terkeliru sebagai Sekcam/Kasi
  if ((/\bkasubbag\b/.test(jabatan) || /\bkasubag\b/.test(jabatan) || (/\bkasubbag\b/.test(peran) && !/\bsekcam\b/.test(jabatan))) && !/\bcamat\b/.test(jabatan)) {
    return 2;
  }
  // Sekcam Level (Level 4):
  if (/\bsekcam\b/.test(combined) || combined.includes('sekretaris')) {
    return 4;
  }
  // Kasi Level (Level 3):
  if (/\bkasi\b/.test(combined) || combined.includes('kepala seksi') || /\bkabid\b/.test(combined)) {
    return 3;
  }
  // Kasubbag Level (Level 2): Fallback
  if (/\bkasubbag\b/.test(combined) || /\bkasubag\b/.test(combined) || combined.includes('kepala sub')) {
    return 2;
  }
  return 1; // Staf / ASN Level
}

// Check if user is a superior
export function isSuperiorUser(user) {
  if (!user) return false;
  const level = getRankLevel(user);
  return level > 1 || String(user.role).includes('Atasan');
}

// Rule #1 - #6: Hierarchy Validation Permission Check
export function canValidate(superior, subordinate, users = []) {
  if (!superior || !subordinate) return false;

  const supId = String(superior.id || superior.nip || '').replace(/\s+/g, '');
  const supName = String(superior.name || '').trim().toLowerCase();
  const subId = String(subordinate.id || subordinate.nip || subordinate.pegawaiId || '').replace(/\s+/g, '');
  const subName = String(subordinate.name || subordinate.namaPegawai || '').trim().toLowerCase();

  // Cannot validate self
  if (supId && subId && supId === subId) return false;
  if (supName && subName && supName === subName) return false;

  // Find subordinate in users list if needed to retrieve atasanValidasi
  let atasanVal = String(subordinate.atasanValidasi || '').toLowerCase();
  if (!atasanVal && users && users.length > 0) {
    const found = users.find(u => {
      const uId = String(u.id || u.nip || '').replace(/\s+/g, '');
      return (subId && uId === subId) || (u.name && String(u.name).trim().toLowerCase() === subName);
    });
    if (found?.atasanValidasi) {
      atasanVal = String(found.atasanValidasi).toLowerCase();
    }
  }

  const supLevel = getRankLevel(superior);
  const subLevel = getRankLevel(subordinate);

  // Superadmin IT (Level 6) can validate all
  if (supLevel === 6) return true;

  // RULE: Subordinate can NEVER validate superior or equal rank level
  if (subLevel >= supLevel) return false;

  const supJabatan = String(superior.jabatan || '').toLowerCase();

  // Check explicit atasanValidasi selected by the employee
  if (atasanVal) {
    const matchesName = supName && (atasanVal.includes(supName) || supName.includes(atasanVal.split('(')[0].trim()));
    const matchesJabatan = (
      (/\bcamat\b/.test(supJabatan) && !/\bsekcam\b/.test(supJabatan) && !supJabatan.includes('sekretaris') && /\bcamat\b/.test(atasanVal) && !atasanVal.includes('sekcam')) ||
      ((/\bsekcam\b/.test(supJabatan) || supJabatan.includes('sekretaris')) && (atasanVal.includes('sekcam') || atasanVal.includes('sekretaris'))) ||
      ((/\bkasi\b/.test(supJabatan) || supJabatan.includes('seksi')) && (atasanVal.includes('kasi') || atasanVal.includes('seksi'))) ||
      ((/\bkasubbag\b/.test(supJabatan) || /\bkasubag\b/.test(supJabatan) || supJabatan.includes('sub')) && (atasanVal.includes('kasub') || atasanVal.includes('sub')))
    );

    if (matchesName || matchesJabatan) {
      return true;
    }
    // Jika bawahan memilih atasan spesifik lain, jangan masuk ke meja validasi atasan ini
    return false;
  }

  // Fallback by hierarchy structure jika atasanValidasi kosong:
  // Camat (5): HANYA memvalidasi Sekcam (4) dan Kasi (3)
  if (supLevel === 5) {
    return subLevel === 4 || subLevel === 3;
  }

  // Sekcam (4): Memvalidasi Kasubbag (2) dan Staf (1) jika rangkap jabatan Kasi
  if (supLevel === 4) {
    const isRangkap = supJabatan.includes('rangkap') || supJabatan.includes('kasi') || supJabatan.includes('plt');
    if (subLevel === 2) return true;
    if (subLevel === 1 && isRangkap) return true;
    return false;
  }

  // Kasi (3): Memvalidasi Staf (1)
  if (supLevel === 3) {
    return subLevel === 1;
  }

  // Kasubbag (2): Memvalidasi Staf (1)
  if (supLevel === 2) {
    return subLevel === 1;
  }

  return false;
}

// RULE #7: Visible Reports Scoping (Staf -> Only Self; Atasan -> Self + Subordinates Langsung)
export function getVisibleReports(user, reports = [], users = []) {
  if (!user) return [];

  // Superadmin IT murni melihat semua
  const isPureAdmin = String(user.role || '').toLowerCase() === 'admin' && !/\bcamat\b/i.test(user.jabatan || '');
  if (isPureAdmin) {
    return reports;
  }

  const level = getRankLevel(user);
  const userId = String(user.id || user.nip || '').replace(/\s+/g, '');
  const userName = String(user.name || '').trim().toLowerCase();
  const userNip = String(user.nip || '').replace(/\s+/g, '');

  // Staf hanya melihat laporannya sendiri
  if (level === 1 && !String(user.role).includes('Atasan')) {
    return reports.filter(r => {
      if (!r) return false;
      const rId = String(r.pegawaiId || '').replace(/\s+/g, '');
      const rNip = String(r.nip || '').replace(/\s+/g, '');
      const rName = String(r.namaPegawai || '').trim().toLowerCase();
      return (rId && (rId === userId || rId === userNip)) ||
             (rNip && (rNip === userId || rNip === userNip)) ||
             (rName && userName && (rName.includes(userName) || userName.includes(rName)));
    });
  }

  // Atasan (Camat, Sekcam, Kasi, Kasubbag): melihat miliknya sendiri + HANYA bawahan langsungnya
  return reports.filter(r => {
    if (!r) return false;
    const rId = String(r.pegawaiId || '').replace(/\s+/g, '');
    const rNip = String(r.nip || '').replace(/\s+/g, '');
    const rName = String(r.namaPegawai || '').trim().toLowerCase();

    const isSelf = (rId && (rId === userId || rId === userNip)) ||
                   (rNip && (rNip === userId || rNip === userNip)) ||
                   (rName && userName && (rName.includes(userName) || userName.includes(rName)));
    if (isSelf) return true;

    // Cari data pegawai di daftar users
    const foundUser = users.find(u => {
      const uId = String(u.id || u.nip || '').replace(/\s+/g, '');
      return (rId && uId === rId) || (rNip && uId === rNip) || (u.name && String(u.name).trim().toLowerCase() === rName);
    });

    const subObj = {
      id: r.pegawaiId || r.nip,
      nip: r.nip,
      name: r.namaPegawai,
      jabatan: foundUser?.jabatan || r.jabatan || '',
      role: foundUser?.role || 'ASN / Staf',
      peranStruktur: foundUser?.peranStruktur || '',
      atasanValidasi: foundUser?.atasanValidasi || r.atasanValidasi || ''
    };

    return canValidate(user, subObj, users);
  });
}

// RULE #7: Visible Pegawai List Scoping
export function getVisiblePegawai(user, pegawaiList = []) {
  if (!user) return [];
  const isPureAdmin = String(user.role || '').toLowerCase() === 'admin' && !/\bcamat\b/i.test(user.jabatan || '');
  if (isPureAdmin) {
    return pegawaiList;
  }

  const level = getRankLevel(user);
  const userId = String(user.id || user.nip || '').replace(/\s+/g, '');

  if (level === 1 && !String(user.role).includes('Atasan')) {
    return pegawaiList.filter(p => String(p.id || p.nip || '').replace(/\s+/g, '') === userId);
  }

  return pegawaiList.filter(p => {
    const pId = String(p.id || p.nip || '').replace(/\s+/g, '');
    if (pId === userId) return true;
    return canValidate(user, p, pegawaiList);
  });
}
