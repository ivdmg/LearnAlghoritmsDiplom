import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home, CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import { useMemo, useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { useAppDispatch, useAppSelector } from '@/shared/lib/hooks/use-app-selector';
import { recordTaskSolved } from '@/shared/store/slices/auth-slice';
import { isApiConfigured } from '@/shared/config/api-url';
import { getOrderedTaskIds, useTaskById } from '@/entities/task';
import { usePyodide, preloadPyodide } from '@/features/run-python';
import { AppHeader } from '@/widgets/app-header';
import { GlassButton } from '@/shared/ui/glass-button/glass-button';
import { ScrollArea } from '@/shared/ui';
import { TaskExpectedOutput } from '@/entities/task/ui/task-expected-output';
import styles from './task-page.module.css';

export function TaskPage() {
  const dispatch = useAppDispatch();
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const { runPython, isLoading } = usePyodide();
  const layoutRef = useRef<HTMLDivElement | null>(null);
  const themeMode = useAppSelector((state) => state.theme.mode);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const bootstrapDone = useAppSelector((state) => state.auth.bootstrapDone);

  const apiOn = isApiConfigured();
  /** С включённым API запуск тестов только для вошедших пользователей (статистика). Без API — как раньше. */
  const runBlocked = apiOn && bootstrapDone && !accessToken;
  const runAuthLoading = apiOn && !bootstrapDone;

  // Ленивая загрузка Pyodide при открытии страницы задачи (в idle time)
  useEffect(() => {
    const idlePreload = () => {
      preloadPyodide().catch(() => {
        // ошибка всплывёт в usePyodide при запуске
      });
    };
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(idlePreload);
    } else {
      const id = globalThis.setTimeout(idlePreload, 500);
      return () => globalThis.clearTimeout(id);
    }
  }, []);

  const { task, loading: taskLoading } = useTaskById(taskId);

  const orderedIds = useMemo(() => getOrderedTaskIds(), []);
  const currentIndex = useMemo(() => orderedIds.indexOf(taskId ?? ''), [orderedIds, taskId]);
  const prevTaskId = currentIndex > 0 ? orderedIds[currentIndex - 1] : null;
  const nextTaskId = currentIndex >= 0 && currentIndex < orderedIds.length - 1 ? orderedIds[currentIndex + 1] : null;

  const initCode = task?.solutionTemplate ?? '';

  useEffect(() => {
    if (task?.solutionTemplate) {
      setCode(task.solutionTemplate);
    }
    setOutput('');
    setIsSuccess(false);
    setHasRun(false);
  }, [taskId, task?.solutionTemplate]);

  const handleRun = async () => {
    if (!runPython || !task) return;
    if (apiOn && !accessToken) {
      if (!bootstrapDone) {
        setOutput('Проверяем сессию… Подождите секунду и нажмите снова.');
        return;
      }
      setOutput(
        'Войдите в личный кабинет (иконка профиля в шапке), чтобы запускать проверку решения и сохранять прогресс в статистике.\n\n' +
          'Roadmap, статьи и условия задач доступны без входа.',
      );
      return;
    }
    setIsRunning(true);
    setIsSuccess(false);
    setHasRun(false);
    setOutput('Выполнение...');

    const isSortingTask = task.topicId === 'sortirovki';
    if (isSortingTask) {
      // Учебный античит: запрещаем использовать готовую сортировку.
      // Это не идеальная защита (клиент), но сильно снижает желание "схитрить" на предзащите.
      const src = code || initCode;
      const forbidden: { re: RegExp; msg: string }[] = [
        { re: /\bsorted\s*\(/, msg: 'Нельзя использовать sorted(). Реализуйте сортировку вручную.' },
        { re: /\.sort\s*\(/, msg: 'Нельзя использовать list.sort(). Реализуйте сортировку вручную.' },
      ];
      const hit = forbidden.find((x) => x.re.test(src));
      if (hit) {
        setOutput(hit.msg);
        setIsRunning(false);
        setHasRun(true);
        return;
      }
    }

    const cases = task.testCases;
    if (!cases || cases.length === 0) {
      setOutput('Нет тест-кейсов для проверки.');
      setIsRunning(false);
      setHasRun(true);
      return;
    }

    try {
      const lines: string[] = [];
      let allPassed = true;

      for (let i = 0; i < cases.length; i++) {
        const tc = cases[i];
        const result = await runPython(code, tc.input, {
          policy: task.topicId === 'sortirovki' ? 'restricted' : 'default',
        });
        const got = (result ?? '').trim();
        const want = (tc.expected ?? '').trim();
        const passed = got === want;
        if (!passed) allPassed = false;
        lines.push(
          `${passed ? '✓' : '✗'} Тест ${i + 1}: вход: ${tc.input}` +
          `\n  Ожидалось: ${want}` +
          `\n  Получено:  ${got}`
        );
      }

      const summary = allPassed
        ? `Все тесты пройдены (${cases.length}/${cases.length})`
        : `Пройдено: ${cases.filter((_, i) => { const r = lines[i]; return r.startsWith('✓'); }).length}/${cases.length}`;

      setOutput(summary + '\n\n' + lines.join('\n\n'));
      setIsSuccess(allPassed);
      if (allPassed && task && apiOn && accessToken) {
        void dispatch(
          recordTaskSolved({ taskId: task.id, difficulty: task.difficulty }),
        );
      }
    } catch (err) {
      setOutput(`Ошибка: ${String(err)}`);
      setIsSuccess(false);
    } finally {
      setIsRunning(false);
      setHasRun(true);
    }
  };

  const handlePrev = () => {
    if (prevTaskId) navigate(`/task/${prevTaskId}`);
  };

  const handleNext = () => {
    if (nextTaskId) navigate(`/task/${nextTaskId}`);
  };

  const handleBack = () => {
    navigate('/');
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty('--task-glow-x', `${x}%`);
      document.documentElement.style.setProperty('--task-glow-y', `${y}%`);
    };

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  if (!task && !taskLoading) {
    return (
      <div className={styles.layout}>
        <AppHeader />
        <div className={styles.error}>Задача не найдена</div>
        <GlassButton onClick={() => navigate('/')}>На главную</GlassButton>
      </div>
    );
  }

  const testCasesPreview =
    task?.testCases && task.testCases.length > 0
      ? task.testCases
          .map(
            (tc, index) =>
              `# Тест ${index + 1}\n# Вход: ${tc.input}\n# Ожидается: ${tc.expected}`,
          )
          .join('\n\n')
      : undefined;

  return (
    <div ref={layoutRef} className={styles.layout}>
      <div className={styles.cursorGlow} aria-hidden />
      <AppHeader />

      <div className={styles.mainLayout}>
        <div className={styles.leftPanel}>
          <ScrollArea className={styles.leftScrollPanel} viewportClassName={styles.leftScrollViewport}>
            <div className={styles.leftTopRow}>
              {task && (
                <span className={`${styles.diffBadge} ${styles[`diff_${task.difficulty}`]}`}>
                  {task.difficulty === 'easy' ? 'Easy' : task.difficulty === 'medium' ? 'Medium' : 'Hard'}
                </span>
              )}
              <div className={styles.leftNavButtons}>
                <GlassButton onClick={handleBack} className={styles.iconButton}>
                  <Home size={18} strokeWidth={2} />
                </GlassButton>
                <GlassButton onClick={handlePrev} className={`${styles.navButton} ${styles.iconButton}`}>
                  <ChevronLeft size={18} strokeWidth={2} />
                </GlassButton>
                <GlassButton onClick={handleNext} className={`${styles.navButton} ${styles.iconButton}`}>
                  <ChevronRight size={18} strokeWidth={2} />
                </GlassButton>
              </div>
            </div>
            <h2 className={styles.sectionTitle}>Условие</h2>
            <p className={styles.text}>{task?.description}</p>
            <h3 className={styles.sectionSubtitle}>Ожидаемый вывод</h3>
            <TaskExpectedOutput
              description={task?.expectedOutput}
              code={testCasesPreview}
              language="python"
            />
            <h3 className={styles.sectionSubtitle}>Подсказки</h3>
            {/* пока берём первые две подсказки, как и раньше */}
            <div className={styles.hints}>
              {task?.hints.slice(0, 2).map((text, index) => (
                <details key={index} className={styles.hintItem}>
                  <summary>
                    <span className={styles.hintTitle}>{`Подсказка ${index + 1}`}</span>
                    <span className={styles.hintChevron}>
                      <ChevronDown size={14} strokeWidth={2} />
                    </span>
                  </summary>
                  <p>{text}</p>
                </details>
              ))}
            </div>
            <div className={styles.infoBox}>
              <div className={styles.infoTitle}>Формат кода</div>
              <p className={styles.infoText}>
                {task?.formatInfo ??
                  'Напишите функцию с именем solution и нужными аргументами. Pyodide вызовет её и вернёт результат.'}
              </p>
            </div>
          </ScrollArea>
        </div>
        <div className={styles.rightPanel}>
          <div className={styles.rightColumn}>
            <div className={styles.panelContent}>
              {runBlocked && (
                <div className={styles.runGateBanner} role="status">
                  <strong>Вход нужен для проверки решения.</strong> Условие и код вы можете читать свободно; запуск тестов и
                  учёт в статистике — после входа в личный кабинет.
                  <button type="button" className={styles.runGateLink} onClick={() => navigate('/account')}>
                    Войти или зарегистрироваться
                  </button>
                </div>
              )}
              {runAuthLoading && (
                <div className={styles.runGateBannerMuted} role="status">
                  Проверка сессии…
                </div>
              )}
              <div className={styles.editorHeader}>
                <h3 className={styles.sectionSubtitle}>Код (Python)</h3>
                <div className={styles.editorHeaderRight}>
                  {isLoading && (
                    <span className={styles.statusPill}>Загрузка Python (Pyodide)...</span>
                  )}
                  <GlassButton
                    onClick={handleRun}
                    disabled={runBlocked || runAuthLoading || isLoading || isRunning}
                  >
                    <span>
                      {runAuthLoading
                        ? 'Проверка входа…'
                        : runBlocked
                          ? 'Войдите, чтобы запустить'
                          : isRunning || isLoading
                            ? 'Выполнение...'
                            : 'Запустить'}
                    </span>
                  </GlassButton>
                </div>
              </div>
              <CodeMirror
                value={code || initCode}
                height="300px"
                extensions={[python()]}
                onChange={(v) => setCode(v)}
                theme={themeMode === 'dark' ? 'dark' : 'light'}
                basicSetup={{
                  lineNumbers: true,
                }}
                className="cm-transparent"
              />
            </div>

            <div className={styles.outputPanel}>
              <div className={styles.outputHeader}>
                <h3 className={styles.sectionSubtitle}>Вывод</h3>
                {hasRun && (
                  <GlassButton
                    className={`${styles.resultBadge} ${
                      isSuccess ? styles.resultBadgeSuccess : styles.resultBadgeError
                    }`}
                  >
                    {isSuccess ? (
                      <>
                        <CheckCircle size={14} strokeWidth={2} /> Успешно
                      </>
                    ) : (
                      <>
                        <XCircle size={14} strokeWidth={2} /> Нужно доработать
                      </>
                    )}
                  </GlassButton>
                )}
              </div>
              <pre className={styles.output}>{output || '(нажмите Запустить)'}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
