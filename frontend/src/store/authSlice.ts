import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type UserRole = 'ADMIN' | 'ASSET_MANAGER' | 'DEPT_HEAD' | 'EMPLOYEE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  status: string;
}

interface AuthState {
  user: User | null;
  activeRole: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
}

const getInitialState = (): AuthState => {
  // Try to load session from localStorage for persistence
  try {
    const savedUser = localStorage.getItem('af_user');
    const savedToken = localStorage.getItem('af_token');
    const savedActiveRole = localStorage.getItem('af_active_role');
    
    if (savedUser && savedToken) {
      const parsedUser = JSON.parse(savedUser) as User;
      return {
        user: parsedUser,
        token: savedToken,
        activeRole: (savedActiveRole as UserRole) || parsedUser.role,
        isAuthenticated: true,
      };
    }
  } catch (e) {
    console.error('Failed to parse auth from localStorage', e);
  }

  return {
    user: null,
    activeRole: null,
    token: null,
    isAuthenticated: false,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.activeRole = user.role;
      state.isAuthenticated = true;
      localStorage.setItem('af_user', JSON.stringify(user));
      localStorage.setItem('af_token', token);
      localStorage.setItem('af_active_role', user.role);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.activeRole = null;
      state.isAuthenticated = false;
      localStorage.removeItem('af_user');
      localStorage.removeItem('af_token');
      localStorage.removeItem('af_active_role');
    },
    // Developer Override Role (for floating widget)
    overrideActiveRole: (state, action: PayloadAction<UserRole>) => {
      state.activeRole = action.payload;
      localStorage.setItem('af_active_role', action.payload);
    },
  },
});

export const { setCredentials, logout, overrideActiveRole } = authSlice.actions;
export default authSlice.reducer;
