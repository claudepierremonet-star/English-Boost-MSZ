import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const READING_MODE_STORAGE_KEY = 'eb_msz_reading_mode_v1';

interface ReadingModeContextValue {
  isReadingMode: boolean;
  setReadingMode: (enabled: boolean) => void;
  toggleReadingMode: () => void;
}

const ReadingModeContext = createContext<ReadingModeContextValue>({
  isReadingMode: false,
  setReadingMode: () => {},
  toggleReadingMode: () => {}
});

export const ReadingModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReadingMode, setIsReadingMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(READING_MODE_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(READING_MODE_STORAGE_KEY, String(isReadingMode));
    } catch {
      // Ignore storage errors in restricted environments
    }
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('reading-mode', isReadingMode);
    }
  }, [isReadingMode]);

  const setReadingMode = useCallback((enabled: boolean) => {
    setIsReadingMode(enabled);
  }, []);

  const toggleReadingMode = useCallback(() => {
    setIsReadingMode((prev) => !prev);
  }, []);

  return (
    <ReadingModeContext.Provider value={{ isReadingMode, setReadingMode, toggleReadingMode }}>
      {children}
    </ReadingModeContext.Provider>
  );
};

export function useReadingMode(): ReadingModeContextValue {
  return useContext(ReadingModeContext);
}
