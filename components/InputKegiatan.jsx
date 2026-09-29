'use client';

import { useState, useRef } from 'react';
import { 
  Calendar, Clock, User, AlignLeft, Send, CheckCircle, FileText, FileText, 
  Camera, Upload, X, Trash2, Image as ImageIcon, Briefcase, 
  CheckSquare, Activity, ShieldCheck, Download, Award, Building, Plus, Edit3
} from 'lucide-react';


// Fallback for missing durasiJam
const getDurasiFallback = (item) => {
  if (item.durasiJam) return item.durasiJam;
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
export default function InputKegiatan({ 
  onSaveReport, 
  onDeleteReport,
  activeUser = null,
  reports = [],
  pegawaiList = []
}) {
  const today = new Date().toISOString().split('T')[0];

  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    tanggal: today,
    jamMulai: '08:00',
    jamSelesai: '10:00',
    kategori: 'Pelayanan Publik',
    deskripsi: '',
    volume: 1,
    satuan: 'Berkas',
    statusHasil: 'Selesai',
    fotoUrls: [] // Can hold up to 2 objects: { url, name, size }
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [filterRecapStatus, setFilterRecapStatus] = useState('Semua');
  const [editingReportId, setEditingReportId] = useState(null);
  const [validationError, setValidationError] = useState('');

  // Helper to calculate duration
  const calculateDuration = (start, end) => {
    if (!start || !end) return 0;
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    const diffMins = (h2 * 60 + m2) - (h1 * 60 + m1);
    return Math.max(0, parseFloat((diffMins / 60).toFixed(1)));
  };

  // Compression helper
  const compressImageFile = (file, maxWidth = 800, maxHeight = 800, quality = 0.75) => {
    return new Promise((resolve, reject) => {
      if (file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
          } else {
            if (height > maxHeight) { width = Math.round((width * maxHeight) / height); height = maxHeight; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    const maxAllowed = 2 - formData.fotoUrls.length;
    const filesToProcess = files.slice(0, maxAllowed);
    
    if (filesToProcess.length < files.length) {
      alert('Maksimal 2 foto dokumentasi per laporan.');
    }

    try {
      const compressedPhotos = await Promise.all(
        filesToProcess.map(async (file) => {
          const url = await compressImageFile(file);
          return {
            url,
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB'
          };
        })
      );
      setFormData(prev => ({
        ...prev,
        fotoUrls: [...prev.fotoUrls, ...compressedPhotos]
      }));
    } catch (err) {
      alert('Gagal memproses gambar foto.');
    }
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      fotoUrls: prev.fotoUrls.filter((_, i) => i !== index)
    }));
  };

  // Date Formatters
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

  const formatToDDMMYYYY = (dateVal) => {
    const yyyymmdd = formatToYYYYMMDD(dateVal);
    if (!yyyymmdd || !yyyymmdd.includes('-')) return dateVal;
    const [y, m, d] = yyyymmdd.split('-');
    return `${d}/${m}/${y}`;
  };

  const formatToCustomDate = (dateVal) => {
    const yyyymmdd = formatToYYYYMMDD(dateVal);
    if (!yyyymmdd || !yyyymmdd.includes('-')) return dateVal;
    const [y, m, d] = yyyymmdd.split('-');
    const dateObj = new Date(y, parseInt(m, 10) - 1, d);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    return `${days[dateObj.getDay()]}, ${d}/${months[dateObj.getMonth()]}/${y}`;
  };

  const handleEditClick = (report) => {
    const firstKeg = report.detailKegiatan?.[0] || {};
    setEditingReportId(report.id);
    
    const fotos = [];
    if (firstKeg.fotoUrl) fotos.push({ url: firstKeg.fotoUrl, name: 'Bukti Dukung 1.jpg', size: '-' });
    if (firstKeg.fotoUrl2) fotos.push({ url: firstKeg.fotoUrl2, name: 'Bukti Dukung 2.jpg', size: '-' });
    else if (!firstKeg.fotoUrl && report.lampiranUrl) fotos.push({ url: report.lampiranUrl, name: 'Lampiran LKH.jpg', size: '-' });

    setFormData({
      tanggal: formatToYYYYMMDD(report.tanggal),
      jamMulai: firstKeg.jamMulai || '08:00',
      jamSelesai: firstKeg.jamSelesai || '10:00',
      kategori: firstKeg.kategori || report.deskripsi?.split(':')[0] || 'Pelayanan Publik',
      deskripsi: firstKeg.deskripsi || report.deskripsi || '',
      volume: firstKeg.volume || 1,
      satuan: firstKeg.satuan || 'Berkas',
      statusHasil: firstKeg.statusHasil || 'Selesai',
      fotoUrls: fotos
    });
    setValidationError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingReportId(null);
    setFormData({
      tanggal: today,
      jamMulai: '08:00',
      jamSelesai: '10:00',
      kategori: 'Pelayanan Publik',
      deskripsi: '',
      volume: 1,
      satuan: 'Berkas',
      statusHasil: 'Selesai',
      fotoUrls: []
    });
    setValidationError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.deskripsi.trim()) {
      setValidationError('Tuliskan secara detail apa yang dikerjakan, hasil keluaran/output, serta pihak yang terlibat...');
      return;
    }
    setValidationError('');

    const reportOwner = activeUser || {
      id: 'USER-001', name: 'Guest User', nip: '000000', jabatan: 'Staf'
    };

    const durasi = calculateDuration(formData.jamMulai, formData.jamSelesai);

    const detailItem = {
      jamMulai: formData.jamMulai,
      jamSelesai: formData.jamSelesai,
      kategori: formData.kategori,
      deskripsi: formData.deskripsi,
      durasiJam: durasi,
      volume: formData.volume,
      satuan: formData.satuan,
      statusHasil: formData.statusHasil,
      fotoUrl: formData.fotoUrls[0]?.url || '',
      fotoUrl2: formData.fotoUrls[1]?.url || ''
    };

    const checkIsCamat = (user) => {
      if (!user) return false;
      const peran = (user.peranStruktur || '').toLowerCase();
      const jab = (user.jabatan || '').toLowerCase();
      
      if (peran.includes('sekretaris') || peran.includes('sekcam') || jab.includes('sekretaris') || jab.includes('sekcam')) return false;
      
      // Use regex \b to match the exact word "camat" and exclude "kecamatan"
      return /\bcamat\b/i.test(peran) || /\bcamat\b/i.test(jab);
    };
    const isCamat = checkIsCamat(reportOwner);

    const newReport = {
      id: editingReportId || `LKH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      tanggal: formData.tanggal,
      pegawaiId: reportOwner.id,
      namaPegawai: reportOwner.name,
      nip: reportOwner.nip,
      jabatan: reportOwner.jabatan || 'ASN',
      detailKegiatan: [detailItem],
      deskripsi: formData.deskripsi,
      durasiJam: durasi,
      lampiranUrl: detailItem.fotoUrl,
      status: isCamat ? 'DIVALIDASI' : 'PENDING',
      catatanAtasan: isCamat ? 'Otomatis divalidasi (Atasan Tertinggi)' : '',
      diverifikasiOleh: isCamat ? 'Sistem' : '',
      waktuInput: `${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')} WITA`
    };

    onSaveReport(newReport);

    setIsSuccess(true);
    setEditingReportId(null);
    setFormData(prev => ({
      ...prev,
      deskripsi: '',
      fotoUrls: [],
      jamMulai: prev.jamSelesai,
      jamSelesai: `${String(Math.min(23, parseInt(prev.jamSelesai.split(':')[0]) + 2)).padStart(2, '0')}:00`
    }));

    setTimeout(() => setIsSuccess(false), 4000);
  };

  // User's Own Submitted Reports Filter
  const userOwnReports = reports.filter(r => {
    if (!activeUser) return true;
    const isIdMatch = r.pegawaiId && String(r.pegawaiId) === String(activeUser.id);
    const isNipMatch = r.nip && activeUser.nip && r.nip.replace(/\s+/g, '') === activeUser.nip.replace(/\s+/g, '');
    return isIdMatch || isNipMatch;
  });

  const filteredUserReports = userOwnReports.filter(r => {
    if (filterRecapStatus === 'Semua') return true;
    if (filterRecapStatus === 'Pending') return r.status === 'PENDING';
    if (filterRecapStatus === 'Disetujui') return r.status === 'DIVALIDASI';
    if (filterRecapStatus === 'Revisi') return r.status === 'REVISI';
    if (filterRecapStatus === 'Ditolak') return r.status === 'DITOLAK';
    return true;
  }).sort((a, b) => {
    const timeA = new Date(a.tanggal || 0).getTime();
    const timeB = new Date(b.tanggal || 0).getTime();
    if (timeA !== timeB) return timeB - timeA;
    return String(b.id || '').localeCompare(String(a.id || ''));
  });

  // Extract all photos from user's reports for the Gallery
  const galleryPhotos = userOwnReports
    .flatMap(r => r.detailKegiatan ? r.detailKegiatan.flatMap(k => [k.fotoUrl, k.fotoUrl2]) : [r.lampiranUrl])
    .filter(url => url && url.startsWith('data:image'));

  const categories = [
    'Pelayanan Publik', 'Rapat', 'Koordinasi', 'Monev', 'Dinas LD', 'Kegiatan Lainnya'
  ];

  return (
    <div className="space-y-6 text-sm">
      
      {/* 2-COLUMN LAYOUT: FORM (LEFT) & PROFILE/GALLERY (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: FORM INPUT */}
        <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="border-b border-slate-200 pb-4 mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800">
                {editingReportId ? 'Mode Edit Akun LKH' : 'Input Kegiatan Harian ASN'}
              </h1>
              {editingReportId ? (
                <div className="flex items-center space-x-2 mt-2">
                  <span className="bg-amber-500/20 text-amber-700 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-bold">
                    Tanggal Laporan: {formData.tanggal} ({formData.jamMulai} - {formData.jamSelesai})
                  </span>
                </div>
              ) : (
                <p className="text-slate-500 mt-1 text-sm">Tulis daftar kegiatan harian yang Anda lakukan hari ini.</p>
              )}
            </div>
            {editingReportId && (
              <button 
                type="button" 
                onClick={handleCancelEdit} 
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors border border-slate-300"
              >
                Batal Edit
              </button>
            )}
          </div>

          {isSuccess && (() => {
            const checkIsCamat = (user) => {
              if (!user) return false;
              const peran = (user.peranStruktur || '').toLowerCase();
              const jab = (user.jabatan || '').toLowerCase();
              if (peran.includes('sekretaris') || peran.includes('sekcam') || jab.includes('sekretaris') || jab.includes('sekcam')) return false;
              return /\bcamat\b/i.test(peran) || /\bcamat\b/i.test(jab);
            };
            const isUserCamat = checkIsCamat(activeUser);
            
            return (
              <div className="bg-blue-600/20 border border-blue-600/40 text-blue-600 p-4 rounded-xl mb-6 flex items-center space-x-3 shadow-lg">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-bold">
                  {isUserCamat
                    ? 'Laporan berhasil disimpan dan otomatis divalidasi (Atasan Tertinggi).'
                    : 'Daftar laporan harian berhasil ditambahkan dan dikirim ke atasan untuk verifikasi.'}
                </span>
              </div>
            );
          })()}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* WAKTU & TANGGAL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-600 font-bold mb-1.5 uppercase text-[10px] tracking-wider">Tanggal Kegiatan</label>
                <div className="relative">
                  <Calendar 
                    onClick={() => {
                      try { document.getElementById('inputTanggal').showPicker(); } catch(e) {}
                    }}
                    className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 cursor-pointer z-10" 
                  />
                  <input
                    id="inputTanggal"
                    type="date"
                    required
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full bg-white border border-slate-200 border border-slate-200/60 rounded-xl pl-10 pr-3 py-2.5 text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1.5 uppercase text-[10px] tracking-wider">Waktu Mulai</label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none" />
                  <input
                    type="time"
                    required
                    value={formData.jamMulai}
                    onChange={(e) => setFormData({ ...formData, jamMulai: e.target.value })}
                    className="w-full bg-white border border-slate-200 border border-slate-200/60 rounded-xl pl-10 pr-3 py-2.5 text-slate-800 focus:outline-none focus:border-blue-600 font-mono cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1.5 uppercase text-[10px] tracking-wider">Waktu Selesai</label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-rose-500 pointer-events-none" />
                  <input
                    type="time"
                    required
                    value={formData.jamSelesai}
                    onChange={(e) => setFormData({ ...formData, jamSelesai: e.target.value })}
                    className="w-full bg-white border border-slate-200 border border-slate-200/60 rounded-xl pl-10 pr-3 py-2.5 text-slate-800 focus:outline-none focus:border-blue-600 font-mono cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full"
                  />
                </div>
              </div>
            </div>

            {/* KATEGORI TUGAS */}
            <div>
              <label className="block text-slate-600 font-bold mb-2 uppercase text-[10px] tracking-wider">Kategori Tugas</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <label key={cat} className={`
                    cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center text-center space-y-2 transition-all
                    ${formData.kategori === cat 
                      ? 'bg-blue-600/20 border-blue-600 text-blue-600 shadow-md shadow-sm' 
                      : 'bg-slate-50 border-slate-300 text-slate-500 hover:bg-slate-100 hover:border-slate-300'
                    }
                  `}>
                    <input 
                      type="radio" 
                      name="kategori" 
                      value={cat} 
                      checked={formData.kategori === cat} 
                      onChange={(e) => setFormData({ ...formData, kategori: e.target.value })} 
                      className="hidden" 
                    />
                    <Briefcase className="w-5 h-5" />
                    <span className="text-[11px] font-bold leading-tight">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* DESKRIPSI KEGIATAN */}
            <div>
              <label className="block text-slate-600 font-bold mb-1.5 uppercase text-[10px] tracking-wider">Deskripsi Kegiatan Kerja</label>
              <textarea
                rows={3}
                placeholder="Tulis detail pekerjaan yang diselesaikan..."
                value={formData.deskripsi}
                onChange={(e) => {
                  setFormData({ ...formData, deskripsi: e.target.value });
                  if (validationError) setValidationError('');
                }}
                className={`w-full bg-white border border-slate-200 border ${validationError ? 'border-rose-500' : 'border-slate-200/60'} rounded-xl p-4 text-slate-800 focus:outline-none focus:border-blue-600 transition-colors resize-y`}
              />
              {validationError ? (
                <p className="text-[11px] text-rose-500 font-bold mt-1.5">{validationError}</p>
              ) : (
                <p className="text-[11px] text-amber-700/80 font-medium mt-1.5">
                  Contoh: Melakukan pemeriksaan KTP-el dan verifikasi berkas pengajuan mutasi masuk warga desa...
                </p>
              )}
            </div>

            {/* VOLUME & STATUS HASIL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-600 font-bold mb-1.5 uppercase text-[10px] tracking-wider">Volume Output</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={formData.volume}
                  onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                  className="w-full bg-white border border-slate-200 border border-slate-200/60 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1.5 uppercase text-[10px] tracking-wider">Satuan Kerja</label>
                <select
                  value={formData.satuan}
                  onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                  className="w-full bg-white border border-slate-200 border border-slate-200/60 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="Berkas">Berkas</option>
                  <option value="Kegiatan">Kegiatan</option>
                  <option value="Laporan">Laporan</option>
                  <option value="Dokumen">Dokumen</option>
                  <option value="Orang">Orang / Warga</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1.5 uppercase text-[10px] tracking-wider">Status Hasil</label>
                <div className="flex bg-white border border-slate-200 border border-slate-200/60 rounded-xl overflow-hidden p-1">
                  {['Selesai', 'Proses', 'Tertunda'].map((st) => (
                    <label key={st} className={`
                      flex-1 text-center py-1.5 text-[11px] font-bold cursor-pointer rounded-lg transition-colors
                      ${formData.statusHasil === st 
                        ? (st === 'Selesai' ? 'bg-blue-600 text-white' : st === 'Proses' ? 'bg-amber-500 text-zinc-900' : 'bg-blue-600 text-white')
                        : 'text-slate-500 hover:bg-slate-100'
                      }
                    `}>
                      <input 
                        type="radio" 
                        name="statusHasil" 
                        value={st} 
                        checked={formData.statusHasil === st} 
                        onChange={(e) => setFormData({ ...formData, statusHasil: e.target.value })} 
                        className="hidden" 
                      />
                      {st}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* UNGGAH BERKAS / FOTO */}
            <div>
              <label className="block text-slate-600 font-bold mb-1.5 uppercase text-[10px] tracking-wider flex justify-between">
                <span>Foto / File Bukti Dukung (Opsional)</span>
                <span className="text-slate-400">{formData.fotoUrls.length} / 2 File</span>
              </label>
              
              <div 
                className="w-full border-2 border-dashed border-slate-200 hover:border-blue-600 bg-white/40 hover:bg-white/70 rounded-2xl p-6 transition-all flex flex-col items-center justify-center cursor-pointer relative"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  accept="image/*,application/pdf" 
                  multiple 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                
                {formData.fotoUrls.length === 0 ? (
                  <>
                    <div className="bg-slate-100 p-3 rounded-full mb-3 text-blue-600">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-slate-600 font-bold text-xs text-center">Seret & taruh foto/PDF ke sini, atau klik untuk unggah (Maks. 2 File)</p>
                    <p className="text-slate-400 text-[10px] font-medium mt-1">Format: JPG, PNG, JPEG, PDF (maks 5MB).</p>
                  </>
                ) : (
                  <div className="flex flex-wrap gap-4 w-full justify-center">
                    {formData.fotoUrls.map((foto, idx) => (
                      <div key={idx} className="relative flex flex-col items-center gap-2 group" onClick={(e) => e.stopPropagation()}>
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-blue-600/50">
                          {foto.url.includes('application/pdf') || foto.name.endsWith('.pdf') ? (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-rose-50 text-rose-500">
                                <FileText className="w-8 h-8" />
                                <span className="text-[8px] font-bold mt-1">PDF</span>
                              </div>
                            ) : (
                              <img src={foto.url} alt={`Bukti ${idx+1}`} className="w-full h-full object-cover" />
                            )}
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removePhoto(idx); }}
                            className="absolute top-1 right-1 bg-rose-600/90 text-slate-800 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-blue-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-center w-24 overflow-hidden">
                          <div className="text-[10px] font-bold text-slate-600 truncate" title={foto.name}>{foto.name}</div>
                          <div className="text-[9px] text-slate-400">{foto.size}</div>
                        </div>
                      </div>
                    ))}
                    {formData.fotoUrls.length < 2 && (
                      <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-colors">
                        <Plus className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* TOMBOL KIRIM */}
            <div className="pt-2">
              <button
                type="submit"
                className={`w-full text-slate-800 font-extrabold text-sm py-3.5 rounded-2xl shadow-xl flex items-center justify-center space-x-2 transition-transform hover:-translate-y-0.5 ${
                  editingReportId 
                    ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/40' 
                    : 'bg-blue-600 hover:bg-blue-600 shadow-blue-600/20'
                }`}
              >
                <Send className="w-5 h-5" />
                <span>{editingReportId ? 'Simpan Perubahan' : 'Kirim Laporan Kegiatan'}</span>
              </button>
            </div>

          </form>
        </div>

        {/* RIGHT COLUMN: PROFIL & GALLERY */}
        <div className="space-y-6">
          
          {/* PROFIL PENGGAL LKH */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShieldCheck className="w-24 h-24" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full border-4 border-blue-600/50 bg-white overflow-hidden shadow-lg">
                {activeUser?.fotoProfil ? (
                  <img src={activeUser.fotoProfil} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <User className="w-10 h-10" />
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 leading-tight">{activeUser?.name || 'Nama Pegawai'}</h3>
                <p className="text-blue-600 font-mono text-xs font-bold mt-0.5">NIP. {activeUser?.nip || '123456789'}</p>
              </div>

              <div className="w-full space-y-2.5 text-left bg-white/60 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-start space-x-2.5">
                  <Briefcase className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Jabatan</div>
                    <div className="text-xs text-slate-800 font-medium">{activeUser?.jabatan || '-'}</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2.5">
                  <Award className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Pangkat / Golongan</div>
                    <div className="text-xs text-slate-800 font-medium">{activeUser?.pangkatGolongan || '-'}</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2.5">
                  <Building className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Unit Kerja</div>
                    <div className="text-xs text-slate-800 font-medium">{activeUser?.unitKerja || '-'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* KARTU ATASAN PENILAI (Jika ada) */}
          {activeUser?.atasanValidasi && (
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <ShieldCheck className="w-24 h-24" />
              </div>
              
              <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                {(() => {
                  const atasanObj = pegawaiList.find(p => activeUser.atasanValidasi.includes(p.name));
                  return (
                    <>
                      <div className="w-16 h-16 rounded-full border-2 border-blue-600/50 bg-white overflow-hidden shadow-lg">
                        {atasanObj?.fotoProfil ? (
                          <img src={atasanObj.fotoProfil} alt="Profil Atasan" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <User className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-800 leading-tight">{atasanObj?.name || activeUser.atasanValidasi}</h3>
                        {atasanObj?.nip && <p className="text-blue-600 font-mono text-[10px] font-bold mt-0.5">NIP. {atasanObj.nip}</p>}
                        <div className="mt-1 inline-block bg-blue-600/20 border border-blue-600/40 text-blue-600 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase">
                          Atasan Penilai Langsung
                        </div>
                      </div>
                      
                      {atasanObj && (
                        <div className="w-full space-y-2 text-left bg-white/60 p-3 rounded-xl border border-slate-200 mt-2">
                          <div className="flex items-start space-x-2">
                            <Briefcase className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-[9px] text-slate-400 font-bold uppercase">Jabatan Atasan</div>
                              <div className="text-[11px] text-slate-800 font-medium">{atasanObj.jabatan || '-'}</div>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Award className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-[9px] text-slate-400 font-bold uppercase">Pangkat / Golongan</div>
                              <div className="text-[11px] text-slate-800 font-medium">{atasanObj.pangkatGolongan || '-'}</div>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Building className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-[9px] text-slate-400 font-bold uppercase">Unit Kerja Atasan</div>
                              <div className="text-[11px] text-slate-800 font-medium">{atasanObj.unitKerja || '-'}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* GALERI FOTO KEGIATAN */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2 mb-4">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              <span>Galeri Bukti Kegiatan</span>
            </h3>
            
            {galleryPhotos.length === 0 ? (
              <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-white/30">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">Belum ada foto kegiatan.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                {galleryPhotos.map((img, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden border border-slate-200 bg-black">
                    <img src={img} alt="Galeri" className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer" />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* BAGIAN BAWAH: TABEL REKAPITULASI */}
      <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xl mt-8">
        
        {/* Header Tabel & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>Rekapan Kegiatan yang Sudah Diinput</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Daftar laporan kegiatan harian Anda. Anda dapat mengedit atau menghapus laporan.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {['Semua', 'Pending', 'Disetujui', 'Revisi', 'Ditolak'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterRecapStatus(status)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  filterRecapStatus === status
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* TABEL DATA */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/60 shadow-inner bg-slate-50/50">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-blue-600 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <th className="py-4 px-4">TANGGAL & WAKTU</th>
                <th className="py-4 px-4">KATEGORI</th>
                <th className="py-4 px-4 min-w-[200px]">DESKRIPSI KEGIATAN</th>
                <th className="py-4 px-4 text-center">OUTPUT / VOLUME</th>
                <th className="py-4 px-4 text-center">DURASI</th>
                <th className="py-4 px-4 text-center">STATUS</th>
                <th className="py-4 px-4 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-600 font-medium">
              {filteredUserReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CheckSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    Belum ada data kegiatan yang sesuai kriteria.
                  </td>
                </tr>
              ) : (
                filteredUserReports.map(item => {
                  const firstKeg = item.detailKegiatan?.[0] || {};
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 border border-slate-200 transition-colors group">
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1.5">
                          <div className="flex items-center space-x-1.5 text-blue-600 font-extrabold text-xs">
                            <Calendar className="w-4 h-4" />
                            <span>{formatToCustomDate(item.tanggal)}</span>
                          </div>
                          <div className="flex items-center space-x-1.5 text-[11px] font-mono">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            <span className="text-slate-600">Durasi:</span>
                            <span className="text-slate-800 font-bold tracking-wide">{firstKeg.jamMulai} - {firstKeg.jamSelesai}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-[10px] font-bold">
                          {firstKeg.kategori || item.deskripsi?.split(':')[0] || 'Lainnya'}
                        </span>
                      </td>
                      <td className="py-4 px-4 max-w-sm">
                        <p className="line-clamp-2" title={firstKeg.deskripsi || item.deskripsi}>{firstKeg.deskripsi || item.deskripsi}</p>
                        
                        {/* Expandable links if photos exist */}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(firstKeg.fotoUrl || item.lampiranUrl) && (
                            <a href={firstKeg.fotoUrl || item.lampiranUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-600 hover:text-blue-600 flex items-center space-x-1">
                              <ImageIcon className="w-3 h-3" /> <span>Bukti Dukung 1</span>
                            </a>
                          )}
                          {firstKeg.fotoUrl2 && (
                            <a href={firstKeg.fotoUrl2} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-600 hover:text-blue-600 flex items-center space-x-1">
                              <ImageIcon className="w-3 h-3" /> <span>Bukti Dukung 2</span>
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <div className="font-bold text-slate-800">{firstKeg.volume || 1}</div>
                        <div className="text-[10px] text-slate-400">{firstKeg.satuan || 'Berkas'}</div>
                      </td>
                      <td className="py-4 px-4 text-center font-mono font-bold text-amber-700">
                        {getDurasiFallback(item)} Jam
                      </td>
                      <td className="py-4 px-4 text-center">
                        {item.status === 'DIVALIDASI' && (
                          <span className="bg-blue-600/20 text-blue-600 border border-blue-600/40 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase">Disetujui</span>
                        )}
                        {item.status === 'PENDING' && (
                          <span className="bg-amber-500/20 text-amber-700 border border-amber-500/40 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase">Pending</span>
                        )}
                        {item.status === 'REVISI' && (
                          <span className="bg-blue-500/20 text-blue-400 border border-blue-500/40 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase">Revisi</span>
                        )}
                        {item.status === 'DITOLAK' && (
                          <span className="bg-blue-600/20 text-blue-600 border border-rose-500/40 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase">Ditolak</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditClick(item)} className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white transition-colors" title="Edit Laporan">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => onDeleteReport(item.id)} className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-rose-600 hover:text-slate-800 transition-colors" title="Hapus Laporan">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}


