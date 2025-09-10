import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/services/api';

interface AuthState {
    user: User | null;
}

const initialState: AuthState = {
    user: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials(state, action: PayloadAction<{ user: User }>) {
            const { user } = action.payload;
            state.user = user;
            localStorage.setItem('user', JSON.stringify(user));
        },
        clearCredentials(state) {
            state.user = null;
            localStorage.removeItem('user');
        },
    },
});

export const { setCredentials, clearCredentials } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
