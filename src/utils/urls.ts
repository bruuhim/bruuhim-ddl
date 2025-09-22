export function getDownloadUrl(fileId: string) {
  return `/api/download?id=${encodeURIComponent(fileId)}`;
}

export function getPreviewUrl(fileId: string) {
  // For now, preview still uses Google Drive's preview functionality
  // You could implement a separate preview proxy endpoint if needed
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export function getDirectLink(fileId: string) {
  // Direct links will now use our proxy as well
  return `/api/download?id=${encodeURIComponent(fileId)}`;
}