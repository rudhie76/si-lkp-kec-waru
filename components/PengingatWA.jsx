'use client';

import { useState } from 'react';
import { MessageSquare, Send, Phone, User, CheckCircle2, Copy } from 'lucide-react';

export default function PengingatWA({ pegawaiList }) {
  const [selectedPegawaiId, setSelectedPegawaiId] = useState(pegawaiList[2]?.id || pegawaiList[0]?.id || '1');
  const [phoneNumber, setPhoneNumber] = useState('6281234567890');
  const [templateType, setTemplateType] = useState('REMINDER');
  const [customText, setCustomText] = useState('');
  const [copied, setCopied] = useState(false);

  const selectedPegawai = pegawaiList.find(p => p.id === selectedPegawaiId) || pegawaiList[0];

  const getTemplateMessage = () => {
    const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    
    if (templateType === 'REMINDER') {
      return `📢 *PENGINGAT LAPORAN KINERJA HARIAN (Si-LKP Waru v1.5)*\n\nYth. *${selectedPegawai.name}*\nNIP. ${selectedPegawai.nip}\nJabatan: ${selectedPegawai.jabatan}\n\nMengingatkan untuk mengisi dan menginput Laporan Kinerja Harian (LKH) untuk hari ini, *${today}* melalui portal Si-LKP Waru.\n\nTerima Kasih.\n_Pemerintah Kecamatan Waru - Kab. Penajam Paser Utara_`;
    }

    if (templateType === 'APPROVED') {
      return `✅ *PEMBERITAHUAN LKH DISETUJUI*\n\nYth. *${selectedPegawai.name}*,\n\nInformasi bahwa Laporan Kinerja Harian (LKH) Anda telah *DISETUJUI* oleh Atasan Penilai. Anda dapat mengunduh / mencetak format dokumen LKH harian melalui portal Si-LKP Waru v1.5.\n\n_Pemerintah Kecamatan Waru - Kab. Penajam Paser Utara_`;
    }

    if (templateType === 'REVISION') {
      return `⚠️ *PEMBERITAHUAN REVISI LKH*\n\nYth. *${selectedPegawai.name}*,\n\nTerdapat masukan/revisi pada Laporan Kinerja Harian (LKH) yang Anda kirimkan. Mohon periksa catatan verifikasi dan perbarui uraian/lampiran pada portal Si-LKP Waru v1.5.\n\n_Pemerintah Kecamatan Waru - Kab. Penajam Paser Utara_`;
    }

    return customText;
  };

  const finalMessage = getTemplateMessage();

  const handleSendWA = () => {
    let cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }
    const encodedText = encodeURIComponent(finalMessage);
    window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, '_blank');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(finalMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Title Header */}
      <div className="bg-gradient-to-r from-olive-900 via-olive-800 to-olive-950 border border-slate-200 rounded-2xl p-6 shadow-xl space-y-2">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-red-800/20 text-red-800 border border-red-800/30 rounded-xl">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Generator Pengingat Notifikasi WhatsApp</h1>
            <p className="text-xs text-red-800/80">Kirim notifikasi pesan otomatis ke WhatsApp pegawai Kecamatan Waru</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        
        {/* Form Controls */}
        <div className="bg-gradient-to-b from-olive-900 to-olive-950 border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
          
          <div>
            <label className="block text-slate-600 font-semibold mb-1.5 flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-red-800" />
              <span>Pilih Pegawai Penerima:</span>
            </label>
            <select
              value={selectedPegawaiId}
              onChange={(e) => setSelectedPegawaiId(e.target.value)}
              className="w-full bg-white border border-slate-200/60 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-red-800"
            >
              {pegawaiList.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.jabatan})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1.5 flex items-center space-x-1.5">
              <Phone className="w-3.5 h-3.5 text-red-800" />
              <span>Nomor WhatsApp (Awali 628...):</span>
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="6281234567890"
              className="w-full bg-white border border-slate-200/60 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-red-800 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1.5">Pilih Template Pesan:</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 bg-white border border-slate-200 p-2.5 rounded-xl border border-olive-800/80 cursor-pointer hover:border-red-800/50">
                <input
                  type="radio"
                  name="template"
                  checked={templateType === 'REMINDER'}
                  onChange={() => setTemplateType('REMINDER')}
                  className="accent-emerald-500"
                />
                <span className="text-slate-700">Pengingat Belum Input LKH Harian</span>
              </label>

              <label className="flex items-center space-x-2 bg-white border border-slate-200 p-2.5 rounded-xl border border-olive-800/80 cursor-pointer hover:border-red-800/50">
                <input
                  type="radio"
                  name="template"
                  checked={templateType === 'APPROVED'}
                  onChange={() => setTemplateType('APPROVED')}
                  className="accent-emerald-500"
                />
                <span className="text-slate-700">Pemberitahuan LKH Disetujui</span>
              </label>

              <label className="flex items-center space-x-2 bg-white border border-slate-200 p-2.5 rounded-xl border border-olive-800/80 cursor-pointer hover:border-red-800/50">
                <input
                  type="radio"
                  name="template"
                  checked={templateType === 'REVISION'}
                  onChange={() => setTemplateType('REVISION')}
                  className="accent-emerald-500"
                />
                <span className="text-slate-700">Teguran Catatan Revisi LKH</span>
              </label>
            </div>
          </div>

        </div>

        {/* Message Preview Box */}
        <div className="bg-gradient-to-b from-olive-900 to-olive-950 border border-slate-200 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-olive-800/80 pb-3 mb-3">
              <h3 className="font-bold text-slate-800 flex items-center space-x-2">
                <span>Pratinjau Teks WhatsApp</span>
              </h3>
              <button
                onClick={handleCopyText}
                className="text-red-800 hover:text-red-700 flex items-center space-x-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
              </button>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-4 text-emerald-100 font-sans leading-relaxed whitespace-pre-wrap">
              {finalMessage}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSendWA}
              className="w-full bg-red-800 hover:bg-red-800 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Buka & Kirim Langsung via WhatsApp Web / App</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
