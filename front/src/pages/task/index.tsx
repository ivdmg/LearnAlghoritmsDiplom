import { useParams, useNavigate } from 'react-router-dom';
import { LeftOutlined, RightOutlined, HomeOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
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
    const el = layoutRef.current;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--task-glow-x', `${x}%`);
      el.style.setProperty('--task-glow-y', `${y}%`);
    };

    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
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

  return (
    <div ref={layoutRef} className={styles.layout}>
      <div className={styles.cursorGlow} aria-hidden />
      <AppHeader />

      <div className={styles.mainLayout}>
        <div className={styles.leftPanel}>
          <div className={styles.panelContent}>
            <div className={styles.leftTopRow}>
              <h2 className={styles.sectionTitle}>Условие</h2>
              <div className={styles.leftNavButtons}>
                <GlassButton onClick={handleBack}>
                  <HomeOutlined />
                  <span>Домой</span>
                </GlassButton>
                <GlassButton onClick={handlePrev} className={styles.navButton}>
                  <LeftOutlined />
                  <span>Предыдущая</span>
                </GlassButton>
                <GlassButton onClick={handleNext} className={styles.navButton}>
                  <RightOutlined />
                  <span>Следующая</span>
                </GlassButton>
              </div>
            </div>
            <p className={styles.text}>{task?.description}</p>
            <h3 className={styles.sectionSubtitle}>Ожидаемый вывод</h3>
            <TaskExpectedOutput
              description={task?.expectedOutput}
              code={task?.expectedOutputCode}
              language={task?.expectedOutputLanguage}
            />
            <h3 className={styles.sectionSubtitle}>Подсказки</h3>
            {/* пока берём первые две подсказки, как и раньше */}
            <div className={styles.hints}>
              {task?.hints.slice(0, 2).map((text, index) => (
                <details key={index} className={styles.hintItem}>
                  <summary>{`Подсказка ${index + 1}`}</summary>
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
