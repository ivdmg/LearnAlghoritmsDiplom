import { Switch } from 'antd';
import { useAppDispatch, useAppSelector } from '@/shared/lib/hooks/use-app-selector';
import { toggleTheme } from '@/shared/store/slices/theme-slice';

export function ThemeToggle() {
  const dispatch = useAppDispatch();
  const isDark = useAppSelector((state) => state.theme.mode) === 'dark';

  return (
    <Switch
      checked={isDark}
      onChange={() => dispatch(toggleTheme())}
      checkedChildren="🌙"
      unCheckedChildren="☀️"
    />
  );
}
