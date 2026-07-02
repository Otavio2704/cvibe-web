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
        basename="/gupify-web" — o site é publicado em uma subpasta no
        GitHub Pages (https://otavio2704.github.io/gupify-web/), não na raiz
        do domínio. Sem isso, o React Router monta as rotas internas
        (/dashboard, /generate, etc.) a partir da raiz do domínio, gerando
        links e navegações incorretos como "otavio2704.github.io/dashboard"
        em vez de ".../gupify-web/dashboard" — o que causa 404 tanto ao
        navegar quanto ao recarregar a página.
      */}
      <BrowserRouter basename="/gupify-web">
        <AppShell />
      </BrowserRouter>
    </SessionProvider>
  );
}
