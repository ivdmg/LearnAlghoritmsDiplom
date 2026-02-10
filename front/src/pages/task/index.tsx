import { useParams, useNavigate } from 'react-router-dom';
import { Button, Layout, Collapse, Alert } from 'antd';
import { LeftOutlined, RightOutlined, HomeOutlined } from '@ant-design/icons';
import { useMemo, useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { useAppSelector } from '@/shared/lib/hooks/use-app-selector';
import { ROADMAP_TOPICS, TASKS } from '@/shared/config/roadmap-data';
import { ThemeToggle } from '@/widgets/theme-toggle/ui/theme-toggle';
import { usePyodide } from './model/use-pyodide';
import styles from './task-page.module.css';

export function TaskPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);

  const { runPython, isLoading } = usePyodide();
  const themeMode = useAppSelector((state) => state.theme.mode);

  const task = useMemo(() => TASKS.find((t) => t.id === taskId), [taskId]);

  const currentTopic = useMemo(
    () => ROADMAP_TOPICS.find((t) => t.taskIds.includes(taskId ?? '')),
    [taskId]
  );

  const tasksInTopic = useMemo(
    () => TASKS.filter((t) => t?.topicId === currentTopic?.id) ?? [],
    [currentTopic]
  );

  const currentIndex = tasksInTopic.findIndex((t) => t.id === taskId);
  const prevTask = currentIndex > 0 ? tasksInTopic[currentIndex - 1] : null;
  const nextTask =
    currentIndex >= 0 && currentIndex < tasksInTopic.length - 1
      ? tasksInTopic[currentIndex + 1]
      : null;

  const initCode = task?.solutionTemplate ?? '';

  useEffect(() => {
    if (task?.solutionTemplate) {
      setCode(task.solutionTemplate);
    }
    setOutput('');
  }, [taskId, task?.solutionTemplate]);

  const handleRun = async () => {
    if (!runPython || !task) return;
    setIsRunning(true);
    setOutput('Выполнение...');
    const testInput = task.testCases[0]?.input;
    try {
      const result = await runPython(code, testInput);
      setOutput(result ?? '(нет вывода)');
    } catch (err) {
      setOutput(`Ошибка: ${String(err)}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handlePrev = () => {
    if (prevTask) navigate(`/task/${prevTask.id}`);
  };

  const handleNext = () => {
    if (nextTask) navigate(`/task/${nextTask.id}`);
  };

  const handleBack = () => {
    navigate('/');
  };

  if (!task) {
    return (
      <Layout className={styles.layout}>
        <div className={styles.error}>Задача не найдена</div>
        <Button onClick={() => navigate('/')}>На главную</Button>
      </Layout>
    );
  }

  const hintItems = task.hints.slice(0, 2).map((h, i) => ({
    key: String(i),
    label: `Подсказка ${i + 1}`,
    children: <p>{h}</p>,
  }));

  return (
    <Layout className={styles.layout}>
      <Layout.Header className={styles.header}>
        <div className={styles.headerLeft}>
          <Button icon={<HomeOutlined />} onClick={handleBack}>
            Roadmap
          </Button>
          <Button
            icon={<LeftOutlined />}
            disabled={!prevTask}
            onClick={handlePrev}
          >
            Предыдущая
          </Button>
          <Button
            icon={<RightOutlined />}
            disabled={!nextTask}
            onClick={handleNext}
          >
            Следующая
          </Button>
        </div>
        <span className={styles.taskTitle}>{task.title}</span>
        <ThemeToggle />
      </Layout.Header>

      <div className={styles.mainLayout}>
        <div className={styles.leftPanel}>
          <div className={styles.panelContent}>
            <h2>Условие</h2>
            <p>{task.description}</p>
            <h3>Ожидаемый вывод</h3>
            <p>{task.expectedOutput}</p>
            <h3>Подсказки</h3>
            <Collapse items={hintItems} />
            <Alert
              message="Формат кода"
              description="Напишите функцию с именем solution и нужными аргументами. Pyodide вызовет её и вернёт результат. Пример: def solution(a: int, b: int) -> int: return a + b"
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          </div>
        </div>
        <div className={styles.rightPanel}>
          <div className={styles.panelContent}>
            <div className={styles.editorHeader}>
              <h3>Код (Python)</h3>
              {isLoading && (
                <Alert
                  message="Загрузка Python (Pyodide)..."
                  type="info"
                  showIcon
                  style={{ marginBottom: 12 }}
                />
              )}
              <Button
                type="primary"
                onClick={handleRun}
                loading={isRunning || isLoading}
                disabled={isLoading}
              >
                Запустить
              </Button>
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
            />
            <h3 style={{ marginTop: 16 }}>Вывод</h3>
            <pre className={styles.output}>{output || '(нажмите Запустить)'}</pre>
          </div>
        </div>
      </div>
    </Layout>
  );
}
