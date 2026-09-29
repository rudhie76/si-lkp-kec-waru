const url = 'https://script.google.com/macros/s/AKfycbyZLCn9JvI-ujPgx1umIHA4Zcj7eMYPsCW5WXP1TStGWoTqp5opregiegbgWo7IlPPn/exec';
const payload3 = { action: 'getReports' };
fetch(url, { method: 'POST', body: JSON.stringify(payload3) })
  .then(res => res.json())
  .then(data => {
    console.log(data.status);
    console.log(Object.keys(data));
  });
