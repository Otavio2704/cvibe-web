import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import {
  LayoutDashboard,
  Sparkles,
  BookOpen,
  CheckSquare,
  Menu,
  X,
  ArrowRight,
  House,
} from 'lucide-react';

export function Sidebar() {
  const { isMockMode } = useSession();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Otimizar Currículo', path: '/generate', icon: Sparkles },
    { name: 'Guia da Gupy', path: '/guia', icon: BookOpen },
    { name: 'Checklist Interativo', path: '/checklist', icon: CheckSquare },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  if (location.pathname === '/') return null;

  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-slate-200/80 bg-white sticky top-0 self-start h-screen overflow-y-auto">
      <div className="flex min-h-full flex-col justify-between p-6">
        <div>
          <Link to="/dashboard" className="flex items-center space-x-2.5 mb-8 px-2">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md shadow-indigo-200">
              G
            </div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-900 bg-clip-text text-transparent">
              Gupify<span className="text-slate-400 font-normal text-sm ml-0.5">Web</span>
            </span>
          </Link>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</span>
            {isMockMode ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                Simulador
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                API Online
              </span>
            )}
          </div>

          <Link
            to="/"
            className="w-full text-xs font-bold text-slate-500 hover:text-indigo-700 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border border-slate-200 hover:border-indigo-200 bg-slate-50/50 hover:bg-indigo-50/60 transition-all shadow-sm"
          >
            <House className="w-3.5 h-3.5" />
            <span>Ver página inicial</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}

export default function Navbar() {
  const { isMockMode } = useSession();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Otimizar Currículo', path: '/generate', icon: Sparkles },
    { name: 'Guia da Gupy', path: '/guia', icon: BookOpen },
    { name: 'Checklist Interativo', path: '/checklist', icon: CheckSquare },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  if (location.pathname === '/') {
    return (
      <nav className="bg-white/95 border-b border-gray-100 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-3 min-w-0">
              <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
                <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md shadow-indigo-200">
                  G
                </div>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                  Gupify<span className="text-gray-400 font-normal text-sm ml-0.5">Web</span>
                </span>
              </Link>

              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-50 text-indigo-700 border border-indigo-100/50 whitespace-nowrap">
                Otimizador ATS · Gratuito
              </span>
            </div>

            <div className="flex items-center pl-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] uppercase tracking-wider font-extrabold rounded-xl shadow-sm transition-all hover:shadow-indigo-100 active:scale-95 whitespace-nowrap"
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
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 animate-fade-in lg:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2 flex-shrink-0" title="Voltar ao Painel">
              <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md shadow-indigo-200">
                G
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                Gupify<span className="text-gray-400 font-normal text-sm ml-0.5">Web</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="bg-white border-b border-gray-100 px-2 pt-2 pb-4 space-y-1 shadow-inner animate-fade-in">
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
                navigate('/');
              }}
              className="w-full text-center text-sm text-indigo-700 bg-indigo-50 hover:bg-indigo-100 py-2 px-3 rounded-md font-medium transition-all flex items-center justify-center space-x-2"
            >
              <House className="w-4 h-4" />
              <span>Ver página inicial</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

