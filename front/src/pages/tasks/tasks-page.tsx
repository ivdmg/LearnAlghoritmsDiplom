import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/widgets/app-header';
import { TasksStatsSnippet } from '@/widgets/tasks-stats-snippet';
import { GlassButton } from '@/shared/ui/glass-button/glass-button';
import { ScrollArea, TaskRowList, DifficultyFilter } from '@/shared/ui';
import type { DifficultyFilterValue } from '@/shared/ui';
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
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilterValue>(null);

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
        let stTaskIds = TASKS
          .filter((t) => t.topicId === topic.id && t.subtopicId === st.id)
          .map((t) => t.id);
        if (difficultyFilter) {
          stTaskIds = stTaskIds.filter((id) => {
            const task = taskById.get(id);
            return task?.difficulty === difficultyFilter;
          });
        }
        return { kind: 'subtopic' as const, id: st.id, title: st.title, taskIds: stTaskIds };
      });

      let topicLevelTaskIds = TASKS
        .filter((t) => t.topicId === topic.id && !t.subtopicId)
        .map((t) => t.id);
      if (difficultyFilter) {
        topicLevelTaskIds = topicLevelTaskIds.filter((id) => {
          const task = taskById.get(id);
          return task?.difficulty === difficultyFilter;
        });
      }

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
  }, [difficultyFilter, taskById]);

  return (
    <div ref={layoutRef} className={styles.layout}>
      <div className={styles.cursorGlow} aria-hidden />
      <AppHeader />

      <div className={styles.mainLayout}>
        <div className={styles.leftPanel}>
          <div className={styles.panelContent}>
            <TasksStatsSnippet />
          </div>
        </div>

        <div className={styles.rightPanel}>
          <ScrollArea className={styles.panelContent} viewportClassName={styles.panelViewport}>
            <div className={styles.filterRow}>
              <DifficultyFilter value={difficultyFilter} onChange={setDifficultyFilter} />
            </div>

            {groups.length === 0 ? (
              <div className={styles.empty}>
                {difficultyFilter
                  ? `Нет задач со сложностью "${difficultyFilter}".`
                  : 'Пока нет задач. Добавьте их в `entities/task/model/data.ts`.'}
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
                            <TaskRowList
                              tasks={it.taskIds
                                .map((id) => taskById.get(id))
                                .filter((t): t is NonNullable<typeof t> => t != null)}
                              onTaskSelect={(task) => navigate(`/task/${task.id}`)}
                            />
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

