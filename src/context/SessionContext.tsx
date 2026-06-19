import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { session, isUsingMock, setMockStateListener } from '../services/api';

interface SessionContextType {
  sessionReady: boolean;
  sessionValid: boolean;
  isMockMode: boolean;
  refreshSession: () => Promise<void>;
  endSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType>({
  sessionReady: false,
  sessionValid: false,
  isMockMode: false,
  refreshSession: async () => {},
  endSession: async () => {}
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);
  const [isMockMode, setIsMockMode] = useState(isUsingMock());

  // Listen to the API mock mode switch in real-time
  useEffect(() => {
    setMockStateListener((mockActive: boolean) => {
      setIsMockMode(mockActive);
    });
  }, []);

  const initSession = async () => {
    try {
      setSessionReady(false);
      const result = await session.init();
      if (result) {
        setSessionValid(true);
      } else {
        setSessionValid(false);
      }
    } catch (err) {
      console.warn("Session init error, using simulator:", err);
      setSessionValid(true);
    } finally {
      setSessionReady(true);
      setIsMockMode(isUsingMock());
    }
  };

  useEffect(() => {
    initSession();
  }, []);

  const refreshSession = async () => {
    try {
      const checkResult = await session.check();
      if (checkResult && (checkResult.valid || checkResult.success)) {
        setSessionValid(true);
      } else {
        await initSession();
      }
    } catch (err) {
      setSessionValid(true);
    } finally {
      setSessionReady(true);
      setIsMockMode(isUsingMock());
    }
  };

  const endSession = async () => {
    try {
      await session.destroy();
      setSessionValid(false);
      await initSession();
    } catch (err) {
      setSessionValid(false);
      await initSession();
    }
  };

  return (
    <SessionContext.Provider
      value={{
        sessionReady,
        sessionValid,
        isMockMode,
        refreshSession,
        endSession
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
