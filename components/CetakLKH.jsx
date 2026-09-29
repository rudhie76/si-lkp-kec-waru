import React, { useState } from 'react';
import { Printer, Calendar, Search, Filter, Clock } from 'lucide-react';

export default function CetakLKH({ reports, pegawaiList, activeUser }) {
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedPegawai, setSelectedPegawai] = useState(activeUser?.id || '');

  const targetPegawai = pegawaiList.find(p => String(p.id) === String(selectedPegawai)) || activeUser;
  const [includePending, setIncludePending] = useState(false);

  // Normalize date function
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

  // Filter reports
  const allUserReportsInDate = reports.filter(r => {
    const rId = String(r.pegawaiId || '').replace(/\s+/g, '');
    const sId = String(selectedPegawai || '').replace(/\s+/g, '');
    const rNip = String(r.nip || '').replace(/\s+/g, '');
    const tNip = String(targetPegawai?.nip || '').replace(/\s+/g, '');

    const isSamePegawai = (rId === sId) || (rNip && tNip && rNip === tNip);
    
    // Exact date match
    const rTanggal = normalizeDate(r.tanggal);
    const targetDate = normalizeDate(filterDate);
    const isWithinDate = rTanggal === targetDate;
    
    return isSamePegawai && isWithinDate;
  });

  const filteredReports = allUserReportsInDate.filter(r => {
    const statusText = String(r.status || '').trim().toUpperCase();
    const isApproved = statusText === 'DIVALIDASI' || statusText === 'DISETUJUI';
    return includePending ? true : isApproved;
  }).sort((a, b) => new Date(normalizeDate(a.tanggal)) - new Date(normalizeDate(b.tanggal)));

  const pendingCount = allUserReportsInDate.length - filteredReports.length;
  const atasan = targetPegawai?.atasanValidasi 
    ? pegawaiList.find(p => targetPegawai.atasanValidasi.includes(p.name)) 
    : null;

  const getDurasi = (start, end) => {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff < 0) diff = 0;
    return Math.round((diff / 60) * 10) / 10;
  };

  const handlePrint = () => {
    window.print();
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
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${days[dateObj.getDay()]}, ${day} ${months[dateObj.getMonth()]} ${y}`;
  };

  const totalJamKerja = filteredReports.reduce((total, r) => {
    const keg = r.detailKegiatan?.[0] || {};
    return total + getDurasi(keg.jamMulai, keg.jamSelesai);
  }, 0);

  let penilaianAkhir = "";
  if (totalJamKerja > 0 && totalJamKerja < 3) penilaianAkhir = "Cukup";
  else if (totalJamKerja >= 3 && totalJamKerja < 6) penilaianAkhir = "Baik";
  else if (totalJamKerja >= 6 && totalJamKerja < 8) penilaianAkhir = "Memuaskan";
  else if (totalJamKerja >= 8) penilaianAkhir = "Sangat Memuaskan";

  return (
    <div className="space-y-6">
      {/* FILTER SECTION (HIDDEN ON PRINT) */}
      <div className="no-print bg-gradient-to-br from-olive-900 to-olive-950 border border-slate-300 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-3 border-b border-slate-200 pb-3">
          <div className="p-2 bg-red-800/20 text-red-800 rounded-xl">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Cetak Laporan Kinerja Harian</h2>
            <p className="text-xs text-slate-500">Pilih tanggal untuk mencetak LKH yang sudah divalidasi</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Tanggal</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-800 pointer-events-none" />
              <input 
                type="date" 
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="w-full bg-white border border-slate-200/60 rounded-xl pl-10 pr-3 py-2.5 text-slate-800 text-sm focus:ring-2 focus:ring-red-800 focus:outline-none cursor-pointer"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Pegawai (Admin/Atasan)</label>
            <select 
              value={selectedPegawai}
              onChange={e => setSelectedPegawai(e.target.value)}
              disabled={activeUser?.role === 'ASN / Staf'}
              className="w-full bg-white border border-slate-200/60 rounded-xl p-2.5 text-slate-800 text-sm disabled:opacity-50"
            >
              {activeUser?.role === 'ASN / Staf' ? (
                <option value={activeUser?.id}>{activeUser?.name}</option>
              ) : (
                pegawaiList.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-between items-center border-t border-slate-200 mt-2">
          
          <div className="flex flex-col">
            <label className="flex items-center space-x-2 text-slate-600 text-xs cursor-pointer hover:text-red-800 transition-colors">
              <input 
                type="checkbox" 
                checked={includePending}
                onChange={e => setIncludePending(e.target.checked)}
                className="rounded border-slate-200 text-red-800 focus:ring-red-800/30"
              />
              <span>Tampilkan juga laporan PENDING (Khusus Pratinjau)</span>
            </label>
            {!includePending && pendingCount > 0 && (
              <span className="text-amber-700 text-[10px] mt-1 font-bold animate-pulse">
                ⚠️ Ada {pendingCount} laporan Anda di tanggal ini yang masih berstatus PENDING (menunggu divalidasi).
              </span>
            )}
            {includePending && (
              <span className="text-red-800 text-[10px] mt-1 font-bold">
                Mencetak dengan status PENDING tidak direkomendasikan untuk dokumen resmi.
              </span>
            )}
          </div>

          <button 
            onClick={handlePrint}
            disabled={filteredReports.length === 0}
            className="px-6 py-2.5 bg-red-800 hover:bg-red-800 disabled:bg-slate-200 disabled:text-slate-500 text-white font-bold rounded-xl flex items-center space-x-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak PDF / Print</span>
          </button>
        </div>
      </div>

      {/* PRINTABLE AREA */}
      <div className="overflow-x-auto w-full pb-4">
        <div className="print-area bg-white text-black min-w-[750px] print:min-w-0 mx-auto p-8 rounded-xl shadow-lg min-h-[500px] relative" style={{ lineHeight: 1.05 }}>
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

        {/* JUDUL DOKUMEN & TANGGAL */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-bold uppercase underline">LAPORAN KINERJA HARIAN PEGAWAI (LKH)</h3>
          <p className="text-sm mt-1 font-semibold">
            Tanggal Kegiatan: {formatToCustomDate(filterDate)}
          </p>
        </div>

        {/* IDENTITAS PEGAWAI & ATASAN (2 KOLOM) */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-[13px]">
          {/* KOLOM KIRI */}
          <div>
            <h4 className="font-bold mb-2">PEGAWAI YANG DINILAI</h4>
            <table className="w-full text-left">
              <tbody>
                <tr>
                  <td className="py-1 w-28 align-top">Nama</td>
                  <td className="py-1 w-4 align-top">:</td>
                  <td className="py-1 align-top">{targetPegawai?.name}</td>
                </tr>
                <tr>
                  <td className="py-1 align-top">NIP</td>
                  <td className="py-1 align-top">:</td>
                  <td className="py-1 align-top">{targetPegawai?.nip}</td>
                </tr>
                <tr>
                  <td className="py-1 align-top">Pangkat / Gol</td>
                  <td className="py-1 align-top">:</td>
                  <td className="py-1 align-top">{targetPegawai?.pangkatGolongan || '...........................'}</td>
                </tr>
                <tr>
                  <td className="py-1 align-top">Jabatan</td>
                  <td className="py-1 align-top">:</td>
                  <td className="py-1 align-top">{targetPegawai?.jabatan}</td>
                </tr>
                <tr>
                  <td className="py-1 align-top">Unit Kerja</td>
                  <td className="py-1 align-top">:</td>
                  <td className="py-1 align-top">{targetPegawai?.unitKerja || 'Kecamatan Waru'}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* KOLOM KANAN */}
          <div>
            <h4 className="font-bold mb-2">PEJABAT PENILAI / ATASAN LANGSUNG</h4>
            <table className="w-full text-left">
              <tbody>
                <tr>
                  <td className="py-1 w-28 align-top">Nama</td>
                  <td className="py-1 w-4 align-top">:</td>
                  <td className="py-1 align-top">{atasan ? atasan.name : '...........................'}</td>
                </tr>
                <tr>
                  <td className="py-1 align-top">NIP</td>
                  <td className="py-1 align-top">:</td>
                  <td className="py-1 align-top">{atasan ? atasan.nip : '...........................'}</td>
                </tr>
                <tr>
                  <td className="py-1 align-top">Pangkat / Gol</td>
                  <td className="py-1 align-top">:</td>
                  <td className="py-1 align-top">{atasan?.pangkatGolongan || '...........................'}</td>
                </tr>
                <tr>
                  <td className="py-1 align-top">Jabatan</td>
                  <td className="py-1 align-top">:</td>
                  <td className="py-1 align-top">{atasan ? atasan.jabatan : '...........................'}</td>
                </tr>
                <tr>
                  <td className="py-1 align-top">Unit Kerja</td>
                  <td className="py-1 align-top">:</td>
                  <td className="py-1 align-top">{atasan?.unitKerja || 'Kecamatan Waru'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* TABEL LKH */}
        {filteredReports.length === 0 ? (
          <div className="text-center py-10 text-gray-500 font-bold border border-gray-300 rounded-lg">
            Tidak ada laporan yang divalidasi pada rentang tanggal ini.
          </div>
        ) : (
          <table className="w-full border-collapse border border-black text-sm mb-10">
            <thead>
              <tr className="bg-emerald-50 text-center">
                <th className="border border-black p-2 w-10">No</th>
                <th className="border border-black p-2 w-28">Waktu Pelaksanaan</th>
                <th className="border border-black p-2">Uraian / Deskripsi Kegiatan Kerja</th>
                <th className="border border-black p-2 w-20">Volume & Satuan</th>
                <th className="border border-black p-2 w-16">Durasi</th>
                <th className="border border-black p-2 w-28 min-w-[100px]">Foto / File Dukung</th>
                <th className="border border-black p-2 w-24">Verifikasi Atasan</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((r, index) => {
                const keg = r.detailKegiatan?.[0] || {};
                const durasi = getDurasi(keg.jamMulai, keg.jamSelesai);
                const status = String(r.status || 'PENDING');
                const isDisetujui = status.toUpperCase() === 'DIVALIDASI' || status.toUpperCase() === 'DISETUJUI';
                  
                  const extractNilai = (catatan) => {
                    if (!catatan) return null;
                    const match = catatan.match(/\[NILAI:\s*(.*?)\]/);
                    return match ? match[1] : null;
                  };
                  const nilai = extractNilai(r.catatanAtasan);
                
                return (
                  <tr key={r.id}>
                    <td className="border border-black p-2 text-center align-top">{index + 1}</td>
                    <td className="border border-black p-2 align-top">
                      <div className="flex flex-col space-y-1.5 justify-center h-full text-left">
                        <div className="flex items-center space-x-1.5 text-emerald-700 font-bold text-[11px] whitespace-nowrap">
                          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{formatToCustomDate(r.tanggal)}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-[11px] font-mono whitespace-nowrap">
                          <Clock className="w-3 h-3 text-amber-600 flex-shrink-0" />
                          <span className="text-gray-500">Durasi:</span>
                          <span className="text-black font-bold tracking-wide">{keg.jamMulai} - {keg.jamSelesai}</span>
                        </div>
                      </div>
                    </td>
                    <td className="border border-black p-2 align-top">
                      <div className="font-bold text-xs uppercase mb-1">[{keg.kategori || 'KEGIATAN'}]</div>
                      <div>{r.deskripsi}</div>
                    </td>
                    <td className="border border-black p-2 text-center align-top">
                      {keg.volume} {keg.satuan}
                    </td>
                    <td className="border border-black p-2 text-center align-top">
                      {durasi} Jam
                    </td>
                    <td className="border border-black p-2 text-center align-top">
                        <div className="flex justify-center gap-1">
                          {keg.fotoUrl && (
                            <img src={keg.fotoUrl} className="w-10 h-10 object-cover border border-gray-300 rounded-md" alt="Bukti 1" />
                          )}
                          {keg.fotoUrl2 && (
                            <img src={keg.fotoUrl2} className="w-10 h-10 object-cover border border-gray-300 rounded-md" alt="Bukti 2" />
                          )}
                        </div>
                      </td>
                    <td className="border border-black p-2 text-center align-top font-bold text-xs">
                        {isDisetujui ? (
                          <span className="flex items-center justify-center space-x-1"><span>&#10003;</span> <span>Disetujui</span></span>
                        ) : (
                          <span>{status}</span>
                        )}
                      </td>
                  </tr>
                );
              })}
              {/* ROW TOTAL JAM KERJA */}
              <tr className="bg-emerald-50 font-bold">
                <td colSpan={4} className="border border-black p-2 text-right">
                  Jumlah Jam Kerja Terakumulasi:
                </td>
                <td className="border border-black p-2 text-center">
                  {totalJamKerja} Jam
                </td>
                <td colSpan={2} className="border border-black p-2 text-center text-emerald-800 font-bold">{penilaianAkhir && `Penilaian: ${penilaianAkhir}`}</td>
              </tr>
            </tbody>
          </table>
        )}

        {/* TANDA TANGAN */}
        {filteredReports.length > 0 && (
          <div className="flex justify-between text-sm mt-12 px-8">
            {/* KIRI */}
            <div className="text-center w-72 flex flex-col justify-between" style={{ minHeight: '180px' }}>
              <div>
                <p className="mb-1">Mengetahui,</p>
                <p className="font-bold">PEJABAT PENILAI / ATASAN LANGSUNG</p>
                <p>{atasan ? atasan.jabatan : '...................................'}</p>
              </div>
              <div>
                <p className="font-bold underline">{atasan ? atasan.name : '...................................'}</p>
                <p>NIP. {atasan ? atasan.nip : '..........................'}</p>
              </div>
            </div>
            
            {/* KANAN */}
            <div className="text-center w-72 flex flex-col justify-between" style={{ minHeight: '180px' }}>
              <div>
                <p className="mb-1">Waru, {formatToCustomDate(new Date().toISOString().slice(0, 10))}</p>
                <p className="font-bold">PEGAWAI NEGERI SIPIL YANG DINILAI</p>
                <p>{targetPegawai?.jabatan}</p>
              </div>
              <div>
                <p className="font-bold underline">{targetPegawai?.name}</p>
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
            size: 215.9mm 330.2mm; /* F4 / Legal Portrait as default max */
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
