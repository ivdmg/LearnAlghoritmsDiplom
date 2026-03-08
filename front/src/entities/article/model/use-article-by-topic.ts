import { useEffect, useState } from 'react';
import type { Article } from './types';

interface UseArticleByTopicResult {
  article: Article | null;
  loading: boolean;
  error: Error | null;
}

const API_BASE = 'http://localhost:3001';

export function useArticleByTopic(topicId?: string, subtopicId?: string): UseArticleByTopicResult {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!topicId) {
      setArticle(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set('topicId', topicId as string);
        if (subtopicId) {
          params.set('subtopicId', subtopicId);
        }
        const res = await fetch(`${API_BASE}/articles?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`Failed to load article (status ${res.status})`);
        }
        const data = (await res.json()) as Article[];
        if (!cancelled) {
          setArticle(data[0] ?? null);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [topicId, subtopicId]);

  return { article, loading, error };
}

