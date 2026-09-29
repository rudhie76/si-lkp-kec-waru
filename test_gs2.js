const url = 'https://script.google.com/macros/s/AKfycbyZLCn9JvI-ujPgx1umIHA4Zcj7eMYPsCW5WXP1TStGWoTqp5opregiegbgWo7IlPPn/exec';
const payload2 = {
  action: 'saveReport',
  data: {
    id: 'LKH-TEST-123',
    tanggal: '2026-09-28',
    pegawaiId: '123',
    namaPegawai: 'Test Updated', // changed
    nip: '123',
    status: 'DIVALIDASI' // changed
  }
};
fetch(url, { method: 'POST', body: JSON.stringify(payload2) })
  .then(res => res.text())
  .then(text => console.log('POST Response Edit:', text));
