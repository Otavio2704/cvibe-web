import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { 
  LayoutDashboard, 
  Sparkles, 
  BookOpen, 
  CheckSquare, 
  Menu, 
  X, 
  RefreshCw,
  ArrowRight
} from 'lucide-react';

export default function Navbar() {
  const { isMockMode, endSession } = useSession();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Otimizar Currículo', path: '/generate', icon: Sparkles },
    { name: 'Guia da Gupy', path: '/guia', icon: BookOpen },
    { name: 'Checklist Interativo', path: '/checklist', icon: CheckSquare },
  ];

  const handleResetSession = async () => {
    if (confirm("Tem certeza que deseja encerrar a sessão atual? Isso limpará seus currículos e relatórios temporários do simulador e gerará uma nova sessão.")) {
      setResetting(true);
      await endSession();
      setResetting(false);
      window.location.href = '/';
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // [ANTI-AI] Barra de cima preenchida de forma elegante e minimalista na Landing Page (/)
  // Evita poluição de abas internas antes do login, mantendo o visual equilibrado.
  if (location.pathname === '/') {
    return (
      <nav className="bg-white/95 border-b border-gray-100 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-3">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
                <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md shadow-indigo-200">
                  G
                </div>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                  Gupify<span className="text-gray-400 font-normal text-sm ml-0.5">Web</span>
                </span>
              </Link>

              {/* Minimalist Status Badge */}
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-50 text-indigo-700 border border-indigo-100/50">
                Beta Aberto · Otimizador ATS
              </span>
            </div>

            {/* Direct CTA to the workspace */}
            <div className="flex items-center">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] uppercase tracking-wider font-extrabold rounded-xl shadow-sm transition-all hover:shadow-indigo-100 active:scale-95"
              >
                <span>Acessar Painel</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* [ANTI-AI] A logo redireciona para o painel de controle (/dashboard) nas páginas internas, evitando retornar à tela de apresentação */}
            <Link to="/dashboard" className="flex items-center space-x-2 flex-shrink-0" title="Voltar ao Painel">
              <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md shadow-indigo-200">
                G
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                Gupify<span className="text-gray-400 font-normal text-sm ml-0.5">Web</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex ml-10 space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right section with Session Status & Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {/* API Status Badge */}
            <div className="flex items-center">
              {isMockMode ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/50" title="A API remota está offline ou inacessível. O Gupify Web está utilizando um simulador completo no navegador.">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>
                  Simulador Local Ativo
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50" title="Conexão direta ativa com o gupify-api">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                  API Conectada
                </span>
              )}
            </div>

            <button
              onClick={handleResetSession}
              disabled={resetting}
              className="text-xs font-medium text-gray-500 hover:text-red-600 flex items-center space-x-1 py-1 px-2 rounded-md border border-gray-200 hover:border-red-200 bg-white transition-all shadow-sm"
              title="Apaga a sessão atual e inicia uma nova"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
              <span>Resetar Sessão</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-2 pt-2 pb-4 space-y-1 shadow-inner animate-fade-in">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-2.5 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-4 pb-2 border-t border-gray-100 mt-3 px-3 flex flex-col gap-3">
            {/* Status for mobile */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Status da API:</span>
              {isMockMode ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>
                  Simulador Local Ativo
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                  API Conectada
                </span>
              )}
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                handleResetSession();
              }}
              disabled={resetting}
              className="w-full text-center text-sm text-red-600 bg-red-50 hover:bg-red-100 py-2 px-3 rounded-md font-medium transition-all flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
              <span>Resetar Sessão Atual</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
