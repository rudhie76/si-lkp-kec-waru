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
  const userNip = currentUser?.nip || '';
  const myReports = reports.filter(r => r.nip === userNip || r.pegawaiId === currentUser?.id);
  const subordinateReports = reports.filter(r => r.nip !== userNip && r.pegawaiId !== currentUser?.id);
  const hasSubordinates = (currentUser?.role?.toLowerCase().includes('admin')) || (currentUser?.peranStruktur && !currentUser.peranStruktur.toLowerCase().includes('staf'));
  const myApproved = myReports.filter(r => r.status === 'DIVALIDASI' || r.status === 'Disetujui').length;
  const subApproved = subordinateReports.filter(r => r.status === 'DIVALIDASI' || r.status === 'Disetujui').length;
  const myPending = myReports.filter(r => r.status === 'PENDING' || r.status === 'Menunggu Verifikasi').length;
  const subPending = subordinateReports.filter(r => r.status === 'PENDING' || r.status === 'Menunggu Verifikasi').length;
  
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

  const myDurationThisMonth = validReports.filter(r => r.nip === userNip || r.pegawaiId === currentUser?.id).reduce((acc, curr) => {
    if (!curr.tanggal) return acc;
    const d = new Date(curr.tanggal);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      return acc + getDurasiFallback(curr);
    }
    return acc;
  }, 0);

  const subDurationThisMonth = validReports.filter(r => r.nip !== userNip && r.pegawaiId !== currentUser?.id).reduce((acc, curr) => {
    if (!curr.tanggal) return acc;
    const d = new Date(curr.tanggal);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
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
  }).sort((a, b) => {
    const timeA = new Date(a.tanggal || 0).getTime();
    const timeB = new Date(b.tanggal || 0).getTime();
    if (timeA !== timeB) return timeB - timeA;
    return String(b.id || '').localeCompare(String(a.id || ''));
  });

  // Short & Clean Date Formatting Helper: [Hari], [dd]/[MMM]/[yyyy]
  const formatShortDate = (dateStr) => {
    if (!dateStr) return 'Hari Ini';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      
      const year = d.getFullYear();
      const monthIndex = d.getMonth();
      const day = d.getDate();
      
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      
      const dayName = days[d.getDay()];
      const dd = String(day).padStart(2, '0');
      const mmm = months[monthIndex];
      return `${dayName}, ${dd}/${mmm}/${year}`;
    } catch(e) {
      return String(dateStr);
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

    const checkIsCamat = (user) => {
      if (!user) return false;
      const peran = (user.peranStruktur || '').toLowerCase();
      const jab = (user.jabatan || '').toLowerCase();
      if (peran.includes('sekretaris') || peran.includes('sekcam') || jab.includes('sekretaris') || jab.includes('sekcam')) return false;
      return /\bcamat\b/i.test(peran) || /\bcamat\b/i.test(jab);
    };
    const isCamat = checkIsCamat(currentUser);

    const finalReport = {
      ...editingReport,
      detailKegiatan: updatedDetail,
      durasiJam: (parseFloat(editingReport.jamSelesai) - parseFloat(editingReport.jamMulai)) || editingReport.durasiJam,
      status: isCamat ? 'DIVALIDASI' : 'PENDING',
      catatanAtasan: isCamat ? 'Otomatis divalidasi (Atasan Tertinggi)' : '',
      diverifikasiOleh: isCamat ? 'Sistem' : ''
    };

    if (onSaveReport) {
      onSaveReport(finalReport);
    }
    setEditingReport(null);
    alert('Laporan berhasil diperbarui!');
  };

  const formatToYYYYMMDD = (dateVal) => {
    if (!dateVal) return '';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal).substring(0, 10);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch(e) {
      return String(dateVal).substring(0, 10);
    }
  };

  // 7 Active Days Accumulated Work Duration Calculation
  const getLast4DaysData = () => {
    const dates = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const localIsoDate = `${year}-${month}-${day}`;
      
      const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
      const dayNum = d.getDate();
      
      const dayReports = reports.filter(r => {
        const rDate = formatToYYYYMMDD(r.tanggal);
        return rDate === localIsoDate && (r.status === 'DIVALIDASI' || r.status === 'PENDING' || r.status === 'Disetujui' || r.status === 'Menunggu Verifikasi');
      });
      const hours = dayReports.reduce((sum, r) => sum + (getDurasiFallback(r)), 0);

      dates.push({
        isoDate: localIsoDate,
        label: `${dayName} ${dayNum}`,
        hours: parseFloat(hours.toFixed(1)),
        pct: Math.min(100, Math.round((hours / 8) * 100))
      });
    }
    return dates;
  };

  const last4Days = getLast4DaysData();

  // Category Distribution Calculation
    const categoriesList = [
    { cat: 'Pelayanan Publik', color: 'bg-blue-400', textColor: 'text-blue-600' },
    { cat: 'Rapat', color: 'bg-amber-400', textColor: 'text-amber-600' },
    { cat: 'Koordinasi', color: 'bg-cyan-400', textColor: 'text-cyan-600' },
    { cat: 'Monev', color: 'bg-teal-400', textColor: 'text-teal-600' },
    { cat: 'Dinas LD', color: 'bg-purple-400', textColor: 'text-purple-600' },
    { cat: 'Kegiatan Lainnya', color: 'bg-slate-400', textColor: 'text-slate-600' },
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
        <div className="relative overflow-hidden bg-white border border-blue-600/40 rounded-2xl p-5 shadow-xl group hover:border-blue-400 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Total Laporan LKH</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1 group-hover:text-blue-600 transition-colors">{totalReports}</h3>
              {hasSubordinates ? (
                <div className="flex flex-col gap-1 mt-2 border-t border-blue-200 pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">LKH Saya:</span>
                    <span className="text-blue-600 font-bold">{myReports.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">LKH Bawahan:</span>
                    <span className="text-blue-600 font-bold">{subordinateReports.length}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-600 mt-1">Seluruh kegiatan terdata</p>
              )}
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-blue-600/20 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 2: Divalidasi Atasan */}
        <div className="relative overflow-hidden bg-white border border-blue-600/40 rounded-2xl p-5 shadow-xl group hover:border-blue-400 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">LKH Divalidasi</p>
              <h3 className="text-3xl font-extrabold text-blue-600 mt-1">{approvedReports}</h3>
              {hasSubordinates ? (
                <div className="flex flex-col gap-1 mt-2 border-t border-blue-200 pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">LKH Saya:</span>
                    <span className="text-blue-600 font-bold">{myApproved}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">LKH Bawahan:</span>
                    <span className="text-blue-600 font-bold">{subApproved}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-600 mt-1">{((approvedReports / (totalReports || 1)) * 100).toFixed(0)}% dari total laporan</p>
              )}
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-blue-600/20 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 3: Verifikasi PENDING */}
        <div 
          onClick={onNavigateToVerify}
          className="relative overflow-hidden bg-white border border-amber-500/50 rounded-2xl p-5 shadow-xl group hover:border-amber-400 hover:shadow-amber-500/30 hover:-translate-y-1 cursor-pointer transition-all duration-300"
          title="Klik untuk menuju halaman Verifikasi Atasan"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Verifikasi PENDING</p>
              <h3 className="text-3xl font-extrabold text-amber-800 mt-1">{pendingReports}</h3>
              {hasSubordinates ? (
                <div className="flex flex-col gap-1 mt-2 border-t border-amber-200 pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">LKH Saya:</span>
                    <span className="text-amber-800 font-bold">{myPending}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Aksi Anda:</span>
                    <span className="text-amber-800 font-bold">{subPending}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-600 mt-1">Membutuhkan aksi atasan</p>
              )}
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-amber-500/20 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 4: Durasi Jam Kerja */}
        <div className="relative overflow-hidden bg-white border border-gold-500/50 rounded-2xl p-5 shadow-xl group hover:border-gold-400 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Durasi Jam Kerja</p>
              <h3 className="text-3xl font-extrabold text-amber-700 mt-1">{totalDuration.toFixed(1)} <span className="text-sm font-semibold text-slate-800">Jam</span></h3>
              {hasSubordinates ? (
                <div className="flex flex-col gap-1 mt-2 border-t border-gold-800/30 pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Bulan Ini (Saya):</span>
                    <span className="text-amber-800 font-bold">{myDurationThisMonth.toFixed(1)} Jam</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Bulan Ini (Bwtn):</span>
                    <span className="text-amber-800 font-bold">{subDurationThisMonth.toFixed(1)} Jam</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1 mt-2 border-t border-gold-800/30 pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Bulan Ini:</span>
                    <span className="text-amber-800 font-bold">{totalDurationThisMonth.toFixed(1)} Jam</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Tahun Ini:</span>
                    <span className="text-amber-800 font-bold">{totalDurationThisYear.toFixed(1)} Jam</span>
                  </div>
                </div>
              )}
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
              <Hourglass className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-amber-100 rounded-full blur-xl pointer-events-none" />
        </div>

      </div>

      {/* PROFIL FOTO DIRI PEGAWAI & ATASAN VALIDASI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CARD 1: FOTO DIRI PEGAWAI LOGGED IN */}
        <div className="bg-white border border-blue-600/40 rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 flex items-center space-x-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Profil Pengisi LKH (ASN Logged In)</span>
            </span>
            <span className="text-[10px] bg-blue-600/20 text-blue-600 border border-blue-600/40 px-2.5 py-0.5 rounded-full font-bold">
              AKUN AKTIF
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 text-xs">
            <div className="w-24 h-28 rounded-2xl overflow-hidden border-2 border-blue-400 bg-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/20 relative">
              {activeUser.fotoProfil ? (
                <img src={activeUser.fotoProfil} alt="Foto Diri" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-slate-400" />
              )}
              <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-blue-600 border-2 border-white rounded-full" />
            </div>

            <div className="space-y-1.5 text-center sm:text-left flex-1">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Nama Lengkap:</span>
                <span className="text-sm font-extrabold text-slate-800">{activeUser.name}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Jabatan:</span>
                <span className="text-xs font-bold text-blue-600">{activeUser.jabatan || 'ASN Pelaksana'}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-300">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">NIP:</span>
                  <span className="font-mono text-slate-700 font-bold">{activeUser.nip}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Pangkat / Golongan:</span>
                  <span className="font-semibold text-amber-700">{activeUser.pangkatGolongan || 'Penata Muda / IIIa'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: FOTO DIRI ATASAN VALIDASI PENILAI */}
        {validatingSuperior ? (
          <div className="bg-white border border-amber-500/40 rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Profil Atasan Penilai (Memvalidasi)</span>
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-800 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold">
                VERIFIKATOR LANGSUNG
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 text-xs">
              <div className="w-24 h-28 rounded-2xl overflow-hidden border-2 border-amber-400 bg-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-950/60 relative">
                {validatingSuperior.fotoProfil ? (
                  <img src={validatingSuperior.fotoProfil} alt="Foto Atasan" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-slate-400" />
                )}
                <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-amber-500 border-2 border-white rounded-full" />
              </div>

              <div className="space-y-1.5 text-center sm:text-left flex-1">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Nama Lengkap Atasan:</span>
                  <span className="text-sm font-extrabold text-slate-800">{validatingSuperior.name}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Jabatan Atasan:</span>
                  <span className="text-xs font-bold text-amber-800">{validatingSuperior.jabatan}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">NIP Atasan:</span>
                    <span className="font-mono text-slate-700 font-bold">{validatingSuperior.nip}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Pangkat / Golongan:</span>
                    <span className="font-semibold text-amber-700">{validatingSuperior.pangkatGolongan || 'Pembina / IVa'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-300 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col items-center justify-center text-center opacity-80">
            <div className="w-20 h-20 bg-slate-100/30 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-2">Atasan Tertinggi</h3>
            <p className="text-xs text-slate-500 font-medium px-4">
              Akun Anda berstatus sebagai Atasan Tertinggi (Camat/Sederajat). Setiap laporan LKH Anda akan tervalidasi secara otomatis oleh sistem.
            </p>
          </div>
        )}

      </div>

      {/* CHARTS ROW (TREN DURASI JAM KERJA HARIAN & DISTRIBUSI KATEGORI KEGIATAN SIDE-BY-SIDE) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* WIDGET KIRI: TREN DURASI JAM KERJA HARIAN (7 HARI AKTIF TERAKHIR) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600/20 text-blue-600 rounded-xl border border-blue-600/30">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Tren Durasi Jam Kerja Harian</h3>
                <p className="text-[11px] text-blue-600 font-medium">Akumulasi Jam Kerja Efektif (4 Hari Aktif Terakhir)</p>
              </div>
            </div>
            <span className="text-[10px] bg-white text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200">
              Target: 8 Jam / Hari
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {last4Days.map((day, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 font-mono">{day.label}</span>
                  <span className="font-mono font-extrabold text-amber-700">{day.hours} Jam</span>
                </div>
                <div className="w-full bg-white rounded-full h-3 overflow-hidden border border-slate-200">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${day.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WIDGET KANAN: DISTRIBUSI KATEGORI KEGIATAN */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
                <PieChart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Distribusi Kategori Kegiatan</h3>
                <p className="text-[11px] text-cyan-400 font-medium">Pembagian Tugas Berdasarkan Jenis Pelayanan</p>
              </div>
            </div>
          </div>

          <div className="space-y-3.5 pt-2">
            {categoryDistribution.map((cat, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className={`font-bold ${cat.textColor}`}>{cat.cat}</span>
                  <span className="font-mono font-bold text-slate-800">{cat.count} Laporan ({cat.pct}%)</span>
                </div>
                <div className="w-full bg-white rounded-full h-3 overflow-hidden border border-slate-200">
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
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
        
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
              <span>📋 Tabel Aktivitas Terbaru (LKH Diri Sendiri & Bawahan)</span>
              <span className="text-xs bg-blue-600/20 text-blue-600 border border-blue-600/30 px-2.5 py-0.5 rounded-full font-mono font-bold">
                {filteredReports.length} Data
              </span>
            </h2>
            <p className="text-xs text-blue-600/90 font-medium mt-0.5">Laporan LKH terurut berdasarkan hari, tanggal, dan durasi jam kerja.</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onNavigateToInput}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-4 py-2 rounded-xl transition-all shadow-lg flex items-center space-x-1.5"
            >
              <span>+ Tambah LKH</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text"
              placeholder="🔍 Cari nama pegawai, NIP, uraian pekerjaan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/90 border border-slate-200/60 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-white/90 border border-slate-200/60 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-600 appearance-none cursor-pointer"
            >
              <option value="ALL">Semua Status Validasi ▾</option>
              <option value="DIVALIDASI">DIVALIDASI</option>
              <option value="PENDING">PENDING</option>
              <option value="DITOLAK">DITOLAK</option>
            </select>
            <Filter className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white shadow-sm border border-slate-200 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">HARI, TANGGAL & DURASI WAKTU</th>
                <th className="py-3.5 px-4">Nama Pegawai & NIP</th>
                <th className="py-3.5 px-4">Uraian Rincian Kegiatan</th>
                <th className="py-3.5 px-4 text-center">Durasi Total</th>
                <th className="py-3.5 px-4">Status Validasi</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
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
                    <tr key={item.id} className="hover:bg-slate-100/30 transition-colors">
                      
                      {/* Hari, Tanggal & Durasi Waktu (FORMAT SINGKAT DENGAN KETENTUAN PRESISI) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-blue-600 flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          <span>{shortDateStr}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 font-mono mt-0.5 flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-amber-700 flex-shrink-0" />
                          <span>Durasi: {timeDurationStr}</span>
                        </div>
                      </td>

                      {/* Pegawai & NIP */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-extrabold text-slate-800">{item.namaPegawai}</div>
                        <div className="text-[11px] text-slate-500 font-mono">NIP. {item.nip}</div>
                        <div className="text-[10px] text-slate-400">{item.jabatan}</div>
                      </td>

                      {/* Rincian Deskripsi */}
                      <td className="py-3.5 px-4 max-w-md">
                        {item.detailKegiatan && Array.isArray(item.detailKegiatan) ? (
                          <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                            {item.detailKegiatan.map((keg, idx) => (
                              <li key={idx}>
                                <span className="font-bold text-blue-600">[{keg.kategori}]</span> {keg.deskripsi} ({keg.volume} {keg.satuan})
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">{item.deskripsi}</p>
                        )}
                      </td>

                      {/* Durasi */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap font-mono text-amber-700 font-extrabold">
                        {getDurasiFallback(item)} Jam
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isValidated && (
                          <span className="bg-blue-100 border border-blue-300 text-blue-800 text-[11px] font-bold px-2.5 py-1 rounded-full">
                            ✓ DIVALIDASI
                          </span>
                        )}
                        {isPending && (
                          <span className="bg-amber-100 border border-amber-300 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full animate-pulse">
                            ⏳ PENDING
                          </span>
                        )}
                        {isRejected && (
                          <span className="bg-red-100 border border-red-300 text-red-600 text-[11px] font-bold px-2.5 py-1 rounded-full">
                            ✕ DITOLAK
                          </span>
                        )}
                      </td>

                      {/* Aksi: Tombol Detail */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => setSelectedReport(item)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shadow-sm"
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
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 max-w-xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <img src="/si-lkp-kec-waru/logo-ppu.png" alt="Logo PPU" className="w-8 h-10 object-contain" />
                <h3 className="text-sm font-bold text-slate-800">Detail LKH - {selectedReport.namaPegawai}</h3>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-slate-500 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-2 text-slate-600">
              <p><strong>NIP:</strong> {selectedReport.nip}</p>
              <p><strong>Jabatan:</strong> {selectedReport.jabatan}</p>
              <p><strong>Tanggal:</strong> {formatShortDate(selectedReport.tanggal)}</p>
              <p><strong>Durasi Waktu:</strong> {formatDurationTime(selectedReport)} ({getDurasiFallback(selectedReport)} Jam)</p>
              <p><strong>Status Validasi:</strong> <span className="text-blue-600 font-bold">{selectedReport.status}</span></p>
              {selectedReport.catatanAtasan && <p><strong>Catatan Atasan:</strong> {selectedReport.catatanAtasan}</p>}
              
              <div className="pt-2 space-y-2">
                <strong className="block text-slate-800">Rincian Kegiatan Kerja:</strong>
                {selectedReport.detailKegiatan && Array.isArray(selectedReport.detailKegiatan) ? (
                  selectedReport.detailKegiatan.map((keg, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex justify-between font-bold text-blue-600">
                        <span>[{keg.kategori}] {keg.jamMulai} - {keg.jamSelesai}</span>
                        <span>{keg.volume} {keg.satuan}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{keg.deskripsi}</p>
                      <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                        {keg.fotoUrl && (
                          <img src={keg.fotoUrl} alt="Foto 1" className="h-32 rounded-lg object-cover border border-slate-200" />
                        )}
                        {keg.fotoUrl2 && (
                          <img src={keg.fotoUrl2} alt="Foto 2" className="h-32 rounded-lg object-cover border border-slate-200" />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                    <p className="whitespace-pre-wrap">{selectedReport.deskripsi}</p>
                    <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                      {selectedReport.fotoUrl && (
                        <img src={selectedReport.fotoUrl} alt="Foto 1" className="h-32 rounded-lg object-cover border border-slate-200" />
                      )}
                      {selectedReport.fotoUrl2 && (
                        <img src={selectedReport.fotoUrl2} alt="Foto 2" className="h-32 rounded-lg object-cover border border-slate-200" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-right pt-2 border-t border-slate-200">
              <button onClick={() => setSelectedReport(null)} className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT LAPORAN LKH */}
      {editingReport && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveEditSubmit} className="bg-white border border-slate-200/60 rounded-3xl p-6 max-w-xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-amber-700" />
                <h3 className="text-sm font-bold text-slate-800">Edit Laporan LKH ({editingReport.namaPegawai})</h3>
              </div>
              <button type="button" onClick={() => setEditingReport(null)} className="text-slate-500 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Tanggal Laporan:</label>
                <input
                  type="date"
                  required
                  value={editingReport.tanggal}
                  onChange={(e) => setEditingReport({ ...editingReport, tanggal: e.target.value })}
                  className="w-full bg-white border border-slate-200/60 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Jam Mulai:</label>
                  <input
                    type="time"
                    required
                    value={editingReport.jamMulai || '08:00'}
                    onChange={(e) => setEditingReport({ ...editingReport, jamMulai: e.target.value })}
                    className="w-full bg-white border border-slate-200/60 rounded-xl p-2.5 text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Jam Selesai:</label>
                  <input
                    type="time"
                    required
                    value={editingReport.jamSelesai || '10:00'}
                    onChange={(e) => setEditingReport({ ...editingReport, jamSelesai: e.target.value })}
                    className="w-full bg-white border border-slate-200/60 rounded-xl p-2.5 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Uraian Rincian Pekerjaan:</label>
                <textarea
                  rows={3}
                  required
                  value={editingReport.deskripsi}
                  onChange={(e) => setEditingReport({ ...editingReport, deskripsi: e.target.value })}
                  className="w-full bg-white border border-slate-200/60 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Volume Output:</label>
                  <input
                    type="number"
                    min={1}
                    value={editingReport.volume || 1}
                    onChange={(e) => setEditingReport({ ...editingReport, volume: parseInt(e.target.value) || 1 })}
                    className="w-full bg-white border border-slate-200/60 rounded-xl p-2.5 text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Satuan Hasil:</label>
                  <input
                    type="text"
                    value={editingReport.satuan || 'Berkas'}
                    onChange={(e) => setEditingReport({ ...editingReport, satuan: e.target.value })}
                    className="w-full bg-white border border-slate-200/60 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingReport(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-800 text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-lg"
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
