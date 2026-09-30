export const getDriveViewUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  if (url.includes('drive.google.com/uc')) {
    const match = url.match(/id=([^&]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/view`;
    }
  }
  return url;
};

export const handleMediaClick = (e, url) => {
  if (!url || typeof url !== 'string') return;
  if (url.startsWith('data:')) {
    e.preventDefault();
    try {
      const arr = url.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      console.error('Failed to open data URI', err);
      // Fallback
      const win = window.open();
      if (win) {
        win.document.write(`<iframe src="${url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
      }
    }
  }
};
