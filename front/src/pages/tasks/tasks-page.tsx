import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/widgets/app-header';
import { GlassButton } from '@/shared/ui/glass-button/glass-button';
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
    <div className={styles.page}>
      <AppHeader />

      <div className={styles.body}>
        <div className={styles.container}>
          <div>
            <h1 className={styles.pageTitle}>Задачи</h1>
            <p className={styles.pageSubtitle}>Выберите тему, затем задачу — откроется контестер.</p>
          </div>

          {groups.length === 0 ? (
            <div className={styles.block}>
              <div className={styles.blockBody}>
                <div className={styles.empty}>Пока нет задач. Добавьте их в `entities/task/model/data.ts`.</div>
              </div>
            </div>
          ) : (
            groups.map((g, idx) => (
              <details key={g.topicId} className={styles.block} open={idx === 0}>
                <summary className={styles.blockSummary}>
                  <div className={styles.blockTitleRow}>
                    <span className={styles.blockTitle}>{g.topicTitle}</span>
                    <span className={styles.countPill}>{g.totalTasks}</span>
                  </div>
                  <span className={styles.chevron} aria-hidden>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </summary>

                <div className={styles.blockBody}>
                  {g.items.map((it) => (
                    <div key={`${it.kind}-${it.id}`} className={styles.subtopic}>
                      <h3 className={styles.subtopicTitle}>{it.title}</h3>
                      {it.taskIds.length === 0 ? (
                        <div className={styles.empty}>Пока нет задач в этом блоке.</div>
                      ) : (
                        <div className={styles.tasks}>
                          {it.taskIds.map((taskId) => {
                            const task = taskById.get(taskId);
                            if (!task) return null;
                            return (
                              <div key={task.id} className={styles.taskItem}>
                                <div className={styles.taskLeft}>
                                  <div className={styles.taskTitle}>{task.title}</div>
                                  <div className={styles.taskMeta}>{task.description}</div>
                                </div>
                                <GlassButton className={styles.openBtn} onClick={() => navigate(`/task/${task.id}`)}>
                                  Открыть
                                </GlassButton>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

