import { useState } from 'react';
import { useAppDispatch } from '@/shared/lib/hooks/use-app-selector';
import { login as loginAction } from '@/shared/store/slices/auth-slice';
import styles from './auth-page.module.css';

const API = 'http://localhost:3001';

export function AuthPage() {
  const dispatch = useAppDispatch();
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedLogin = loginValue.trim();
    if (!trimmedLogin || !password) {
      setError('Заполните все поля');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        const check = await fetch(`${API}/users?login=${encodeURIComponent(trimmedLogin)}`);
        const existing = await check.json();
        if (existing.length > 0) {
          setError('Пользователь с таким логином уже существует');
          setLoading(false);
          return;
        }

        const res = await fetch(`${API}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login: trimmedLogin, password }),
        });
        const user = await res.json();
        dispatch(loginAction({ id: String(user.id), login: user.login }));
      } else {
        const res = await fetch(
          `${API}/users?login=${encodeURIComponent(trimmedLogin)}&password=${encodeURIComponent(password)}`,
        );
        const users = await res.json();
        if (users.length === 0) {
          setError('Неверный логин или пароль');
          setLoading(false);
          return;
        }
        const user = users[0];
        dispatch(loginAction({ id: String(user.id), login: user.login }));
      }
    } catch {
      setError('Ошибка сервера. Убедитесь, что json-server запущен.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.card}>
        <h1 className={styles.title}>AlgoLearn</h1>
        <p className={styles.subtitle}>
          {mode === 'register' ? 'Создайте аккаунт для начала обучения' : 'Войдите в свой аккаунт'}
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Логин</label>
            <input
              className={styles.input}
              type="text"
              value={loginValue}
              onChange={(e) => setLoginValue(e.target.value)}
              placeholder="Введите логин"
              autoComplete="username"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Пароль</label>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? '...' : mode === 'register' ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </form>

        <div className={styles.toggle}>
          {mode === 'register' ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}
          <button
            className={styles.toggleBtn}
            type="button"
            onClick={() => {
              setMode(mode === 'register' ? 'login' : 'register');
              setError('');
            }}
          >
            {mode === 'register' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </div>
      </div>
    </div>
  );
}
