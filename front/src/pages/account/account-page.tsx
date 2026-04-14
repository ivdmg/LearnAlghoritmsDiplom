import { useState, useEffect } from 'react';
import { useNavigate, type NavigateFunction } from 'react-router-dom';
import {
  UserOutlined,
  EditOutlined,
  KeyOutlined,
  MailOutlined,
  DeleteOutlined,
  LogoutOutlined,
  ReloadOutlined,
  CalendarOutlined,
  BarChartOutlined,
  LineChartOutlined,
  TrophyOutlined,
  BookOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { AppHeader } from '@/widgets/app-header';
import { GlassButton } from '@/shared/ui/glass-button/glass-button';
import { useAppDispatch, useAppSelector } from '@/shared/lib/hooks/use-app-selector';
import {
  changePassword,
  deleteAccount,
  logout,
  updateProfile,
} from '@/shared/store/slices/auth-slice';
import { isApiConfigured } from '@/shared/config/api-url';
import { useMyStats, type MyStats } from '@/shared/hooks/use-my-stats';
import { TASKS } from '@/entities/task';
import { StatsKPI } from '@/widgets/stats-kpi';
import { CalendarHeatmap, DifficultyPie, TopicBarChart, ActivityLineChart } from '@/widgets/stats-dashboard/ui/charts';
import styles from './account-page.module.css';

const USERNAME_RE = /^[a-zA-Z0-9_]{3,24}$/;

type UserShape = {
  id: string;
  email: string;
  username: string | null;
  displayName: string | null;
};

/** Секция профиля */
function ProfileSection({
  user,
  stats,
  statsLoading,
  reload,
  navigate,
}: {
  user: UserShape;
  stats: MyStats | null;
  statsLoading: boolean;
  reload: () => void;
  navigate: NavigateFunction;
}) {
  const dispatch = useAppDispatch();
  const taskTitle = (id: string) => TASKS.find((t) => t.id === id)?.title ?? id;

  // displayName
  const [editName, setEditName] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName ?? '');
  const [nameMsg, setNameMsg] = useState<string | null>(null);

  // username
  const [editUsername, setEditUsername] = useState(false);
  const [username, setUsername] = useState(user.username ?? '');
  const [usernamePwd, setUsernamePwd] = useState('');
  const [usernameMsg, setUsernameMsg] = useState<string | null>(null);

  // email
  const [editEmail, setEditEmail] = useState(false);
  const [email, setEmail] = useState(user.email ?? '');
  const [emailPwd, setEmailPwd] = useState('');
  const [emailMsg, setEmailMsg] = useState<string | null>(null);

  // delete
  const [showDelete, setShowDelete] = useState(false);
  const [deletePwd, setDeletePwd] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);
  const passwordMatch = deletePwd === deleteConfirm;

  const handleSaveDisplayName = () => {
    setNameMsg(null);
    void dispatch(updateProfile({ displayName: displayName.trim() || undefined })).then((a) => {
      if (updateProfile.fulfilled.match(a)) {
        setEditName(false);
        setNameMsg('Сохранено');
      } else {
        setNameMsg(String(a.payload ?? 'Ошибка'));
      }
    });
  };

  const handleSaveUsername = (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameMsg(null);
    void dispatch(updateProfile({ username: username.trim(), currentPassword: usernamePwd })).then((a) => {
      if (updateProfile.fulfilled.match(a)) {
        setEditUsername(false);
        setUsernamePwd('');
        setUsernameMsg('Логин обновлён');
      } else {
        setUsernameMsg(String(a.payload ?? 'Ошибка'));
      }
    });
  };

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailMsg(null);
    void dispatch(updateProfile({ email: email.trim(), currentPassword: emailPwd })).then((a) => {
      if (updateProfile.fulfilled.match(a)) {
        setEditEmail(false);
        setEmailPwd('');
        setEmailMsg('Email обновлён');
      } else {
        setEmailMsg(String(a.payload ?? 'Ошибка'));
      }
    });
  };

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordMatch) {
      setDeleteMsg('Пароли не совпадают');
      return;
    }
    setDeleteMsg(null);
    void dispatch(deleteAccount({ currentPassword: deletePwd })).then((a) => {
      if (deleteAccount.fulfilled.match(a)) {
        navigate('/');
      } else {
        setDeleteMsg(String(a.payload ?? 'Ошибка'));
      }
    });
  };

  const avatarLetter = user.displayName?.charAt(0)?.toUpperCase() ?? user.username?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <>
      {/* Профиль + статистика: 2 колонки */}
      <section className={styles.topGrid}>
        {/* Левая: профиль + настройки */}
        <div className={styles.sidebar}>
          {/* Аватар + инфо */}
          <div className={`${styles.card} ${styles.profileCard}`}>
            <div className={styles.profileHeader}>
              <div className={styles.avatar}>{avatarLetter}</div>
              <div className={styles.profileInfo}>
                <span className={styles.profileName}>{user.displayName || user.username || 'Пользователь'}</span>
                <span className={styles.profileEmail}>{user.email}</span>
              </div>
            </div>

            {/* Логин */}
            <div className={styles.rowFlex}>
              <div className={styles.row}>
                <span className={styles.muted}><UserOutlined style={{ fontSize: 12, marginRight: 4 }} />Логин</span>{' '}
                {editUsername ? <strong className={styles.editMode}>{username}</strong> : <strong>{user.username}</strong>}
              </div>
              <button type="button" className={styles.editBtn} onClick={() => { setEditUsername(!editUsername); setUsername(user.username ?? ''); setUsernameMsg(null); }}>
                {editUsername ? 'Отмена' : <EditOutlined />}
              </button>
            </div>
            {editUsername && (
              <form className={styles.subForm} onSubmit={handleSaveUsername}>
                <label className={styles.label}>
                  Новый логин
                  <input className={`${styles.input} ${USERNAME_RE.test(username) ? '' : styles.inputError}`} value={username} onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))} autoComplete="username" placeholder="3–24 символа, a-z, 0-9, _" />
                </label>
                <label className={styles.label}>Текущий пароль<input className={styles.input} type="password" required value={usernamePwd} onChange={(e) => setUsernamePwd(e.target.value)} autoComplete="current-password" /></label>
                {usernameMsg && <p className={usernameMsg.includes('обновлён') || usernameMsg === 'Сохранено' ? styles.ok : styles.error}>{usernameMsg}</p>}
                <GlassButton type="submit">Сохранить логин</GlassButton>
              </form>
            )}

            {/* Email */}
            <div className={styles.rowFlex}>
              <div className={styles.row}>
                <span className={styles.muted}><MailOutlined style={{ fontSize: 12, marginRight: 4 }} />Email</span>{' '}
                {editEmail ? <span className={styles.editMode}>{email}</span> : <span>{user.email}</span>}
              </div>
              <button type="button" className={styles.editBtn} onClick={() => { setEditEmail(!editEmail); setEmail(user.email ?? ''); setEmailMsg(null); }}>
                {editEmail ? 'Отмена' : <EditOutlined />}
              </button>
            </div>
            {editEmail && (
              <form className={styles.subForm} onSubmit={handleSaveEmail}>
                <label className={styles.label}>Новый email<input className={styles.input} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
                <label className={styles.label}>Текущий пароль<input className={styles.input} type="password" required value={emailPwd} onChange={(e) => setEmailPwd(e.target.value)} autoComplete="current-password" /></label>
                {emailMsg && <p className={emailMsg.includes('обновлён') || emailMsg === 'Сохранено' ? styles.ok : styles.error}>{emailMsg}</p>}
                <GlassButton type="submit">Сохранить email</GlassButton>
              </form>
            )}

            {/* Имя */}
            <div className={styles.rowFlex}>
              <div className={styles.row}>
                <span className={styles.muted}><UserOutlined style={{ fontSize: 12, marginRight: 4 }} />Имя</span>{' '}
                {editName ? <span className={styles.editMode}>{displayName || '—'}</span> : <span>{user.displayName || '—'}</span>}
              </div>
              <button type="button" className={styles.editBtn} onClick={() => { setEditName(!editName); setDisplayName(user.displayName ?? ''); setNameMsg(null); }}>
                {editName ? 'Отмена' : <EditOutlined />}
              </button>
            </div>
            {editName && (
              <div className={styles.subForm}>
                <label className={styles.label}>Новое имя<input className={styles.input} value={displayName} onChange={(e) => setDisplayName(e.target.value.slice(0, 50))} autoComplete="nickname" placeholder="Максимум 50 символов" /></label>
                {nameMsg && <p className={nameMsg === 'Сохранено' ? styles.ok : styles.error}>{nameMsg}</p>}
                <GlassButton onClick={handleSaveDisplayName}>Сохранить имя</GlassButton>
              </div>
            )}

            <div className={styles.actions}>
              <GlassButton onClick={() => void dispatch(logout())}><LogoutOutlined /> Выйти</GlassButton>
            </div>
          </div>

          {/* Смена пароля */}
          <div className={`${styles.card} ${styles.settingsCard}`}>
            <h3 className={styles.h2}><KeyOutlined /> Смена пароля</h3>
            <ChangePasswordForm />
          </div>

          {/* Удаление */}
          <div className={`${styles.card} ${styles.dangerCard}`}>
            <h3 className={styles.h2}><DeleteOutlined /> Удаление аккаунта</h3>
            <p className={styles.muted}>Это действие необратимо. Все данные будут удалены.</p>
            {!showDelete ? (
              <GlassButton onClick={() => setShowDelete(true)} className={styles.dangerBtn}>Удалить аккаунт</GlassButton>
            ) : (
              <form className={styles.form} onSubmit={handleDelete}>
                <label className={styles.label}>Текущий пароль<input className={styles.input} type="password" required value={deletePwd} onChange={(e) => setDeletePwd(e.target.value)} autoComplete="current-password" /></label>
                <label className={styles.label}>Подтвердите пароль<input className={`${styles.input} ${deleteConfirm && !passwordMatch ? styles.inputError : ''}`} type="password" required value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} autoComplete="current-password" />{deleteConfirm && !passwordMatch && <span className={styles.fieldError}>Пароли не совпадают</span>}</label>
                {deleteMsg && <p className={styles.error}>{deleteMsg}</p>}
                <div className={styles.rowFlex}>
                  <GlassButton type="submit" className={styles.dangerBtn}>Удалить навсегда</GlassButton>
                  <GlassButton onClick={() => { setShowDelete(false); setDeletePwd(''); setDeleteConfirm(''); setDeleteMsg(null); }}>Отмена</GlassButton>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Правая: статистика */}
        <div className={styles.mainStats}>
          {/* KPI */}
          <StatsKPI stats={stats} statsLoading={statsLoading} />

          {/* Статистика заголовок */}
          <div className={styles.statsHeader}>
            <h2 className={styles.h2}>Аналитика</h2>
            <GlassButton type="button" onClick={() => reload()}><ReloadOutlined /> Обновить</GlassButton>
          </div>

          {statsLoading && !stats && <p className={styles.muted}>Загрузка…</p>}

          {stats && (
            <div className={styles.chartsGrid}>
              {/* Heatmap */}
              <div className={styles.chartFull}>
                <div className={styles.chartCard}>
                  <h3 className={styles.h3}><CalendarOutlined /> Календарь активности</h3>
                  <CalendarHeatmap data={stats.calendarData} />
                </div>
              </div>

              {/* Donut + Line */}
              <div className={styles.chartCol}>
                <div className={styles.chartCard}>
                  <h3 className={styles.h3}><BarChartOutlined /> По сложности</h3>
                  <DifficultyPie easy={stats.byDifficulty.easy ?? 0} medium={stats.byDifficulty.medium ?? 0} hard={stats.byDifficulty.hard ?? 0} />
                </div>
              </div>
              <div className={styles.chartCol}>
                <div className={styles.chartCard}>
                  <h3 className={styles.h3}><LineChartOutlined /> Активность по дням</h3>
                  <ActivityLineChart calendarData={stats.calendarData} />
                </div>
              </div>

              {/* Topics */}
              <div className={styles.chartFull}>
                <div className={styles.chartCard}>
                  <h3 className={styles.h3}><BookOutlined /> По темам</h3>
                  <TopicBarChart byTopic={stats.byTopic} />
                </div>
              </div>

              {/* Recent solved */}
              <div className={styles.chartFull}>
                <div className={styles.chartCard}>
                  <h3 className={styles.h3}><ClockCircleOutlined /> Недавние решения</h3>
                  {stats.lastSolved.length > 0 ? (
                    <ul className={styles.list}>
                      {stats.lastSolved.slice(0, 10).map((x) => (
                        <li key={`${x.taskId}-${x.solvedAt}`}>
                          <button type="button" className={styles.linkish} onClick={() => navigate(`/task/${x.taskId}`)}>
                            {taskTitle(x.taskId)}
                          </button>
                          <span className={styles.muted}>
                            {' '}· {x.difficulty} · {new Date(x.solvedAt).toLocaleString('ru-RU')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.muted}>Пока нет решённых задач</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function ChangePasswordForm() {
  const dispatch = useAppDispatch();
  const [curPwd, setCurPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);
  const passwordsMatch = newPwd === confirmPwd && newPwd.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
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
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.label}>Текущий пароль<input className={styles.input} type="password" required value={curPwd} onChange={(e) => setCurPwd(e.target.value)} autoComplete="current-password" /></label>
      <label className={styles.label}>Новый пароль<input className={styles.input} type="password" required minLength={8} value={newPwd} onChange={(e) => setNewPwd(e.target.value)} autoComplete="new-password" placeholder="Минимум 8 символов, буквы + цифры" /></label>
      <label className={styles.label}>Подтвердите пароль<input className={`${styles.input} ${confirmPwd && !passwordsMatch ? styles.inputError : ''}`} type="password" required minLength={8} value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} autoComplete="new-password" />{confirmPwd && !passwordsMatch && <span className={styles.fieldError}>Пароли не совпадают</span>}</label>
      {pwdMsg && <p className={pwdMsg.includes('обновлён') ? styles.ok : styles.error}>{pwdMsg}</p>}
      <GlassButton type="submit"><KeyOutlined /> Сохранить пароль</GlassButton>
    </form>
  );
}

export function AccountPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { accessToken, user, loading, error, bootstrapDone } = useAppSelector((s) => s.auth);
  const { stats, loading: statsLoading, reload } = useMyStats();

  const apiOn = isApiConfigured();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (apiOn && bootstrapDone && !loading && !accessToken) {
      navigate('/', { replace: true });
    }
  }, [apiOn, bootstrapDone, loading, accessToken, navigate]);

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
            <code className={styles.code}>server</code>.
          </p>
          <GlassButton onClick={() => navigate(-1)}>Назад</GlassButton>
        </main>
      </div>
    );
  }

  // Show loading state while checking auth
  if (!accessToken) {
    return (
      <div className={styles.layout}>
        <AppHeader />
        <main className={styles.main}>
          <p className={styles.muted}>Перенаправление…</p>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <AppHeader />
      <main className={styles.main}>
        <h1 className={styles.h1}>Личный кабинет</h1>

        {user && (
          <ProfileSection user={user} stats={stats} statsLoading={statsLoading} reload={reload} navigate={navigate} />
        )}
      </main>
    </div>
  );
}
