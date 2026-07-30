import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import HiredFeedbackModal from './HiredFeedbackModal';
import { CVIBE_LOGO } from '../utils/assets';
import {
  LayoutDashboard,
  Sparkles,
  BookOpen,
  CheckSquare,
  Menu,
  X,
  ArrowRight,
  House,
  PartyPopper,
} from 'lucide-react';


function HiredFeedbackCard({ compact = false, dark = false, onClick }: { compact?: boolean; dark?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative block w-full text-left rounded-lg border transition-all overflow-hidden active:scale-[0.98] ${
        dark
          ? 'border-emerald-500/20 bg-emerald-500/[0.07] hover:bg-emerald-500/[0.12] hover:border-emerald-500/30'
          : 'border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-emerald-50/60 to-white shadow-sm hover:shadow-md hover:shadow-emerald-100/60 hover:border-emerald-300'
      } ${compact ? 'p-3' : 'p-4'}`}
    >
      <div className="relative flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <PartyPopper className="w-4.5 h-4.5" />
        </div>
        <div className="min-w-0">
          <div className={`flex items-center gap-1.5 font-black text-sm ${dark ? 'text-emerald-300' : 'text-emerald-800'}`}>
            <span>Conseguiu a vaga?</span>
          </div>
          <p className={`text-[11px] leading-relaxed mt-1 ${dark ? 'text-emerald-200/60' : 'text-emerald-700/80'}`}>
            Me avisa se você foi contratado usando a plataforma. Quero publicar relatos reais na landing page.
          </p>
        </div>
      </div>
    </button>
  );
}


export function Sidebar() {
  const { isMockMode } = useSession();
  const location = useLocation();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Otimizar Currículo', path: '/generate', icon: Sparkles },
    { name: 'Guia dos Recrutadores', path: '/guia', icon: BookOpen },
    { name: 'Checklist Interativo', path: '/checklist', icon: CheckSquare },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  if (location.pathname === '/') return null;

  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-slate-900 bg-slate-950 sticky top-0 self-start h-screen overflow-y-auto">
      <div className="flex min-h-full flex-col justify-between p-6">
        <div>
          <Link to="/dashboard" className="group flex items-center space-x-2.5 mb-9 px-2">
            <img
              src={CVIBE_LOGO}
              alt="Logo do CVibe"
              className="w-9 h-9 rounded-lg shadow-md shadow-black/30 object-contain transition-transform group-hover:scale-105"
            />
            <span className="font-serif-editorial text-xl font-semibold tracking-tight text-white">
              CVibe
            </span>
          </Link>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-nav-item relative flex items-center space-x-3 pl-4 pr-3.5 py-2.5 rounded-lg text-sm font-semibold ${
                    active
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                  }`}
                >
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full bg-indigo-400"
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={`flex items-center justify-center w-7 h-7 rounded-md transition-colors ${
                      active ? 'bg-indigo-500/20' : 'group-hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-indigo-300' : 'text-slate-500'}`} />
                  </span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800 space-y-4">
          <HiredFeedbackCard dark onClick={() => setFeedbackOpen(true)} />

          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</span>
            {isMockMode ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5 pulse-dot"></span>
                Simulador
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>
                API Online
              </span>
            )}
          </div>

          <Link
            to="/"
            className="group w-full text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-slate-800 hover:border-slate-700 bg-white/5 hover:bg-white/10 transition-all"
          >
            <House className="w-3.5 h-3.5" />
            <span>Ver página inicial</span>
            <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </Link>
        </div>
      </div>
      <HiredFeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </aside>
  );
}

export default function Navbar() {
  const { isMockMode } = useSession();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Otimizar Currículo', path: '/generate', icon: Sparkles },
    { name: 'Guia dos Recrutadores', path: '/guia', icon: BookOpen },
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
                <img
                  src={CVIBE_LOGO}
                  alt="Logo do CVibe"
                  className="w-9 h-9 rounded-lg shadow-md shadow-indigo-200 object-contain"
                />
                <span className="font-serif-editorial text-xl font-semibold tracking-tight text-slate-950">
                  CVibe
                </span>
              </Link>

              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
                Otimização por IA Semântica
              </span>
            </div>

            <div className="flex items-center pl-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-slate-950 hover:bg-slate-900 text-white text-[11px] uppercase tracking-wider font-extrabold rounded-lg shadow-sm transition-all active:scale-95 whitespace-nowrap"
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
    <>
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 animate-fade-in lg:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2 flex-shrink-0" title="Voltar ao Painel">
              <img
                src={CVIBE_LOGO}
                alt="Logo do CVibe"
                className="w-9 h-9 rounded-lg shadow-md shadow-indigo-200 object-contain"
              />
              <span className="font-serif-editorial text-xl font-semibold tracking-tight text-slate-950">
                CVibe
              </span>
            </Link>
          </div>

          <div className="flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 active:scale-95 transition-all focus:outline-none"
              aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              <span className="relative w-6 h-6 block">
                <X className={`w-6 h-6 absolute inset-0 transition-all duration-200 ${isOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-45'}`} />
                <Menu className={`w-6 h-6 absolute inset-0 transition-all duration-200 ${isOpen ? 'opacity-0 rotate-45' : 'opacity-100 rotate-0'}`} />
              </span>
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
                className={`relative flex items-center space-x-3 pl-3.5 pr-3 py-2.5 rounded-xl text-base font-semibold transition-colors ${
                  active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full bg-indigo-600" aria-hidden="true" />
                )}
                <Icon className={`w-5 h-5 ${active ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-4 pb-2 border-t border-gray-100 mt-3 px-3 flex flex-col gap-3">
            <HiredFeedbackCard compact onClick={() => setFeedbackOpen(true)} />

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Status da API:</span>
              {isMockMode ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 pulse-dot"></span>
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
              className="w-full text-center text-sm text-indigo-700 bg-indigo-50 hover:bg-indigo-100 active:scale-[0.98] py-2.5 px-3 rounded-xl font-bold transition-all flex items-center justify-center space-x-2"
            >
              <House className="w-4 h-4" />
              <span>Ver página inicial</span>
            </button>
          </div>
        </div>
      )}
    </nav>
    <HiredFeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  );
}
