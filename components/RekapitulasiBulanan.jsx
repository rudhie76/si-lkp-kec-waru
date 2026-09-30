import React, { useState } from 'react';
import { Printer, Calendar, Clock, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function RekapitulasiBulanan({ reports = [], pegawaiList = [], activeUser = null }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 7));
  const [selectedPegawai, setSelectedPegawai] = useState(activeUser?.id || '');
  const [includePending, setIncludePending] = useState(false);

  const targetPegawai = pegawaiList.find(p => String(p.id) === String(selectedPegawai)) || activeUser;
  const MONTHLY_TARGET_HOURS = 165; // Target standar

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

  const getKeg = (r) => r.detailKegiatan?.[0] || {};

  const totalHours = approvedReports.reduce((sum, r) => sum + getDurasi(getKeg(r).jamMulai, getKeg(r).jamSelesai), 0);
  const progressPct = Math.min(100, Math.round((totalHours / MONTHLY_TARGET_HOURS) * 100));

  const getDailyRating = (durasi) => {
    if (durasi >= 8) return "Sangat Memuaskan";
    if (durasi >= 6) return "Memuaskan";
    if (durasi >= 3) return "Baik";
    if (durasi > 0) return "Cukup";
    return "Tidak Memuaskan";
  };

  const getFinalRating = (reports) => {
    if (reports.length === 0) return '-';

    // Group by Date first to get total hours per day
    const dailyHours = {};
    reports.forEach(r => {
      const date = String(r.tanggal);
      const keg = getKeg(r);
      const durasi = getDurasi(keg.jamMulai, keg.jamSelesai);
      if (!dailyHours[date]) dailyHours[date] = 0;
      dailyHours[date] += durasi;
    });

    const ratings = Object.values(dailyHours).map(totalJam => getDailyRating(totalJam));
    
    
    // Get the most frequent rating (mode)
    const counts = {};
    let maxCount = 0;
    let mode = ratings[0];
    for (const r of ratings) {
      counts[r] = (counts[r] || 0) + 1;
      if (counts[r] > maxCount) {
        maxCount = counts[r];
        mode = r;
      }
    }
    return mode;
  };
  const finalMonthRating = getFinalRating(approvedReports);

  const atasan = targetPegawai?.atasanValidasi 
    ? pegawaiList.find(p => targetPegawai.atasanValidasi.includes(p.name)) 
    : null;

  const groupedCategory = approvedReports.reduce((acc, r) => {
    const keg = getKeg(r);
    const kat = keg.kategori || 'Kegiatan Lainnya';
    if(!acc[kat]) acc[kat] = { count: 0, volumes: [], durasi: 0 };
    acc[kat].count += 1;
    
    const volStr = keg.volume ? `${keg.volume} ${keg.satuan || ''}`.trim() : '';
    if (volStr && !acc[kat].volumes.includes(volStr)) {
      acc[kat].volumes.push(volStr);
    }
    
    acc[kat].durasi += getDurasi(keg.jamMulai, keg.jamSelesai);
    return acc;
  }, {});

  const categoryList = Object.keys(groupedCategory).map(k => ({
    kategori: k,
    count: groupedCategory[k].count,
    volumes: groupedCategory[k].volumes.join(', ') || '-',
    durasi: groupedCategory[k].durasi
  }));

  const handlePrint = () => window.print();

  const formatMonthYear = (ym) => {
    if(!ym) return '';
    const [y, m] = ym.split('-');
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${months[parseInt(m, 10)-1]} ${y}`;
  };

  const formatTanggal = (tgl) => {
    if (!tgl) return '';
    const parts = tgl.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return tgl;
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
          <div className="flex items-center space-x-4 w-full lg:w-1/2">
            <div className="p-3 bg-slate-100 text-blue-600 rounded-xl border border-slate-200">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Rekapitulasi Bulanan Otomatis</h2>
              <p className="text-xs text-slate-500 mt-1">Hasil rekap total tugas, volume pekerjaan, dan verifikasi per bulan</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <select 
              value={selectedPegawai}
              onChange={e => setSelectedPegawai(e.target.value)}
              disabled={activeUser?.role === 'ASN / Staf'}
              className="w-full sm:w-56 bg-white border border-slate-200 border border-slate-200/60 rounded-xl p-2.5 text-slate-800 text-sm disabled:opacity-50 appearance-none focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              {activeUser?.role === 'ASN / Staf' ? (
                <option value={activeUser?.id}>{activeUser?.name}</option>
              ) : (
                pegawaiList.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))
              )}
            </select>
            <input 
              type="month" 
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              style={{ colorScheme: 'dark' }}
              className="w-full sm:w-48 bg-white border border-slate-200 border border-slate-200/60 rounded-xl p-2.5 text-slate-800 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
            />
            <button 
              onClick={handlePrint}
              disabled={approvedReports.length === 0}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400 text-slate-800 font-bold rounded-xl flex items-center justify-center space-x-2 transition-colors border border-slate-300 shadow-lg whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak PDF / Print</span>
            </button>
          </div>
        </div>

        {/* Pending Toggle & Helper */}
        <div className="pt-1 flex flex-col px-2">
          <label className="flex items-center space-x-2 text-slate-500 text-xs cursor-pointer hover:text-blue-600 transition-colors w-fit">
            <input 
              type="checkbox" 
              checked={includePending}
              onChange={e => setIncludePending(e.target.checked)}
              className="rounded border-slate-200 text-blue-600 focus:ring-blue-600/30"
            />
            <span>Tampilkan juga laporan PENDING (Khusus Pratinjau)</span>
          </label>
          {!includePending && pendingCount > 0 && (
            <span className="text-amber-700 text-[10px] mt-1 font-bold animate-pulse">
              ⚠️ Ada {pendingCount} laporan Anda di bulan ini yang masih berstatus PENDING (menunggu divalidasi).
            </span>
          )}
          {approvedReports.length === 0 && availableMonths.length > 0 && (
            <span className="text-blue-400 text-[11px] mt-2 font-bold">
              ℹ️ Info: Anda memiliki data tersimpan di bulan: {availableMonths.map(formatMonthYear).join(', ')}. Silakan ubah filter bulan di atas ke salah satu bulan tersebut.
            </span>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-700 rounded-xl border border-amber-100/50">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Tugas Bulan Ini</p>
              <p className="text-xl font-black text-gray-800">{approvedReports.length} Kegiatan</p>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-gray-100 text-gray-600 rounded-xl border border-gray-200/50">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Jam Kerja Aktual</p>
              <p className="text-xl font-black text-gray-800">{totalHours} Jam</p>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl border border-orange-100/50">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Menunggu Verifikasi</p>
              <p className="text-xl font-black text-gray-800">{pendingCount} Laporan</p>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="flex justify-between items-end mb-2">
              <p className="text-[11px] font-bold text-gray-700">Progres Target Bulanan</p>
              <p className="text-sm font-black text-gray-900">{progressPct}%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-slate-300 h-2.5 rounded-full" style={{ width: `${progressPct}%` }}></div>
            </div>
            <p className="text-[9px] text-gray-500 mt-2 font-medium">Target: {MONTHLY_TARGET_HOURS} jam (22 hari kerja)</p>
          </div>
        </div>
      </div>

      {/* PRINTABLE AREA */}
      <div className="overflow-x-auto w-full pb-4">
        <div className="print-area bg-white text-black min-w-[750px] print:min-w-0 mx-auto p-8 rounded-xl shadow-lg min-h-[500px] relative" style={{ lineHeight: 1.15 }}>
        
        {/* KOP SURAT */}
        <div className="border-b-[5px] border-double border-black pb-3 mb-4 flex items-center relative">
          <img src="/si-lkp-kec-waru/logo-ppu.png" alt="Logo PPU" className="absolute left-2 w-20 h-24 object-contain" />
          <div className="text-center w-full pl-24 pr-4">
            <h1 className="text-xl font-bold uppercase whitespace-nowrap tracking-tight">Pemerintah Kabupaten Penajam Paser Utara</h1>
            <h2 className="text-2xl font-extrabold uppercase tracking-wide">Kecamatan Waru</h2>
            <p className="text-[12px] mt-1 whitespace-nowrap tracking-tight">Alamat: Jalan Negara Km. 20, Kel. Waru Kec. Waru, Kab. Penajam Paser Utara, Kalimantan Timur, Kode Pos 78281</p>
            <p className="text-[12px] whitespace-nowrap tracking-tight">Email : kecwaruppu@gmail.com | Telp: (0542) 7215281</p>
          </div>
        </div>

        {/* JUDUL */}
        <div className="text-center mb-8">
          <h3 className="text-lg font-bold uppercase underline tracking-wide">REKAPITULASI LAPORAN KINERJA BULANAN PEGAWAI</h3>
          <p className="text-sm mt-1">
            Periode: {formatMonthYear(selectedMonth)}
          </p>
        </div>

        {/* IDENTITAS */}
        <div className="mb-8 text-[13px]">
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

        {/* BAGIAN I */}
        <div className="mb-10">
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
                <td className="border border-black p-2 text-center">{approvedReports.length} Kegiatan</td>
                <td className="border border-black p-2 text-center">{totalHours} Jam Kerja</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* BAGIAN II */}
        <div className="mb-8">
          <h4 className="font-bold text-[13px] mb-2 uppercase">II. Rincian Pelaksanaan Kegiatan Harian</h4>
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
              {approvedReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="border border-black p-4 text-center italic">
                    Belum ada laporan yang divalidasi.
                  </td>
                </tr>
              ) : (
                approvedReports.map((r, index) => {
                  const keg = getKeg(r);
                  const dStart = keg.jamMulai || '-';
                  const dEnd = keg.jamSelesai || '-';
                  const durasiAngka = getDurasi(dStart, dEnd);
                  
                  
                  const isDisetujui = String(r.status || '').trim().toUpperCase() === 'DIVALIDASI' || String(r.status || '').trim().toUpperCase() === 'DISETUJUI';
                  
                  return (
                    <tr key={r.id}>
                      <td className="border border-black p-2 text-center align-top font-bold text-xs">
                          {isDisetujui ? (
                            <span className="flex items-center justify-center space-x-1 font-bold text-xs">
                              <CheckCircle2 className="w-3 h-3 text-blue-600" />
                              <span>Disetujui</span>
                            </span>
                          ) : (
                            <span>{r.status}</span>
                          )}
                        </td>
                      <td className="border border-black p-2 align-top">
                        <div className="flex flex-col space-y-1.5 justify-center h-full text-left">
                          <div className="flex items-center space-x-1.5 font-bold text-blue-800 text-[11px] whitespace-nowrap">
                            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{formatToCustomDate(r.tanggal)}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-[11px] text-gray-700 font-mono whitespace-nowrap">
                            <Clock className="w-3 h-3 text-amber-600 flex-shrink-0" />
                            <span>Durasi: <strong className="text-black">{dStart} - {dEnd}</strong></span>
                          </div>
                        </div>
                      </td>
                      <td className="border border-black p-2 align-top">
                        {keg.kategori && <div className="font-bold text-xs uppercase mb-1">[{keg.kategori}]</div>}
                        <div className="whitespace-pre-wrap">{r.deskripsi}</div>
                      </td>
                      <td className="border border-black p-2 text-center align-top">
                        {keg.volume ? `${keg.volume} ${keg.satuan || ''}`.trim() : '-'}
                      </td>
                      <td className="border border-black p-2 text-center align-top">{durasiAngka} Jam</td>
                      <td className="border border-black p-2 text-center align-top">
                        <div className="flex justify-center gap-1">
                          {keg.fotoUrl && (
                            <a href={keg.fotoUrl} target="_blank" rel="noopener noreferrer"><img src={keg.fotoUrl} className="w-10 h-10 object-cover border border-gray-300 rounded-md" alt="Bukti 1" onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/%3E%3Cpolyline points='14 2 14 8 20 8'/%3E%3Cpath d='M16 13H8'/%3E%3Cpath d='M16 17H8'/%3E%3Cpath d='M10 9H8'/%3E%3C/svg%3E"; }} /></a>
                          )}
                          {keg.fotoUrl2 && (
                            <a href={keg.fotoUrl2} target="_blank" rel="noopener noreferrer"><img src={keg.fotoUrl2} className="w-10 h-10 object-cover border border-gray-300 rounded-md" alt="Bukti 2" onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/%3E%3Cpolyline points='14 2 14 8 20 8'/%3E%3Cpath d='M16 13H8'/%3E%3Cpath d='M16 17H8'/%3E%3Cpath d='M10 9H8'/%3E%3C/svg%3E"; }} /></a>
                          )}
                        </div>
                      </td>
                      <td className="border border-black p-2 text-center align-top">
                        <span className="flex items-center justify-center space-x-1 font-bold text-xs">
                          <CheckCircle2 className="w-3 h-3 text-blue-600" />
                          <span>Disetujui</span>
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
              {approvedReports.length > 0 && (
                <tr className="font-bold bg-blue-50">
                  <td colSpan={4} className="border border-black p-2 text-right">Jumlah Jam Kerja Terakumulasi:</td>
                  <td className="border border-black p-2 text-center">{totalHours} Jam</td>
                  <td colSpan={2} className="border border-black p-2 text-center text-[11px]">
                      Penilaian Akhir:<br/>
                      <span className="text-sm font-extrabold text-blue-800">{finalMonthRating}</span>
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* TANDA TANGAN */}
        {approvedReports.length > 0 && (
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
