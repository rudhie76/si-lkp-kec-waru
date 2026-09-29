const url = 'https://script.google.com/macros/s/AKfycbyZLCn9JvI-ujPgx1umIHA4Zcj7eMYPsCW5WXP1TStGWoTqp5opregiegbgWo7IlPPn/exec';

async function testWAF() {
  console.log("Sending edit payload with Drive URL...");
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'saveReport',
        data: {
          id: 'LKH-WAF-TEST',
          tanggal: '2026-09-28',
          pegawaiId: 'USER-TEST',
          status: 'PENDING',
          lampiranUrl: 'https://drive.google.com/uc?export=view&id=12345'
        }
      })
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
  } catch (e) {
    console.error("Error:", e);
  }
}

testWAF();
