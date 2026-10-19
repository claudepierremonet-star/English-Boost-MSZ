import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppTheme = 'dark' | 'light' | 'dark-floral' | 'light-floral';
export type FloralBorderWidth = '0.5cm' | '0.75cm' | '1cm';

interface ThemeContextType {
  theme: AppTheme;
  floralWidth: FloralBorderWidth;
  setTheme: (theme: AppTheme) => void;
  setFloralWidth: (width: FloralBorderWidth) => void;
  isDark: boolean;
  isFloral: boolean;
}

const THEME_STORAGE_KEY = 'eb_msz_app_theme';
const BORDER_WIDTH_STORAGE_KEY = 'eb_msz_floral_width';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as AppTheme;
      if (['dark', 'light', 'dark-floral', 'light-floral'].includes(saved)) {
        return saved;
      }
    } catch (e) {
      console.warn('Theme read error', e);
    }
    return 'dark';
  });

  const [floralWidth, setFloralWidthState] = useState<FloralBorderWidth>(() => {
    try {
      const saved = localStorage.getItem(BORDER_WIDTH_STORAGE_KEY) as FloralBorderWidth;
      if (['0.5cm', '0.75cm', '1cm'].includes(saved)) {
        return saved;
      }
    } catch (e) {
      console.warn('Border width read error', e);
    }
    return '0.75cm';
  });

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.warn('Theme save error', e);
    }
  };

  const setFloralWidth = (newWidth: FloralBorderWidth) => {
    setFloralWidthState(newWidth);
    try {
      localStorage.setItem(BORDER_WIDTH_STORAGE_KEY, newWidth);
    } catch (e) {
      console.warn('Border width save error', e);
    }
  };

  const isDark = theme === 'dark' || theme === 'dark-floral';
  const isFloral = theme === 'dark-floral' || theme === 'light-floral';

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }

    root.setAttribute('data-theme', theme);
  }, [theme, isDark]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        floralWidth,
        setTheme,
        setFloralWidth,
        isDark,
        isFloral
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return ctx;
};
