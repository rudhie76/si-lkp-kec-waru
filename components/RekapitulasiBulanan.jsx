import { getDriveViewUrl, handleMediaClick } from '../lib/urlHelper';
import React, { useState } from 'react';
import { Printer, Calendar, Clock, FileText, CheckCircle2, AlertCircle, Target } from 'lucide-react';

export default function RekapitulasiBulanan({ 
  reports = [], 
  pegawaiList = [], 
  activeUser = null,
  skpTargets = []
}) {
  const [selectedMonth, setSelectedMonth] = useState(new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 7));
  const [selectedPegawai, setSelectedPegawai] = useState(activeUser?.id || '');
  const [selectedSkpId, setSelectedSkpId] = useState('ALL');
  const [includePending, setIncludePending] = useState(false);

  const targetPegawai = pegawaiList.find(p => String(p.id) === String(selectedPegawai)) || activeUser;
  const MONTHLY_TARGET_HOURS = 165; // Target standar

  // Filter Target SKP for this employee
  const mySkpTargets = (skpTargets || []).filter(s => 
    s && (s.pegawaiId === targetPegawai?.id || s.nip === targetPegawai?.nip)
  );
  const activeSkp = selectedSkpId !== 'ALL' ? mySkpTargets.find(s => s.id === selectedSkpId) : null;

  const normalizeDate = (d) => {
    if (!d) return '';
    try {
      let dateObj = new Date(d);
      const str = String(d).substring(0, 10);
      if (str.includes('/')) {
        const parts = str.split('/');
        if (parts.length === 3 && parts[2].length === 4) {
          dateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
      } else if (str.charAt(2) === '-' && str.charAt(5) === '-') {
        const parts = str.split('-');
        if (parts.length === 3 && parts[2].length === 4) {
          dateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
      }
      if (isNaN(dateObj.getTime())) return str;
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch(e) {
      return String(d).substring(0, 10);
    }
  };

  const allUserReports = reports.filter(r => {
    const rId = String(r.pegawaiId || '').replace(/\s+/g, '');
    const sId = String(selectedPegawai || '').replace(/\s+/g, '');
    const rNip = String(r.nip || '').replace(/\s+/g, '');
    const tNip = String(targetPegawai?.nip || '').replace(/\s+/g, '');
    return (rId === sId) || (rNip && tNip && rNip === tNip);
  });

  const availableMonths = [...new Set(allUserReports.map(r => normalizeDate(r.tanggal).substring(0,7)))].filter(Boolean);

  const allUserReportsInMonth = allUserReports.filter(r => {
    const rTanggal = normalizeDate(r.tanggal);
    return rTanggal.startsWith(selectedMonth);
  }).sort((a, b) => new Date(normalizeDate(a.tanggal)) - new Date(normalizeDate(b.tanggal)));

  const approvedReports = allUserReportsInMonth.filter(r => {
    const statusText = String(r.status || '').trim().toUpperCase();
    const isApproved = statusText === 'DIVALIDASI' || statusText === 'DISETUJUI';
    return includePending ? true : isApproved;
  });

  // Filter for specific SKP Target if selected
  const displayReports = approvedReports.filter(r => {
    if (selectedSkpId === 'ALL') return true;
    return (r.detailKegiatan || []).some(k => k.skpId === selectedSkpId);
  });

  const pendingCount = allUserReportsInMonth.filter(r => {
    const statusText = String(r.status || '').trim().toUpperCase();
    return statusText !== 'DIVALIDASI' && statusText !== 'DISETUJUI';
  }).length;

  const getDurasi = (start, end) => {
    if (!start || !end || start === '-' || end === '-') return 0;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff < 0) diff = 0;
    return Math.round((diff / 60) * 10) / 10;
  };

  const getKeg = (r) => {
    if (!r.detailKegiatan || r.detailKegiatan.length === 0) return {};
    if (selectedSkpId === 'ALL') return r.detailKegiatan[0];
    const match = r.detailKegiatan.find(k => k.skpId === selectedSkpId);
    return match || r.detailKegiatan[0];
  };

  const totalHours = displayReports.reduce((sum, r) => sum + getDurasi(getKeg(r).jamMulai, getKeg(r).jamSelesai), 0);
  const progressPct = Math.min(100, Math.round((totalHours / MONTHLY_TARGET_HOURS) * 100));

  // Calculate total volume for specific SKP
  const targetRealisasiVolume = displayReports.reduce((sum, r) => {
    const kegs = (r.detailKegiatan || []).filter(k => selectedSkpId === 'ALL' || k.skpId === selectedSkpId);
    return sum + kegs.reduce((kSum, k) => kSum + (Number(k.volume) || 1), 0);
  }, 0);

  // Group by category for Section I
  const categoriesMap = {};
  displayReports.forEach(r => {
    const keg = getKeg(r);
    const kat = keg.kategori || 'Pelayanan Publik';
    if (!categoriesMap[kat]) {
      categoriesMap[kat] = { count: 0, volumes: [] };
    }
    categoriesMap[kat].count += 1;
    if (keg.volume && keg.satuan) {
      categoriesMap[kat].volumes.push(`${keg.volume} ${keg.satuan}`);
    }
  });

  const categoryList = Object.keys(categoriesMap).map(k => ({
    kategori: k,
    count: categoriesMap[k].count,
    volumes: categoriesMap[k].volumes.join(', ') || '-'
  }));

  const atasan = targetPegawai?.atasanValidasi 
    ? pegawaiList.find(p => targetPegawai.atasanValidasi.includes(p.name)) 
    : null;

  const handlePrint = () => {
    window.print();
  };

  const formatMonthYear = (my) => {
    if (!my || !my.includes('-')) return my;
    const [y, m] = my.split('-');
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${months[parseInt(m, 10)-1]} ${y}`;
  };

  const formatToCustomDate = (tgl) => {
    const d = normalizeDate(tgl);
    if (!d || !d.includes('-')) return tgl;
    const [y, m, day] = d.split('-');
    const dateObj = new Date(y, parseInt(m, 10) - 1, day);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${day} ${months[dateObj.getMonth()]} ${y}`;
  };

  return (
    <div className="space-y-6">
      {/* FILTER & CARDS SECTION (HIDDEN ON PRINT) */}
      <div className="no-print space-y-4">
        
        {/* Header Bar */}
        <div className="bg-white border border-slate-300 rounded-3xl p-6 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4 w-full lg:w-1/3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Rekapitulasi & Cetak Bukti SKP</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cetak seluruh laporan bulanan atau pilih per Target SKP untuk bukti dukung E-Kinerja
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Pegawai Dropdown */}
            <select 
              value={selectedPegawai}
              onChange={e => {
                setSelectedPegawai(e.target.value);
                setSelectedSkpId('ALL');
              }}
              disabled={activeUser?.role === 'ASN / Staf'}
              className="w-full sm:w-48 bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs sm:text-sm disabled:opacity-50 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              {activeUser?.role === 'ASN / Staf' ? (
                <option value={activeUser?.id}>{activeUser?.name}</option>
              ) : (
                pegawaiList.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))
              )}
            </select>

            {/* Month Picker */}
            <input 
              type="month" 
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              style={{ colorScheme: 'dark' }}
              className="w-full sm:w-36 bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer font-medium"
            />

            {/* Filter Target SKP Dropdown */}
            <select 
              value={selectedSkpId}
              onChange={e => setSelectedSkpId(e.target.value)}
              className="w-full sm:w-64 bg-blue-50/70 border border-blue-200 text-blue-900 rounded-xl p-2.5 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
              title="Pilih Target SKP tertentu untuk mencetak bukti dukung khusus"
            >
              <option value="ALL">📋 Cetak Seluruh Laporan (Umum)</option>
              {mySkpTargets.map((skp, idx) => (
                <option key={skp.id || idx} value={skp.id}>
                  🎯 Target {idx + 1}: {skp.rencanaHasil.length > 30 ? skp.rencanaHasil.substring(0, 30) + '...' : skp.rencanaHasil}
                </option>
              ))}
            </select>

            {/* Print Button */}
            <button 
              onClick={handlePrint}
              disabled={displayReports.length === 0}
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-colors shadow-md shadow-blue-600/20 whitespace-nowrap text-xs sm:text-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak PDF</span>
            </button>
          </div>
        </div>

        {/* Pending Toggle & Helper */}
        <div className="pt-1 flex flex-col px-2">
          <label className="flex items-center space-x-2 text-slate-600 text-xs cursor-pointer hover:text-blue-600 transition-colors w-fit font-medium">
            <input 
              type="checkbox" 
              checked={includePending}
              onChange={e => setIncludePending(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-600/30"
            />
            <span>Tampilkan juga laporan PENDING (Khusus Pratinjau)</span>
          </label>
          {!includePending && pendingCount > 0 && (
            <span className="text-amber-700 text-[11px] mt-1 font-bold">
              ⚠️ Ada {pendingCount} laporan Anda di bulan ini yang masih berstatus PENDING (menunggu divalidasi).
            </span>
          )}
          {activeSkp && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
              <Target className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Mode Cetak Bukti SKP Aktif:</strong> Laporan yang tampil hanya kegiatan yang dikaitkan dengan target: <span className="font-semibold underline">{activeSkp.rencanaHasil}</span>. Total tercapai pada bulan ini: <strong>{targetRealisasiVolume} {activeSkp.satuan}</strong> ({displayReports.length} laporan).
              </div>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                {activeSkp ? 'Realisasi Target' : 'Total Kegiatan Bulan Ini'}
              </p>
              <p className="text-xl font-black text-gray-800">
                {activeSkp ? `${targetRealisasiVolume} ${activeSkp.satuan}` : `${displayReports.length} Kegiatan`}
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Jam Kegiatan</p>
              <p className="text-xl font-black text-gray-800">{totalHours} Jam</p>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl border border-orange-100">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Menunggu Validasi</p>
              <p className="text-xl font-black text-gray-800">{pendingCount} Laporan</p>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col justify-center">
            {activeSkp ? (
              <div>
                <div className="flex justify-between items-end mb-1">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Capaian Target SKP</p>
                  <p className="text-xs font-black text-blue-700">
                    {Math.min(100, Math.round((targetRealisasiVolume / (Number(activeSkp.targetTahun) || 1)) * 100))}%
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, Math.round((targetRealisasiVolume / (Number(activeSkp.targetTahun) || 1)) * 100))}%` }}
                  />
                </div>
                <p className="text-[9px] text-gray-500 mt-1.5 font-medium">Target: {activeSkp.targetTahun} {activeSkp.satuan}</p>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-end mb-1">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Target Jam Bulanan</p>
                  <p className="text-xs font-black text-gray-900">{progressPct}%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progressPct}%` }}></div>
                </div>
                <p className="text-[9px] text-gray-500 mt-1.5 font-medium">Target: {MONTHLY_TARGET_HOURS} jam / bulan</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PRINTABLE AREA */}
      <div className="overflow-x-auto w-full pb-4">
        <div className="print-area bg-white text-black min-w-[750px] print:min-w-0 mx-auto p-8 rounded-xl shadow-lg min-h-[500px] relative" style={{ lineHeight: 1.15 }}>
        
        {/* KOP SURAT RESMI */}
        <div className="border-b-[5px] border-double border-black pb-3 mb-4 flex items-center relative">
          <img src="/si-lkp-kec-waru/logo-ppu.png" alt="Logo PPU" className="absolute left-2 w-20 h-24 object-contain" />
          <div className="text-center w-full pl-24 pr-4">
            <h1 className="text-xl font-bold uppercase whitespace-nowrap tracking-tight">Pemerintah Kabupaten Penajam Paser Utara</h1>
            <h2 className="text-2xl font-extrabold uppercase tracking-wide">Kecamatan Waru</h2>
            <p className="text-[12px] mt-1 whitespace-nowrap tracking-tight">Alamat: Jalan Negara Km. 20, Kel. Waru Kec. Waru, Kab. Penajam Paser Utara, Kalimantan Timur, Kode Pos 78281</p>
            <p className="text-[12px] whitespace-nowrap tracking-tight">Email : kecwaruppu@gmail.com | Telp: (0542) 7215281</p>
          </div>
        </div>

        {/* JUDUL LAPORAN */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-bold uppercase underline tracking-wide">
            {activeSkp 
              ? 'LAPORAN REALISASI BUKTI DUKUNG SASARAN KINERJA PEGAWAI (SKP)' 
              : 'REKAPITULASI LAPORAN KINERJA BULANAN PEGAWAI'
            }
          </h3>
          <p className="text-sm mt-1">
            Periode Evaluasi: {formatMonthYear(selectedMonth)}
          </p>
        </div>

        {/* IDENTITAS PEGAWAI */}
        <div className="mb-6 text-[13px]">
          <table className="w-full sm:w-2/3 text-left">
            <tbody>
              <tr>
                <td className="py-1 w-32">Nama Pegawai</td>
                <td className="py-1 w-4">:</td>
                <td className="py-1 font-bold">{targetPegawai?.name}</td>
              </tr>
              <tr>
                <td className="py-1">NIP</td>
                <td className="py-1">:</td>
                <td className="py-1">{targetPegawai?.nip}</td>
              </tr>
              <tr>
                <td className="py-1">Jabatan</td>
                <td className="py-1">:</td>
                <td className="py-1">{targetPegawai?.jabatan}</td>
              </tr>
              <tr>
                <td className="py-1">Unit Kerja</td>
                <td className="py-1">:</td>
                <td className="py-1">{targetPegawai?.unitKerja || 'Kecamatan Waru'}</td>
              </tr>
              <tr>
                <td className="py-1">Bulan Evaluasi</td>
                <td className="py-1">:</td>
                <td className="py-1 font-bold">{formatMonthYear(selectedMonth)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* PARAMETER TARGET SKP (JIKA MEMILIH TARGET TERTENTU) */}
        {activeSkp && (
          <div className="mb-6 p-4 border-2 border-black rounded-lg bg-slate-50/30 text-[12px]">
            <div className="font-bold text-[11px] uppercase tracking-wider text-black mb-2 border-b border-black pb-1">
              Parameter Sasaran Kinerja Pegawai yang Dinilai (E-Kinerja BKN):
            </div>
            <table className="w-full text-left">
              <tbody>
                <tr>
                  <td className="font-bold py-1 w-48 align-top">Rencana Hasil Kerja (RHK)</td>
                  <td className="py-1 w-4 align-top">:</td>
                  <td className="py-1 font-extrabold text-blue-900">{activeSkp.rencanaHasil}</td>
                </tr>
                {activeSkp.indikator && (
                  <tr>
                    <td className="font-bold py-1 align-top">Indikator Kinerja Individu</td>
                    <td className="py-1 align-top">:</td>
                    <td className="py-1 text-slate-800">{activeSkp.indikator}</td>
                  </tr>
                )}
                <tr>
                  <td className="font-bold py-1 align-top">Target Kinerja Tahunan</td>
                  <td className="py-1 align-top">:</td>
                  <td className="py-1 font-bold text-black">{activeSkp.targetTahun} {activeSkp.satuan} ({activeSkp.waktuBulan} Bulan)</td>
                </tr>
                <tr>
                  <td className="font-bold py-1 align-top">Realisasi Bulan Ini</td>
                  <td className="py-1 align-top">:</td>
                  <td className="py-1 font-extrabold text-emerald-800">
                    {targetRealisasiVolume} {activeSkp.satuan} ({displayReports.length} Kali Kegiatan Dilaporkan)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* BAGIAN I: RINGKASAN KATEGORI (HANYA DITAMPILKAN JIKA CETAK SELURUH LAPORAN) */}
        {!activeSkp && (
          <div className="mb-8">
            <h4 className="font-bold text-[13px] mb-2 uppercase">I. Ringkasan Kinerja Berdasarkan Kategori Tugas</h4>
            <table className="w-full border-collapse border border-black text-[13px]">
              <thead>
                <tr className="bg-blue-50">
                  <th className="border border-black p-2 w-12 text-center">No</th>
                  <th className="border border-black p-2 text-left">Kategori Kegiatan</th>
                  <th className="border border-black p-2 w-32 text-center">Jumlah Kegiatan</th>
                  <th className="border border-black p-2 w-64 text-center">Total Volume Kerja</th>
                </tr>
              </thead>
              <tbody>
                {categoryList.length === 0 ? (
                  <tr><td colSpan={4} className="border border-black p-4 text-center italic">Tidak ada data terverifikasi.</td></tr>
                ) : (
                  categoryList.map((kat, idx) => (
                    <tr key={idx}>
                      <td className="border border-black p-2 text-center">{idx + 1}</td>
                      <td className="border border-black p-2">{kat.kategori}</td>
                      <td className="border border-black p-2 text-center">{kat.count} Kali</td>
                      <td className="border border-black p-2 text-center">{kat.volumes}</td>
                    </tr>
                  ))
                )}
                <tr className="font-bold bg-gray-50">
                  <td colSpan={2} className="border border-black p-2 text-right">Total Akumulasi Bulanan:</td>
                  <td className="border border-black p-2 text-center">{displayReports.length} Kegiatan</td>
                  <td className="border border-black p-2 text-center">{totalHours} Jam Kerja</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* BAGIAN II: RINCIAN PELAKSANAAN KEGIATAN */}
        <div className="mb-8">
          <h4 className="font-bold text-[13px] mb-2 uppercase">
            {activeSkp ? 'Rincian Pelaksanaan Tugas Bukti Dukung Target SKP' : 'II. Rincian Pelaksanaan Kegiatan Harian'}
          </h4>
          <table className="w-full border-collapse border border-black text-[12px]">
            <thead>
              <tr className="bg-blue-50 text-center">
                <th className="border border-black p-2 w-8">No</th>
                <th className="border border-black p-2 w-40">Waktu Pelaksanaan</th>
                <th className="border border-black p-2">Uraian / Deskripsi Kegiatan Kerja</th>
                <th className="border border-black p-2 w-20">Volume & Satuan</th>
                <th className="border border-black p-2 w-16">Durasi</th>
                <th className="border border-black p-2 w-28 min-w-[100px]">Foto / File Dukung</th>
                <th className="border border-black p-2 w-24 min-w-[90px]">Verifikasi Atasan</th>
              </tr>
            </thead>
            <tbody className="align-top">
              {displayReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="border border-black p-4 text-center italic">
                    {activeSkp 
                      ? 'Belum ada kegiatan yang terhubung dengan target SKP ini pada bulan yang dipilih.'
                      : 'Belum ada laporan yang divalidasi pada bulan ini.'
                    }
                  </td>
                </tr>
              ) : (
                displayReports.map((r, index) => {
                  const keg = getKeg(r);
                  const dStart = keg.jamMulai || '-';
                  const dEnd = keg.jamSelesai || '-';
                  const durasiAngka = getDurasi(dStart, dEnd);
                  const isDisetujui = String(r.status || '').trim().toUpperCase() === 'DIVALIDASI' || String(r.status || '').trim().toUpperCase() === 'DISETUJUI';
                  
                  return (
                    <tr key={r.id}>
                      <td className="border border-black p-2 text-center align-top font-bold text-xs">
                        {index + 1}
                      </td>
                      <td className="border border-black p-2 align-top">
                        <div className="flex flex-col space-y-1 justify-center h-full text-left">
                          <div className="flex items-center space-x-1.5 font-bold text-blue-900 text-[11px] whitespace-nowrap">
                            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{formatToCustomDate(r.tanggal)}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-[11px] text-gray-700 font-mono whitespace-nowrap">
                            <Clock className="w-3 h-3 text-amber-700 flex-shrink-0" />
                            <span>Durasi: <strong className="text-black">{dStart} - {dEnd}</strong></span>
                          </div>
                        </div>
                      </td>
                      <td className="border border-black p-2 align-top">
                        {keg.kategori && <div className="font-bold text-xs uppercase mb-1">[{keg.kategori}]</div>}
                        <div className="whitespace-pre-wrap">{keg.deskripsi || r.deskripsi}</div>
                      </td>
                      <td className="border border-black p-2 text-center align-top font-bold">
                        {keg.volume ? `${keg.volume} ${keg.satuan || ''}`.trim() : '-'}
                      </td>
                      <td className="border border-black p-2 text-center align-top">{durasiAngka} Jam</td>
                      <td className="border border-black p-2 text-center align-top">
                        <div className="flex justify-center gap-1">
                          {keg.fotoUrl && (
                            <a href={getDriveViewUrl(keg.fotoUrl)} onClick={(e) => handleMediaClick(e, keg.fotoUrl)} target="_blank" rel="noopener noreferrer">
                              <img src={keg.fotoUrl} className="w-10 h-10 object-cover border border-gray-300 rounded-md" alt="Bukti 1" onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/%3E%3Cpolyline points='14 2 14 8 20 8'/%3E%3Cpath d='M16 13H8'/%3E%3Cpath d='M16 17H8'/%3E%3Cpath d='M10 9H8'/%3E%3C/svg%3E"; }} />
                            </a>
                          )}
                          {keg.fotoUrl2 && (
                            <a href={getDriveViewUrl(keg.fotoUrl2)} onClick={(e) => handleMediaClick(e, keg.fotoUrl2)} target="_blank" rel="noopener noreferrer">
                              <img src={keg.fotoUrl2} className="w-10 h-10 object-cover border border-gray-300 rounded-md" alt="Bukti 2" onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/%3E%3Cpolyline points='14 2 14 8 20 8'/%3E%3Cpath d='M16 13H8'/%3E%3Cpath d='M16 17H8'/%3E%3Cpath d='M10 9H8'/%3E%3C/svg%3E"; }} />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="border border-black p-2 text-center align-top">
                        {isDisetujui ? (
                          <span className="flex items-center justify-center space-x-1 font-bold text-xs text-blue-900">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                            <span>Divalidasi</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase text-amber-700">{r.status}</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* TANDA TANGAN */}
        {displayReports.length > 0 && (
          <div className="flex justify-between text-[13px] mt-12 px-8">
            <div className="text-center w-72 flex flex-col justify-between" style={{ minHeight: '180px' }}>
              <div>
                <p className="mb-1">Mengesahkan,</p>
                <p className="font-bold uppercase">PEJABAT PENILAI / ATASAN LANGSUNG</p>
                <p className="mt-0.5">{atasan ? atasan.jabatan : 'Atasan'}</p>
              </div>
              <div>
                <p className="font-bold underline uppercase">{atasan ? atasan.name : '...................................'}</p>
                <p>NIP. {atasan ? atasan.nip : '..........................'}</p>
              </div>
            </div>
            
            <div className="text-center w-72 flex flex-col justify-between" style={{ minHeight: '180px' }}>
              <div>
                <p className="mb-1">Waru, {formatToCustomDate(new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10))}</p>
                <p className="font-bold uppercase">PEGAWAI NEGERI SIPIL YANG DINILAI</p>
                <p className="mt-0.5">{targetPegawai?.jabatan}</p>
              </div>
              <div>
                <p className="font-bold underline uppercase">{targetPegawai?.name}</p>
                <p>NIP. {targetPegawai?.nip}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: 215.9mm 330.2mm;
            margin: 0.2cm 1cm 1cm 1cm;
          }
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
