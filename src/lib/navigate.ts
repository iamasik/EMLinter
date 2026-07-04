export function navigate(page: string, _state?: unknown): void {
  const path = page === 'home' ? '/' : `/${page}`;
  window.location.href = path;
}
