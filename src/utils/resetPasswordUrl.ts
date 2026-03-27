/** Full URL to the reset-password screen (HashRouter + Vite base). */
export function buildResetPasswordUrl(email: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  const path = `${basePath}/#/reset-password?email=${encodeURIComponent(email)}`;
  return `${origin}${path}`;
}
