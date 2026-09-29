'use client';

import { useState } from 'react';
import { Users, UserPlus, Edit3, Trash2, ShieldCheck, User, Mail, Lock, Award, X, Check, Phone, Building } from 'lucide-react';

export default function ManajemenPegawai({ users, onAddUser, onEditUser, onDeleteUser, currentUser }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    nip: '',
    noWa: '',
    email: '',
    password: '',
    jabatan: '',
    pangkatGolongan: '',
    unitKerja: '',
    peranStruktur: 'Staf Pelaksana / JFT / JFU',
    atasanValidasi: 'Rudiansyah, SE (Plt. Sekcam/Kasi. PM)',
    role: 'Pegawai'
  });

  const isSekcam = Boolean(
    currentUser?.jabatan?.toLowerCase().includes('sekcam') ||
    currentUser?.role?.toLowerCase().includes('sekcam') ||
    currentUser?.peranStruktur?.includes('Sekcam')
  );
  const isAdmin = currentUser?.role === 'Admin' || currentUser?.id === '0' || isSekcam;

  const openAddModal = () => {
    setEditMode(false);
    setFormData({
      id: String(Date.now()),
      name: '',
      nip: '',
      noWa: '',
      email: '',
      password: '',
      jabatan: 'Staf Administrasi',
      pangkatGolongan: 'Penata Muda / IIIa',
      unitKerja: 'Sub Bagian Umum & Kepegawaian',
      peranStruktur: 'Staf Pelaksana / JFT / JFU',
      atasanValidasi: 'Rudiansyah, SE (Plt. Sekcam/Kasi. PM)',
      role: 'Pegawai'
    });
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditMode(true);
    setFormData({
      id: user.id,
      name: user.name,
      nip: user.nip,
      noWa: user.noWa || '',
      email: user.email || '',
      password: user.password || '',
      jabatan: user.jabatan || '',
      pangkatGolongan: user.pangkatGolongan || '',
      unitKerja: user.unitKerja || '',
      peranStruktur: user.peranStruktur || 'Staf Pelaksana / JFT / JFU',
      atasanValidasi: user.atasanValidasi || 'Rudiansyah, SE (Plt. Sekcam/Kasi. PM)',
      role: user.role || 'Pegawai'
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.nip) {
      alert('Mohon lengkapi Nama dan NIP pegawai terlebih dahulu.');
      return;
    }

    if (editMode) {
      onEditUser(formData);
    } else {
      onAddUser(formData);
    }

    setModalOpen(false);
  };

  const handleDelete = (user) => {
    if (!isAdmin) {
      alert('Anda tidak memiliki hak akses Admin untuk menghapus data pegawai.');
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus pegawai "${user.name}" dari sistem dan Google Sheets?`)) {
      onDeleteUser(user.id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="bg-gradient-to-r from-olive-900 via-olive-800 to-olive-950 border border-slate-200 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-red-800/20 text-red-800 border border-red-800/30 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Manajemen Data Pegawai Kecamatan Waru</h1>
            <p className="text-xs text-red-800/80">Kelola akun, Pangkat/Golongan, Unit Kerja, dan Atasan Validasi</p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={openAddModal}
            className="bg-red-800 hover:bg-red-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Tambah Pegawai Baru</span>
          </button>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-gradient-to-b from-olive-900 to-olive-950 border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-base font-bold text-slate-800">Daftar Akun Pegawai Terdaftar ({users.length})</h2>
          <span className="text-xs text-slate-500">Pengelola Aktif: <strong className="text-amber-700">{currentUser?.name} ({currentUser?.role})</strong></span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white shadow-sm border border-slate-200 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Nama Pegawai & NIP</th>
                <th className="py-3 px-4">Jabatan & Pangkat</th>
                <th className="py-3 px-4">Unit Kerja & Atasan</th>
                <th className="py-3 px-4 text-center">Hak Akses Role</th>
                <th className="py-3 px-4 text-right">Aksi Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olive-800/40 text-slate-700">
              {users.map(u => {
                const isUserAdmin = u.role === 'Admin';
                return (
                  <tr key={u.id} className="hover:bg-slate-100/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold whitespace-nowrap">
                      <div className="text-red-700">{u.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">NIP. {u.nip}</div>
                      <div className="text-[10px] text-slate-400">{u.noWa || u.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{u.jabatan}</div>
                      <div className="text-[11px] text-amber-700">{u.pangkatGolongan || '-'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      <div>{u.unitKerja || '-'}</div>
                      <div className="text-[11px] text-slate-500 italic">Validasi: {u.atasanValidasi || '-'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {isUserAdmin ? (
                        <span className="inline-flex items-center space-x-1 bg-amber-100 border border-amber-300 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Admin (Atasan)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 bg-red-800/15 border border-red-800/30 text-red-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                          <User className="w-3.5 h-3.5" />
                          <span>Pegawai Biasa</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {isAdmin ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                            title="Edit Data Pegawai"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            className="p-1.5 rounded-lg bg-rose-600/80 hover:bg-red-800 text-slate-800 transition-colors"
                            title="Hapus Pegawai"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Membutuhkan Akses Admin</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white shadow-sm border border-slate-200 border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-xs space-y-4 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 p-1 rounded-lg bg-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-slate-800">
              {editMode ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Nama Lengkap & Gelar:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Sri Wahyuni, S.Sos"
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-red-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">NIP Pegawai:</label>
                  <input
                    type="text"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    placeholder="19910823..."
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono focus:outline-none focus:border-red-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">No. WhatsApp:</label>
                  <input
                    type="text"
                    value={formData.noWa}
                    onChange={(e) => setFormData({ ...formData, noWa: e.target.value })}
                    placeholder="0852xxxxxxxx"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-red-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Email Resmi:</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@waru.ppu.go.id"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-red-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Password:</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Sandi baru..."
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-red-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Jabatan Pegawai:</label>
                <input
                  type="text"
                  value={formData.jabatan}
                  onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                  placeholder="Pengelola Administrasi Kepegawaian"
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-red-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Pangkat / Golongan:</label>
                  <input
                    type="text"
                    value={formData.pangkatGolongan}
                    onChange={(e) => setFormData({ ...formData, pangkatGolongan: e.target.value })}
                    placeholder="Penata Muda / IIIa"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-red-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Unit Kerja:</label>
                  <input
                    type="text"
                    value={formData.unitKerja}
                    onChange={(e) => setFormData({ ...formData, unitKerja: e.target.value })}
                    placeholder="Sub Bagian Umum & Kepegawaian"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-red-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Peran Struktur:</label>
                  <select
                    value={formData.peranStruktur}
                    onChange={(e) => setFormData({ ...formData, peranStruktur: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-red-800"
                  >
                    <option value="Staf Pelaksana / JFT / JFU">Staf Pelaksana / JFT / JFU</option>
                    <option value="Kepala Seksi (Kasi) / Kasubag">Kepala Seksi (Kasi) / Kasubag</option>
                    <option value="Sekretaris Kecamatan (Sekcam)">Sekretaris Kecamatan (Sekcam)</option>
                    <option value="Camat Waru / Pembina Utama">Camat Waru / Pembina Utama</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Hak Akses System Role:</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-red-800"
                  >
                    <option value="Pegawai">Pegawai Biasa (User)</option>
                    <option value="Admin">Admin (Atasan / Camat)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Atasan Validasi (Kasi/Kasubag):</label>
                <select
                  value={formData.atasanValidasi}
                  onChange={(e) => setFormData({ ...formData, atasanValidasi: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-red-800 font-semibold"
                >
                  <option value="Rudiansyah, SE (Plt. Sekcam/Kasi. PM)">Rudiansyah, SE (Plt. Sekcam/Kasi. PM)</option>
                  <option value="Ahmad Fauzi, S.STP (Camat Waru)">Ahmad Fauzi, S.STP (Camat Waru)</option>
                  <option value="Nurul Hidayah, S.E. (Sekcam)">Nurul Hidayah, S.E. (Sekcam)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-red-800 hover:bg-red-800 text-white px-5 py-2 rounded-xl text-xs font-bold"
                >
                  {editMode ? 'Perbarui Data' : 'Simpan Pegawai'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
