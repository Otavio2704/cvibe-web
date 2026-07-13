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
        quanto ao recarregar a página.

        import.meta.env.BASE_URL reflete o "base" do vite.config.ts, mas o
        vite-plugin-singlefile reescreve esse valor como "./" (relativo) no
        build de produção, o que quebra o Router quando a URL é só "/"
        (ex: npm run preview). Por isso normalizamos: um "./" (ou qualquer
        valor sem "/" inicial) vira "/", e mantemos o valor original nos
        outros casos (dev normal, ou build servido de fato em /cvibe-web/).
      */}
      <BrowserRouter basename={import.meta.env.BASE_URL.startsWith('/') ? import.meta.env.BASE_URL : '/'}>
        <AppShell />
      </BrowserRouter>
    </SessionProvider>
  );
}
