import { useParams, useNavigate } from 'react-router-dom';
import { LeftOutlined, RightOutlined, HomeOutlined, CheckCircleFilled } from '@ant-design/icons';
import { useMemo, useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { useAppSelector } from '@/shared/lib/hooks/use-app-selector';
import { TASKS, getOrderedTaskIds } from '@/entities/task';
import { usePyodide } from '@/features/run-python';
import { GlassTopbar } from '@/shared/ui';
import { GlassButton } from '@/shared/ui/glass-button/glass-button';
import styles from './task-page.module.css';

export function TaskPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { runPython, isLoading } = usePyodide();
  const themeMode = useAppSelector((state) => state.theme.mode);

  const task = useMemo(() => TASKS.find((t) => t.id === taskId), [taskId]);

  const orderedIds = useMemo(() => getOrderedTaskIds(), []);
  const currentIndex = useMemo(() => orderedIds.indexOf(taskId ?? ''), [orderedIds, taskId]);
  const prevTaskId = currentIndex > 0 ? orderedIds[currentIndex - 1] : null;
  const nextTaskId = currentIndex >= 0 && currentIndex < orderedIds.length - 1 ? orderedIds[currentIndex + 1] : null;
  const prevTask = prevTaskId ? TASKS.find((t) => t.id === prevTaskId) : null;
  const nextTask = nextTaskId ? TASKS.find((t) => t.id === nextTaskId) : null;

  const initCode = task?.solutionTemplate ?? '';

  useEffect(() => {
    if (task?.solutionTemplate) {
      setCode(task.solutionTemplate);
    }
    setOutput('');
    setIsSuccess(false);
  }, [taskId, task?.solutionTemplate]);

  const handleRun = async () => {
    if (!runPython || !task) return;
    setIsRunning(true);
    setIsSuccess(false);
    setOutput('Выполнение...');
    const testInput = task.testCases[0]?.input;
    const expected = task.testCases[0]?.expected;
    try {
      const result = await runPython(code, testInput);
      const resultStr = (result ?? '(нет вывода)').trim();
      setOutput(resultStr);
      const expectedStr = (expected ?? '').trim();
      setIsSuccess(resultStr === expectedStr);
    } catch (err) {
      setOutput(`Ошибка: ${String(err)}`);
      setIsSuccess(false);
    } finally {
      setIsRunning(false);
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

  if (!task) {
    return (
      <div className={styles.layout}>
        <div className={styles.error}>Задача не найдена</div>
        <GlassButton onClick={() => navigate('/')}>На главную</GlassButton>
      </div>
    );
  }

  const hintItems = task.hints.slice(0, 2).map((h, i) => ({
    key: String(i),
    title: `Подсказка ${i + 1}`,
    text: h,
  }));

  return (
    <div className={styles.layout}>
      <header className={styles.headerShell}>
        <GlassTopbar
          left={
            <span className={styles.logo}>AlgoLearn</span>
          }
          center={<span className={styles.taskTitle}>{task.title}</span>}
          right={
            <div className={styles.headerRight}>
              {/* тут можно добавить глобальные кнопки/переключатели при необходимости */}
            </div>
          }
        />
      </header>

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
            <p className={styles.text}>{task.description}</p>
            <h3 className={styles.sectionSubtitle}>Ожидаемый вывод</h3>
            <p className={styles.text}>{task.expectedOutput}</p>
            <h3 className={styles.sectionSubtitle}>Подсказки</h3>
            <div className={styles.hints}>
              {hintItems.map((hint) => (
                <details key={hint.key} className={styles.hintItem}>
                  <summary>{hint.title}</summary>
                  <p>{hint.text}</p>
                </details>
              ))}
            </div>
            <div className={styles.infoBox}>
              <div className={styles.infoTitle}>Формат кода</div>
              <p className={styles.infoText}>
                Напишите функцию с именем <code>solution</code> и нужными аргументами. Pyodide
                вызовет её и вернёт результат. Пример:{' '}
                <code>def solution(a: int, b: int) -&gt; int: return a + b</code>
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
                {isSuccess && (
                  <span className={styles.successPill}>
                    <CheckCircleFilled /> Успешно
                  </span>
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
