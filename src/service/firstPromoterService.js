import axios from 'axios';
import HTTP from '@/axios';
const API_KEY = import.meta.env.VITE_PROMOTER_API_KEY;
export async function fetchDashboardData(userpromoterId) {
    try {
        const response = await axios.get(`https://firstpromoter.com/api/v1/promoters/show?id=${userpromoterId}`, {
            headers: { 'X-API-KEY': API_KEY }
        });
        const data = response.data;
        return data;
    } catch (error) {
        console.error('Error fetching FirstPromoter data:', error);
        return null;
    }
}