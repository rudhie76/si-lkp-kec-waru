'use client';

import { useState, useEffect } from 'react';
import { Target, LayoutDashboard, FilePlus, ShieldCheck, Printer, BarChart3, MessageSquare, 
  Database, Menu, X, User, CheckCircle, Clock, Calendar, RefreshCw, LogOut, Users, KeyRound, UserCheck 
} from 'lucide-react';

import DashboardView from '../components/DashboardView';
import InputKegiatan from '../components/InputKegiatan';
import VerifikasiAtasan from '../components/VerifikasiAtasan';
import CetakLKH from '../components/CetakLKH';
import RekapitulasiBulanan from '../components/RekapitulasiBulanan';
import PengingatWA from '../components/PengingatWA';
import GoogleSheetsModal from '../components/GoogleSheetsModal';
import AuthView from '../components/AuthView';
import ManajemenPegawai from '../components/ManajemenPegawai';
import ProfilSaya from '../components/ProfilSaya';
import TargetSKPSaya from '../components/TargetSKPSaya';

import { 
  getReportsFromLocal, saveReportsToLocal, getUsersFromLocal, saveUsersToLocal, 
  getAuthUserFromLocal, setAuthUserToLocal, getGoogleSheetsUrl, 
  fetchFromGoogleSheets, fetchUsersFromGoogleSheets, pushToGoogleSheets, clearReportsInLocal, INITIAL_PEGAWAI 
} from '../lib/googleSheets';
import { getVisibleReports } from '../lib/hierarchyHelper';

export default function Page() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState(INITIAL_PEGAWAI);
  const [currentUser, setCurrentUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isGSModalOpen, setIsGSModalOpen] = useState(false);
  const [isGSConnected, setIsGSConnected] = useState(false);
  const [witaTime, setWitaTime] = useState('');

  // Real-time WITA Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dayOptions = { timeZone: 'Asia/Makassar', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      const timeOptions = { timeZone: 'Asia/Makassar', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      
      const dateStr = now.toLocaleDateString('id-ID', dayOptions);
      const timeStr = now.toLocaleTimeString('id-ID', timeOptions).replace(/\./g, ':');
      
      setWitaTime(`📅 ${dateStr} | ⏱️ ${timeStr} WITA`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initial Data Load & Auth Session Check
  useEffect(() => {
    const localReports = getReportsFromLocal();
    setReports(localReports);

    const localUsers = getUsersFromLocal();
    setUsers(localUsers);

    const session = getAuthUserFromLocal();
    if (session) {
      setCurrentUser(session);
    }

    const gsUrl = getGoogleSheetsUrl();
    if (gsUrl) {
      setIsGSConnected(true);
      fetchFromGoogleSheets(gsUrl)
        .then(data => { 
          if (Array.isArray(data)) { 
            setReports(data); 
            saveReportsToLocal(data);
          } 
        })
        .catch(err => console.log('Auto-fetch GS failed:', err));

      fetchUsersFromGoogleSheets(gsUrl)
        .then(uData => { 
          if (Array.isArray(uData)) { 
            setUsers(uData); 
            saveUsersToLocal(uData);
            if (uData.length === 0) {
              setCurrentUser(null);
              setAuthUserToLocal(null);
            } else if (session) {
              const sessionNip = session.nip ? session.nip.replace(/\s+/g, '') : '';
              const stillExists = uData.some(u => 
                String(u.id) === String(session.id) ||
                (u.nip && u.nip.replace(/\s+/g, '') === sessionNip)
              );
              if (!stillExists) {
                setCurrentUser(null);
                setAuthUserToLocal(null);
              }
            }
          } 
        })
        .catch(err => console.log('Auto-fetch users failed:', err));
    }
  }, []);

  // Login Handler
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setAuthUserToLocal(user);
    setActiveTab('dashboard');
  };

  // Logout Handler
  const handleLogout = () => {
    setCurrentUser(null);
    setAuthUserToLocal(null);
  };

  // Update Profile Handler
  const handleUpdateProfile = (updatedProfile) => {
    setCurrentUser(updatedProfile);
    setAuthUserToLocal(updatedProfile);

    const exists = users.some(u => 
      String(u.id) === String(updatedProfile.id) ||
      (u.nip && updatedProfile.nip && u.nip.replace(/\s+/g, '') === updatedProfile.nip.replace(/\s+/g, ''))
    );

    const updatedUsersList = exists 
      ? users.map(u => (String(u.id) === String(updatedProfile.id) || (u.nip && updatedProfile.nip && u.nip.replace(/\s+/g, '') === updatedProfile.nip.replace(/\s+/g, ''))) ? updatedProfile : u)
      : [...users, updatedProfile];

    setUsers(updatedUsersList);
    saveUsersToLocal(updatedUsersList);

    const gsUrl = getGoogleSheetsUrl();
    if (gsUrl) pushToGoogleSheets(gsUrl, 'editUser', updatedProfile);
  };

  // Update Status Action
  const handleUpdateStatus = (id, newStatus, catatan, verifikator) => {
    const updated = reports.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: newStatus,
          catatanAtasan: catatan || r.catatanAtasan,
          diverifikasiOleh: verifikator || currentUser?.name || 'Admin Waru'
        };
      }
      return r;
    });

    setReports(updated);
    saveReportsToLocal(updated);

    const gsUrl = getGoogleSheetsUrl();
    if (gsUrl) {
      pushToGoogleSheets(gsUrl, 'updateStatus', { id, status: newStatus, catatanAtasan: catatan, diverifikasiOleh: verifikator });
    }
  };

  // Save New or Edit Report Action
  const handleSaveReport = async (newReport) => {
    const exists = reports.some(r => r.id === newReport.id);
    const updated = exists 
      ? reports.map(r => r.id === newReport.id ? newReport : r)
      : [newReport, ...reports];
      
    setReports(updated);
    saveReportsToLocal(updated);

    const gsUrl = getGoogleSheetsUrl();
    if (gsUrl) {
      try {
        if (exists) {
          // Solusi error Apps Script saat edit: Hapus baris lama, simpan baru
          await pushToGoogleSheets(gsUrl, 'deleteReport', { id: newReport.id });
          await new Promise(res => setTimeout(res, 500));
        }
        
        const res = await pushToGoogleSheets(gsUrl, 'saveReport', newReport);
        if (res && res.status === 'error') {
          alert('GAGAL SIMPAN KE DATABASE: ' + res.message);
        } else if (!res) {
          alert('GAGAL TERHUBUNG KE GOOGLE SHEETS! Pastikan URL Web App benar.');
        }
      } catch (err) {
        alert('ERROR KONEKSI DATABASE: ' + err.toString());
      }
    }
  };

  // Delete Report Action
  const handleDeleteReport = (reportId) => {
    const updated = reports.filter(r => r.id !== reportId);
    setReports(updated);
    saveReportsToLocal(updated);

    const gsUrl = getGoogleSheetsUrl();
    if (gsUrl) {
      pushToGoogleSheets(gsUrl, 'deleteReport', { id: reportId });
    }
  };

  // User CRUD Actions (Admin & Self Register)
  const handleAddUser = async (newUser) => {
    const updated = [...users, newUser];
    setUsers(updated);
    saveUsersToLocal(updated);

    const gsUrl = getGoogleSheetsUrl();
    if (gsUrl) {
      return await pushToGoogleSheets(gsUrl, 'saveUser', newUser);
    }
    return { status: 'success', message: 'Tersimpan lokal' };
  };

  const handleEditUser = async (editedUser) => {
    const updated = users.map(u => u.id === editedUser.id ? editedUser : u);
    setUsers(updated);
    saveUsersToLocal(updated);

    if (currentUser?.id === editedUser.id) {
      setCurrentUser(editedUser);
      setAuthUserToLocal(editedUser);
    }

    const gsUrl = getGoogleSheetsUrl();
    if (gsUrl) {
      return await pushToGoogleSheets(gsUrl, 'editUser', editedUser);
    }
    return { status: 'success', message: 'Tersimpan lokal' };
  };

  const handleDeleteUser = async (userId) => {
    const updated = users.filter(u => u.id !== userId);
    setUsers(updated);
    saveUsersToLocal(updated);

    const gsUrl = getGoogleSheetsUrl();
    if (gsUrl) {
      return await pushToGoogleSheets(gsUrl, 'deleteUser', { id: userId });
    }
    return { status: 'success', message: 'Terhapus lokal' };
  };

  // IF NOT LOGGED IN -> RENDER AUTH SCREEN WITH GOOGLE SHEETS SETTINGS
  if (!currentUser) {
    return (
      <>
        <AuthView 
          users={users}
          onLoginSuccess={handleLoginSuccess}
          onRegisterUser={handleAddUser}
          onOpenGSModal={() => setIsGSModalOpen(true)}
          isGSConnected={isGSConnected}
        />
        <GoogleSheetsModal 
          isOpen={isGSModalOpen}
          onClose={() => setIsGSModalOpen(false)}
          onDataSynced={(synced) => {
            setReports(synced);
            saveReportsToLocal(synced);
            setIsGSConnected(true);
          }}
          onUsersSynced={(syncedUsers) => {
            setUsers(syncedUsers);
            saveUsersToLocal(syncedUsers);
            if (syncedUsers.length === 0) {
              setCurrentUser(null);
              setAuthUserToLocal(null);
            }
          }}
        />
      </>
    );
  }

  const isSekcam = Boolean(
    currentUser.jabatan?.toLowerCase().includes('sekcam') ||
    currentUser.role?.toLowerCase().includes('sekcam') ||
    currentUser.peranStruktur?.includes('Sekcam')
  );
  const isAdmin = currentUser.role === 'Admin' || currentUser.id === '0' || isSekcam;

  const isSupervisorOrAdmin = 
    isAdmin || 
    (currentUser?.peranStruktur && (
      currentUser.peranStruktur.includes('Camat') || 
      currentUser.peranStruktur.includes('Sekcam') || 
      currentUser.peranStruktur.includes('Kasi') || 
      currentUser.peranStruktur.includes('Kasubag') ||
      currentUser.peranStruktur.includes('Kasubbag')
    )) ||
    (currentUser?.jabatan && (
      currentUser.jabatan.includes('Camat') || 
      currentUser.jabatan.includes('Sekcam') || 
      currentUser.jabatan.includes('Kasi') || 
      currentUser.jabatan.includes('Kasubag') ||
      currentUser.jabatan.includes('Kasubbag')
    ));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 selection:bg-blue-600 selection:text-white font-sans">
      
      {/* TOPBAR HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xl backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            
            {/* Desktop Toggle Menu Button */}
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:flex p-2 mr-2 bg-slate-100/40 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200/60"
              title="Sembunyikan / Tampilkan Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-10 h-12 flex-shrink-0">
              <img src="/si-lkp-kec-waru/logo-ppu.png" alt="Logo PPU" className="w-full h-full object-contain drop-shadow" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-extrabold text-slate-800 tracking-wide flex items-center space-x-2">
                  <span>Si-LKP Waru</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-600 border border-blue-600/40 shadow-sm font-semibold">
                    v1.5
                  </span>
                </h1>
              </div>
              <p className="text-[11px] text-blue-600 font-medium tracking-wide">Sistem Laporan Kinerja Pegawai • Kecamatan Waru</p>
            </div>
          </div>

          {/* Right Section: Time WITA, GS Indicator, User Profile & Logout */}
          <div className="hidden md:flex items-center space-x-3 text-xs">
            
            {/* WITA Clock */}
            <div className="bg-white shadow-sm border border-slate-200 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-600 font-mono text-[11px] flex items-center space-x-1.5 shadow-inner">
              <span>{witaTime || '📅 WITA'}</span>
            </div>

            {/* GS Connected Status Button */}
            {isAdmin && (
<button 
              onClick={() => setIsGSModalOpen(true)}
              className="bg-blue-600/15 hover:bg-blue-600/25 border border-blue-600/40 text-blue-600 px-3 py-1.5 rounded-xl text-[11px] font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
              title="Konfigurasi Integrasi Google Sheets API"
            >
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>🔗 Sinkronisasi Google Sheets</span>
            </button>
            )}

            {/* Active User Avatar Badge & Logout */}
            <div className="flex items-center space-x-2.5 bg-slate-50/90 border border-slate-200/60 px-3 py-1.5 rounded-xl">
              <button 
                onClick={() => setActiveTab('profil')} 
                className="relative w-8 h-8 rounded-lg overflow-hidden border border-blue-600/50 bg-slate-100 flex items-center justify-center flex-shrink-0"
                title="Buka Profil Saya"
              >
                {currentUser.fotoProfil ? (
                  <img src={currentUser.fotoProfil} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-blue-600" />
                )}
                {/* Active Status Dot */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-blue-600 border border-white rounded-full" />
              </button>

              <div className="cursor-pointer" onClick={() => setActiveTab('profil')}>
                <div className="flex items-center space-x-1">
                  <span className="font-bold text-slate-800 block text-[11px] leading-none truncate max-w-[130px]">{currentUser.name}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                </div>
                <span className="text-[10px] text-blue-600 font-medium">({currentUser.role})</span>
              </div>

              <button
                onClick={handleLogout}
                className="ml-1 p-1.5 rounded-lg bg-blue-600/20 text-blue-600 hover:bg-blue-600 hover:text-slate-800 transition-colors"
                title="Keluar dari Akun (Logout)"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* MAIN CONTAINER WITH SIDEBAR & CONTENT AREA */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col md:flex-row p-4 sm:p-6 lg:p-8 gap-6">
        
        {/* SIDEBAR NAVIGATION (DESKTOP & MOBILE DRAWER) */}
        <aside className={`
          ${isSidebarCollapsed ? 'md:w-0 overflow-hidden md:pl-0 md:pr-0 md:opacity-0 md:border-none' : 'md:w-64 opacity-100'} transition-all duration-300 flex-shrink-0 space-y-4 no-print
          ${isMobileMenuOpen ? 'block' : 'hidden md:block'}
        `}>
          
          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-4 space-y-4 sticky top-28">
            
            {/* GROUP 1: MENU UTAMA */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600/90 px-3 py-1">MENU UTAMA</p>
              
              <button
                onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20'
                    : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-800'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>📊 Dashboard Statistik</span>
              </button>

              
              <button
                onClick={() => { setActiveTab('skp'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-6 py-3.5 transition-all duration-200 ${activeTab === 'skp' ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'}`}
              >
                <Target className={`w-5 h-5 ${activeTab === 'skp' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="font-semibold text-sm">Target SKP Saya</span>
              </button>
<button
                onClick={() => { setActiveTab('profil'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'profil'
                    ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20'
                    : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-800'
                }`}
              >
                <User className="w-4 h-4 text-blue-600" />
                <span>👤 Profil Saya & Foto Diri</span>
              </button>

              <button
                onClick={() => { setActiveTab('input'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'input'
                    ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20'
                    : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-800'
                }`}
              >
                <FilePlus className="w-4 h-4 text-blue-600" />
                <span>📝 Input Kegiatan (LKH)</span>
              </button>
            </div>

            {/* GROUP 2: VALIDASI & LAPORAN */}
            <div className="space-y-1 pt-2 border-t border-slate-300">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600/90 px-3 py-1">VALIDASI & LAPORAN</p>

              {/* SUPERVISOR / ADMIN MENU: VERIFIKASI ATASAN */}
              {isSupervisorOrAdmin && (
                <button
                  onClick={() => { setActiveTab('verify'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeTab === 'verify'
                      ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20'
                      : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>⏳ Verifikasi Atasan</span>
                </button>
              )}

              <button
                onClick={() => { setActiveTab('cetak'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'cetak'
                    ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20'
                    : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-800'
                }`}
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>🖨️ Cetak LKH Harian</span>
              </button>

              <button
                onClick={() => { setActiveTab('rekap'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'rekap'
                    ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20'
                    : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-blue-600" />
                <span>📈 Rekapitulasi Bulanan</span>
              </button>
            </div>

            {/* GROUP 3: PENGATURAN & LAINNYA */}
            <div className="space-y-1 pt-2 border-t border-slate-300">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600/90 px-3 py-1">PENGATURAN & LAINNYA</p>

              {isSupervisorOrAdmin && (
                <button
                  onClick={() => { setActiveTab('wa'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeTab === 'wa'
                      ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20'
                      : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-800'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>💬 Pengingat WA</span>
                </button>
              )}

              {isAdmin && (
<button
                onClick={() => { setIsGSModalOpen(true); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100/60 hover:text-slate-800 transition-all"
              >
                <Database className="w-4 h-4 text-blue-600" />
                <span>⚙️ Pengaturan Sheets API</span>
              </button>
              )}

              {/* ADMIN ONLY MENU: MANAJEMEN PEGAWAI */}
              {isAdmin && (
                <button
                  onClick={() => { setActiveTab('pegawai'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeTab === 'pegawai'
                      ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20'
                      : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-800'
                  }`}
                >
                  <Users className="w-4 h-4 text-amber-700" />
                  <span>👥 Manajemen Pegawai</span>
                </button>
              )}
            </div>

            {/* POINT 1: ALUR PELAPORAN LKH (DITEMPATKAN DI BAWAH KOLOM MENU SIDEBAR) */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="bg-white border border-slate-200 p-3 rounded-xl space-y-2 text-xs">
                <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                  <span className="text-sm">🚀</span>
                  <div>
                    <h4 className="font-bold text-slate-800 text-[11px]">Alur Pelaporan LKH</h4>
                    <p className="text-[10px] text-blue-600">Panduan Operasional v1.5</p>
                  </div>
                </div>

                <ol className="space-y-1.5 text-[10px] text-slate-600 list-decimal list-inside leading-tight">
                  <li><strong className="text-slate-800">Input LKH:</strong> Pegawai memasukkan rincian kerja & foto kamera HP.</li>
                  <li><strong className="text-slate-800">Validasi Atasan:</strong> Atasan memeriksa & memberikan status <span className="text-blue-600">DIVALIDASI</span>.</li>
                  <li><strong className="text-slate-800">Cetak PDF:</strong> Laporan divalidasi dapat dicetak ke PDF A4 ber-Kop & TTD.</li>
                </ol>

                <button
                  onClick={() => { setActiveTab('input'); setIsMobileMenuOpen(false); }}
                  className="w-full mt-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-600 border border-blue-600/40 font-bold py-1.5 rounded-lg text-[10px] flex items-center justify-center space-x-1 transition-all"
                >
                  <span>Input LKH Sekarang ➔</span>
                </button>
              </div>
            </div>

            {/* INFO USER DI BAWAH SIDEBAR */}
            <div className="pt-2 border-t border-slate-200">
              <div className="bg-white shadow-sm border border-slate-200/90 border border-slate-200 p-3 rounded-xl text-[11px] space-y-1.5 shadow-inner">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Info User Logged In:</div>
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-100 border border-blue-600/40 flex items-center justify-center flex-shrink-0">
                    {currentUser.fotoProfil ? (
                      <img src={currentUser.fotoProfil} alt="Profil" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-slate-800 block truncate leading-tight">{currentUser.name}</span>
                    <span className="text-[10px] text-slate-500 block font-mono">NIP: {currentUser.nip}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-olive-900 text-[10px]">
                  <span className="text-slate-500">Role:</span>
                  <span className={`font-bold px-2 py-0.5 rounded ${isAdmin ? 'bg-amber-500/20 text-amber-800 border border-amber-500/30' : 'bg-blue-600/20 text-blue-600 border border-blue-600/30'}`}>
                    {currentUser.role}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </aside>

        {/* MAIN DYNAMIC CONTENT AREA */}
        <main className="flex-1 w-full min-w-0">
          
          {activeTab === 'dashboard' && (
            <DashboardView 
              reports={getVisibleReports(currentUser, reports)}
              onUpdateStatus={handleUpdateStatus}
              onNavigateToInput={() => setActiveTab('input')}
              onNavigateToVerify={() => setActiveTab('verify')}
              currentUser={currentUser}
              users={users}
              onDeleteReport={handleDeleteReport}
              onSaveReport={handleSaveReport}
            />
          )}

          {activeTab === 'profil' && (
            <ProfilSaya 
              currentUser={currentUser}
              onUpdateProfile={handleUpdateProfile}
              users={users}
            />
          )}

          {activeTab === 'skp' && (
            <TargetSKPSaya 
              activeUser={currentUser}
              skpTargets={skpTargets}
              setSkpTargets={setSkpTargets}
            />
          )}

          {activeTab === 'input' && (
            <InputKegiatan 
              onSaveReport={handleSaveReport}
              onDeleteReport={handleDeleteReport}
              pegawaiList={users}
              activeUser={currentUser}
              reports={reports}
            />
          )}

          {activeTab === 'verify' && isSupervisorOrAdmin && (
            <VerifikasiAtasan 
              reports={reports}
              onUpdateStatus={handleUpdateStatus}
              activeUser={currentUser}
              users={users}
            />
          )}

          {activeTab === 'cetak' && (
            <CetakLKH 
              reports={reports}
              pegawaiList={users}
              activeUser={currentUser}
            />
          )}

          {activeTab === 'rekap' && (
            <RekapitulasiBulanan 
              reports={reports}
              pegawaiList={users}
              activeUser={currentUser}
            />
          )}

          {activeTab === 'wa' && isSupervisorOrAdmin && (
            <PengingatWA 
              pegawaiList={users}
            />
          )}

          {activeTab === 'pegawai' && isAdmin && (
            <ManajemenPegawai
              users={users}
              onAddUser={handleAddUser}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
              currentUser={currentUser}
            />
          )}

        </main>

      </div>

      {/* FOOTER */}
      <footer className="no-print bg-slate-50 border-t border-slate-300 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 Pemerintah Kecamatan Waru - Kabupaten Penajam Paser Utara</span>
          <span className="text-blue-600/80 font-mono">Si-LKP Waru v1.5 • Clean Starting State & Profile Photo</span>
        </div>
      </footer>

      {/* GOOGLE SHEETS MODAL */}
      <GoogleSheetsModal 
        isOpen={isGSModalOpen}
        onClose={() => setIsGSModalOpen(false)}
        onDataSynced={(synced) => {
          setReports(synced);
          saveReportsToLocal(synced);
          setIsGSConnected(true);
        }}
        onUsersSynced={(syncedUsers) => {
          setUsers(syncedUsers);
          saveUsersToLocal(syncedUsers);
          if (syncedUsers.length === 0) {
            setCurrentUser(null);
            setAuthUserToLocal(null);
          }
        }}
      />

    </div>
  );
}
