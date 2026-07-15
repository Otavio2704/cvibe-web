import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import SessionGuard from './components/SessionGuard';
import Navbar, { Sidebar } from './components/Navbar';

import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Generate from './pages/Generate';
import Report from './pages/Report';
import Guia from './pages/Guia';
import Checklist from './pages/Checklist';

function AppShell() {
  const location = useLocation();
  const isGenerateBusy = location.pathname === '/generate';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      <Navbar />

      <div className="flex flex-1 min-h-0">
        <Sidebar />

        <main className="flex-1 min-w-0">
          <Routes>
            <Route path="/" element={<Landing />} />

            <Route element={<SessionGuard />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/generate" element={<Generate />} />
              <Route path="/reports/:id" element={<Report />} />
            </Route>

            <Route path="/guia" element={<Guia />} />
            <Route path="/checklist" element={<Checklist />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// Detecta o basename olhando a URL real que o navegador está usando, em vez
// de confiar em import.meta.env.BASE_URL.
//
// Por quê: o "base" configurado no vite.config.ts é "/cvibe-web/", correto
// para produção (GitHub Pages). Só que o vite-plugin-singlefile reescreve
// BASE_URL como "./" (relativo) dentro do bundle final — não importa se o
// ambiente é dev local ou produção real, o valor injetado é sempre "./".
// Ou seja, BASE_URL sozinho NÃO diferencia "estou em localhost:5173" de
// "estou publicado em otavio2704.github.io/cvibe-web/".
//
// A correção anterior (usar "/" sempre que BASE_URL não começasse com "/")
// resolvia o caso local, mas quebrava produção: o Router passava a tratar
// o site como se vivesse na raiz do domínio, então qualquer navegação
// client-side (cliques em <Link>, etc.) reescrevia a URL removendo o
// "/cvibe-web/" — o usuário via a barra de endereço "limpar" para
// "otavio2704.github.io/" mesmo com o conteúdo certo carregado.
//
// A forma confiável é checar window.location.pathname no momento em que a
// página carrega: se ele começa com "/cvibe-web", estamos em produção real
// e o basename deve ser "/cvibe-web/". Caso contrário (localhost, preview
// local), o basename é "/".
function detectBasename(): string {
  const path = window.location.pathname;
  return path.startsWith('/cvibe-web') ? '/cvibe-web/' : '/';
}

export default function App() {
  return (
    <SessionProvider>
      {/*
        basename — o site é publicado em uma subpasta no GitHub Pages
        (https://otavio2704.github.io/cvibe-web/), não na raiz do domínio.
        Sem isso, o React Router monta as rotas internas (/dashboard,
        /generate, etc.) a partir da raiz do domínio, gerando links e
        navegações incorretos como "otavio2704.github.io/dashboard" em vez
        de ".../cvibe-web/dashboard" — o que causa 404 tanto ao navegar
        quanto ao recarregar a página. Ver o comentário em detectBasename()
        acima para o porquê de não usar import.meta.env.BASE_URL direto.
      */}
      <BrowserRouter basename={detectBasename()}>
        <AppShell />
      </BrowserRouter>
    </SessionProvider>
  );
}
