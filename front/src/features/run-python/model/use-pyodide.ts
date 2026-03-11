import { useState, useCallback } from 'react';
import { loadPyodide } from 'pyodide';

/** Pyodide runtime state */
export interface PyodideState {
  runPython: (code: string, testInput?: string) => Promise<string>;
  isLoading: boolean;
  error: string | null;
}

type PyodideInstance = Awaited<ReturnType<typeof loadPyodide>>;

let sharedPyodide: PyodideInstance | null = null;
let sharedPromise: Promise<PyodideInstance> | null = null;

export async function preloadPyodide(): Promise<PyodideInstance> {
  if (sharedPyodide) return sharedPyodide;
  if (sharedPromise) return sharedPromise;

  sharedPromise = loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/',
  }).then((p) => {
    sharedPyodide = p;
    return p;
  });

  return sharedPromise;
}

export function usePyodide(): PyodideState {
  const [pyodide, setPyodide] = useState<PyodideInstance | null>(sharedPyodide);
  const [isLoading, setIsLoading] = useState(!sharedPyodide && !!sharedPromise);
  const [error, setError] = useState<string | null>(null);

  const ensurePyodide = useCallback(async (): Promise<PyodideInstance> => {
    if (sharedPyodide) return sharedPyodide;

    setIsLoading(true);
    try {
      const instance = await preloadPyodide();
      sharedPyodide = instance;
      setPyodide(instance);
      setError(null);
      return instance;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const runPython = useCallback(
    async (code: string, testInput?: string): Promise<string> => {
      const runtime = pyodide ?? (await ensurePyodide());

      runtime.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
`);

      try {
        runtime.runPython(code);
        if (testInput?.trim()) {
          runtime.globals.set('_test_input', testInput);
          runtime.runPython(`
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
        const stdout = (runtime.runPython('sys.stdout.getvalue()') as string) || '';
        return stdout.trim();
      } finally {
        runtime.runPython('sys.stdout = sys.__stdout__');
      }
    },
    [pyodide, ensurePyodide]
  );

  return { runPython, isLoading, error };
}
