import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/widgets/app-header';
import { GlassButton } from '@/shared/ui/glass-button/glass-button';
import { ScrollArea } from '@/shared/ui';
import { ROADMAP } from '@/entities/roadmap';
import { TASKS } from '@/entities/task';
import styles from './tasks-page.module.css';

type Group = {
  topicId: string;
  topicTitle: string;
  items: Array<
    | { kind: 'subtopic'; id: string; title: string; taskIds: string[] }
    | { kind: 'topic'; id: string; title: string; taskIds: string[] }
  >;
  totalTasks: number;
};

export function TasksPage() {
  const navigate = useNavigate();
  const layoutRef = useRef<HTMLDivElement | null>(null);

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

  const taskById = useMemo(() => new Map(TASKS.map((t) => [t.id, t])), []);

  const groups: Group[] = useMemo(() => {
    return ROADMAP.map((topic) => {
      const subtopicItems = topic.subtopics.map((st) => {
        const stTaskIds = TASKS.filter((t) => t.topicId === topic.id && t.subtopicId === st.id).map(
          (t) => t.id,
        );
        return { kind: 'subtopic' as const, id: st.id, title: st.title, taskIds: stTaskIds };
      });

      const topicLevelTaskIds = TASKS.filter((t) => t.topicId === topic.id && !t.subtopicId).map((t) => t.id);
      const items: Group['items'] = [...subtopicItems];
      if (topicLevelTaskIds.length > 0) {
        items.push({ kind: 'topic', id: topic.id, title: 'Задачи по теме', taskIds: topicLevelTaskIds });
      }

      const totalTasks = items.reduce((acc, x) => acc + x.taskIds.length, 0);
      return {
        topicId: topic.id,
        topicTitle: topic.title,
        items,
        totalTasks,
      };
    }).filter((g) => g.totalTasks > 0);
  }, []);

  return (
    <div ref={layoutRef} className={styles.layout}>
      <div className={styles.cursorGlow} aria-hidden />
      <AppHeader />

      <div className={styles.mainLayout}>
        <div className={styles.leftPanel}>
          <div className={styles.panelContent}>
            <h2 className={styles.sectionTitle}>Задачи</h2>
            <p className={styles.text}>Выберите тему, затем задачу — откроется контестер.</p>
          </div>
        </div>

        <div className={styles.rightPanel}>
          <ScrollArea className={styles.panelContent} viewportClassName={styles.panelViewport}>
            {groups.length === 0 ? (
              <div className={styles.empty}>
                Пока нет задач. Добавьте их в `entities/task/model/data.ts`.
              </div>
            ) : (
              <div className={styles.blocks}>
                {groups.map((g, idx) => (
                  <details key={g.topicId} className={styles.block} open={idx === 0}>
                    <summary className={styles.blockSummary}>
                      <div className={styles.blockTitleRow}>
                        <span className={styles.blockTitle}>{g.topicTitle}</span>
                        <GlassButton className={styles.countPillBtn} disabled>
                          {g.totalTasks}
                        </GlassButton>
                      </div>
                      <span className={styles.chevron} aria-hidden>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </span>
                    </summary>

                    <div className={styles.blockBody}>
                      {g.items.map((it) => (
                        <div key={`${it.kind}-${it.id}`} className={styles.subtopic}>
                          <h3 className={styles.sectionSubtitle}>{it.title}</h3>
                          {it.taskIds.length === 0 ? (
                            <div className={styles.empty}>Пока нет задач в этом блоке.</div>
                          ) : (
                            <div className={styles.tasks}>
                              {it.taskIds.map((taskId) => {
                                const task = taskById.get(taskId);
                                if (!task) return null;
                                const diff = task.difficulty ?? 'easy';
                                return (
                                  <button
                                    key={task.id}
                                    className={styles.taskItem}
                                    type="button"
                                    onClick={() => navigate(`/task/${task.id}`)}
                                  >
                                    <div className={styles.taskLeft}>
                                      <div className={styles.taskTitle}>{task.title}</div>
                                    </div>
                                    <span className={`${styles.diffBadge} ${styles[`diff_${diff}`]}`}>
                                      {diff === 'easy' ? 'Easy' : diff === 'medium' ? 'Medium' : 'Hard'}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

    </div>
  );
}

