import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/services/api';

interface AuthState {
    user: User | null;
    token: string | null;
}

const initialState: AuthState = {
    user: null,
    token: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials(state, action: PayloadAction<{ user: User; token: string }>) {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;
        },
        clearCredentials(state) {
            state.user = null;
            state.token = null;
        },
    },
});

export const { setCredentials, clearCredentials } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
