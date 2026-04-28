import { createContext, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAppSelector } from '@/shared/lib/hooks/use-app-selector';
import type { ThemeConfig } from 'antd/es/config-provider/context';
import antTheme from 'antd/es/theme';

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
      fontFamily:
        '"Plus Jakarta Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontFamilyCode:
        '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
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
