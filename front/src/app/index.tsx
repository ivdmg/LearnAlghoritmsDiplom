import { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '@/shared/store';
import { AppRouter } from './router';
import { ThemeProvider, useThemeConfig } from './providers/theme-provider';
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

  // Pyodide preload убран отсюда — загружается лениво только при открытии страницы задачи
  // (см. TaskPage и usePyodide)

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
