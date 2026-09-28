'use client';

import { useState } from 'react';
import { 
  LogIn, UserPlus, ShieldCheck, Lock, User, Award, Phone, Eye, EyeOff, CheckCircle, AlertCircle, Database 
} from 'lucide-react';
import { getGoogleSheetsUrl } from '../lib/googleSheets';

export default function AuthView({ users = [], onLoginSuccess, onRegisterUser, onOpenGSModal, isGSConnected }) {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);

  // Login State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [regData, setRegData] = useState({
    name: '',
    nip: '',
    noWa: '',
    email: '',
    jabatan: 'Staf Pelaksana',
    pangkatGolongan: 'Penata Muda / IIIa',
    unitKerja: 'Kecamatan Waru',
    peranStruktur: 'Staf Pelaksana / JFT / JFU',
    atasanValidasi: '',
    role: 'ASN / Staf',
    password: '',
    fotoProfil: '',
    showRangkapJabatan: false,
    rangkapJabatan: []
  });

  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState('');

  const handleRangkapChange = (e) => {
    const { value, checked } = e.target;
    let newRangkap = [...regData.rangkapJabatan];
    if (checked) {
      newRangkap.push(value);
    } else {
      newRangkap = newRangkap.filter(item => item !== value);
    }
    setRegData({ ...regData, rangkapJabatan: newRangkap });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRegData({ ...regData, fotoProfil: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Login
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    if (!loginIdentifier.trim()) {
      setLoginError('Mohon isi NIP atau Nama Lengkap.');
      setIsLoading(false);
      return;
    }

    const cleanInput = loginIdentifier.trim().toLowerCase().replace(/\s+/g, '');

    // Match Registered User
    const matchedUser = users.find(u => {
      const uNip = u.nip ? u.nip.toLowerCase().replace(/\s+/g, '') : '';
      const uName = u.name ? u.name.toLowerCase().replace(/\s+/g, '') : '';
      const uId = u.id ? String(u.id).toLowerCase().replace(/\s+/g, '') : '';
      return uNip === cleanInput || uName === cleanInput || uId === cleanInput;
    });

    if (matchedUser) {
      setIsLoading(false);
      onLoginSuccess(matchedUser);
      return;
    }

    setIsLoading(false);
    setLoginError('NIP atau Nama Lengkap tidak terdaftar dalam sistem. Silakan daftarkan akun pada tab Pendaftaran Pegawai.');
  };

  // Handle Register
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');

    if (!regData.name.trim() || !regData.nip.trim()) {
      setRegError('Nama Lengkap dan NIP wajib diisi.');
      return;
    }

    const exists = users.some(u => 
      u.nip && u.nip.replace(/\s+/g, '') === regData.nip.replace(/\s+/g, '')
    );

    if (exists) {
      setRegError('NIP ini sudah terdaftar dalam sistem.');
      return;
    }

    const isSuperior = !regData.peranStruktur.includes('Staf') || regData.rangkapJabatan.length > 0;
    const computedRole = isSuperior ? 'Atasan Langsung' : 'ASN / Staf';

    const finalPeran = regData.showRangkapJabatan && regData.rangkapJabatan.length > 0 
      ? `${regData.peranStruktur} | Rangkap: ${regData.rangkapJabatan.join(', ')}`
      : regData.peranStruktur;

    const newUser = {
      id: regData.nip.replace(/\s+/g, ''),
      name: regData.name.trim(),
      nip: regData.nip.trim(),
      noWa: regData.noWa.trim(),
      email: regData.email.trim(),
      passwordHash: regData.password,
      jabatan: regData.jabatan.trim() || 'ASN',
      pangkatGolongan: regData.pangkatGolongan.trim() || 'Penata Muda / IIIa',
      unitKerja: regData.unitKerja.trim() || 'Kecamatan Waru',
      peranStruktur: finalPeran,
      atasanValidasi: regData.atasanValidasi.trim(),
      role: computedRole,
      fotoProfil: regData.fotoProfil || ''
    };

    setIsLoading(true);
    if (onRegisterUser) {
      await onRegisterUser(newUser);
    }
    setIsLoading(false);

    setRegSuccess(true);
    setRegData({
      name: '',
      nip: '',
      noWa: '',
      email: '',
      jabatan: 'Staf Pelaksana',
      pangkatGolongan: 'Penata Muda / IIIa',
      unitKerja: 'Kecamatan Waru',
      peranStruktur: 'Staf Pelaksana / JFT / JFU',
      atasanValidasi: '',
      role: 'ASN / Staf',
      password: '',
      fotoProfil: '',
      showRangkapJabatan: false,
      rangkapJabatan: []
    });

    setTimeout(() => {
      setRegSuccess(false);
      setActiveTab('login');
      setLoginIdentifier(newUser.nip);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-emerald-600 selection:text-white">
      
      {/* BRANDING HEADER WITH OFFICIAL LOGO PPU */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="flex justify-center">
          <img 
            src="/si-lkp-kec-waru/logo-ppu.png" 
            alt="Logo Penajam Paser Utara" 
            className="w-20 h-24 object-contain drop-shadow-xl hover:scale-105 transition-transform" 
          />
        </div>
        
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-wide">
            Si-LKP Waru <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">v1.5</span>
          </h2>
          <p className="text-xs text-emerald-400 font-semibold tracking-wider uppercase mt-1">
            PEMERINTAH KABUPATEN PENAJAM PASER UTARA
          </p>
          <p className="text-xs text-zinc-400 mt-0.5">
            Portal Resmi Laporan Kinerja Harian ASN Kecamatan Waru
          </p>
        </div>

        {/* GOOGLE SHEETS SETUP BUTTON ON AUTH SCREEN */}
        {onOpenGSModal && users.length === 0 && (
          <div className="pt-1 flex justify-center">
            <button 
              type="button"
              onClick={onOpenGSModal}
              className="bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 px-3.5 py-1.5 rounded-2xl text-xs font-semibold flex items-center space-x-2 transition-all shadow-md"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>🔗 Pengaturan Database Google Sheets</span>
              {isGSConnected ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Google Sheets Terhubung" />
              ) : (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-md border border-amber-500/40">Belum Terhubung</span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* FORM CARD CONTAINER */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-gradient-to-b from-olive-900 via-olive-950 to-zinc-950 border border-olive-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/50 space-y-6">
          
          {/* TAB SWITCHER */}
          <div className="flex bg-zinc-900/90 p-1 rounded-2xl border border-olive-800/80">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setLoginError(''); setRegError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'login'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk (Login)</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('register'); setLoginError(''); setRegError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'register'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Pendaftaran Pegawai</span>
            </button>
          </div>

          {/* TAB 1: LOGIN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              
              {loginError && (
                <div className="bg-rose-500/10 border border-rose-500/40 text-rose-300 p-3 rounded-xl flex items-center space-x-2 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">NIP atau Nama Lengkap:</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    required
                    placeholder="Masukkan NIP atau Nama Lengkap"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full bg-zinc-900/90 border border-olive-700/60 rounded-xl pl-9 pr-3 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Kata Sandi (Password):</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-zinc-900/90 border border-olive-700/60 rounded-xl pl-9 pr-10 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-xs flex items-center justify-center space-x-2 mt-2"
              >
                {isLoading ? (
                  <span>Memproses Login...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Masuk ke Si-LKP Waru</span>
                  </>
                )}
              </button>

            </form>
          )}

          {/* TAB 2: REGISTER FORM */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              
              {regError && (
                <div className="bg-rose-500/10 border border-rose-500/40 text-rose-300 p-3 rounded-xl flex items-center space-x-2 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 p-3 rounded-xl flex items-center space-x-2 text-xs">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Pendaftaran Berhasil! Mengalihkan ke halaman login...</span>
                </div>
              )}

              {/* FOTO PROFIL UPLOAD */}
              <div className="flex flex-col items-center mb-6">
                <label className="relative cursor-pointer group">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-olive-700/60 bg-zinc-900/50 flex items-center justify-center overflow-hidden transition-all group-hover:border-emerald-500">
                    {regData.fotoProfil ? (
                      <img src={regData.fotoProfil} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-zinc-500 group-hover:text-emerald-500 transition-colors" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wide">Pilih Foto</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
                <span className="text-[10px] text-zinc-400 mt-2">Foto Profil (Opsional)</span>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Nama Lengkap & Gelar:</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Andi Hasmainti, S.IP."
                    value={regData.name}
                    onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                    className="w-full bg-zinc-900/90 border border-olive-700/60 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">NIP (Nomor Induk Pegawai):</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 19981212 201101 2 001"
                  value={regData.nip}
                  onChange={(e) => setRegData({ ...regData, nip: e.target.value })}
                  className="w-full bg-zinc-900/90 border border-olive-700/60 rounded-xl px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Nomor WhatsApp (Aktif):</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 08123456789"
                    value={regData.noWa}
                    onChange={(e) => setRegData({ ...regData, noWa: e.target.value })}
                    className="w-full bg-zinc-900/90 border border-olive-700/60 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Alamat Email (Akun Google Drive):</label>
                <input
                  type="email"
                  required
                  placeholder="Contoh: emailku@domain.com"
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  className="w-full bg-zinc-900/90 border border-olive-700/60 rounded-xl px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Jabatan Pegawai:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pengelola Pelayanan / Kasi / Sekcam / Camat"
                  value={regData.jabatan}
                  onChange={(e) => setRegData({ ...regData, jabatan: e.target.value })}
                  className="w-full bg-zinc-900/90 border border-olive-700/60 rounded-xl px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Pangkat / Golongan:</label>
                <input
                  type="text"
                  placeholder="Contoh: Penata Muda / IIIa, Pembina / IVa"
                  value={regData.pangkatGolongan}
                  onChange={(e) => setRegData({ ...regData, pangkatGolongan: e.target.value })}
                  className="w-full bg-zinc-900/90 border border-olive-700/60 rounded-xl px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Unit Kerja:</label>
                <input
                  type="text"
                  placeholder="Contoh: Kecamatan Waru"
                  value={regData.unitKerja}
                  onChange={(e) => setRegData({ ...regData, unitKerja: e.target.value })}
                  className="w-full bg-zinc-900/90 border border-olive-700/60 rounded-xl px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Peran Struktur (Hirarki Validasi LKH):</label>
                <select
                  value={regData.peranStruktur}
                  onChange={(e) => setRegData({ ...regData, peranStruktur: e.target.value, showRangkapJabatan: false, rangkapJabatan: [] })}
                  className="w-full bg-zinc-900/90 border border-olive-700/60 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 cursor-pointer font-medium"
                >
                  <option value="Staf Pelaksana / JFT / JFU">Staf Pelaksana / JFT / JFU</option>
                  <option value="Kepala Sub Bagian / Kasubag">Kepala Sub Bagian / Kasubag</option>
                  <option value="Kepala Seksi / Kasi">Kepala Seksi / Kasi</option>
                  <option value="Sekretaris Kecamatan / Sekcam">Sekretaris Kecamatan / Sekcam</option>
                  <option value="Camat (Tanpa Atasan Validasi)">Camat (Tanpa Atasan Validasi)</option>
                </select>

                {regData.peranStruktur !== 'Camat (Tanpa Atasan Validasi)' && (
                  <div className="mt-4 p-3 border border-olive-700/60 rounded-xl bg-zinc-900/50">
                    <label className="flex items-center space-x-2 cursor-pointer mb-2">
                      <input 
                        type="checkbox" 
                        checked={regData.showRangkapJabatan}
                        onChange={(e) => setRegData({...regData, showRangkapJabatan: e.target.checked, rangkapJabatan: []})}
                        className="form-checkbox text-emerald-500 rounded bg-zinc-800 border-olive-700 w-4 h-4"
                      />
                      <span className="text-zinc-300 font-bold text-[10px] uppercase tracking-wider">Rangkap Jabatan / Peran Tambahan (Opsional)</span>
                    </label>

                    {regData.showRangkapJabatan && (
                      <div className="pl-6 space-y-2 mt-2">
                        {regData.peranStruktur === 'Staf Pelaksana / JFT / JFU' && (
                          <>
                            <label className="flex items-center space-x-2 text-zinc-400 cursor-pointer text-xs">
                                <input type="checkbox" className="form-checkbox text-emerald-500 rounded bg-zinc-800" value="Kasi (Validator Staf)" checked={regData.rangkapJabatan.includes("Kasi (Validator Staf)")} onChange={handleRangkapChange} />
                                <span>Kasi (Validator Staf)</span>
                            </label>
                            <label className="flex items-center space-x-2 text-zinc-400 cursor-pointer text-xs">
                                <input type="checkbox" className="form-checkbox text-emerald-500 rounded bg-zinc-800" value="Kasubag (Validator Staf)" checked={regData.rangkapJabatan.includes("Kasubag (Validator Staf)")} onChange={handleRangkapChange} />
                                <span>Kasubag (Validator Staf)</span>
                            </label>
                          </>
                        )}
                        {regData.peranStruktur === 'Kepala Sub Bagian / Kasubag' && (
                          <>
                            <label className="flex items-center space-x-2 text-zinc-400 cursor-pointer text-xs">
                                <input type="checkbox" className="form-checkbox text-emerald-500 rounded bg-zinc-800" value="Sekcam (Validator Kasubag)" checked={regData.rangkapJabatan.includes("Sekcam (Validator Kasubag)")} onChange={handleRangkapChange} />
                                <span>Sekcam (Validator Kasubag)</span>
                            </label>
                            <label className="flex items-center space-x-2 text-zinc-400 cursor-pointer text-xs">
                                <input type="checkbox" className="form-checkbox text-emerald-500 rounded bg-zinc-800" value="Kasi (Validator Staf)" checked={regData.rangkapJabatan.includes("Kasi (Validator Staf)")} onChange={handleRangkapChange} />
                                <span>Kasi (Validator Staf)</span>
                            </label>
                          </>
                        )}
                        {regData.peranStruktur === 'Kepala Seksi / Kasi' && (
                          <>
                            <label className="flex items-center space-x-2 text-zinc-400 cursor-pointer text-xs">
                                <input type="checkbox" className="form-checkbox text-emerald-500 rounded bg-zinc-800" value="Sekcam (Validator Kasubag)" checked={regData.rangkapJabatan.includes("Sekcam (Validator Kasubag)")} onChange={handleRangkapChange} />
                                <span>Sekcam (Validator Kasubag)</span>
                            </label>
                            <label className="flex items-center space-x-2 text-zinc-400 cursor-pointer text-xs">
                                <input type="checkbox" className="form-checkbox text-emerald-500 rounded bg-zinc-800" value="Kasubag (Validator Staf)" checked={regData.rangkapJabatan.includes("Kasubag (Validator Staf)")} onChange={handleRangkapChange} />
                                <span>Kasubag (Validator Staf)</span>
                            </label>
                          </>
                        )}
                        {regData.peranStruktur === 'Sekretaris Kecamatan / Sekcam' && (
                          <>
                            <label className="flex items-center space-x-2 text-zinc-400 cursor-pointer text-xs">
                                <input type="checkbox" className="form-checkbox text-emerald-500 rounded bg-zinc-800" value="Kasi (Validator Staf)" checked={regData.rangkapJabatan.includes("Kasi (Validator Staf)")} onChange={handleRangkapChange} />
                                <span>Kasi (Validator Staf)</span>
                            </label>
                            <label className="flex items-center space-x-2 text-zinc-400 cursor-pointer text-xs">
                                <input type="checkbox" className="form-checkbox text-emerald-500 rounded bg-zinc-800" value="Kasubag (Validator Staf)" checked={regData.rangkapJabatan.includes("Kasubag (Validator Staf)")} onChange={handleRangkapChange} />
                                <span>Kasubag (Validator Staf)</span>
                            </label>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>




              {regData.peranStruktur !== 'Camat (Tanpa Atasan Validasi)' && (
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Atasan Langsung / Penilai:</label>
                  <select
                    value={regData.atasanValidasi}
                    onChange={(e) => setRegData({ ...regData, atasanValidasi: e.target.value })}
                    className="w-full bg-zinc-900/90 border border-olive-700/60 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    required
                  >
                    <option value="">-- Pilih Atasan Langsung --</option>
                    {users && users.length > 0 ? (
                      users.map((u, idx) => (
                        <option key={idx} value={u.name}>
                          {u.name} ({u.jabatan})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>Belum ada data pegawai/atasan terdaftar</option>
                    )}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Password:</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="password"
                    required
                    placeholder="Buat Password Akun"
                    value={regData.password}
                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                    className="w-full bg-zinc-900/90 border border-olive-700/60 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-xs flex items-center justify-center space-x-2 mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Daftarkan Akun Pegawai</span>
              </button>

            </form>
          )}

        </div>
      </div>

    </div>
  );
}
