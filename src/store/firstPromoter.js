import { defineStore } from 'pinia';
import axios from 'axios'; // Assuming you're using Axios for HTTP requests
import { useRouter } from 'vue-router';
import http from "@/axios.js"

export const useFirstPromoterStore = defineStore('promoter', {
    state: () => ({
        baseURL: import.meta.env.VITE_API_BASE_URL,
        user: null,
        token: null,
        promoterId: '',
        loading: false,
        error: null,
        promoterData: []
    }),
    getters: { 
        getPromoterId: (state) => state.promoterId,
        getPromoterData: (state) => state.promoterData,
    },
    actions: {
        setPromoterId(id){
            this.promoterId = id;
        },
        setPromoterData(promoterData){ 
            this.promoterData = promoterData;
         }
    },
    persist: {
        key: 'auth', // Optional: Key to use in localStorage
        storage: localStorage, // Default is localStorage; you can use sessionStorage too
    },
});
