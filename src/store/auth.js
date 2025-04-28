import { defineStore } from 'pinia';
import axios from 'axios'; // Assuming you're using Axios for HTTP requests
import { useRouter } from 'vue-router';
const router = useRouter();
import http from "@/axios.js"

export const useAuthStore = defineStore('auth', {
    state: () => ({
        baseURL: import.meta.env.VITE_API_BASE_URL,
        user: null,
        token: null,
        loading: false,
        error: null,
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
        getUser: (state) => state.user,
        getErrors: (state) => state.error,
    },
    actions: {
        setUserLoginDetail(user){
            this.user = user;
            this.token = user.token;
            localStorage.setItem('token', this.token);
        }
    },
    persist: {
        key: 'auth', // Optional: Key to use in localStorage
        storage: localStorage, // Default is localStorage; you can use sessionStorage too
    },
});
