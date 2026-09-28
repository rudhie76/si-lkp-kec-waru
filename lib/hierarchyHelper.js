/**
 * Helper Module for Si-LKP Waru Hierarchical Validation & Data Scoping
 * 
 * Aturan Struktural 7 Poin:
 * 1. Camat memvalidasi Sekcam & Kasi
 * 2. Sekcam memvalidasi Kasubbag
 * 3. Kasi memvalidasi Staf bawahannya
 * 4. Kasubbag memvalidasi Staf bawahannya
 * 5. Atasan rangkap jabatan (misal: Sekcam rangkap Kasi) memvalidasi staf bawahannya
 * 6. Bawahan TIDAK BISA memvalidasi atasan
 * 7. Staf HANYA melihat datanya sendiri; Atasan melihat dirinya & bawahannya
 */

export function getRankLevel(user) {
  if (!user) return 0;
  const role = String(user.role || '').toLowerCase();
  const jabatan = String(user.jabatan || '').toLowerCase();
  const peran = String(user.peranStruktur || '').toLowerCase();
  const combined = `${role} ${jabatan} ${peran}`;

  if (combined.includes('admin') || combined.includes('camat') && !combined.includes('sekcam')) {
    return 5; // Camat / Admin Level
  }
  if (combined.includes('sekcam') || combined.includes('sekretaris kecamatan')) {
    return 4; // Sekcam Level
  }
  if (combined.includes('kasi') || combined.includes('kepala seksi') || combined.includes('kabid')) {
    return 3; // Kasi / Kabid Level
  }
  if (combined.includes('kasubbag') || combined.includes('kasubag') || combined.includes('kepala sub')) {
    return 2; // Kasubbag Level
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
export function canValidate(superior, subordinate) {
  if (!superior || !subordinate) return false;

  const supId = String(superior.id || superior.nip || '');
  const subId = String(subordinate.id || subordinate.nip || subordinate.pegawaiId || '');

  // Cannot validate self as subordinate
  if (supId && subId && supId === subId) return false;

  const supLevel = getRankLevel(superior);
  const subLevel = getRankLevel(subordinate);

  // RULE #6: Subordinate can NEVER validate superior or equal rank level!
  if (subLevel >= supLevel) {
    return false;
  }

  // RULE #1: Camat validates Sekcam, Kasi, Kasubbag, Staf
  if (supLevel === 5) {
    return true;
  }

  // RULE #2 & #5: Sekcam validates Kasubbag (and Staf if Rangkap Jabatan)
  if (supLevel === 4) {
    const supCombined = `${superior.jabatan || ''} ${superior.peranStruktur || ''}`.toLowerCase();
    const isRangkapKasi = supCombined.includes('rangkap') || supCombined.includes('kasi') || supCombined.includes('plt');

    if (subLevel === 2) return true; // Kasubbag
    if (subLevel === 1 && isRangkapKasi) return true; // Staf under Rangkap Jabatan Kasi
    if (subLevel === 3) return false; // Sekcam does not validate Kasi unless Camat
    return subLevel === 1 && isRangkapKasi;
  }

  // RULE #3: Kasi validates Staf
  if (supLevel === 3) {
    return subLevel === 1; // Staf
  }

  // RULE #4: Kasubbag validates Staf
  if (supLevel === 2) {
    return subLevel === 1; // Staf
  }

  return false;
}

// RULE #7: Visible Reports Scoping (Staf -> Only Self; Atasan -> Self + Subordinates)
export function getVisibleReports(user, reports = []) {
  if (!user) return [];
  const level = getRankLevel(user);

  // Admin & Camat see all reports
  if (level === 5 || String(user.role).toLowerCase().includes('admin')) {
    return reports;
  }

  const userId = String(user.id || user.nip || '').replace(/\s+/g, '');
  const userName = String(user.name || '').trim().toLowerCase();
  const userNip = String(user.nip || '').replace(/\s+/g, '');

  // RULE #7: Staf sees ONLY their own reports
  if (level === 1 && !String(user.role).includes('Atasan')) {
    return reports.filter(r => {
      const rId = String(r.pegawaiId || '').replace(/\s+/g, '');
      const rNip = String(r.nip || '').replace(/\s+/g, '');
      const rName = String(r.namaPegawai || '').trim().toLowerCase();
      return (rId && rId === userId) || (rNip && rNip === userNip) || (rName && rName === userName);
    });
  }

  // Atasan (Level 2, 3, 4) sees self + eligible subordinates
  return reports.filter(r => {
    const rId = String(r.pegawaiId || '').replace(/\s+/g, '');
    const rNip = String(r.nip || '').replace(/\s+/g, '');
    const rName = String(r.namaPegawai || '').trim().toLowerCase();

    const isSelf = (rId && rId === userId) || (rNip && rNip === userNip) || (rName && rName === userName);
    if (isSelf) return true;

    const subObj = {
      id: r.pegawaiId || r.nip,
      nip: r.nip,
      name: r.namaPegawai,
      jabatan: r.jabatan,
      role: 'ASN / Staf'
    };

    return canValidate(user, subObj);
  });
}

// RULE #7: Visible Pegawai List Scoping
export function getVisiblePegawai(user, pegawaiList = []) {
  if (!user) return [];
  const level = getRankLevel(user);

  if (level === 5 || String(user.role).toLowerCase().includes('admin')) {
    return pegawaiList;
  }

  const userId = String(user.id || user.nip || '').replace(/\s+/g, '');

  // Staf sees ONLY self in dropdowns
  if (level === 1 && !String(user.role).includes('Atasan')) {
    return pegawaiList.filter(p => String(p.id || p.nip || '').replace(/\s+/g, '') === userId);
  }

  // Atasan sees self + eligible subordinates
  return pegawaiList.filter(p => {
    const pId = String(p.id || p.nip || '').replace(/\s+/g, '');
    if (pId === userId) return true;
    return canValidate(user, p);
  });
}
