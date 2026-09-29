'use client';

import { useState, useRef, useMemo } from 'react';
import { 
  User, Camera, Save, CheckCircle, Lock, Mail, Phone, 
  Building, Award, ShieldCheck, KeyRound, Image as ImageIcon, Trash2, Edit3, X, EyeOff, Eye
} from 'lucide-react';
import { hashPasswordSHA256 } from '../lib/googleSheets';

export default function ProfilSaya({ currentUser, onUpdateProfile, users = [] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* SUCCESS NOTIFICATION */}
      {isSuccess && (
        <div className="bg-blue-600/20 border border-blue-600/40 text-blue-600 p-4 rounded-xl flex items-center space-x-3 text-xs shadow-lg">
          <CheckCircle className="w-5 h-5 flex-shrink-0 text-blue-600" />
          <div>
            <span className="font-bold block">Profil & Foto Berhasil Perbarui!</span>
            <span>Data profil Anda telah tersimpan dan terhubung ke database.</span>
          </div>
        </div>
      )}

      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-olive-900 via-olive-800 to-olive-950 border border-slate-200 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8 text-center md:text-left relative overflow-hidden">
        
        {/* Abstract Background Design */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative group flex-shrink-0">
          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-blue-600 bg-white flex items-center justify-center shadow-xl shadow-emerald-900/50">
            {currentUser?.fotoProfil ? (
              <img src={currentUser.fotoProfil} alt="Foto Profil" className="w-full h-full object-cover" />
            ) : (
              <User className="w-20 h-20 text-blue-600/50" />
            )}
          </div>
        </div>

        <div className="flex-1 space-y-3 z-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-wide">{currentUser?.name}</h1>
            <p className="text-sm text-blue-600 font-mono font-bold mt-1">NIP. {currentUser?.nip}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
            <div className="flex items-center space-x-2 md:justify-start justify-center">
              <Award className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="truncate">{currentUser?.jabatan || '-'}</span>
            </div>
            <div className="flex items-center space-x-2 md:justify-start justify-center">
              <Building className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="truncate">{currentUser?.unitKerja || '-'}</span>
            </div>
            <div className="flex items-center space-x-2 md:justify-start justify-center">
              <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span className="truncate">{currentUser?.peranStruktur || '-'}</span>
            </div>
            <div className="flex items-center space-x-2 md:justify-start justify-center">
              <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="truncate text-xs">Atasan: <strong className="text-slate-800">{currentUser?.atasanValidasi || '-'}</strong></span>
            </div>
          </div>

          <div className="pt-4 flex justify-center md:justify-start">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-600 text-white font-bold text-sm px-6 py-2.5 rounded-full transition-all shadow-lg shadow-emerald-900/50 flex items-center space-x-2 hover:scale-105"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profil Pegawai</span>
            </button>
          </div>
        </div>
      </div>

      {/* BIODATA LENGKAP - READ ONLY SECTION */}
      <div className="bg-gradient-to-b from-olive-900 to-olive-950 border border-slate-200 rounded-3xl p-8 shadow-xl">
        <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2 border-b border-slate-200 pb-4 mb-6">
          <User className="w-5 h-5 text-blue-600" />
          <span>Informasi Biodata Pegawai</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-1">
            <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Nama Lengkap & Gelar</span>
            <div className="font-semibold text-slate-800">{currentUser?.name || '-'}</div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">NIP Pegawai</span>
            <div className="font-mono font-semibold text-blue-600">{currentUser?.nip || '-'}</div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">No. WhatsApp (Aktif)</span>
            <div className="font-semibold text-slate-800 flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentUser?.noWa || '-'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Alamat Email</span>
            <div className="font-semibold text-slate-800 flex items-center space-x-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentUser?.email || '-'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Jabatan Pegawai</span>
            <div className="font-semibold text-slate-800">{currentUser?.jabatan || '-'}</div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Pangkat / Golongan</span>
            <div className="font-semibold text-slate-800">{currentUser?.pangkatGolongan || '-'}</div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Unit Kerja</span>
            <div className="font-semibold text-slate-800">{currentUser?.unitKerja || '-'}</div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Hak Akses Role (Sistem)</span>
            <div>
              <span className="px-3 py-1 rounded-full bg-blue-600/20 border border-blue-600/30 text-blue-600 text-xs font-bold">
                {currentUser?.role || '-'}
              </span>
            </div>
          </div>

          <div className="space-y-1 md:col-span-2">
            <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Peran Struktur & Validasi</span>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-1">
              <div className="font-bold text-slate-800 mb-2">{currentUser?.peranStruktur || '-'}</div>
              <div className="text-xs text-slate-500 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Atasan Penilai Langsung: <strong className="text-blue-600">{currentUser?.atasanValidasi || '-'}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <EditProfilModal 
          currentUser={currentUser} 
          onClose={() => setIsModalOpen(false)}
          onUpdate={(updatedData) => {
            onUpdateProfile(updatedData);
            setIsModalOpen(false);
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 3500);
          }}
          users={users}
        />
      )}

    </div>
  );
}

// ----------------------------------------
// MODAL DIALOG COMPONENT
// ----------------------------------------
function EditProfilModal({ currentUser, onClose, onUpdate, users }) {
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Parse Rangkap Jabatan from existing peranStruktur (if it exists)
  const existingPeran = currentUser?.peranStruktur || 'Staf Pelaksana / JFT / JFU (Divalidasi Kasubag / Kasi)';
  const [basePeran, rangkapString] = existingPeran.split(' | Rangkap: ');
  const initialRangkap = rangkapString ? rangkapString.split(', ') : [];

  const [formData, setFormData] = useState({
    id: currentUser?.id || '',
    name: currentUser?.name || '',
    nip: currentUser?.nip || '',
    noWa: currentUser?.noWa || '',
    email: currentUser?.email || '',
    jabatan: currentUser?.jabatan || '',
    pangkatGolongan: currentUser?.pangkatGolongan || '',
    unitKerja: currentUser?.unitKerja || '',
    peranStruktur: basePeran,
    atasanValidasi: currentUser?.atasanValidasi || '',
    role: currentUser?.role || 'Pegawai',
    fotoProfil: currentUser?.fotoProfil || '',
    newPassword: '',
    rangkapJabatan: initialRangkap
  });

  // Dynamically extract possible superiors from users array
  const superiorList = useMemo(() => {
    // Only Camat, Sekcam, Kasi, Kasubag can be validators
    return users.filter(u => {
      const p = u.peranStruktur || '';
      return p.includes('Camat') || p.includes('Sekcam') || p.includes('Kasi') || p.includes('Kasubag');
    }).map(u => `${u.name} (${u.jabatan || 'Atasan'})`);
  }, [users]);

  // Helper to compress and resize images
  const compressProfileImage = (file, maxWidth = 400, maxHeight = 400, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = (err) => reject(err);
        img.src = event.target.result;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const compressed = await compressProfileImage(file, 400, 400, 0.8);
      setFormData(prev => ({ ...prev, fotoProfil: compressed }));
    } catch (err) {
      console.error('Image compression error:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, fotoProfil: reader.result }));
      };
      reader.readAsDataURL(file);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRangkapChange = (e) => {
    const { value, checked } = e.target;
    let newRangkap = [...formData.rangkapJabatan];
    if (checked) {
      newRangkap.push(value);
    } else {
      newRangkap = newRangkap.filter(item => item !== value);
    }
    setFormData({ ...formData, rangkapJabatan: newRangkap });
  };

  const handlePeranChange = (e) => {
    setFormData({ 
      ...formData, 
      peranStruktur: e.target.value,
      rangkapJabatan: [] // reset rangkap when base role changes
    });
  };

  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let updatedUser = { ...formData };
    
    // Process Final Peran Struktur
    if (formData.rangkapJabatan.length > 0) {
      updatedUser.peranStruktur = `${formData.peranStruktur} | Rangkap: ${formData.rangkapJabatan.join(', ')}`;
    }

    // Determine Role
    const isSuperior = !formData.peranStruktur.includes('Staf') || formData.rangkapJabatan.length > 0;
    if (currentUser?.role !== 'Admin') { // Admin remains Admin
      updatedUser.role = isSuperior ? 'Atasan Langsung' : 'ASN / Staf';
    }

    if (formData.newPassword) {
      const pwdHash = await hashPasswordSHA256(formData.newPassword);
      updatedUser.passwordHash = pwdHash;
    }

    delete updatedUser.newPassword;
    delete updatedUser.rangkapJabatan;

    onUpdate(updatedUser);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-gradient-to-b from-olive-900 to-olive-950 border border-slate-200/60 rounded-3xl w-full max-w-3xl shadow-2xl relative my-auto">
        
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">Edit Profil Pegawai</h2>
            <p className="text-[11px] text-blue-600 mt-1">Pembaruan biodata, pangkat, jabatan, dan peran struktural Anda.</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 bg-white hover:bg-blue-600/20 p-2 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSaveSubmit} className="p-6 space-y-6">
          
          {/* FOTO PROFIL SECTION */}
          <div className="flex flex-col items-center justify-center -mt-2">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-slate-200 bg-white flex items-center justify-center shadow-xl">
                {formData.fotoProfil ? (
                  <img src={formData.fotoProfil} alt="Foto Profil" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-slate-400" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2.5 bg-rose-600 hover:bg-blue-600 text-slate-800 rounded-full border-2 border-slate-300 shadow-lg transition-transform hover:scale-110"
                title="Unggah Foto Profil Baru"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
          </div>

          {/* FORM GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            
            <div>
              <label className="block text-slate-600 font-bold mb-1.5 uppercase tracking-wide text-[10px]">Nama Lengkap (Dengan Gelar)</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white border border-slate-200 border border-slate-200/60 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1.5 uppercase tracking-wide text-[10px]">NIP (Nomor Induk Pegawai)</label>
              <input
                type="text"
                required
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                className="w-full bg-white border border-slate-200 border border-slate-200/60 rounded-xl px-4 py-2.5 text-blue-600 font-mono focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1.5 uppercase tracking-wide text-[10px]">NO. WHATSAPP (AKTIF)</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={formData.noWa}
                  onChange={(e) => setFormData({ ...formData, noWa: e.target.value })}
                  className="w-full bg-white border border-slate-200 border border-slate-200/60 rounded-xl pl-9 pr-4 py-2.5 text-slate-800 focus:outline-none focus:border-blue-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1.5 uppercase tracking-wide text-[10px]">ALAMAT EMAIL (GOOGLE DRIVE)</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white border border-slate-200 border border-slate-200/60 rounded-xl pl-9 pr-4 py-2.5 text-slate-800 focus:outline-none focus:border-blue-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1.5 uppercase tracking-wide text-[10px]">JABATAN PEGAWAI</label>
              <input
                type="text"
                required
                value={formData.jabatan}
                onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                className="w-full bg-white border border-slate-200 border border-slate-200/60 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1.5 uppercase tracking-wide text-[10px]">UNIT KERJA</label>
              <input
                type="text"
                required
                value={formData.unitKerja}
                onChange={(e) => setFormData({ ...formData, unitKerja: e.target.value })}
                className="w-full bg-white border border-slate-200 border border-slate-200/60 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1.5 uppercase tracking-wide text-[10px]">PANGKAT / GOLONGAN</label>
              <select
                value={formData.pangkatGolongan}
                onChange={(e) => setFormData({ ...formData, pangkatGolongan: e.target.value })}
                className="w-full bg-white border border-slate-200 border border-slate-200/60 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-blue-600 transition-colors cursor-pointer"
              >
                <option value="">-- Pilih Pangkat/Golongan --</option>
                <option value="Pengatur Muda / IIa">Pengatur Muda / IIa</option>
                <option value="Pengatur Muda Tk.I / IIb">Pengatur Muda Tk.I / IIb</option>
                <option value="Pengatur / IIc">Pengatur / IIc</option>
                <option value="Pengatur Tk.I / IId">Pengatur Tk.I / IId</option>
                <option value="Penata Muda / IIIa">Penata Muda / IIIa</option>
                <option value="Penata Muda Tk.I / IIIb">Penata Muda Tk.I / IIIb</option>
                <option value="Penata / IIIc">Penata / IIIc</option>
                <option value="Penata Tk.I / IIId">Penata Tk.I / IIId</option>
                <option value="Pembina / IVa">Pembina / IVa</option>
                <option value="Pembina Tk.I / IVb">Pembina Tk.I / IVb</option>
                <option value="Tenaga Honorer / THL">Tenaga Honorer / THL</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1.5 uppercase tracking-wide text-[10px]">PERAN STRUKTUR UTAMA</label>
              <select
                value={formData.peranStruktur}
                onChange={handlePeranChange}
                className="w-full bg-white border border-slate-200 border border-slate-200/60 rounded-xl px-4 py-2.5 text-blue-600 font-bold focus:outline-none focus:border-blue-600 transition-colors cursor-pointer"
              >
                <option value="Staf Pelaksana / JFT / JFU (Divalidasi Kasubag / Kasi)">Staf Pelaksana / JFT / JFU (Divalidasi Kasubag / Kasi)</option>
                <option value="Kepala Sub Bagian / Kasubag (Divalidasi Sekcam)">Kepala Sub Bagian / Kasubag (Divalidasi Sekcam)</option>
                <option value="Kepala Seksi / Kasi (Divalidasi Camat)">Kepala Seksi / Kasi (Divalidasi Camat)</option>
                <option value="Sekretaris Kecamatan / Sekcam (Divalidasi Camat)">Sekretaris Kecamatan / Sekcam (Divalidasi Camat)</option>
                <option value="Camat (Tanpa Atasan Validasi)">Camat (Tanpa Atasan Validasi)</option>
              </select>
            </div>

          </div>

          {/* RANGKAP JABATAN CHECKBOX AREA */}
          {!formData.peranStruktur.includes('Camat (Tanpa Atasan Validasi)') && (
            <div className="bg-white/60 border border-slate-300 rounded-2xl p-4">
              <h3 className="text-slate-700 font-bold text-[10px] uppercase tracking-widest mb-1">RANGKAP JABATAN / PERAN TAMBAHAN (OPSIONAL)</h3>
              <p className="text-[10px] text-slate-500 mb-3 leading-tight">Centang peran di bawah jika Anda memegang jabatan ganda, agar pegawai di bawah peran tersebut dapat memilih Anda sebagai atasan validasi mereka.</p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                
                {formData.peranStruktur.includes('Staf Pelaksana') && (
                  <>
                    <label className="flex items-center space-x-2 text-slate-600 cursor-pointer text-xs font-medium hover:text-blue-600 transition-colors">
                      <input type="checkbox" className="w-4 h-4 rounded bg-slate-100 border-slate-200 text-blue-600 focus:ring-blue-600 focus:ring-offset-white" value="Kasi (Validator Staf)" checked={formData.rangkapJabatan.includes("Kasi (Validator Staf)")} onChange={handleRangkapChange} />
                      <span>Kasi (Validator Staf)</span>
                    </label>
                    <label className="flex items-center space-x-2 text-slate-600 cursor-pointer text-xs font-medium hover:text-blue-600 transition-colors">
                      <input type="checkbox" className="w-4 h-4 rounded bg-slate-100 border-slate-200 text-blue-600 focus:ring-blue-600 focus:ring-offset-white" value="Kasubag (Validator Staf)" checked={formData.rangkapJabatan.includes("Kasubag (Validator Staf)")} onChange={handleRangkapChange} />
                      <span>Kasubag (Validator Staf)</span>
                    </label>
                  </>
                )}

                {formData.peranStruktur.includes('Kasubag') && (
                  <>
                    <label className="flex items-center space-x-2 text-slate-600 cursor-pointer text-xs font-medium hover:text-blue-600 transition-colors">
                      <input type="checkbox" className="w-4 h-4 rounded bg-slate-100 border-slate-200 text-blue-600 focus:ring-blue-600 focus:ring-offset-white" value="Sekcam (Validator Kasubag)" checked={formData.rangkapJabatan.includes("Sekcam (Validator Kasubag)")} onChange={handleRangkapChange} />
                      <span>Sekcam (Validator Kasubag)</span>
                    </label>
                    <label className="flex items-center space-x-2 text-slate-600 cursor-pointer text-xs font-medium hover:text-blue-600 transition-colors">
                      <input type="checkbox" className="w-4 h-4 rounded bg-slate-100 border-slate-200 text-blue-600 focus:ring-blue-600 focus:ring-offset-white" value="Kasi (Validator Staf)" checked={formData.rangkapJabatan.includes("Kasi (Validator Staf)")} onChange={handleRangkapChange} />
                      <span>Kasi (Validator Staf)</span>
                    </label>
                  </>
                )}

                {formData.peranStruktur.includes('Kepala Seksi') && (
                  <>
                    <label className="flex items-center space-x-2 text-slate-600 cursor-pointer text-xs font-medium hover:text-blue-600 transition-colors">
                      <input type="checkbox" className="w-4 h-4 rounded bg-slate-100 border-slate-200 text-blue-600 focus:ring-blue-600 focus:ring-offset-white" value="Sekcam (Validator Kasubag)" checked={formData.rangkapJabatan.includes("Sekcam (Validator Kasubag)")} onChange={handleRangkapChange} />
                      <span>Sekcam (Validator Kasubag)</span>
                    </label>
                    <label className="flex items-center space-x-2 text-slate-600 cursor-pointer text-xs font-medium hover:text-blue-600 transition-colors">
                      <input type="checkbox" className="w-4 h-4 rounded bg-slate-100 border-slate-200 text-blue-600 focus:ring-blue-600 focus:ring-offset-white" value="Kasubag (Validator Staf)" checked={formData.rangkapJabatan.includes("Kasubag (Validator Staf)")} onChange={handleRangkapChange} />
                      <span>Kasubag (Validator Staf)</span>
                    </label>
                  </>
                )}

                {formData.peranStruktur.includes('Sekretaris Kecamatan') && (
                  <>
                    <label className="flex items-center space-x-2 text-slate-600 cursor-pointer text-xs font-medium hover:text-blue-600 transition-colors">
                      <input type="checkbox" className="w-4 h-4 rounded bg-slate-100 border-slate-200 text-blue-600 focus:ring-blue-600 focus:ring-offset-white" value="Kasi (Validator Staf)" checked={formData.rangkapJabatan.includes("Kasi (Validator Staf)")} onChange={handleRangkapChange} />
                      <span>Kasi (Validator Staf)</span>
                    </label>
                    <label className="flex items-center space-x-2 text-slate-600 cursor-pointer text-xs font-medium hover:text-blue-600 transition-colors">
                      <input type="checkbox" className="w-4 h-4 rounded bg-slate-100 border-slate-200 text-blue-600 focus:ring-blue-600 focus:ring-offset-white" value="Kasubag (Validator Staf)" checked={formData.rangkapJabatan.includes("Kasubag (Validator Staf)")} onChange={handleRangkapChange} />
                      <span>Kasubag (Validator Staf)</span>
                    </label>
                  </>
                )}

              </div>
            </div>
          )}

          {/* ATASAN PENILAI LANGSUNG */}
          <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-2xl p-4">
            <h3 className="text-blue-600 font-bold text-[10px] uppercase tracking-widest mb-1">ATASAN PENILAI LANGSUNG (VALIDATOR LKH)</h3>
            <p className="text-[10px] text-slate-500 mb-3 leading-tight">Pilih Pegawai yang berwenang memeriksa dan menyetujui Laporan Kerja Harian (LKH) Anda.</p>
            
            <select
              value={formData.atasanValidasi}
              onChange={(e) => setFormData({ ...formData, atasanValidasi: e.target.value })}
              className="w-full bg-white border border-slate-200 border border-slate-200/60 rounded-xl px-4 py-3 text-slate-800 font-semibold focus:outline-none focus:border-blue-600 transition-colors cursor-pointer text-sm"
            >
              <option value="">-- Pilih Atasan Penilai --</option>
              {superiorList.map((sup, idx) => (
                <option key={idx} value={sup}>{sup}</option>
              ))}
              {/* Fallback Option in case superior list is empty */}
              {superiorList.length === 0 && (
                <option value="Rudiansyah, SE (Plt. Sekcam/Kasi. PM)">Rudiansyah, SE (Plt. Sekcam/Kasi. PM)</option>
              )}
              {superiorList.length === 0 && (
                <option value="Ahmad Fauzi, S.STP (Camat Waru)">Ahmad Fauzi, S.STP (Camat Waru)</option>
              )}
            </select>
          </div>

          {/* KATA SANDI AKUN */}
          <div>
             <label className="block text-slate-600 font-bold mb-1.5 uppercase tracking-wide text-[10px]">KATA SANDI AKUN (KOSONGKAN JIKA TIDAK DIUBAH)</label>
             <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan kata sandi baru..."
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="w-full bg-white border border-slate-200 border border-slate-200/60 rounded-xl pl-9 pr-10 py-2.5 text-slate-800 focus:outline-none focus:border-blue-600 transition-colors text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
             </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-600 text-white text-xs font-bold shadow-lg shadow-emerald-900/50 flex items-center space-x-2 transition-transform hover:scale-105"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
