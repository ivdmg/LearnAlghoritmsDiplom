import { ConfigProvider } from 'antd';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '@/shared/store';
import { AppRouter } from './router';
import { ThemeProvider, useThemeConfig } from './providers/theme-provider';

function AppConfig() {
  const themeConfig = useThemeConfig();

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
