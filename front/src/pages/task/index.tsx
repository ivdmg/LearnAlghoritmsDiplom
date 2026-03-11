import { useParams, useNavigate } from 'react-router-dom';
import { LeftOutlined, RightOutlined, HomeOutlined, CheckCircleFilled, CloseCircleFilled, DownOutlined } from '@ant-design/icons';
import { useMemo, useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { useAppSelector } from '@/shared/lib/hooks/use-app-selector';
import { getOrderedTaskIds, useTaskById } from '@/entities/task';
import { usePyodide } from '@/features/run-python';
import { AppHeader } from '@/widgets/app-header';
import { GlassButton } from '@/shared/ui/glass-button/glass-button';
import { TaskExpectedOutput } from '@/entities/task/ui/task-expected-output';
import styles from './task-page.module.css';

export function TaskPage() {
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
    setIsRunning(true);
    setIsSuccess(false);
    setHasRun(false);
    setOutput('Выполнение...');
    const testInput = task.testCases[0]?.input;
    const expected = task.testCases[0]?.expected;
    try {
      const result = await runPython(code, testInput);
      const resultStr = (result ?? '(нет вывода)').trim();
      setOutput(resultStr);
      const expectedStr = (expected ?? '').trim();
      const success = resultStr === expectedStr;
      setIsSuccess(success);
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
          <div className={styles.panelContent}>
            <div className={styles.leftTopRow}>
              <div className={styles.leftNavButtons}>
                <GlassButton onClick={handleBack} className={styles.iconButton}>
                  <HomeOutlined />
                </GlassButton>
                <GlassButton onClick={handlePrev} className={`${styles.navButton} ${styles.iconButton}`}>
                  <LeftOutlined />
                </GlassButton>
                <GlassButton onClick={handleNext} className={`${styles.navButton} ${styles.iconButton}`}>
                  <RightOutlined />
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
                      <DownOutlined />
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
          </div>
        </div>
        <div className={styles.rightPanel}>
          <div className={styles.rightColumn}>
            <div className={styles.panelContent}>
              <div className={styles.editorHeader}>
                <h3 className={styles.sectionSubtitle}>Код (Python)</h3>
                <div className={styles.editorHeaderRight}>
                  {isLoading && (
                    <span className={styles.statusPill}>Загрузка Python (Pyodide)...</span>
                  )}
                  <GlassButton onClick={handleRun}>
                    <span>{isRunning || isLoading ? 'Выполнение...' : 'Запустить'}</span>
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

            <div className={styles.panelContent}>
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
                        <CheckCircleFilled /> Успешно
                      </>
                    ) : (
                      <>
                        <CloseCircleFilled /> Нужно доработать
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
