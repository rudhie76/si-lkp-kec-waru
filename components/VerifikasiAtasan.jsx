'use client';

import { useState } from 'react';
import { ShieldCheck, Check, X, Eye, Clock, FileText, User, Calendar, AlertCircle } from 'lucide-react';
import { canValidate, getVisibleReports, isSuperiorUser } from '../lib/hierarchyHelper';


// Fallback for missing durasiJam

const formatTanggal = (dateVal) => {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal).substring(0, 10);
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const day = String(d.getDate()).padStart(2, '0');
    return `${days[d.getDay()]}, ${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch(e) {
    return String(dateVal).substring(0, 10);
  }
};

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
export default function VerifikasiAtasan({ 
  reports = [], 
  onUpdateStatus, 
  activeUser = null,
  users = []
}) {
  const [filterStatus, setFilterStatus] = useState('PENDING');
  const [selectedReport, setSelectedReport] = useState(null);
  const [catatanText, setCatatanText] = useState('');

  // RULE #7: Only filter reports from eligible subordinates (Excluding self for validation list)
  const visibleReports = getVisibleReports(activeUser, reports).filter(r => {
    const rId = String(r.pegawaiId || r.nip || '').replace(/\s+/g, '');
    const uId = String(activeUser?.id || activeUser?.nip || '').replace(/\s+/g, '');
    return rId !== uId; // Validation tab is for subordinates' reports
  });

  const filteredReports = visibleReports.filter(r => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  }).sort((a, b) => {
    const timeA = new Date(a.tanggal || 0).getTime();
    const timeB = new Date(b.tanggal || 0).getTime();
    if (timeA !== timeB) return timeB - timeA;
    return String(b.id || '').localeCompare(String(a.id || ''));
  });

  const validatedReportsList = visibleReports.filter(r => r.status === 'DIVALIDASI').sort((a, b) => {
    const timeA = new Date(a.tanggal || 0).getTime();
    const timeB = new Date(b.tanggal || 0).getTime();
    if (timeA !== timeB) return timeB - timeA;
    return String(b.id || '').localeCompare(String(a.id || ''));
  });

  const handleApprove = (report) => {
    const subObj = {
      id: report.pegawaiId || report.nip,
      nip: report.nip,
      name: report.namaPegawai,
      jabatan: report.jabatan
    };

    // RULE #6 Strict check
    if (!canValidate(activeUser, subObj)) {
      alert('Akses Ditolak: Bawahan tidak dapat memvalidasi atasan atau pejabat setingkat.');
      return;
    }

    onUpdateStatus(
      report.id, 
      'DIVALIDASI', 
      catatanText || 'Laporan telah disetujui & divalidasi oleh Atasan Langsung.', 
      activeUser?.name || 'Atasan Langsung'
    );
    setSelectedReport(null);
    setCatatanText('');
  };

  const handleReject = (report) => {
    if (!catatanText.trim()) {
      alert('Mohon isi alasan / catatan perbaikan jika menolak laporan.');
      return;
    }

    const subObj = {
      id: report.pegawaiId || report.nip,
      nip: report.nip,
      name: report.namaPegawai,
      jabatan: report.jabatan
    };

    // RULE #6 Strict check
    if (!canValidate(activeUser, subObj)) {
      alert('Akses Ditolak: Bawahan tidak dapat memvalidasi atasan atau pejabat setingkat.');
      return;
    }

    onUpdateStatus(
      report.id, 
      'DITOLAK', 
      catatanText, 
      activeUser?.name || 'Atasan Langsung'
    );
    setSelectedReport(null);
    setCatatanText('');
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <img src="/si-lkp-kec-waru/logo-ppu.png" alt="Logo PPU" className="w-10 h-12 object-contain drop-shadow" />
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-amber-700" />
              <span>Modul Validasi Atasan Langsung</span>
            </h1>
            <p className="text-xs text-blue-600/80">Peninjauan dan Pengesahan LKH Bawahan Berdasarkan Hirarki Struktural Kecamatan Waru</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-2 text-xs">
          {['PENDING', 'DIVALIDASI', 'DITOLAK', 'ALL'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-2 rounded-xl font-bold transition-all ${
                filterStatus === st
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white/90 text-slate-500 hover:text-slate-800 border border-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE REPORTS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <span>Daftar Laporan Masuk Bawahan Langsung ({filteredReports.length} Data)</span>
          </h2>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white shadow-sm border border-slate-200 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Nama Pegawai & NIP</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Rincian Kegiatan Kerja</th>
                <th className="py-3 px-4 text-center">Durasi Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Tindakan Validasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Tidak ada laporan kinerja bawahan yang memerlukan validasi saat ini.
                  </td>
                </tr>
              ) : (
                filteredReports.map(item => (
                  <tr key={item.id} className="hover:bg-slate-100/30 transition-colors">
                    
                    {/* Pegawai */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-blue-600">{item.namaPegawai}</div>
                      <div className="text-[11px] text-slate-500 font-mono">NIP. {item.nip}</div>
                      <div className="text-[10px] text-slate-400">{item.jabatan}</div>
                    </td>

                    {/* Tanggal */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-blue-600">{formatTanggal(item.tanggal)}</div>
                      {item.detailKegiatan && item.detailKegiatan[0] && (
                        <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                          <Clock className="w-3 h-3 inline-block mr-1 opacity-70" />
                          {item.detailKegiatan[0].jamMulai} - {item.detailKegiatan[0].jamSelesai}
                        </div>
                      )}
                    </td>

                    {/* Rincian Kegiatan */}
                    <td className="py-3.5 px-4 max-w-md">
                      {item.detailKegiatan && Array.isArray(item.detailKegiatan) ? (
                        <ul className="list-disc list-inside space-y-1 text-slate-600">
                          {item.detailKegiatan.map((k, idx) => (
                            <li key={idx}>
                              <span className="font-semibold text-blue-600">[{k.kategori}]</span> {k.deskripsi} ({k.volume} {k.satuan})
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span>{item.deskripsi}</span>
                      )}
                    </td>

                    {/* Durasi */}
                    <td className="py-3.5 px-4 text-center font-mono text-amber-700 font-bold whitespace-nowrap">
                      {getDurasiFallback(item)} Jam
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.status === 'DIVALIDASI' && (
                        <span className="bg-blue-600/20 text-blue-600 border border-blue-600/40 px-2.5 py-1 rounded-full font-bold">
                          ✓ DIVALIDASI
                        </span>
                      )}
                      {item.status === 'PENDING' && (
                        <span className="bg-amber-500/20 text-amber-700 border border-amber-500/40 px-2.5 py-1 rounded-full font-bold animate-pulse">
                          ⏳ PENDING
                        </span>
                      )}
                      {item.status === 'DITOLAK' && (
                        <span className="bg-blue-600/20 text-blue-600 border border-rose-500/40 px-2.5 py-1 rounded-full font-bold">
                          ✕ DITOLAK
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => { setSelectedReport(item); setCatatanText(item.catatanAtasan || ''); }}
                          className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-600 border border-blue-600/40 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail & Validasi</span>
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL & VALIDASI MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 max-w-2xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <img src="/si-lkp-kec-waru/logo-ppu.png" alt="Logo PPU" className="w-8 h-10 object-contain" />
                <div>
                  <h3 className="text-base font-bold text-slate-800">Detail Laporan Kinerja ASN</h3>
                  <p className="text-xs text-blue-600">Pemeriksaan Bukti & Penilaian Atasan Langsung</p>
                </div>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-slate-500 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Identitas ASN */}
            <div className="bg-white shadow-sm border border-slate-200 border border-slate-200 p-4 rounded-2xl grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Nama Pegawai:</span>
                <span className="font-bold text-slate-800 text-sm">{selectedReport.namaPegawai}</span>
              </div>
              <div>
                <span className="text-slate-500 block">NIP:</span>
                <span className="font-mono text-blue-600 font-bold">{selectedReport.nip}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Jabatan:</span>
                <span className="text-slate-700">{selectedReport.jabatan || 'ASN'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Tanggal Laporan:</span>
                <span className="text-amber-700 font-bold">{selectedReport.tanggal}</span>
              </div>
            </div>

            {/* Rincian Kegiatan List & Foto Dokumentasi */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Rincian Kegiatan Kerja:</h4>
              
              {selectedReport.detailKegiatan && Array.isArray(selectedReport.detailKegiatan) ? (
                selectedReport.detailKegiatan.map((keg, idx) => (
                  <div key={idx} className="bg-white/90 border border-slate-200 p-3 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-600">[{keg.kategori}] Waktu: {keg.jamMulai} - {keg.jamSelesai}</span>
                      <span className="text-slate-500 font-bold">{keg.volume} {keg.satuan}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{keg.deskripsi}</p>
                    
                    {(keg.fotoUrl || keg.fotoUrl2) && (
                      <div className="pt-2">
                        <span className="text-[10px] text-slate-500 block mb-1">Foto Dokumentasi Kegiatan:</span>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {keg.fotoUrl && (
                            <a href={keg.fotoUrl} target="_blank" rel="noopener noreferrer"><img src={keg.fotoUrl} alt="Dokumentasi 1" className="h-32 rounded-xl border border-slate-200 object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/%3E%3Cpolyline points='14 2 14 8 20 8'/%3E%3Cpath d='M16 13H8'/%3E%3Cpath d='M16 17H8'/%3E%3Cpath d='M10 9H8'/%3E%3C/svg%3E"; }} /></a>
                          )}
                          {keg.fotoUrl2 && (
                            <a href={keg.fotoUrl2} target="_blank" rel="noopener noreferrer"><img src={keg.fotoUrl2} alt="Dokumentasi 2" className="h-32 rounded-xl border border-slate-200 object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/%3E%3Cpolyline points='14 2 14 8 20 8'/%3E%3Cpath d='M16 13H8'/%3E%3Cpath d='M16 17H8'/%3E%3Cpath d='M10 9H8'/%3E%3C/svg%3E"; }} /></a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-white/90 border border-slate-200 p-3 rounded-xl">
                  <p className="text-slate-700 whitespace-pre-wrap">{selectedReport.deskripsi}</p>
                  
                  {(selectedReport.lampiranUrl || selectedReport.fotoUrl2) && (
                    <div className="pt-2 mt-2">
                      <span className="text-[10px] text-slate-500 block mb-1">Foto Dokumentasi Kegiatan:</span>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {selectedReport.lampiranUrl && (
                          <a href={selectedReport.lampiranUrl} target="_blank" rel="noopener noreferrer"><img src={selectedReport.lampiranUrl} alt="Dokumentasi 1" className="h-32 rounded-xl border border-slate-200 object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/%3E%3Cpolyline points='14 2 14 8 20 8'/%3E%3Cpath d='M16 13H8'/%3E%3Cpath d='M16 17H8'/%3E%3Cpath d='M10 9H8'/%3E%3C/svg%3E"; }} /></a>
                        )}
                        {selectedReport.fotoUrl2 && (
                          <a href={selectedReport.fotoUrl2} target="_blank" rel="noopener noreferrer"><img src={selectedReport.fotoUrl2} alt="Dokumentasi 2" className="h-32 rounded-xl border border-slate-200 object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/%3E%3Cpolyline points='14 2 14 8 20 8'/%3E%3Cpath d='M16 13H8'/%3E%3Cpath d='M16 17H8'/%3E%3Cpath d='M10 9H8'/%3E%3C/svg%3E"; }} /></a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Catatan Atasan Input */}
            <div className="space-y-2 text-xs">
              <label className="block text-slate-600 font-semibold">Catatan / Reviu Atasan Langsung:</label>
              <textarea
                rows={2}
                placeholder="Tuliskan catatan apresiasi atau perbaikan jika menolak..."
                value={catatanText}
                onChange={(e) => setCatatanText(e.target.value)}
                className="w-full bg-white border border-slate-200/60 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => handleReject(selectedReport)}
                className="bg-rose-600 hover:bg-blue-600 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1.5"
              >
                <X className="w-4 h-4" />
                <span>Tolak Laporan (Beri Catatan)</span>
              </button>

              <button
                type="button"
                onClick={() => handleApprove(selectedReport)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Setujui (DIVALIDASI)</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
