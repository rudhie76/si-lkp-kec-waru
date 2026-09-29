'use client';

import { useState, useEffect } from 'react';
import { X, Database, RefreshCw, CheckCircle, AlertTriangle, Link as LinkIcon, Code, Trash2 } from 'lucide-react';
import { getGoogleSheetsUrl, setGoogleSheetsUrl, fetchFromGoogleSheets, fetchUsersFromGoogleSheets, clearReportsInLocal, clearUsersInLocal } from '../lib/googleSheets';

export default function GoogleSheetsModal({ isOpen, onClose, onDataSynced, onUsersSynced }) {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('idle'); // idle | testing | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setUrl(getGoogleSheetsUrl());
      setStatus('idle');
      setMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    if (!url.trim()) {
      setGoogleSheetsUrl('');
      setStatus('success');
      setMessage('Mode penyimpanan lokal aktif (LocalStorage).');
      setTimeout(() => onClose(), 1500);
      return;
    }

    setStatus('testing');
    setMessage('Menghubungkan ke Google Sheets Apps Script...');

    try {
      const data = await fetchFromGoogleSheets(url.trim());
      const uData = await fetchUsersFromGoogleSheets(url.trim());
      setGoogleSheetsUrl(url.trim());
      setStatus('success');
      
      if (Array.isArray(data)) {
        setMessage(`Koneksi Berhasil! Tersinkronisasi (${data.length} laporan, ${uData ? uData.length : 0} user).`);
        if (onDataSynced) {
          onDataSynced(data);
        }
        if (onUsersSynced && Array.isArray(uData)) {
          onUsersSynced(uData);
        }
      } else {
        setMessage('Koneksi Google Sheets Berhasil!');
      }
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setStatus('error');
      setMessage('Gagal terhubung. Pastikan Web App diset ke "Anyone" (Siapa Saja).');
    }
  };

  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin mengosongkan/menghapus semua data laporan & pengguna lokal? Seluruh data di aplikasi akan di-reset menjadi kosong.')) {
      clearReportsInLocal();
      clearUsersInLocal();
      if (onDataSynced) {
        onDataSynced([]);
      }
      if (onUsersSynced) {
        onUsersSynced([]);
      }
      setStatus('success');
      setMessage('Semua data laporan dan pengguna lokal telah dikosongkan!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white shadow-sm border border-slate-200 border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-xs space-y-4">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 p-1 rounded-lg bg-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center space-x-3 border-b border-olive-800 pb-3">
          <div className="p-2.5 bg-red-800/20 text-red-800 rounded-xl border border-red-800/30">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Integrasi Database Google Sheets</h2>
            <p className="text-red-800/80 text-[11px]">Si-LKP Waru v1.5 API Sync</p>
          </div>
        </div>

        {/* Status Alert */}
        {status === 'success' && (
          <div className="p-3 rounded-xl bg-red-800/20 border border-red-800/40 text-red-700 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {status === 'error' && (
          <div className="p-3 rounded-xl bg-red-800/20 border border-rose-500/40 text-red-800 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Form URL */}
        <div className="space-y-2">
          <label className="block text-slate-600 font-semibold flex items-center space-x-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-red-800" />
            <span>Google Apps Script Web App URL:</span>
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/AKfycb.../exec"
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 text-xs font-mono focus:outline-none focus:border-red-800"
          />
        </div>

        {/* Setup Instructions */}
        <div className="bg-white/90 border border-olive-800/80 rounded-xl p-3.5 space-y-2 text-[11px] text-slate-600">
          <div className="font-semibold text-red-800 flex items-center space-x-1">
            <Code className="w-3.5 h-3.5" />
            <span>Panduan Pasang Kode Google Apps Script:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-500 leading-relaxed">
            <li>Buka dokumen Google Sheets Anda.</li>
            <li>Pilih menu <strong>Extensions -&gt; Apps Script</strong>.</li>
            <li>Salin file kode dari folder <code>google-apps-script/Code.gs</code> di aplikasi ini.</li>
            <li>Klik tombol <strong>Deploy -&gt; New deployment -&gt; Web app</strong>.</li>
            <li>Set <em>Execute as</em>: <strong>Me</strong> dan <em>Who has access</em>: <strong>Anyone</strong>.</li>
            <li>Tempelkan Web App URL yang dihasilkan ke kolom di atas.</li>
          </ol>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleResetData}
            type="button"
            className="bg-red-800/10 hover:bg-red-800/20 text-red-800 border border-rose-500/30 px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5"
            title="Hapus / Kosongkan semua data laporan lama dari aplikasi"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-800" />
            <span>Kosongkan Data Aplikasi</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-xl text-xs font-semibold"
            >
              Batal
            </button>
            <button
              onClick={handleTestAndSave}
              disabled={status === 'testing'}
              className="bg-red-800 hover:bg-red-800 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5"
            >
              {status === 'testing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Menghubungkan...</span>
                </>
              ) : (
                <span>Simpan & Sinkronkan</span>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
