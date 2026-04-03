import { useEffect, useState } from 'react';
import type { Article } from './types';
import { getContentApiBaseUrl } from '@/shared/config/content-api-url';

interface UseArticleByTopicResult {
  article: Article | null;
  loading: boolean;
  error: Error | null;
}

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

    const resolvedTopicId = topicId;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setArticle(null);

      const base = getContentApiBaseUrl();
      if (!base) {
        if (!cancelled) {
          setLoading(false);
          setError(null);
        }
        return;
      }

      try {
        const params = new URLSearchParams();
        params.set('topicId', resolvedTopicId);
        if (subtopicId) {
          params.set('subtopicId', subtopicId);
        }
        const res = await fetch(`${base}/articles?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`Failed to load article (status ${res.status})`);
        }
        const data = (await res.json()) as Article[];
        if (!cancelled) {
          setArticle(data[0] ?? null);
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          /* Нет json-server — сайдбар покажет THEORIES (markdown) */
          setArticle(null);
          setError(null);
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [topicId, subtopicId]);

  return { article, loading, error };
}
