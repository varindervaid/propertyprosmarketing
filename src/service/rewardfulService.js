import axios from 'axios';
const baseURL = import.meta.env.VITE_API_BASE_URL;


export const rewardfulService = {
    updateAffiliate: async (affiliateId, payload) => {
        try {
            let endpoint = `${baseURL}rewardful/update-affiliate/${affiliateId}`;
            let response = await axios.post(endpoint, payload);
            return response;
        } catch (error) {
            console.error('Error fetching FirstPromoter data:', error);
            return null;
        }
    },
    getAffiliate: async (affiliateId) => {
        try {
            let endpoint = `${baseURL}rewardful/get-affiliate/${affiliateId}`;
            let response = await axios.get(endpoint);
            return response;
        } catch (error) {
            console.error('Error fetching FirstPromoter data:', error);
            return null;
        }
    },
    getCampaign: async (campaignId) => {
        try {
            let endpoint = `${baseURL}rewardful/get-campaign/${campaignId}`;
            let response = await axios.get(endpoint);
            return response;
        } catch (error) {
            console.error('Error fetching FirstPromoter data:', error);
            return null;
        }
    },
    getCommissions: async ({ affiliate_id, commissionId }) => {
        try {
            let endpoint = `${baseURL}rewardful/get-commissions`;
            const params = new URLSearchParams();
            if (affiliate_id) {
                params.append("affiliate_id", affiliate_id);
            } else {
                params.append("commissionId", commissionId);
            }
            if (params.toString()) {
                endpoint += `?${params.toString()}`;
            }

            let response = await axios.get(endpoint);
            return response;
        } catch (error) {
            console.error("Error fetching payouts data:", error);
            return null;
        }
    },
    getReferrals: async (affiliate_id) => {
        try {
            let endpoint = `${baseURL}rewardful/get-referrals`;
            const params = new URLSearchParams();
            // if (conversion_state) params.append("conversion_state", conversion_state);
            if (affiliate_id) params.append("affiliate_id", affiliate_id);

            if (params.toString()) {
                endpoint += `?${params.toString()}`;
            }

            let response = await axios.get(endpoint);
            return response;
        } catch (error) {
            console.error("Error fetching referral data:", error);
            return null;
        }
    },
    getPayouts: async ({ affiliate_id, payoutId }) => {
        console.log(affiliate_id);
        try {
            let endpoint = `${baseURL}rewardful/get-payouts`;
            const params = new URLSearchParams();
            if (affiliate_id) {
                params.append("affiliate_id", affiliate_id);
            } else {
                params.append("payoutId", payoutId);
            }
            if (params.toString()) {
                endpoint += `?${params.toString()}`;
            }

            let response = await axios.get(endpoint);
            return response;
        } catch (error) {
            console.error("Error fetching referral data:", error);
            return null;
        }
    },
    createNewAffiliateLink: async (payload) => {
        try {
            const endpoint = `${baseURL}rewardful/create-new-affiliate-link`;
            const response = await axios.post(endpoint, payload);
            return response?.data;
        } catch (error) {
            return {
                error: error.response?.data?.error,
            };
        }
    },
};

