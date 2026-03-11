import { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '@/shared/store';
import { AppRouter } from './router';
import { ThemeProvider, useThemeConfig } from './providers/theme-provider';
import { preloadPyodide } from '@/features/run-python';

function AppConfig() {
  const themeConfig = useThemeConfig();

  useEffect(() => {
    const preload = () => {
      preloadPyodide().catch(() => {
        // тихо игнорируем ошибку предзагрузки, она всплывёт в usePyodide
      });
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(preload);
    } else {
      const id = window.setTimeout(preload, 2000);
      return () => window.clearTimeout(id);
    }
  }, []);

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
