import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserOutlined, MailOutlined } from '@ant-design/icons';
import { GlassButton } from '@/shared/ui/glass-button/glass-button';
import { PasswordInput } from '@/shared/ui/password-input/password-input';
import { useAppDispatch, useAppSelector } from '@/shared/lib/hooks/use-app-selector';
import { login, register, clearAuthError } from '@/shared/store/slices/auth-slice';
import { isApiConfigured } from '@/shared/config/api-url';
import styles from './auth-modal.module.css';

const USERNAME_RE = /^[a-zA-Z0-9_]{3,24}$/;

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

export function AuthModal({ open, onClose, onLoginSuccess }: AuthModalProps) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.auth);
  const apiOn = isApiConfigured();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      dispatch(clearAuthError());
    }
  }, [open, dispatch]);

  // Block body scroll when modal is open
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const usernameValid = USERNAME_RE.test(username);
  const usernameTouched = username.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearAuthError());
    if (mode === 'login') {
      void dispatch(login({ identifier: identifier.trim(), password })).then((a) => {
        if (login.fulfilled.match(a)) {
          onLoginSuccess?.();
          onClose();
        }
      });
    } else {
      void dispatch(register({ email, password, username: username.trim(), displayName: displayName.trim() || undefined })).then((a) => {
        if (register.fulfilled.match(a)) {
          onLoginSuccess?.();
          onClose();
        }
      });
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!apiOn) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.backdrop}
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              mass: 0.8,
            }}
          >
            {/* Header */}
            <div className={styles.header}>
              <h2 className={styles.title}>Личный кабинет</h2>
              <GlassButton onClick={onClose} variant="close" aria-label="Закрыть">
                ✕
              </GlassButton>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
              <button
                type="button"
                className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
                onClick={() => { setMode('login'); dispatch(clearAuthError()); }}
              >
                Вход
              </button>
              <button
                type="button"
                className={`${styles.tab} ${mode === 'register' ? styles.tabActive : ''}`}
                onClick={() => { setMode('register'); dispatch(clearAuthError()); }}
              >
                Регистрация
              </button>
            </div>

            {/* Forms */}
            {mode === 'login' ? (
              <form className={styles.form} onSubmit={handleSubmit}>
                <label className={styles.label}>
                  <span className={styles.labelText}>
                    <UserOutlined style={{ fontSize: 12, marginRight: 4 }} />
                    Email или логин
                  </span>
                  <input
                    className={styles.input}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    autoComplete="username"
                    placeholder="email@example.com или my_username"
                  />
                </label>
                <label className={styles.label}>
                  <span className={styles.labelText}>Пароль</span>
                  <PasswordInput
                    value={password}
                    onChange={setPassword}
                    placeholder="Введите пароль"
                    minLength={8}
                    required
                  />
                </label>
                {error && <p className={styles.error}>{error}</p>}
                <GlassButton type="submit" disabled={loading} className={styles.submitBtn}>
                  {loading ? '…' : 'Войти'}
                </GlassButton>
              </form>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                <label className={styles.label}>
                  <span className={styles.labelText}>Логин *</span>
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
                  <span className={styles.labelText}>
                    <MailOutlined style={{ fontSize: 12, marginRight: 4 }} />
                    Email *
                  </span>
                  <input
                    className={styles.input}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="email@example.com"
                  />
                </label>
                <label className={styles.label}>
                  <span className={styles.labelText}>Пароль *</span>
                  <PasswordInput
                    value={password}
                    onChange={setPassword}
                    placeholder="Минимум 8 символов, буквы + цифры"
                    minLength={8}
                    required
                    autoComplete="new-password"
                  />
                </label>
                <label className={styles.label}>
                  <span className={styles.labelText}>Имя (необязательно)</span>
                  <input
                    className={styles.input}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value.slice(0, 50))}
                    autoComplete="nickname"
                    placeholder="Как вас называть?"
                  />
                </label>
                {error && <p className={styles.error}>{error}</p>}
                <GlassButton
                  type="submit"
                  disabled={loading || (usernameTouched && !usernameValid)}
                  className={styles.submitBtn}
                >
                  {loading ? '…' : 'Зарегистрироваться'}
                </GlassButton>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
