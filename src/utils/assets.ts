export const asset = (path: string): string => {
  const base = import.meta.env.BASE_URL ?? '/';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${cleanPath}`;
};

export const CVIBE_LOGO = asset('cvibe-logo.png');
