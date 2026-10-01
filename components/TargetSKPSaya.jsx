'use client';

import { useState } from 'react';
import { Target, Plus, Edit2, Trash2, Save, X, Briefcase, FileText } from 'lucide-react';

export default function TargetSKPSaya({ activeUser, skpTargets, setSkpTargets }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  const [formData, setFormData] = useState({
    rencanaHasil: '',
    indikator: '',
    targetTahun: '',
    satuan: 'Dokumen',
    waktuBulan: '12'
  });

  // Filter only my targets
  const safeSkpTargets = Array.isArray(skpTargets) ? skpTargets : [];
  const myTargets = safeSkpTargets.filter(skp => skp?.pegawaiId === activeUser?.id);

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
    setFormData({
      rencanaHasil: skp.rencanaHasil,
      indikator: skp.indikator,
      targetTahun: skp.targetTahun,
      satuan: skp.satuan,
      waktuBulan: skp.waktuBulan
    });
    setCurrentId(skp.id);
    setIsEditing(true);
  };

  const handleDelete = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus target SKP ini?')) {
      setSkpTargets(prev => prev.filter(skp => skp.id !== id));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.rencanaHasil || !formData.targetTahun) {
      alert('Mohon isi Rencana Hasil Kerja dan Target Tahunan!');
      return;
    }

    if (currentId) {
      // Update
      setSkpTargets(prev => prev.map(skp => skp.id === currentId ? { ...skp, ...formData } : skp));
    } else {
      // Add
      const newSkp = {
        id: `SKP-${Date.now()}`,
        pegawaiId: activeUser.id,
        ...formData
      };
      setSkpTargets(prev => [...prev, newSkp]);
    }
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Target className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Target className="w-6 h-6" /> Target SKP Tahunan Saya
          </h2>
          <p className="text-blue-100 opacity-90 max-w-2xl">
            Masukkan daftar Rencana Hasil Kerja (SKP) Bapak/Ibu untuk tahun ini. Data ini akan muncul saat Anda mengisi Laporan Kinerja Harian untuk memudahkan penyusunan realisasi dan pengumpulan bukti dukung.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Input */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xl h-fit">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
            {isEditing ? <Edit2 className="w-5 h-5 text-amber-500" /> : <Plus className="w-5 h-5 text-blue-600" />}
            {isEditing ? 'Edit Target SKP' : 'Tambah Target SKP Baru'}
          </h3>
          
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

            <div className="grid grid-cols-2 gap-4">
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  value={formData.satuan}
                  onChange={e => setFormData({...formData, satuan: e.target.value})}
                >
                  <option value="Dokumen">Dokumen</option>
                  <option value="Laporan">Laporan</option>
                  <option value="Surat">Surat</option>
                  <option value="Berkas">Berkas</option>
                  <option value="Folder">Folder</option>
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

            <div className="pt-4 flex gap-3">
              <button 
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
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

        {/* List of Targets */}
        <div className="lg:col-span-2">
          {(!myTargets || myTargets.length === 0) ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200/60 shadow-xl text-center">
              <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-12 h-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Target SKP</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Anda belum memasukkan Rencana Hasil Kerja (SKP) tahunan. Silakan tambahkan melalui form di samping.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myTargets.map((skp, index) => (
                <div key={skp.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 leading-tight mb-1">{skp.rencanaHasil}</h4>
                    {skp.indikator && (
                      <p className="text-xs text-slate-500 mb-2 line-clamp-2">Indikator: {skp.indikator}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-amber-200/50">
                        <FileText className="w-3 h-3" /> Target: {skp.targetTahun} {skp.satuan}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-emerald-200/50">
                        <Briefcase className="w-3 h-3" /> Waktu: {skp.waktuBulan} Bulan
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0 mt-3 sm:mt-0 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-3">
                    <button 
                      onClick={() => handleEdit(skp)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(skp.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-colors"
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
    </div>
  );
}
