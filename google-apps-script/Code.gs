/**
 * Backend API Si-LKP Waru v1.5 - Kecamatan Waru
 * Database Google Sheets Integrasi (Sheet Users & Sheet Laporan)
 */

const SHEET_LKH = 'Laporan';
const SHEET_USERS = 'Users';

function hashSha256(text) {
  if (!text) return '';
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(text), Utilities.Charset.UTF_8);
  let hex = '';
  for (let i = 0; i < digest.length; i++) {
    let byteStr = (digest[i] < 0 ? digest[i] + 256 : digest[i]).toString(16);
    if (byteStr.length === 1) byteStr = '0' + byteStr;
    hex += byteStr;
  }
  return hex;
}

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Setup Sheet Users (ID, Nama Lengkap, NIP, No WA, Email, PasswordHash, Jabatan, Pangkat Golongan, Unit Kerja, Peran Struktur, Atasan Validasi, Role)
  let sheetUsers = ss.getSheetByName(SHEET_USERS);
  if (!sheetUsers) {
    sheetUsers = ss.insertSheet(SHEET_USERS);
    const uHeaders = ['ID', 'Nama Lengkap', 'NIP', 'No WA', 'Email', 'PasswordHash', 'Jabatan', 'Pangkat Golongan', 'Unit Kerja', 'Peran Struktur', 'Atasan Validasi', 'Role', 'Foto Profil'];
    sheetUsers.getRange(1, 1, 1, uHeaders.length).setValues([uHeaders]);
    sheetUsers.getRange(1, 1, 1, uHeaders.length)
      .setFontWeight('bold')
      .setBackground('#1b4d36')
      .setFontColor('#ffffff');
    sheetUsers.setFrozenRows(1);
  }

  // 2. Setup Sheet Laporan (ID_Laporan, NIP, Tanggal, Detail_Kegiatan, URL_Foto_Drive, Status_Validasi, Divalidasi_Oleh)
  let sheetLKH = ss.getSheetByName(SHEET_LKH);
  if (!sheetLKH) {
    sheetLKH = ss.insertSheet(SHEET_LKH);
    const headers = [
      'ID_Laporan', 'NIP', 'Tanggal', 'Detail_Kegiatan', 
      'URL_Foto_Drive', 'Status_Validasi', 'Divalidasi_Oleh', 
      'Nama_Pegawai', 'Jabatan', 'Catatan_Atasan', 'Waktu_Input'
    ];
    sheetLKH.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheetLKH.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#1b4d36')
      .setFontColor('#ffffff');
    sheetLKH.setFrozenRows(1);
  }
}

// GET Request
function doGet(e) {
  setupSheet();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const action = e.parameter.action || 'getReports';

  if (action === 'getUsers') {
    const sheetUsers = ss.getSheetByName(SHEET_USERS);
    const dataUsers = sheetUsers.getDataRange().getValues();
    const users = [];
    for (let i = 1; i < dataUsers.length; i++) {
      const row = dataUsers[i];
      if (!row[0]) continue;
      users.push({
        id: String(row[0]),
        name: String(row[1] || ''),
        nip: String(row[2] || row[0]),
        noWa: String(row[3] || ''),
        email: String(row[4] || ''),
        passwordHash: String(row[5] || ''),
        jabatan: String(row[6] || 'ASN'),
        pangkatGolongan: String(row[7] || ''),
        unitKerja: String(row[8] || ''),
        peranStruktur: String(row[9] || ''),
        atasanValidasi: String(row[10] || ''),
        role: String(row[11] || 'ASN / Staf'),
        fotoProfil: String(row[12] || '')
      });
    }
    return createJsonResponse({ status: 'success', data: users });
  }

  const sheet = ss.getSheetByName(SHEET_LKH);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return createJsonResponse({ status: 'success', data: [] });

  const reports = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    let detailKegiatan = [];
    try {
      detailKegiatan = JSON.parse(row[3]);
    } catch(err) {
      detailKegiatan = [{ deskripsi: String(row[3]), volume: 1, satuan: 'Berkas' }];
    }

    reports.push({
      id: String(row[0]),
      pegawaiId: String(row[1]),
      nip: String(row[1]),
      tanggal: String(row[2]),
      detailKegiatan: detailKegiatan,
      deskripsi: detailKegiatan.map(k => k.deskripsi).join('; '),
      lampiranUrl: String(row[4] || ''),
      status: String(row[5] || 'PENDING'),
      diverifikasiOleh: String(row[6] || ''),
      namaPegawai: String(row[7] || ''),
      jabatan: String(row[8] || ''),
      catatanAtasan: String(row[9] || ''),
      waktuInput: String(row[10] || '')
    });
  }

  return createJsonResponse({ status: 'success', data: reports });
}

// Helper: Upload Base64 to Google Drive
function uploadToDrive(dataURI, fileName, folderName) {
  if (!dataURI || !dataURI.startsWith('data:')) return dataURI;
  try {
    const splitData = dataURI.split(',');
    const mimeType = splitData[0].match(/:(.*?);/)[1];
    const base64Data = splitData[1];
    const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, fileName);
    
    const folders = DriveApp.getFoldersByName(folderName);
    let folder;
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(folderName);
      try {
        folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (e) {}
    }
    
    const file = folder.createFile(blob);
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (e) {}
    
    return "https://drive.google.com/uc?export=view&id=" + file.getId();
  } catch (e) {
    return dataURI;
  }
}

// POST Request
function doPost(e) {
  try {
    setupSheet();
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action || 'saveReport';
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. SAVE USER (Register / Insert / Update User)
    if (action === 'saveUser' || action === 'editUser') {
      const sheetUsers = ss.getSheetByName(SHEET_USERS);
      const user = payload.data;
      const passHash = user.password ? hashSha256(user.password) : (user.passwordHash || '');
      const targetId = String(user.id || user.nip).trim().replace(/\s+/g, '');

      // Upload Foto Profil to Drive if it's base64
      if (user.fotoProfil && user.fotoProfil.startsWith('data:image')) {
        user.fotoProfil = uploadToDrive(user.fotoProfil, 'Profil_' + targetId + '.jpg', 'SILKP_FOTO_PROFIL');
      }

      const dataUsers = sheetUsers.getDataRange().getValues();
      let updated = false;

      for (let i = 1; i < dataUsers.length; i++) {
        const rowId = String(dataUsers[i][0]).replace(/\s+/g, '');
        const rowNip = String(dataUsers[i][2]).replace(/\s+/g, '');
        
        if (rowId === targetId || rowNip === targetId) {
          if (user.name !== undefined) sheetUsers.getRange(i + 1, 2).setValue(user.name);
          if (user.nip !== undefined) sheetUsers.getRange(i + 1, 3).setValue(user.nip);
          if (user.noWa !== undefined) sheetUsers.getRange(i + 1, 4).setValue(user.noWa);
          if (user.email !== undefined) sheetUsers.getRange(i + 1, 5).setValue(user.email);
          if (passHash) sheetUsers.getRange(i + 1, 6).setValue(passHash);
          if (user.jabatan !== undefined) sheetUsers.getRange(i + 1, 7).setValue(user.jabatan);
          if (user.pangkatGolongan !== undefined) sheetUsers.getRange(i + 1, 8).setValue(user.pangkatGolongan);
          if (user.unitKerja !== undefined) sheetUsers.getRange(i + 1, 9).setValue(user.unitKerja);
          if (user.peranStruktur !== undefined) sheetUsers.getRange(i + 1, 10).setValue(user.peranStruktur);
          if (user.atasanValidasi !== undefined) sheetUsers.getRange(i + 1, 11).setValue(user.atasanValidasi);
          if (user.role !== undefined) sheetUsers.getRange(i + 1, 12).setValue(user.role);
          if (user.fotoProfil !== undefined) sheetUsers.getRange(i + 1, 13).setValue(user.fotoProfil);
          updated = true;
          break;
        }
      }

      if (!updated) {
        const newRow = [
          user.id || user.nip,
          user.name || '',
          user.nip || '',
          user.noWa || '',
          user.email || '',
          passHash,
          user.jabatan || 'ASN',
          user.pangkatGolongan || 'Penata Muda / IIIa',
          user.unitKerja || 'Kecamatan Waru',
          user.peranStruktur || 'Staf Pelaksana / JFT / JFU',
          user.atasanValidasi || '',
          user.role || 'ASN / Staf',
          user.fotoProfil || ''
        ];
        sheetUsers.appendRow(newRow);
      }

      return createJsonResponse({ status: 'success', message: 'User berhasil disimpan ke Google Sheets' });
    }

    // 2. DELETE USER
    if (action === 'deleteUser') {
      const sheetUsers = ss.getSheetByName(SHEET_USERS);
      const dataUsers = sheetUsers.getDataRange().getValues();
      const targetId = String(payload.data.id || payload.data.nip).replace(/\s+/g, '');

      for (let i = 1; i < dataUsers.length; i++) {
        const rowId = String(dataUsers[i][0]).replace(/\s+/g, '');
        const rowNip = String(dataUsers[i][2] || '').replace(/\s+/g, '');
        if (rowId === targetId || rowNip === targetId) {
          sheetUsers.deleteRow(i + 1);
          return createJsonResponse({ status: 'success', message: 'User berhasil dihapus' });
        }
      }
      return createJsonResponse({ status: 'error', message: 'User tidak ditemukan' });
    }

    // 3. SAVE REPORT (Insert or Update Report)
    if (action === 'saveReport') {
      const sheet = ss.getSheetByName(SHEET_LKH);
      const r = payload.data;
      const reportId = String(r.id || ('LKH-' + new Date().getTime()));

      // Upload Photos to Drive
      if (r.detailKegiatan && Array.isArray(r.detailKegiatan)) {
        r.detailKegiatan.forEach((keg, idx) => {
          if (keg.fotoUrl && keg.fotoUrl.startsWith('data:image')) {
            keg.fotoUrl = uploadToDrive(keg.fotoUrl, reportId + '_1.jpg', 'SILKP_LAPORAN_LKH');
          }
          if (keg.fotoUrl2 && keg.fotoUrl2.startsWith('data:image')) {
            keg.fotoUrl2 = uploadToDrive(keg.fotoUrl2, reportId + '_2.jpg', 'SILKP_LAPORAN_LKH');
          }
        });
      }

      if (r.lampiranUrl && r.lampiranUrl.startsWith('data:image')) {
        r.lampiranUrl = r.detailKegiatan && r.detailKegiatan[0] ? r.detailKegiatan[0].fotoUrl : uploadToDrive(r.lampiranUrl, reportId + '_main.jpg', 'SILKP_LAPORAN_LKH');
      }

      const detailJson = JSON.stringify(r.detailKegiatan || [{
        kategori: r.kategori || 'Administrasi',
        deskripsi: r.deskripsi || '',
        volume: r.volume || 1,
        satuan: r.satuan || 'Berkas',
        jamMulai: r.jamMulai || '08:00',
        jamSelesai: r.jamSelesai || '10:00',
        fotoUrl: r.lampiranUrl || ''
      }]);

      const dataReports = sheet.getDataRange().getValues();
      let updated = false;

      for (let i = 1; i < dataReports.length; i++) {
        if (String(dataReports[i][0]).trim() === reportId.trim()) {
          try {
            sheet.getRange(i + 1, 2, 1, 10).setValues([[
              r.nip || r.pegawaiId,
              r.tanggal,
              detailJson,
              r.lampiranUrl || '',
              r.status || 'PENDING',
              r.diverifikasiOleh || '',
              r.namaPegawai || '',
              r.jabatan || '',
              r.catatanAtasan || '',
              r.waktuInput || new Date().toLocaleString()
            ]]);
            updated = true;
          } catch (updateErr) {
            return createJsonResponse({ status: 'error', message: 'SetValues failed: ' + updateErr.toString() });
          }
          break;
        }
      }

      if (!updated) {
        const newRow = [
          reportId,
          r.nip || r.pegawaiId,
          r.tanggal,
          detailJson,
          r.lampiranUrl || '',
          r.status || 'PENDING',
          r.diverifikasiOleh || '',
          r.namaPegawai || '',
          r.jabatan || '',
          r.catatanAtasan || '',
          r.waktuInput || new Date().toLocaleString()
        ];
        sheet.appendRow(newRow);
      }

      return createJsonResponse({ status: 'success', message: 'Laporan berhasil disimpan ke Google Sheets' });
    }

    // 4. DELETE REPORT
    if (action === 'deleteReport') {
      const sheet = ss.getSheetByName(SHEET_LKH);
      const data = sheet.getDataRange().getValues();
      const targetId = String(payload.data.id);

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === targetId) {
          sheet.deleteRow(i + 1);
          return createJsonResponse({ status: 'success', message: 'Laporan berhasil dihapus' });
        }
      }
      return createJsonResponse({ status: 'error', message: 'ID Laporan tidak ditemukan' });
    }

    // 5. UPDATE STATUS REPORT
    if (action === 'updateStatus') {
      const sheet = ss.getSheetByName(SHEET_LKH);
      const data = sheet.getDataRange().getValues();
      const targetId = String(payload.data.id);
      const newStatus = payload.data.status;
      const catatan = payload.data.catatanAtasan || '';
      const verifikator = payload.data.diverifikasiOleh || '';

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === targetId) {
          sheet.getRange(i + 1, 6).setValue(newStatus);
          sheet.getRange(i + 1, 7).setValue(verifikator);
          sheet.getRange(i + 1, 10).setValue(catatan);
          return createJsonResponse({ status: 'success', message: 'Status berhasil diperbarui' });
        }
      }
      return createJsonResponse({ status: 'error', message: 'ID Laporan tidak ditemukan' });
    }

    return createJsonResponse({ status: 'error', message: 'Action tidak dikenali' });

  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
