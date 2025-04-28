import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL;
import HTTP from "@/axios";
import router from "@/router";
export const AuthService = {
    login: async (payload) => {
        try {
            let endpoint = `${baseURL}auth/login`;
            let response = await axios.post(endpoint, payload);

            return {
                user: response.data.user,
                token: response.data.token,
            };
        } catch (error) {
            return {
                error: error.response?.data?.message || "Login failed. Please try again.",
            };
        }
    },
    changePassword: async (payload) => {
        try {
            let endpoint = `${baseURL}auth/change-password`;
            let response = await axios.post(endpoint, payload);
            return {
                message: response.data.message,
            };
        } catch (error) {
            return {
                error: error.response?.data?.message || "Failed to Change Password.",
            };
        }
    },
    getUserMeta: async (userId,key,token) => {
        try {
            let endpoint = `auth/get-user-meta?userId=${userId}&key=${key}`;
            let user = await HTTP.get(endpoint,{
                headers: { Authorization: `Bearer ${token}` }
            });

            return user.data.value;
        } catch (error) {
            alert("Session Expired");
            localStorage.removeItem('token');
            router.push({ name: 'login' });
            console.log("error : "+error.response?.data?.message);
        }
    },
};
