'use client';

import { useState } from 'react';
import { 
  FileText, CheckCircle2, Clock, Hourglass, Search, Filter, 
  Eye, Check, X, ShieldAlert, ArrowRight, BookOpen, Layers,
  Calendar, UserCheck, ExternalLink, MessageSquare, ShieldCheck, User, TrendingUp, PieChart, Award, Edit3, Trash2
} from 'lucide-react';


// Fallback for missing durasiJam
const getDurasiFallback = (item) => {
  if (item.durasiJam) return parseFloat(item.durasiJam) || 0;
  if (item.detailKegiatan && item.detailKegiatan.length > 0) {
    const keg = item.detailKegiatan[0];
    if (!keg.jamMulai || !keg.jamSelesai) return 0;
    const [h1, m1] = keg.jamMulai.split(':').map(Number);
    const [h2, m2] = keg.jamSelesai.split(':').map(Number);
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    return Math.max(0, Math.round((diff / 60) * 10) / 10);
  }
  return 0;
};
export default function DashboardView({ 
  reports = [], 
  onUpdateStatus, 
  onNavigateToInput, 
  onNavigateToVerify,
  currentUser = null,
  users = [],
  onDeleteReport,
  onSaveReport
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterKategori, setFilterKategori] = useState('ALL');
  const [selectedReport, setSelectedReport] = useState(null);
  const [editingReport, setEditingReport] = useState(null);

  // Default User Fallback
  const activeUser = currentUser || {
    id: '199812122011012001',
    name: 'Andi Hasmainti, S.IP.',
    nip: '19981212 201101 2 001',
    jabatan: 'Pengelola Pelayanan Publik',
    pangkatGolongan: 'Penata Muda / IIIa',
    role: 'ASN / Staf',
    fotoProfil: ''
  };

  const checkIsCamat = (user) => {
    if (!user) return false;
    const peran = (user.peranStruktur || '').toLowerCase();
    const jab = (user.jabatan || '').toLowerCase();
    if (peran.includes('sekretaris') || peran.includes('sekcam') || jab.includes('sekretaris') || jab.includes('sekcam')) return false;
    return /\bcamat\b/i.test(peran) || /\bcamat\b/i.test(jab);
  };
  const isCamat = checkIsCamat(activeUser);

  // Find Validating Superior (Atasan Penilai)
  const foundAtasan = users.find(u => {
    if (activeUser.atasanValidasi) {
      return activeUser.atasanValidasi.includes(u.name);
    }
    const role = String(u.role || '').toLowerCase();
    const jabatan = String(u.jabatan || '').toLowerCase();
    return (role.includes('atasan') || jabatan.includes('camat') || jabatan.includes('sekcam') || jabatan.includes('kasi')) && String(u.id) !== String(activeUser.id);
  });

  const validatingSuperior = isCamat ? null : (foundAtasan || {
    name: 'Belum Memilih Atasan',
    nip: '-',
    jabatan: 'Silakan Edit Profil',
    pangkatGolongan: '-',
    fotoProfil: ''
  });

  // Statistics calculation
  const totalReports = reports.length;
  const approvedReports = reports.filter(r => r.status === 'DIVALIDASI' || r.status === 'Disetujui').length;
  const pendingReports = reports.filter(r => r.status === 'PENDING' || r.status === 'Menunggu Verifikasi').length;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const validReports = reports.filter(r => r.status === 'DIVALIDASI' || r.status === 'PENDING' || r.status === 'Disetujui' || r.status === 'Menunggu Verifikasi');
  
  const totalDuration = validReports.reduce((acc, curr) => acc + getDurasiFallback(curr), 0);
  
  const totalDurationThisMonth = validReports.reduce((acc, curr) => {
    if (!curr.tanggal) return acc;
    const d = new Date(curr.tanggal);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      return acc + getDurasiFallback(curr);
    }
    return acc;
  }, 0);

  const totalDurationThisYear = validReports.reduce((acc, curr) => {
    if (!curr.tanggal) return acc;
    const d = new Date(curr.tanggal);
    if (d.getFullYear() === currentYear) {
      return acc + getDurasiFallback(curr);
    }
    return acc;
  }, 0);


  // Filtered reports for recent activity table
  const filteredReports = reports.filter(item => {
    const matchesSearch = 
      (item.namaPegawai && item.namaPegawai.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.nip && item.nip.includes(searchTerm)) ||
      (item.deskripsi && item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    const matchesKategori = filterKategori === 'ALL' || (item.kategori && item.kategori === filterKategori);

    return matchesSearch && matchesStatus && matchesKategori;
  });

  // Short & Clean Date Formatting Helper: [Hari], [dd]/[MMM]/[yyyy]
  const formatShortDate = (dateStr) => {
    if (!dateStr) return 'Hari Ini';
    try {
      // Clean raw GMT date strings if present
      let cleanStr = String(dateStr);
      if (cleanStr.includes('GMT') || cleanStr.includes('Waktu')) {
        const d = new Date(cleanStr);
        if (!isNaN(d.getTime())) {
          const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
          const dayName = days[d.getDay()];
          const dd = String(d.getDate()).padStart(2, '0');
          const mmm = months[d.getMonth()];
          const yyyy = d.getFullYear();
          return `${dayName}, ${dd}/${mmm}/${yyyy}`;
        }
      }

      const parts = cleanStr.split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const dateObj = new Date(year, monthIndex, day);
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        
        const dayName = days[dateObj.getDay()] || 'Hari';
        const dd = String(day).padStart(2, '0');
        const mmm = months[monthIndex] || parts[1];
        return `${dayName}, ${dd}/${mmm}/${year}`;
      }
      return cleanStr;
    } catch (e) {
      return dateStr;
    }
  };

  // Duration Time Helper: 00:00 - 00:00
  const formatDurationTime = (item) => {
    if (item.detailKegiatan && Array.isArray(item.detailKegiatan) && item.detailKegiatan.length > 0) {
      const start = item.detailKegiatan[0].jamMulai || '08:00';
      const end = item.detailKegiatan[item.detailKegiatan.length - 1].jamSelesai || '10:00';
      return `${start} - ${end}`;
    }
    const start = item.jamMulai || '08:00';
    const end = item.jamSelesai || '16:00';
    return `${start} - ${end}`;
  };

  // Handle Delete Report Action
  const handleDelete = (reportId) => {
    if (confirm('Apakah Anda yakin ingin menghapus laporan kegiatan ini?')) {
      if (onDeleteReport) {
        onDeleteReport(reportId);
      }
    }
  };

  // Handle Save Edited Report Action
  const handleSaveEditSubmit = (e) => {
    e.preventDefault();
    if (!editingReport) return;

    // Update detailKegiatan based on the top-level modifications made in the modal
    const updatedDetail = editingReport.detailKegiatan && editingReport.detailKegiatan.length > 0
      ? [...editingReport.detailKegiatan]
      : [{}];

    updatedDetail[0] = {
      ...updatedDetail[0],
      jamMulai: editingReport.jamMulai || updatedDetail[0].jamMulai,
      jamSelesai: editingReport.jamSelesai || updatedDetail[0].jamSelesai,
      deskripsi: editingReport.deskripsi || updatedDetail[0].deskripsi,
      statusHasil: editingReport.statusHasil || updatedDetail[0].statusHasil || 'Selesai'
    };

    const finalReport = {
      ...editingReport,
      detailKegiatan: updatedDetail,
      durasiJam: (parseFloat(editingReport.jamSelesai) - parseFloat(editingReport.jamMulai)) || editingReport.durasiJam
    };

    if (onSaveReport) {
      onSaveReport(finalReport);
    }
    setEditingReport(null);
    alert('Laporan berhasil diperbarui!');
  };

  // 7 Active Days Accumulated Work Duration Calculation
  const getLast7DaysData = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const isoDate = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
      const dayNum = d.getDate();
      
      const dayReports = reports.filter(r => r.tanggal === isoDate && (r.status === 'DIVALIDASI' || r.status === 'PENDING' || r.status === 'Disetujui'));
      const hours = dayReports.reduce((sum, r) => sum + (getDurasiFallback(r)), 0);

      dates.push({
        isoDate,
        label: `${dayName} ${dayNum}`,
        hours: parseFloat(hours.toFixed(1)),
        pct: Math.min(100, Math.round((hours / 8) * 100))
      });
    }
    return dates;
  };

  const last7Days = getLast7DaysData();

  // Category Distribution Calculation
  const categoriesList = [
    { cat: 'Pelayanan Publik', color: 'bg-emerald-400', textColor: 'text-emerald-400' },
    { cat: 'Administrasi', color: 'bg-cyan-400', textColor: 'text-cyan-400' },
    { cat: 'Rapat & Koordinasi', color: 'bg-gold-400', textColor: 'text-gold-400' },
    { cat: 'Monitoring Lapangan', color: 'bg-amber-400', textColor: 'text-amber-400' },
    { cat: 'Tugas Kedinasan Lainnya', color: 'bg-rose-400', textColor: 'text-rose-400' },
  ];

  const categoryDistribution = categoriesList.map(item => {
    const catReports = reports.filter(r => {
      if (r.detailKegiatan && Array.isArray(r.detailKegiatan)) {
        return r.detailKegiatan.some(k => k.kategori === item.cat);
      }
      return r.kategori === item.cat;
    });

    const count = catReports.length;
    const pct = totalReports > 0 ? Math.round((count / totalReports) * 100) : 0;
    return { ...item, count, pct };
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* 4 TOP SUMMARY CARDS WITH VIBRANT COLORS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Laporan */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-olive-900 to-zinc-950 border border-emerald-500/40 rounded-2xl p-5 shadow-xl group hover:border-emerald-400 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Total Laporan LKH</p>
              <h3 className="text-3xl font-extrabold text-white mt-1 group-hover:text-emerald-300 transition-colors">{totalReports}</h3>
              <p className="text-xs text-zinc-300 mt-1">Seluruh kegiatan terdata</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform shadow-inner">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 2: Divalidasi Atasan */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-olive-900 to-zinc-950 border border-emerald-500/40 rounded-2xl p-5 shadow-xl group hover:border-emerald-400 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Divalidasi Atasan</p>
              <h3 className="text-3xl font-extrabold text-emerald-300 mt-1">{approvedReports}</h3>
              <p className="text-xs text-zinc-300 mt-1">{((approvedReports / (totalReports || 1)) * 100).toFixed(0)}% dari total laporan</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/25 border border-emerald-400/60 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform shadow-inner">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 3: Verifikasi PENDING */}
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-950/90 via-olive-900 to-zinc-950 border border-amber-500/50 rounded-2xl p-5 shadow-xl group hover:border-amber-400 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Verifikasi PENDING</p>
              <h3 className="text-3xl font-extrabold text-amber-300 mt-1">{pendingReports}</h3>
              <p className="text-xs text-zinc-300 mt-1">Membutuhkan aksi atasan</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform shadow-inner">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-amber-500/20 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 4: Durasi Jam Kerja */}
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-950/90 via-olive-900 to-zinc-950 border border-gold-500/50 rounded-2xl p-5 shadow-xl group hover:border-gold-400 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-gold-400 uppercase tracking-wider">Durasi Jam Kerja</p>
              <h3 className="text-3xl font-extrabold text-gold-300 mt-1">{totalDuration.toFixed(1)} <span className="text-sm font-semibold text-white">Jam</span></h3>
              <div className="flex flex-col gap-1 mt-2 border-t border-gold-800/30 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Bulan Ini:</span>
                  <span className="text-gold-200 font-bold">{totalDurationThisMonth.toFixed(1)} Jam</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Tahun Ini:</span>
                  <span className="text-gold-200 font-bold">{totalDurationThisYear.toFixed(1)} Jam</span>
                </div>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gold-500/20 border border-gold-400/50 flex items-center justify-center text-gold-300 group-hover:scale-110 transition-transform shadow-inner">
              <Hourglass className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-gold-500/20 rounded-full blur-xl pointer-events-none" />
        </div>

      </div>

      {/* PROFIL FOTO DIRI PEGAWAI & ATASAN VALIDASI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CARD 1: FOTO DIRI PEGAWAI LOGGED IN */}
        <div className="bg-gradient-to-br from-olive-900 via-olive-950 to-zinc-950 border border-emerald-500/40 rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between border-b border-olive-800/80 pb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center space-x-2">
              <User className="w-4 h-4 text-emerald-400" />
              <span>Profil Pengisi LKH (ASN Logged In)</span>
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold">
              AKUN AKTIF
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 text-xs">
            <div className="w-24 h-28 rounded-2xl overflow-hidden border-2 border-emerald-400 bg-zinc-900 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-950/60 relative">
              {activeUser.fotoProfil ? (
                <img src={activeUser.fotoProfil} alt="Foto Diri" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-emerald-400" />
              )}
              <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-zinc-950 rounded-full" />
            </div>

            <div className="space-y-1.5 text-center sm:text-left flex-1">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase block font-semibold">Nama Lengkap:</span>
                <span className="text-sm font-extrabold text-white">{activeUser.name}</span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 uppercase block font-semibold">Jabatan:</span>
                <span className="text-xs font-bold text-emerald-300">{activeUser.jabatan || 'ASN Pelaksana'}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-olive-800/60">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase block font-semibold">NIP:</span>
                  <span className="font-mono text-zinc-200 font-bold">{activeUser.nip}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase block font-semibold">Pangkat / Golongan:</span>
                  <span className="font-semibold text-gold-400">{activeUser.pangkatGolongan || 'Penata Muda / IIIa'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: FOTO DIRI ATASAN VALIDASI PENILAI */}
        {validatingSuperior ? (
          <div className="bg-gradient-to-br from-olive-900 via-olive-950 to-zinc-950 border border-amber-500/40 rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between border-b border-olive-800/80 pb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Profil Atasan Penilai (Memvalidasi)</span>
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold">
                VERIFIKATOR LANGSUNG
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 text-xs">
              <div className="w-24 h-28 rounded-2xl overflow-hidden border-2 border-amber-400 bg-zinc-900 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-950/60 relative">
                {validatingSuperior.fotoProfil ? (
                  <img src={validatingSuperior.fotoProfil} alt="Foto Atasan" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-amber-400" />
                )}
                <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-amber-500 border-2 border-zinc-950 rounded-full" />
              </div>

              <div className="space-y-1.5 text-center sm:text-left flex-1">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase block font-semibold">Nama Lengkap Atasan:</span>
                  <span className="text-sm font-extrabold text-white">{validatingSuperior.name}</span>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-400 uppercase block font-semibold">Jabatan Atasan:</span>
                  <span className="text-xs font-bold text-amber-300">{validatingSuperior.jabatan}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-olive-800/60">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase block font-semibold">NIP Atasan:</span>
                    <span className="font-mono text-zinc-200 font-bold">{validatingSuperior.nip}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase block font-semibold">Pangkat / Golongan:</span>
                    <span className="font-semibold text-gold-400">{validatingSuperior.pangkatGolongan || 'Pembina / IVa'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-olive-900 via-olive-950 to-zinc-950 border border-olive-800/60 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col items-center justify-center text-center opacity-80">
            <div className="w-20 h-20 bg-olive-800/30 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-2">Atasan Tertinggi</h3>
            <p className="text-xs text-zinc-400 font-medium px-4">
              Akun Anda berstatus sebagai Atasan Tertinggi (Camat/Sederajat). Setiap laporan LKH Anda akan tervalidasi secara otomatis oleh sistem.
            </p>
          </div>
        )}

      </div>

      {/* CHARTS ROW (TREN DURASI JAM KERJA HARIAN & DISTRIBUSI KATEGORI KEGIATAN SIDE-BY-SIDE) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* WIDGET KIRI: TREN DURASI JAM KERJA HARIAN (7 HARI AKTIF TERAKHIR) */}
        <div className="bg-gradient-to-b from-olive-900 to-olive-950 border border-olive-700/50 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-olive-800/80 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Tren Durasi Jam Kerja Harian</h3>
                <p className="text-[11px] text-emerald-400 font-medium">Akumulasi Jam Kerja Efektif (7 Hari Aktif Terakhir)</p>
              </div>
            </div>
            <span className="text-[10px] bg-zinc-900 text-zinc-300 px-2.5 py-1 rounded-lg border border-olive-800">
              Target: 8 Jam / Hari
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {last7Days.map((day, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-200 font-mono">{day.label}</span>
                  <span className="font-mono font-extrabold text-gold-400">{day.hours} Jam</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-3 overflow-hidden border border-olive-800/80">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 via-emerald-400 to-gold-400 h-full rounded-full transition-all duration-500 shadow-md"
                    style={{ width: `${day.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WIDGET KANAN: DISTRIBUSI KATEGORI KEGIATAN */}
        <div className="bg-gradient-to-b from-olive-900 to-olive-950 border border-olive-700/50 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-olive-800/80 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
                <PieChart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Distribusi Kategori Kegiatan</h3>
                <p className="text-[11px] text-cyan-400 font-medium">Pembagian Tugas Berdasarkan Jenis Pelayanan</p>
              </div>
            </div>
          </div>

          <div className="space-y-3.5 pt-2">
            {categoryDistribution.map((cat, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className={`font-bold ${cat.textColor}`}>{cat.cat}</span>
                  <span className="font-mono font-bold text-white">{cat.count} Laporan ({cat.pct}%)</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-3 overflow-hidden border border-olive-800/80">
                  <div 
                    className={`${cat.color} h-full rounded-full transition-all duration-500 shadow-md`}
                    style={{ width: `${cat.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* TABEL AKTIVITAS TERBARU (DISINGKAT FORMAT: HARI, DD/MMM/YYYY; DURASI WAKTU 00:00 - 00:00 & TOMBOL EDIT/HAPUS) */}
      <div className="bg-gradient-to-b from-olive-900 to-olive-950 border border-olive-700/50 rounded-3xl p-6 shadow-xl space-y-4">
        
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-olive-800/80 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>📋 Tabel Aktivitas Terbaru (LKH Diri Sendiri & Bawahan)</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono font-bold">
                {filteredReports.length} Data
              </span>
            </h2>
            <p className="text-xs text-emerald-400/90 font-medium mt-0.5">Laporan LKH terurut berdasarkan hari, tanggal, dan durasi jam kerja.</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onNavigateToInput}
              className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-extrabold px-4 py-2 rounded-xl transition-all shadow-lg flex items-center space-x-1.5"
            >
              <span>+ Tambah LKH</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text"
              placeholder="🔍 Cari nama pegawai, NIP, uraian pekerjaan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/90 border border-olive-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-zinc-900/90 border border-olive-700/60 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
            >
              <option value="ALL">Semua Status Validasi ▾</option>
              <option value="DIVALIDASI">DIVALIDASI</option>
              <option value="PENDING">PENDING</option>
              <option value="DITOLAK">DITOLAK</option>
            </select>
            <Filter className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-2xl border border-olive-800/80">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-olive-950 text-zinc-300 font-bold border-b border-olive-800 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">HARI, TANGGAL & DURASI WAKTU</th>
                <th className="py-3.5 px-4">Nama Pegawai & NIP</th>
                <th className="py-3.5 px-4">Uraian Rincian Kegiatan</th>
                <th className="py-3.5 px-4 text-center">Durasi Total</th>
                <th className="py-3.5 px-4">Status Validasi</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olive-800/40 text-zinc-200">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-400">
                    Tidak ada laporan kinerja diri atau bawahan yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredReports.map((item) => {
                  const isValidated = item.status === 'DIVALIDASI' || item.status === 'Disetujui';
                  const isPending = item.status === 'PENDING' || item.status === 'Menunggu Verifikasi';
                  const isRejected = item.status === 'DITOLAK' || item.status === 'Revisi';
                  
                  // FORMAT SINGKAT: [Hari], [dd]/[MMM]/[yyyy]
                  const shortDateStr = formatShortDate(item.tanggal);
                  // DURASI WAKTU: 00:00 - 00:00
                  const timeDurationStr = formatDurationTime(item);

                  return (
                    <tr key={item.id} className="hover:bg-olive-800/30 transition-colors">
                      
                      {/* Hari, Tanggal & Durasi Waktu (FORMAT SINGKAT DENGAN KETENTUAN PRESISI) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-emerald-300 flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>{shortDateStr}</span>
                        </div>
                        <div className="text-[11px] text-zinc-300 font-mono mt-0.5 flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-gold-400 flex-shrink-0" />
                          <span>Durasi: {timeDurationStr}</span>
                        </div>
                      </td>

                      {/* Pegawai & NIP */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-extrabold text-white">{item.namaPegawai}</div>
                        <div className="text-[11px] text-zinc-400 font-mono">NIP. {item.nip}</div>
                        <div className="text-[10px] text-zinc-500">{item.jabatan}</div>
                      </td>

                      {/* Rincian Deskripsi */}
                      <td className="py-3.5 px-4 max-w-md">
                        {item.detailKegiatan && Array.isArray(item.detailKegiatan) ? (
                          <ul className="list-disc list-inside space-y-1 text-zinc-300 text-[11px]">
                            {item.detailKegiatan.map((keg, idx) => (
                              <li key={idx}>
                                <span className="font-bold text-emerald-400">[{keg.kategori}]</span> {keg.deskripsi} ({keg.volume} {keg.satuan})
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-zinc-300 text-xs leading-relaxed line-clamp-2">{item.deskripsi}</p>
                        )}
                      </td>

                      {/* Durasi */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap font-mono text-gold-400 font-extrabold">
                        {getDurasiFallback(item)} Jam
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isValidated && (
                          <span className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-full">
                            ✓ DIVALIDASI
                          </span>
                        )}
                        {isPending && (
                          <span className="bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-full animate-pulse">
                            ⏳ PENDING
                          </span>
                        )}
                        {isRejected && (
                          <span className="bg-rose-500/20 border border-rose-500/50 text-rose-300 text-[11px] font-bold px-2.5 py-1 rounded-full">
                            ✕ DITOLAK
                          </span>
                        )}
                      </td>

                      {/* Aksi: Tombol Detail */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => setSelectedReport(item)}
                            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors shadow-sm"
                            title="Lihat Detail LKH"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL 1: DETAIL LKH */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-olive-900 to-olive-950 border border-olive-700/60 rounded-3xl p-6 max-w-xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-olive-800 pb-3">
              <div className="flex items-center space-x-2">
                <img src="/si-lkp-kec-waru/logo-ppu.png" alt="Logo PPU" className="w-8 h-10 object-contain" />
                <h3 className="text-sm font-bold text-white">Detail LKH - {selectedReport.namaPegawai}</h3>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-2 text-zinc-300">
              <p><strong>NIP:</strong> {selectedReport.nip}</p>
              <p><strong>Jabatan:</strong> {selectedReport.jabatan}</p>
              <p><strong>Tanggal:</strong> {formatShortDate(selectedReport.tanggal)}</p>
              <p><strong>Durasi Waktu:</strong> {formatDurationTime(selectedReport)} ({getDurasiFallback(selectedReport)} Jam)</p>
              <p><strong>Status Validasi:</strong> <span className="text-emerald-400 font-bold">{selectedReport.status}</span></p>
              {selectedReport.catatanAtasan && <p><strong>Catatan Atasan:</strong> {selectedReport.catatanAtasan}</p>}
              
              <div className="pt-2 space-y-2">
                <strong className="block text-white">Rincian Kegiatan Kerja:</strong>
                {selectedReport.detailKegiatan && Array.isArray(selectedReport.detailKegiatan) ? (
                  selectedReport.detailKegiatan.map((keg, idx) => (
                    <div key={idx} className="bg-zinc-900 p-3 rounded-xl border border-olive-800 space-y-1">
                      <div className="flex justify-between font-bold text-emerald-400">
                        <span>[{keg.kategori}] {keg.jamMulai} - {keg.jamSelesai}</span>
                        <span>{keg.volume} {keg.satuan}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{keg.deskripsi}</p>
                      <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                        {keg.fotoUrl && (
                          <img src={keg.fotoUrl} alt="Foto 1" className="h-32 rounded-lg object-cover border border-olive-700" />
                        )}
                        {keg.fotoUrl2 && (
                          <img src={keg.fotoUrl2} alt="Foto 2" className="h-32 rounded-lg object-cover border border-olive-700" />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-zinc-900 p-3 rounded-xl border border-olive-800 space-y-1">
                    <p className="whitespace-pre-wrap">{selectedReport.deskripsi}</p>
                    <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                      {selectedReport.fotoUrl && (
                        <img src={selectedReport.fotoUrl} alt="Foto 1" className="h-32 rounded-lg object-cover border border-olive-700" />
                      )}
                      {selectedReport.fotoUrl2 && (
                        <img src={selectedReport.fotoUrl2} alt="Foto 2" className="h-32 rounded-lg object-cover border border-olive-700" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-right pt-2 border-t border-olive-800">
              <button onClick={() => setSelectedReport(null)} className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT LAPORAN LKH */}
      {editingReport && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveEditSubmit} className="bg-gradient-to-b from-olive-900 to-olive-950 border border-olive-700/60 rounded-3xl p-6 max-w-xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-olive-800 pb-3">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Edit Laporan LKH ({editingReport.namaPegawai})</h3>
              </div>
              <button type="button" onClick={() => setEditingReport(null)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Tanggal Laporan:</label>
                <input
                  type="date"
                  required
                  value={editingReport.tanggal}
                  onChange={(e) => setEditingReport({ ...editingReport, tanggal: e.target.value })}
                  className="w-full bg-zinc-900 border border-olive-700/60 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Jam Mulai:</label>
                  <input
                    type="time"
                    required
                    value={editingReport.jamMulai || '08:00'}
                    onChange={(e) => setEditingReport({ ...editingReport, jamMulai: e.target.value })}
                    className="w-full bg-zinc-900 border border-olive-700/60 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Jam Selesai:</label>
                  <input
                    type="time"
                    required
                    value={editingReport.jamSelesai || '10:00'}
                    onChange={(e) => setEditingReport({ ...editingReport, jamSelesai: e.target.value })}
                    className="w-full bg-zinc-900 border border-olive-700/60 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Uraian Rincian Pekerjaan:</label>
                <textarea
                  rows={3}
                  required
                  value={editingReport.deskripsi}
                  onChange={(e) => setEditingReport({ ...editingReport, deskripsi: e.target.value })}
                  className="w-full bg-zinc-900 border border-olive-700/60 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Volume Output:</label>
                  <input
                    type="number"
                    min={1}
                    value={editingReport.volume || 1}
                    onChange={(e) => setEditingReport({ ...editingReport, volume: parseInt(e.target.value) || 1 })}
                    className="w-full bg-zinc-900 border border-olive-700/60 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Satuan Hasil:</label>
                  <input
                    type="text"
                    value={editingReport.satuan || 'Berkas'}
                    onChange={(e) => setEditingReport({ ...editingReport, satuan: e.target.value })}
                    className="w-full bg-zinc-900 border border-olive-700/60 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-olive-800">
              <button
                type="button"
                onClick={() => setEditingReport(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs shadow-lg"
              >
                Simpan Perubahan LKH
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
