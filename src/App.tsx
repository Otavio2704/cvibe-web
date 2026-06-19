import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import SessionGuard from './components/SessionGuard';
import Navbar from './components/Navbar';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Generate from './pages/Generate';
import Report from './pages/Report';
import Guia from './pages/Guia';
import Checklist from './pages/Checklist';

function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans antialiased text-gray-800">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          
          {/* Protected routes that wait for the session handshake */}
          <Route element={<SessionGuard />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/generate" element={<Generate />} />
            <Route path="/reports/:id" element={<Report />} />
          </Route>

          {/* Static informational resources */}
          <Route path="/guia" element={<Guia />} />
          <Route path="/checklist" element={<Checklist />} />
          
          {/* Catch-all fallback redirecting to Landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
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
