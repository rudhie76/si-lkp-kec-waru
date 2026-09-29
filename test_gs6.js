const url = 'https://script.google.com/macros/s/AKfycbyZLCn9JvI-ujPgx1umIHA4Zcj7eMYPsCW5WXP1TStGWoTqp5opregiegbgWo7IlPPn/exec?action=getReports';
fetch(url)
  .then(res => res.json())
  .then(data => {
    if (data.data) {
      const counts = {};
      data.data.forEach(r => {
        counts[r.id] = (counts[r.id] || 0) + 1;
      });
      const duplicates = Object.entries(counts).filter(([id, count]) => count > 1);
      console.log("Total Duplicates found:", duplicates.length);
      if (duplicates.length > 0) {
        console.log(duplicates.slice(0, 10)); // print first 10
      }
    }
  }).catch(e => console.error(e));
