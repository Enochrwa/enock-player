import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { User } from '@/services/api';

interface AuthResponse {
    success: boolean;
    data?: {
        user: User;
    };
    message?: string;
}

export const authApiSlice = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
        credentials: 'include',
    }),
    tagTypes: ['User'],
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['User'],
        }),
        register: builder.mutation({
            query: (userInfo) => ({
                url: '/auth/register',
                method: 'POST',
                body: userInfo,
            }),
            invalidatesTags: ['User'],
        }),
        logout: builder.mutation({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
            invalidatesTags: ['User'],
        }),
        getProfile: builder.query({
            query: () => '/auth/me',
            providesTags: ['User'],
        }),
    }),
});

export const { useLoginMutation, useRegisterMutation, useLogoutMutation, useGetProfileQuery } = authApiSlice;
