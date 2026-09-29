const url = 'https://script.google.com/macros/s/AKfycbyZLCn9JvI-ujPgx1umIHA4Zcj7eMYPsCW5WXP1TStGWoTqp5opregiegbgWo7IlPPn/exec?action=getReports';
fetch(url)
  .then(res => res.json())
  .then(data => {
    console.log("Status:", data.status);
    if (data.data) {
      console.log("Total reports:", data.data.length);
      const testReports = data.data.filter(r => r.id === 'LKH-TEST-123' || (r.namaPegawai && r.namaPegawai.includes('Test')));
      console.log("Test Reports Found:", testReports.length);
      console.log(testReports);
    } else {
      console.log("No data array found in response");
    }
  }).catch(e => console.error(e));
