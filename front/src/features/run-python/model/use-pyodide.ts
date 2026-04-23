import { useState, useCallback } from 'react';
import { loadPyodide } from 'pyodide';

/** Pyodide runtime state */
export interface PyodideState {
  runPython: (code: string, testInput?: string, options?: RunPythonOptions) => Promise<string>;
  isLoading: boolean;
  error: string | null;
}

export type RunPythonPolicy = 'default' | 'restricted';

export interface RunPythonOptions {
  policy?: RunPythonPolicy;
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
    async (code: string, testInput?: string, options?: RunPythonOptions): Promise<string> => {
      const runtime = pyodide ?? (await ensurePyodide());

      runtime.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
`);

      try {
        const policy: RunPythonPolicy = options?.policy ?? 'default';

        runtime.globals.set('_user_code', code);
        runtime.globals.set('_test_input', testInput ?? '');
        runtime.globals.set('_policy', policy);

        runtime.runPython(`
import ast

def _run_user(_user_code: str, _test_input: str, _policy: str):
    # default: run as-is (backward compatible)
    if _policy == 'default':
        exec(_user_code, globals())
        if _test_input and _test_input.strip():
            _args = ast.literal_eval(_test_input)
            if not isinstance(_args, tuple):
                _args = (_args,)
            _result = solution(*_args)
            print(_result)
        return

    # restricted: educational sandbox (no imports, no eval/exec/sorted)
    _safe_builtins = {
        # basics
        'print': print,
        'range': range,
        'len': len,
        'enumerate': enumerate,
        'zip': zip,
        'map': map,
        'filter': filter,
        'reversed': reversed,
        'sorted': None,  # explicitly absent; kept as None to make message clearer if referenced
        # types
        'int': int,
        'float': float,
        'str': str,
        'bool': bool,
        'list': list,
        'tuple': tuple,
        'dict': dict,
        'set': set,
        # math-ish
        'abs': abs,
        'min': min,
        'max': max,
        'sum': sum,
        'all': all,
        'any': any,
    }

    _g = {'__builtins__': _safe_builtins}
    try:
        exec(_user_code, _g, _g)
    except Exception as e:
        print(f"Ошибка в коде: {e}")
        return

    if 'solution' not in _g or not callable(_g['solution']):
        print("Ошибка: функция solution не найдена.")
        return

    if _test_input and _test_input.strip():
        try:
            _args = ast.literal_eval(_test_input)
        except Exception as e:
            print(f"Ошибка входных данных: {e}")
            return
        if not isinstance(_args, tuple):
            _args = (_args,)
        try:
            _result = _g['solution'](*_args)
            print(_result)
        except Exception as e:
            print(f"Ошибка при вызове solution: {e}")

_run_user(_user_code, _test_input, _policy)
`);

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
