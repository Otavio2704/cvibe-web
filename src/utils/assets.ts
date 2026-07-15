export const asset = (path: string): string => {
  // O vite-plugin-singlefile reescreve import.meta.env.BASE_URL como "./"
  // (caminho relativo) no build de produção, em vez de "/cvibe-web/" (o
  // "base" configurado no vite.config.ts). Isso quebra em qualquer rota
  // interna do React Router (ex: /dashboard, /guia): como a navegação é
  // client-side sem recarregar a página, "./" passa a ser resolvido pelo
  // navegador relativo à rota atual (".../cvibe-web/dashboard/"), não à
  // raiz do site — gerando caminhos de imagem quebrados como
  // ".../cvibe-web/dashboard/cvibe-logo.png".
  //
  // Por isso não confiamos direto no BASE_URL: se ele não vier absoluto
  // (começando com "/"), usamos "/cvibe-web/" fixo, que é o valor real de
  // produção. Em dev local (localhost:5173, sem subpasta) o BASE_URL chega
  // corretamente como "/", então o fallback nunca entra em ação lá.
  const rawBase = import.meta.env.BASE_URL ?? '/';
  const base = rawBase.startsWith('/') ? rawBase : '/cvibe-web/';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${cleanPath}`;
};

export const CVIBE_LOGO = asset('cvibe-logo.png');
