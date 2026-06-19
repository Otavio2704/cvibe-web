import { Outlet } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { Loader2 } from 'lucide-react';

export default function SessionGuard() {
  const { sessionReady } = useSession();

  if (!sessionReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Iniciando Sessão Segura
        </h3>
        <p className="text-sm text-gray-500 mt-2 max-w-xs">
          Estamos preparando o seu ambiente seguro temporário no Gupify.
        </p>
      </div>
    );
  }

  return <Outlet />;
}
