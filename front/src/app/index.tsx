import { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '@/shared/store';
import { useAppSelector } from '@/shared/lib/hooks/use-app-selector';
import { AppRouter } from './router';
import { ThemeProvider, useThemeConfig } from './providers/theme-provider';
import { preloadPyodide } from '@/features/run-python';
import { AuthPage } from '@/pages/auth/auth-page';

function AppConfig() {
  const themeConfig = useThemeConfig();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    const preload = () => {
      preloadPyodide().catch(() => {});
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(preload);
    } else {
      const id = window.setTimeout(preload, 2000);
      return () => window.clearTimeout(id);
    }
  }, []);

  if (!user) {
    return (
      <ConfigProvider theme={themeConfig}>
        <AuthPage />
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider theme={themeConfig}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ConfigProvider>
  );
}

export function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppConfig />
      </ThemeProvider>
    </Provider>
  );
}
