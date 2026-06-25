import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import SessionGuard from './components/SessionGuard';
import Navbar, { Sidebar } from './components/Navbar';

// Pages
import Landing   from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Generate  from './pages/Generate';
import Report    from './pages/Report';
import Guia      from './pages/Guia';
import Checklist from './pages/Checklist';

function AppLayout() {
  return (
    /*
      Layout de duas colunas:
        - Sidebar fixa à esquerda (apenas lg+, oculta na Landing)
        - main ocupa o restante da largura
      A Topbar mobile é renderizada pelo Navbar e fica sticky no topo.
    */
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">

      {/* Topbar mobile (hidden em lg) */}
      <Navbar />

      {/* Corpo: sidebar + conteúdo */}
      <div className="flex flex-1">

        {/* Sidebar desktop (hidden em mobile) */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-auto">
          <Routes>
            <Route path="/" element={<Landing />} />

            {/* Rotas protegidas (aguardam handshake de sessão) */}
            <Route element={<SessionGuard />}>
              <Route path="/dashboard"      element={<Dashboard />} />
              <Route path="/generate"       element={<Generate />}  />
              <Route path="/reports/:id"    element={<Report />}    />
            </Route>

            {/* Recursos informativos estáticos */}
            <Route path="/guia"      element={<Guia />}      />
            <Route path="/checklist" element={<Checklist />} />

            {/* Catch-all */}
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
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </SessionProvider>
  );
}
