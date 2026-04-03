import { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '@/shared/store';
import { AppRouter } from './router';
import { ThemeProvider, useThemeConfig } from './providers/theme-provider';
import { preloadPyodide } from '@/features/run-python';
import { useAppDispatch } from '@/shared/lib/hooks/use-app-selector';
import { bootstrapAuth, markBootstrapDone } from '@/shared/store/slices/auth-slice';
import { isApiConfigured } from '@/shared/config/api-url';

function AuthBootstrap() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (isApiConfigured()) {
      void dispatch(bootstrapAuth());
    } else {
      dispatch(markBootstrapDone());
    }
  }, [dispatch]);
  return null;
}

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
      const id = globalThis.setTimeout(preload, 2000);
      return () => globalThis.clearTimeout(id);
    }
  }, []);

  return (
    <ConfigProvider theme={themeConfig}>
      <BrowserRouter>
        <AuthBootstrap />
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
