export function getImageUrl(path: string | undefined | null): string | undefined {
  if (!path) return undefined;
  
  // If the path is already an absolute URL (e.g., from an external provider), return it as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Get the base URL from env
  const apiUrl = import.meta.env.VITE_API_BASE_URL as string;
  
  // Ensure we strip '/api' if it's there to point directly to the host for static files
  const hostUrl = apiUrl.replace(/\/api\/?$/, '');
  
  // Combine the host URL with the relative image path
  const separator = path.startsWith('/') ? '' : '/';
  return `${hostUrl}${separator}${path}`;
}
