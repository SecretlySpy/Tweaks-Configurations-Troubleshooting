export const basePath = import.meta.env.BASE_URL.replace(/\/$/u, '');

export function withBase(pathname: string): string {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${basePath}${normalizedPath}`;
}

