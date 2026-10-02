'use client';

import { useState, useRef } from 'react';
import { 
  Target, Plus, Edit2, Trash2, Save, X, Briefcase, FileText, 
  Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw, TrendingUp 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { getGoogleSheetsUrl, pushToGoogleSheets } from '../lib/googleSheets';

export default function TargetSKPSaya({ activeUser = {}, skpTargets = [], setSkpTargets = () => {}, reports = [] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState('');
  const [expandedSkpId, setExpandedSkpId] = useState(null);
  
  // State for Import Preview Modal
  const [previewTargets, setPreviewTargets] = useState(null);
  const [importFileName, setImportFileName] = useState('');
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    rencanaHasil: '',
    indikator: '',
    targetTahun: '',
    satuan: 'Dokumen',
    waktuBulan: '12'
  });

  // Filter only my targets safely
  const safeSkpTargets = Array.isArray(skpTargets) ? skpTargets : [];
  const myTargets = safeSkpTargets.filter(skp => skp && activeUser && skp.pegawaiId === activeUser.id);

  // Sync to Google Sheets Helper
  const syncBatchToGoogleSheets = async (targetsList) => {
    const gsUrl = getGoogleSheetsUrl();
    if (!gsUrl || !activeUser?.id) return;
    
    setIsSyncing(true);
    setSyncNotice('Menyimpan ke Google Sheets...');
    try {
      await pushToGoogleSheets(gsUrl, 'saveSKPBatch', {
        pegawaiId: activeUser.id,
        nip: activeUser.nip || activeUser.id,
        namaPegawai: activeUser.name || '',
        targets: targetsList
      });
      setSyncNotice('Berhasil tersinkronisasi ke Google Sheets!');
      setTimeout(() => setSyncNotice(''), 3000);
    } catch (err) {
      console.error('Sync SKP error:', err);
      setSyncNotice('Tersimpan di perangkat lokal (Google Sheets offline)');
      setTimeout(() => setSyncNotice(''), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      rencanaHasil: '',
      indikator: '',
      targetTahun: '',
      satuan: 'Dokumen',
      waktuBulan: '12'
    });
    setCurrentId(null);
    setIsEditing(false);
  };

  const handleEdit = (skp) => {
    if (!skp) return;
    setFormData({
      rencanaHasil: skp.rencanaHasil || '',
      indikator: skp.indikator || '',
      targetTahun: skp.targetTahun || '',
      satuan: skp.satuan || 'Dokumen',
      waktuBulan: skp.waktuBulan || '12'
    });
    setCurrentId(skp.id);
    setIsEditing(true);
  };

  const handleDelete = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus target SKP ini?')) {
      const updatedAll = safeSkpTargets.filter(skp => skp.id !== id);
      setSkpTargets(updatedAll);
      const myNewTargets = updatedAll.filter(skp => skp.pegawaiId === activeUser.id);
      syncBatchToGoogleSheets(myNewTargets);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.rencanaHasil || !formData.targetTahun) {
      alert('Mohon isi Rencana Hasil Kerja dan Target Tahunan!');
      return;
    }

    let updatedAll = [];
    if (currentId) {
      // Update
      updatedAll = safeSkpTargets.map(skp => skp.id === currentId ? { ...skp, ...formData } : skp);
    } else {
      // Add
      const newSkp = {
        id: `SKP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        pegawaiId: activeUser?.id || '',
        ...formData
      };
      updatedAll = [...safeSkpTargets, newSkp];
    }

    setSkpTargets(updatedAll);
    const myNewTargets = updatedAll.filter(skp => skp.pegawaiId === activeUser?.id);
    syncBatchToGoogleSheets(myNewTargets);
    resetForm();
  };

  // 1. Download Standard Template Excel
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'No': 1,
        'Rencana Hasil Kerja': 'Terlaksananya verifikasi dan tanda tangan checklist pertanggungjawaban SPJ APBDes di wilayah kecamatan',
        'Indikator Kinerja Individu': 'Jumlah Folder checklist SPJ APBDes yang ditandatangani dan divalidasi',
        'Target Kuantitas': 75,
        'Satuan': 'Folder',
        'Waktu Pelaksanaan (Bulan)': 12
      },
      {
        'No': 2,
        'Rencana Hasil Kerja': 'Terbitnya Surat Rekomendasi Pencairan APBDes di wilayah kecamatan',
        'Indikator Kinerja Individu': 'Jumlah Surat Rekomendasi Pencairan APBDes yang diverifikasi',
        'Target Kuantitas': 75,
        'Satuan': 'Surat',
        'Waktu Pelaksanaan (Bulan)': 12
      },
      {
        'No': 3,
        'Rencana Hasil Kerja': 'Terlaksananya Tata Kelola Administrasi di Bidang Pemberdayaan Masyarakat',
        'Indikator Kinerja Individu': 'Mengonsep Surat Keluar dan Diproses sesuai dengan ketentuan yang berlaku',
        'Target Kuantitas': 60,
        'Satuan': 'Surat',
        'Waktu Pelaksanaan (Bulan)': 12
      },
      {
        'No': 4,
        'Rencana Hasil Kerja': 'Terlaksananya Proses Pengadaan Barang dan Jasa Di Kecamatan berjalan dengan lancar',
        'Indikator Kinerja Individu': 'Jumlah DPP Belanja Pengadaan Barang dan Jasa lewat E-Purchasing',
        'Target Kuantitas': 150,
        'Satuan': 'Dokumen',
        'Waktu Pelaksanaan (Bulan)': 12
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // Set column widths for readability
    ws['!cols'] = [
      { wch: 6 },
      { wch: 45 },
      { wch: 45 },
      { wch: 18 },
      { wch: 15 },
      { wch: 25 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_SKP');
    XLSX.writeFile(wb, 'Template_Target_SKP_SiLKP.xlsx');
  };

  // 2. Upload & Parse Excel/CSV
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Convert to array of objects
        const rawRows = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (rawRows.length === 0) {
          alert('File Excel kosong atau tidak memiliki data baris.');
          return;
        }

        // Smart Column Matching
        const parsed = [];
        rawRows.forEach((row, idx) => {
          const keys = Object.keys(row);
          
          let rencana = '';
          let indikator = '';
          let target = '';
          let satuan = 'Dokumen';
          let waktu = '12';

          keys.forEach(key => {
            const k = key.toLowerCase().trim();
            const val = String(row[key]).trim();

            if (k.includes('rencana') || k.includes('hasil kerja') || k.includes('rhk') || k.includes('kegiatan')) {
              if (val) rencana = val;
            } else if (k.includes('indikator') || k.includes('iki') || k.includes('aspek')) {
              if (val) indikator = val;
            } else if (k.includes('target') || k.includes('kuantitas') || k.includes('volume') || k.includes('vol')) {
              if (val) {
                // Parse number & satuan if combined (e.g., "75 Folder")
                const match = val.match(/^(\d+)\s*(.*)$/);
                if (match) {
                  target = match[1];
                  if (match[2] && match[2].trim()) satuan = match[2].trim();
                } else {
                  target = val;
                }
              }
            } else if (k.includes('satuan') || k.includes('output')) {
              if (val) satuan = val;
            } else if (k.includes('waktu') || k.includes('bulan') || k.includes('durasi')) {
              if (val) {
                const num = val.replace(/\D/g, '');
                waktu = num || '12';
              }
            }
          });

          // Fallback positional if header didn't match keyword
          if (!rencana && keys[1] && row[keys[1]]) rencana = String(row[keys[1]]).trim();
          if (!indikator && keys[2] && row[keys[2]]) indikator = String(row[keys[2]]).trim();
          if (!target && keys[3] && row[keys[3]]) target = String(row[keys[3]]).trim();

          if (rencana) {
            parsed.push({
              id: `SKP-${Date.now()}-${idx}`,
              pegawaiId: activeUser?.id || '',
              rencanaHasil: rencana,
              indikator: indikator,
              targetTahun: target || '1',
              satuan: satuan || 'Dokumen',
              waktuBulan: waktu || '12'
            });
          }
        });

        if (parsed.length === 0) {
          alert('Tidak dapat mendeteksi Rencana Hasil Kerja dari file ini. Pastikan kolom memiliki judul seperti "Rencana Hasil Kerja" atau gunakan Template Excel.');
          return;
        }

        setPreviewTargets(parsed);
      } catch (err) {
        console.error('Error parsing excel:', err);
        alert('Gagal membaca file Excel. Pastikan format file .xlsx, .xls, atau .csv valid.');
      }
    };

    reader.readAsBinaryString(file);
    // Reset file input so same file can be re-uploaded if desired
    e.target.value = null;
  };

  // 3. Confirm Import
  const handleConfirmImport = (mode = 'replace') => {
    if (!previewTargets || previewTargets.length === 0) return;

    let updatedAll = [];
    if (mode === 'replace') {
      // Replace existing targets of this user with the new ones
      const otherUsersTargets = safeSkpTargets.filter(skp => skp.pegawaiId !== activeUser.id);
      updatedAll = [...otherUsersTargets, ...previewTargets];
    } else {
      // Append to existing
      updatedAll = [...safeSkpTargets, ...previewTargets];
    }

    setSkpTargets(updatedAll);
    const myNewTargets = updatedAll.filter(skp => skp.pegawaiId === activeUser.id);
    syncBatchToGoogleSheets(myNewTargets);

    setPreviewTargets(null);
    setImportFileName('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Target className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Target className="w-6 h-6" /> Target SKP Tahunan Saya
              </h2>
              <p className="text-blue-100 opacity-90 max-w-2xl text-xs md:text-sm">
                Kelola daftar Rencana Hasil Kerja (SKP) tahunan Anda. Anda bisa mengetik manual, atau langsung mengunggah file Excel dari E-Kinerja agar semua target otomatis terinput ke Google Sheets.
              </p>
            </div>

            {/* Action Buttons: Template & Upload */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleDownloadTemplate}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm backdrop-blur-sm"
                title="Unduh contoh format Excel"
              >
                <Download className="w-4 h-4 text-emerald-300" />
                <span>Unduh Template Excel</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-900/20"
                title="Unggah file Excel SKP"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Excel E-Kinerja</span>
              </button>

              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xlsx, .xls, .csv"
                className="hidden" 
              />
            </div>
          </div>

          {/* Sync Status Badge */}
          {syncNotice && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-white animate-fade-in">
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{syncNotice}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Form & List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Input Manual */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xl h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              {isEditing ? <Edit2 className="w-5 h-5 text-amber-500" /> : <Plus className="w-5 h-5 text-blue-600" />}
              {isEditing ? 'Edit Target SKP' : 'Input Manual Target'}
            </h3>
            {isEditing && (
              <button 
                type="button" 
                onClick={resetForm} 
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
              >
                Batal
              </button>
            )}
          </div>
          
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Rencana Hasil Kerja</label>
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                rows="3"
                placeholder="Contoh: Terlaksananya monitoring dan evaluasi APBDes..."
                value={formData.rencanaHasil}
                onChange={e => setFormData({...formData, rencanaHasil: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Indikator Kinerja Individu</label>
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                rows="2"
                placeholder="Contoh: Laporan Hasil Monitoring dan Evaluasi..."
                value={formData.indikator}
                onChange={e => setFormData({...formData, indikator: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Target</label>
                <input 
                  type="number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  placeholder="Misal: 75"
                  value={formData.targetTahun}
                  onChange={e => setFormData({...formData, targetTahun: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Satuan</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
                  value={formData.satuan}
                  onChange={e => setFormData({...formData, satuan: e.target.value})}
                >
                  <option value="Dokumen">Dokumen</option>
                  <option value="Laporan">Laporan</option>
                  <option value="Surat">Surat</option>
                  <option value="Berkas">Berkas</option>
                  <option value="Folder">Folder</option>
                  <option value="Lembar">Lembar</option>
                  <option value="Kegiatan">Kegiatan</option>
                  <option value="Bulan">Bulan</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Waktu Pelaksanaan (Bulan)</label>
              <input 
                type="number"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                placeholder="12"
                value={formData.waktuBulan}
                onChange={e => setFormData({...formData, waktuBulan: e.target.value})}
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button 
                type="submit"
                disabled={isSyncing}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md shadow-blue-600/20 disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {isEditing ? 'Simpan Perubahan' : 'Simpan Target'}
              </button>
              {isEditing && (
                <button 
                  type="button"
                  onClick={resetForm}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 px-4 rounded-xl transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List of Current Targets */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              <span>Daftar Target SKP Saya ({myTargets.length})</span>
            </h3>
            {myTargets.length > 0 && (
              <span className="text-xs text-slate-400 font-medium">
                Otomatis muncul di form LKH
              </span>
            )}
          </div>

          {(!myTargets || myTargets.length === 0) ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200/60 shadow-xl text-center">
              <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Belum Ada Target SKP</h3>
              <p className="text-slate-500 text-xs md:text-sm max-w-md mx-auto mb-6">
                Anda belum memasukkan target tahunan. Anda bisa mengunggah file Excel dari E-Kinerja atau mengisi manual melalui form di sebelah kiri.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleDownloadTemplate}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" /> Template Excel
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md"
                >
                  <Upload className="w-4 h-4" /> Upload File Excel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {myTargets.map((skp, index) => (
                <div key={skp.id || index} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-shrink-0 w-11 h-11 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center font-black text-base border border-blue-100">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm leading-snug mb-1">{skp.rencanaHasil}</h4>
                    {skp.indikator && (
                      <p className="text-xs text-slate-500 mb-2 line-clamp-2">
                        <span className="font-semibold text-slate-600">Indikator:</span> {skp.indikator}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-2.5">
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-amber-200/60">
                        <FileText className="w-3 h-3 text-amber-600" /> Target: {skp.targetTahun} {skp.satuan}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-emerald-200/60">
                        <Briefcase className="w-3 h-3 text-emerald-600" /> Waktu: {skp.waktuBulan} Bulan
                      </span>
                    </div>

                    {/* REALISASI & PROGRES DARI LAPORAN HARIAN */}
                    {(() => {
                      const myReports = (reports || []).filter(r => 
                        (r.pegawaiId === activeUser?.id || r.nip === activeUser?.nip)
                      );
                      const linkedActivities = [];
                      myReports.forEach(r => {
                        (r.detailKegiatan || []).forEach(k => {
                          if (k.skpId === skp.id) {
                            linkedActivities.push({
                              tanggal: r.tanggal,
                              deskripsi: k.deskripsi,
                              volume: Number(k.volume) || 1,
                              satuan: k.satuan || skp.satuan,
                              status: r.status
                            });
                          }
                        });
                      });

                      const totalRealisasi = linkedActivities.reduce((acc, a) => acc + a.volume, 0);
                      const targetVal = Number(skp.targetTahun) || 1;
                      const pct = Math.min(100, Math.round((totalRealisasi / targetVal) * 100));
                      const isExpanded = expandedSkpId === skp.id;

                      return (
                        <div className="mt-2 pt-2 border-t border-slate-100">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-slate-700 flex items-center gap-1 text-[11px]">
                              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                              Realisasi Saat Ini: <strong className="text-blue-700">{totalRealisasi}</strong> / {skp.targetTahun} {skp.satuan}
                            </span>
                            <span className={`font-black text-[11px] ${pct >= 100 ? 'text-emerald-600' : pct > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                              {pct}%
                            </span>
                          </div>

                          {/* Progress Track */}
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                pct >= 100 ? 'bg-emerald-500' : pct > 50 ? 'bg-blue-600' : 'bg-amber-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>

                          {/* Toggle Link to View Connected Activities */}
                          <div className="mt-1.5 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setExpandedSkpId(isExpanded ? null : skp.id)}
                              className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>
                                {linkedActivities.length > 0 
                                  ? `${linkedActivities.length} Laporan Harian Terhubung ${isExpanded ? '▲' : '▼'}`
                                  : 'Belum ada inputan harian yang terhubung'
                                }
                              </span>
                            </button>
                          </div>

                          {/* List of Connected Daily Reports */}
                          {isExpanded && linkedActivities.length > 0 && (
                            <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs animate-in fade-in duration-150">
                              <div className="font-bold text-[9px] text-slate-500 uppercase tracking-wider">
                                Laporan Harian yang Menyumbang Target Ini:
                              </div>
                              <div className="divide-y divide-slate-200/60 max-h-36 overflow-y-auto pr-1">
                                {linkedActivities.map((act, aIdx) => (
                                  <div key={aIdx} className="py-1.5 flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <div className="font-semibold text-slate-800 text-[11px] truncate">{act.deskripsi}</div>
                                      <div className="text-[10px] text-slate-400">
                                        📅 {act.tanggal} • Output: <strong className="text-slate-600">{act.volume} {act.satuan}</strong>
                                      </div>
                                    </div>
                                    <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                                      act.status === 'DIVALIDASI' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                      {act.status || 'PENDING'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0 mt-3 sm:mt-0 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-3">
                    <button 
                      onClick={() => handleEdit(skp)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(skp.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* IMPORT PREVIEW MODAL */}
      {previewTargets && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Pratinjau Impor Target SKP</h3>
                  <p className="text-xs text-slate-500">
                    File: <span className="font-mono text-emerald-600 font-semibold">{importFileName}</span> • Terdeteksi {previewTargets.length} target
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setPreviewTargets(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content / Preview Table */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <p className="font-bold mb-0.5">Periksa Hasil Pembacaan File Excel:</p>
                  Sistem telah membaca target dari file Anda. Pastikan nama kegiatan dan jumlah target di bawah sudah sesuai sebelum disimpan ke sistem dan Google Sheets.
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3 w-12 text-center">No</th>
                      <th className="p-3">Rencana Hasil Kerja</th>
                      <th className="p-3">Indikator</th>
                      <th className="p-3 w-28">Target</th>
                      <th className="p-3 w-20">Waktu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {previewTargets.map((t, i) => (
                      <tr key={i} className="hover:bg-blue-50/40">
                        <td className="p-3 text-center font-bold text-slate-400">{i + 1}</td>
                        <td className="p-3 font-semibold text-slate-800">{t.rencanaHasil}</td>
                        <td className="p-3 text-slate-500">{t.indikator || '-'}</td>
                        <td className="p-3">
                          <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">
                            {t.targetTahun} {t.satuan}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-slate-600">{t.waktuBulan} Bln</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-medium">
                Pilih opsi penyimpanan:
              </span>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setPreviewTargets(null)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
                >
                  Batal
                </button>

                {myTargets.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleConfirmImport('append')}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all"
                  >
                    Tambahkan ke Target Lama
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleConfirmImport('replace')}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Gantikan & Simpan ({previewTargets.length} Target)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
