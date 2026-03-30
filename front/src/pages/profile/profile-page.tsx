import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/shared/lib/hooks/use-app-selector';
import { login as loginAction, logout } from '@/shared/store/slices/auth-slice';
import { AppHeader } from '@/widgets/app-header';
import styles from './profile-page.module.css';

const API = 'http://localhost:3001';

export function ProfilePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const [loginValue, setLoginValue] = useState(user?.login ?? '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const trimmed = loginValue.trim();
    if (!trimmed) {
      setMsg({ type: 'err', text: 'Логин не может быть пустым' });
      return;
    }
    if (!user) return;

    setSaving(true);
    try {
      const body: Record<string, string> = { login: trimmed };
      if (password) body.password = password;

      if (trimmed !== user.login) {
        const check = await fetch(`${API}/users?login=${encodeURIComponent(trimmed)}`);
        const existing = await check.json();
        if (existing.length > 0) {
          setMsg({ type: 'err', text: 'Этот логин уже занят' });
          setSaving(false);
          return;
        }
      }

      await fetch(`${API}/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      dispatch(loginAction({ id: user.id, login: trimmed }));
      setPassword('');
      setMsg({ type: 'ok', text: 'Сохранено' });
    } catch {
      setMsg({ type: 'err', text: 'Ошибка сервера' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className={styles.page}>
      <AppHeader />

      <div className={styles.body}>
        <div className={styles.container}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Личный кабинет</h2>
            <form className={styles.form} onSubmit={handleSave}>
              <div className={styles.field}>
                <label className={styles.label}>Логин</label>
                <input
                  className={styles.input}
                  type="text"
                  value={loginValue}
                  onChange={(e) => setLoginValue(e.target.value)}
                  autoComplete="username"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Новый пароль</label>
                <input
                  className={styles.input}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Оставьте пустым, чтобы не менять"
                  autoComplete="new-password"
                />
              </div>
              {msg && (
                <p className={msg.type === 'ok' ? styles.success : styles.error}>{msg.text}</p>
              )}
              <button className={styles.saveBtn} type="submit" disabled={saving}>
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </form>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Статистика</h2>
            <div className={styles.statsPlaceholder}>Скоро тут будет статистика</div>
          </div>

          <button className={styles.logoutBtn} type="button" onClick={handleLogout}>
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </div>
  );
}
