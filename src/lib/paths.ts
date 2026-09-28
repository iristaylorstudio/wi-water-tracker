// Builds site links that work under the GitHub Pages base path.

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function url(path: string): string {
  return `${BASE}/${path.replace(/^\//, '')}`;
}

export function facilityUrl(id: string): string {
  return url(`facilities/${id}/`);
}
