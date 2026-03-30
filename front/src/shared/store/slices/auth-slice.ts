import { createSlice } from '@reduxjs/toolkit';

interface AuthState {
  user: { id: string; login: string } | null;
}

const saved = localStorage.getItem('auth-user');

const initialState: AuthState = {
  user: saved ? JSON.parse(saved) : null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: { payload: { id: string; login: string } }) => {
      state.user = action.payload;
      localStorage.setItem('auth-user', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      localStorage.removeItem('auth-user');
    },
  },
});

export const { login, logout } = authSlice.actions;
