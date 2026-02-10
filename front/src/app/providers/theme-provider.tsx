import { createContext, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAppSelector } from '@/shared/lib/hooks/use-app-selector';
import type { ThemeConfig } from 'antd';
import { theme as antTheme } from 'antd';

const { darkAlgorithm, defaultAlgorithm } = antTheme;

type ThemeContextValue = ThemeConfig;

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeMode = useAppSelector((state) => state.theme.mode);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  const themeConfig: ThemeConfig = {
    algorithm: themeMode === 'dark' ? darkAlgorithm : defaultAlgorithm,
    token: {
      colorPrimary: '#1677ff',
      borderRadius: 6,
    },
  };

  return (
    <ThemeContext.Provider value={themeConfig}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeConfig(): ThemeConfig {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeConfig must be used within ThemeProvider');
  }
  return context;
}
