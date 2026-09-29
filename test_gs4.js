const url = 'https://script.google.com/macros/s/AKfycbyZLCn9JvI-ujPgx1umIHA4Zcj7eMYPsCW5WXP1TStGWoTqp5opregiegbgWo7IlPPn/exec';
const payload = { action: 'getReports' };
fetch(url, { method: 'POST', body: JSON.stringify(payload) })
  .then(res => res.json())
  .then(data => {
    console.log(JSON.stringify(data, null, 2));
  }).catch(e => console.error(e));
