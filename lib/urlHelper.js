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
