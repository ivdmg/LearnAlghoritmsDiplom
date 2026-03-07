import { useParams, useNavigate } from 'react-router-dom';
import { Button, Layout, Collapse, Alert, Tag } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  HomeOutlined,
  ThunderboltOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import { useMemo, useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { useAppSelector } from '@/shared/lib/hooks/use-app-selector';
import { TASKS, getOrderedTaskIds } from '@/entities/task';
import { ThemeToggle } from '@/widgets/theme-toggle/ui/theme-toggle';
import { usePyodide } from '@/features/run-python';
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
        <div className={styles.headerRight}>
          <Button
            type="link"
            icon={<ThunderboltOutlined />}
            onClick={() => navigate('/animation')}
            className={styles.animationBtn}
          >
            Animation
          </Button>
          <ThemeToggle />
        </div>
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
            <div className={styles.outputHeader}>
              <h3 style={{ margin: 0 }}>Вывод</h3>
              {isSuccess && (
                <Tag color="success" icon={<CheckCircleFilled />}>
                  Успешно
                </Tag>
              )}
            </div>
            <pre className={styles.output}>{output || '(нажмите Запустить)'}</pre>
          </div>
        </div>
      </div>
    </Layout>
  );
}
