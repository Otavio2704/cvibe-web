export const asset = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `./${cleanPath}`;
};

export const GUPIFY_LOGO = asset('gupify-logo.png');
