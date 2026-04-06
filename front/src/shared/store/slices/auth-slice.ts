import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { apiFetch, ApiNotConfiguredError } from '@/shared/api/api-client';
import { isApiConfigured } from '@/shared/config/api-url';

export type AuthUser = {
  id: string;
  email: string;
  username: string | null;
  displayName: string | null;
};

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  bootstrapDone: boolean;
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  accessToken: null,
  user: null,
  bootstrapDone: false,
  loading: false,
  error: null,
};

export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async (_, { rejectWithValue }) => {
  if (!isApiConfigured()) {
    return { skipped: true as const };
  }
  try {
    const res = await apiFetch('/auth/refresh', { method: 'POST' });
    if (!res.ok) {
      return { skipped: false as const, session: null as null };
    }
    const data = (await res.json()) as { accessToken: string; user: AuthUser };
    return { skipped: false as const, session: { accessToken: data.accessToken, user: data.user } };
  } catch (e) {
    if (e instanceof ApiNotConfiguredError) {
      return { skipped: true as const };
    }
    return rejectWithValue('Сеть недоступна');
  }
});

export const login = createAsyncThunk(
  'auth/login',
  async (payload: { identifier: string; password: string }, { rejectWithValue }) => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return rejectWithValue((data as { error?: string }).error ?? 'Ошибка входа');
    }
    return data as { accessToken: string; user: AuthUser };
  },
);

export const register = createAsyncThunk(
  'auth/register',
  async (
    payload: { email: string; password: string; username: string; displayName?: string },
    { rejectWithValue },
  ) => {
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return rejectWithValue((data as { error?: string }).error ?? 'Ошибка регистрации');
    }
    return data as { accessToken: string; user: AuthUser };
  },
);

export const logout = createAsyncThunk('auth/logout', async (_, { getState }) => {
  const token = (getState() as { auth: AuthState }).auth.accessToken;
  try {
    await apiFetch('/auth/logout', { method: 'POST', accessToken: token ?? undefined });
  } catch {
    /* ignore */
  }
});

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (
    payload: { currentPassword: string; newPassword: string },
    { getState, rejectWithValue },
  ) => {
    const token = (getState() as { auth: AuthState }).auth.accessToken;
    if (!token) return rejectWithValue('Не авторизован');
    const res = await apiFetch('/auth/password', {
      method: 'POST',
      accessToken: token,
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return rejectWithValue((data as { error?: string }).error ?? 'Не удалось сменить пароль');
    }
    return true;
  },
);

export const recordTaskSolved = createAsyncThunk(
  'auth/recordTaskSolved',
  async (
    payload: { taskId: string; difficulty: string },
    { getState, rejectWithValue },
  ) => {
    const token = (getState() as { auth: AuthState }).auth.accessToken;
    if (!token) return rejectWithValue('skip');
    const res = await apiFetch('/me/progress/solved', {
      method: 'POST',
      accessToken: token,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return rejectWithValue((data as { error?: string }).error ?? 'Не сохранено');
    }
    return true;
  },
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (
    payload: { displayName?: string; username?: string; email?: string; currentPassword?: string },
    { getState, rejectWithValue },
  ) => {
    const token = (getState() as { auth: AuthState }).auth.accessToken;
    if (!token) return rejectWithValue('Не авторизован');
    const res = await apiFetch('/me/profile', {
      method: 'PUT',
      accessToken: token,
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return rejectWithValue((data as { error?: string }).error ?? 'Не удалось обновить');
    }
    return (data as { user: AuthUser }).user;
  },
);

export const deleteAccount = createAsyncThunk(
  'auth/deleteAccount',
  async (
    payload: { currentPassword: string },
    { getState, rejectWithValue },
  ) => {
    const token = (getState() as { auth: AuthState }).auth.accessToken;
    if (!token) return rejectWithValue('Не авторизован');
    const res = await apiFetch('/me/account', {
      method: 'DELETE',
      accessToken: token,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return rejectWithValue((data as { error?: string }).error ?? 'Не удалось удалить');
    }
    return true;
  },
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    markBootstrapDone(state) {
      state.bootstrapDone = true;
    },
    clearAuthError(state) {
      state.error = null;
    },
    setSession(state, action: PayloadAction<{ accessToken: string; user: AuthUser } | null>) {
      if (!action.payload) {
        state.accessToken = null;
        state.user = null;
        return;
      }
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.bootstrapDone = true;
        if (action.payload.skipped) return;
        if (action.payload.session) {
          state.accessToken = action.payload.session.accessToken;
          state.user = action.payload.session.user;
        } else {
          state.accessToken = null;
          state.user = null;
        }
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.loading = false;
        state.bootstrapDone = true;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload ?? 'Ошибка');
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload ?? 'Ошибка');
      })
      .addCase(logout.fulfilled, (state) => {
        state.accessToken = null;
        state.user = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.accessToken = null;
        state.user = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.accessToken = null;
        state.user = null;
      })
  },
});

export const { clearAuthError, setSession, markBootstrapDone } = authSlice.actions;
