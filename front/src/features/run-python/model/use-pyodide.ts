import { useState, useEffect, useCallback } from 'react';
import { loadPyodide } from 'pyodide';

/** Pyodide runtime state */
export interface PyodideState {
  runPython: (code: string, testInput?: string) => Promise<string>;
  isLoading: boolean;
  error: string | null;
}

export function usePyodide(): PyodideState {
  const [pyodide, setPyodide] = useState<Awaited<ReturnType<typeof loadPyodide>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/',
    })
      .then((p) => {
        setPyodide(p);
        setError(null);
      })
      .catch((e) => {
        setError(String(e));
      })
      .finally(() => setIsLoading(false));
  }, []);

  const runPython = useCallback(
    async (code: string, testInput?: string): Promise<string> => {
      if (!pyodide) throw new Error('Pyodide ещё загружается');

      pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
`);

      try {
        pyodide.runPython(code);
        if (testInput?.trim()) {
          pyodide.globals.set('_test_input', testInput);
          pyodide.runPython(`
try:
    _args = eval(_test_input)
    if not isinstance(_args, tuple):
        _args = (_args,)
    _result = solution(*_args)
    print(_result)
except Exception as e:
    print(f"Ошибка при вызове solution: {e}")
`);
        }
        const stdout = (pyodide.runPython('sys.stdout.getvalue()') as string) || '';
        return stdout.trim();
      } finally {
        pyodide.runPython('sys.stdout = sys.__stdout__');
      }
    },
    [pyodide]
  );

  return { runPython, isLoading, error };
}
