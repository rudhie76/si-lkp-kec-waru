const url = 'https://script.google.com/macros/s/AKfycbyZLCn9JvI-ujPgx1umIHA4Zcj7eMYPsCW5WXP1TStGWoTqp5opregiegbgWo7IlPPn/exec';

async function testFullCycle() {
  const testId = 'LKH-CYCLE-TEST-' + Date.now();
  
  // 1. Create a record (DIVALIDASI)
  console.log("1. Creating record...");
  await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      action: 'saveReport',
      data: {
        id: testId,
        tanggal: '2026-09-28',
        pegawaiId: 'USER-TEST',
        namaPegawai: 'Cycle Test User',
        nip: '12345',
        status: 'DIVALIDASI',
        deskripsi: 'Initial creation'
      }
    })
  });
  
  // 2. Edit the record (PENDING)
  console.log("2. Editing record...");
  await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      action: 'saveReport',
      data: {
        id: testId,
        tanggal: '2026-09-28',
        pegawaiId: 'USER-TEST',
        namaPegawai: 'Cycle Test User',
        nip: '12345',
        status: 'PENDING',
        deskripsi: 'Edited description'
      }
    })
  });
  
  // 3. Fetch the records and check status
  console.log("3. Fetching records...");
  const res = await fetch(url + '?action=getReports');
  const json = await res.json();
  const reports = json.data || [];
  
  const myReports = reports.filter(r => r.id === testId);
  console.log("Found matches:", myReports.length);
  if(myReports.length > 0) {
    console.log("First Match Status:", myReports[0].status);
    console.log("First Match Deskripsi:", myReports[0].deskripsi);
  }
}

testFullCycle();
