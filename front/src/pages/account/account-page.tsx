import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/widgets/app-header';
import { GlassButton } from '@/shared/ui/glass-button/glass-button';
import { useAppDispatch, useAppSelector } from '@/shared/lib/hooks/use-app-selector';
import {
  changePassword,
  clearAuthError,
  login,
  logout,
  register,
} from '@/shared/store/slices/auth-slice';
import { isApiConfigured } from '@/shared/config/api-url';
import { useMyStats } from '@/shared/hooks/use-my-stats';
import { TASKS } from '@/entities/task';
import styles from './account-page.module.css';

const USERNAME_RE = /^[a-zA-Z0-9_]{3,24}$/;

export function AccountPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { accessToken, user, loading, error, bootstrapDone } = useAppSelector((s) => s.auth);
  const { stats, loading: statsLoading, reload } = useMyStats();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [curPwd, setCurPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);

  const usernameValid = USERNAME_RE.test(username);
  const usernameTouched = username.length > 0;
  const passwordsMatch = newPwd === confirmPwd && newPwd.length > 0;

  const apiOn = isApiConfigured();

  const taskTitle = (id: string) => TASKS.find((t) => t.id === id)?.title ?? id;

  if (apiOn && !bootstrapDone) {
    return (
      <div className={styles.layout}>
        <AppHeader />
        <main className={styles.main}>
          <p className={styles.muted}>Загрузка…</p>
        </main>
      </div>
    );
  }

  if (!apiOn) {
    return (
      <div className={styles.layout}>
        <AppHeader />
        <main className={styles.main}>
          <h1 className={styles.h1}>Личный кабинет</h1>
          <p className={styles.muted}>
            Сервер авторизации не подключён. Для локальной работы создайте файл{' '}
            <code className={styles.code}>front/.env.local</code> с{' '}
            <code className={styles.code}>VITE_API_URL=http://localhost:3000</code>, запустите API из папки{' '}
            <code className={styles.code}>server</code> (см. <code className={styles.code}>docs/COMMERCIAL_STACK_AUTH_AND_DEPLOY.md</code>
            ).
          </p>
          <GlassButton onClick={() => navigate(-1)}>Назад</GlassButton>
        </main>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearAuthError());
    if (mode === 'login') {
      void dispatch(login({ identifier: identifier.trim(), password }));
    } else {
      void dispatch(register({ email, password, username: username.trim(), displayName: displayName.trim() || undefined }));
    }
  };

  const handleLogout = () => {
    void dispatch(logout());
    setPwdMsg(null);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);
    if (!passwordsMatch) {
      setPwdMsg('Пароли не совпадают');
      return;
    }
    void dispatch(changePassword({ currentPassword: curPwd, newPassword: newPwd })).then((a) => {
      if (changePassword.fulfilled.match(a)) {
        setPwdMsg('Пароль обновлён. Войдите снова.');
        setCurPwd('');
        setNewPwd('');
        setConfirmPwd('');
      } else if (changePassword.rejected.match(a)) {
        setPwdMsg(String(a.payload ?? 'Ошибка'));
      }
    });
  };

  return (
    <div className={styles.layout}>
      <AppHeader />
      <main className={styles.main}>
        <h1 className={styles.h1}>Личный кабинет</h1>

        {!accessToken ? (
          <section className={styles.card}>
            <div className={styles.tabs}>
              <button
                type="button"
                className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
                onClick={() => setMode('login')}
              >
                Вход
              </button>
              <button
                type="button"
                className={`${styles.tab} ${mode === 'register' ? styles.tabActive : ''}`}
                onClick={() => setMode('register')}
              >
                Регистрация
              </button>
            </div>

            {mode === 'login' ? (
              <form className={styles.form} onSubmit={handleSubmit}>
                <label className={styles.label}>
                  Email или логин
                  <input
                    className={styles.input}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    autoComplete="username"
                    placeholder="email@example.com или my_username"
                  />
                </label>
                <label className={styles.label}>
                  Пароль
                  <input
                    className={styles.input}
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </label>
                {error && <p className={styles.error}>{error}</p>}
                <GlassButton type="submit" disabled={loading}>
                  {loading ? '…' : 'Войти'}
                </GlassButton>
              </form>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                <label className={styles.label}>
                  Логин *
                  <input
                    className={`${styles.input} ${usernameTouched && !usernameValid ? styles.inputError : ''}`}
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    autoComplete="username"
                    placeholder="3–24 символа, a-z, 0-9, _"
                    required
                  />
                  {usernameTouched && !usernameValid && (
                    <span className={styles.fieldError}>3–24 символа, только a-z, 0-9, _</span>
                  )}
                </label>
                <label className={styles.label}>
                  Email *
                  <input
                    className={styles.input}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </label>
                <label className={styles.label}>
                  Пароль *
                  <input
                    className={styles.input}
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Минимум 8 символов, буквы + цифры"
                  />
                </label>
                <label className={styles.label}>
                  Имя (необязательно)
                  <input
                    className={styles.input}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    autoComplete="nickname"
                  />
                </label>
                {error && <p className={styles.error}>{error}</p>}
                <GlassButton type="submit" disabled={loading || (usernameTouched && !usernameValid)}>
                  {loading ? '…' : 'Зарегистрироваться'}
                </GlassButton>
              </form>
            )}
          </section>
        ) : (
          <>
            <section className={styles.card}>
              <h2 className={styles.h2}>Профиль</h2>
              {user?.username && (
                <p className={styles.row}>
                  <span className={styles.muted}>Логин</span>{' '}
                  <strong>{user.username}</strong>
                </p>
              )}
              <p className={styles.row}>
                <span className={styles.muted}>Email</span> {user?.email}
              </p>
              {user?.displayName && (
                <p className={styles.row}>
                  <span className={styles.muted}>Имя</span> {user.displayName}
                </p>
              )}
              <div className={styles.actions}>
                <GlassButton onClick={handleLogout}>Выйти</GlassButton>
              </div>
            </section>

            <section className={styles.card}>
              <h2 className={styles.h2}>Смена пароля</h2>
              <form className={styles.form} onSubmit={handleChangePassword}>
                <label className={styles.label}>
                  Текущий пароль
                  <input
                    className={styles.input}
                    type="password"
                    required
                    value={curPwd}
                    onChange={(e) => setCurPwd(e.target.value)}
                    autoComplete="current-password"
                  />
                </label>
                <label className={styles.label}>
                  Новый пароль
                  <input
                    className={styles.input}
                    type="password"
                    required
                    minLength={8}
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Минимум 8 символов, буквы + цифры"
                  />
                </label>
                <label className={styles.label}>
                  Подтвердите пароль
                  <input
                    className={`${styles.input} ${confirmPwd && !passwordsMatch ? styles.inputError : ''}`}
                    type="password"
                    required
                    minLength={8}
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    autoComplete="new-password"
                  />
                  {confirmPwd && !passwordsMatch && (
                    <span className={styles.fieldError}>Пароли не совпадают</span>
                  )}
                </label>
                {pwdMsg && (
                  <p className={pwdMsg.includes('обновлён') ? styles.ok : styles.error}>{pwdMsg}</p>
                )}
                <GlassButton type="submit">Сохранить пароль</GlassButton>
              </form>
            </section>

            <section className={styles.card}>
              <div className={styles.statsHeader}>
                <h2 className={styles.h2}>Статистика задач</h2>
                <GlassButton type="button" onClick={() => void reload()}>
                  Обновить
                </GlassButton>
              </div>
              {statsLoading && <p className={styles.muted}>Загрузка…</p>}
              {stats && (
                <>
                  <p className={styles.bigStat}>
                    Решено: <strong>{stats.solvedTotal}</strong> из {TASKS.length}
                  </p>
                  <p className={styles.row}>
                    Easy / Medium / Hard:{' '}
                    <strong>
                      {stats.byDifficulty.easy ?? 0} / {stats.byDifficulty.medium ?? 0} /{' '}
                      {stats.byDifficulty.hard ?? 0}
                    </strong>
                  </p>
                  <p className={styles.row}>
                    Серия дней (streak): <strong>{stats.streakDays}</strong>
                  </p>
                  {stats.firstSolvedAt && (
                    <p className={styles.row}>
                      Первое решение:{' '}
                      {new Date(stats.firstSolvedAt).toLocaleDateString('ru-RU')}
                    </p>
                  )}
                  <h3 className={styles.h3}>Недавние</h3>
                  <ul className={styles.list}>
                    {stats.lastSolved.slice(0, 8).map((x) => (
                      <li key={`${x.taskId}-${x.solvedAt}`}>
                        <button
                          type="button"
                          className={styles.linkish}
                          onClick={() => navigate(`/task/${x.taskId}`)}
                        >
                          {taskTitle(x.taskId)}
                        </button>
                        <span className={styles.muted}>
                          {' '}
                          · {x.difficulty} · {new Date(x.solvedAt).toLocaleString('ru-RU')}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
