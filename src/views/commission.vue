<template>
    <div class="bg-white p-6 shadow-lg rounded-lg">
        <div class="flex items-center justify-between mb-6 border-b pb-4">
            <h2 class="text-xl font-semibold flex items-center gap-2">
                Commission
            </h2>
        </div>
        <div class="mb-6 overflow-x-auto">
            <table class="w-full text-center border border-gray-200">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="p-4 border">Unpaid Commission</th>
                        <th class="p-4 border">Paid Commission</th>
                        <th class="p-4 border">Total Commission</th>
                        <th class="p-4 border">Gross Revenue</th>
                        <th class="p-4 border">Net Revenue</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="loading">
                        <td colspan="6" class="py-4 text-center text-gray-500">
                            <div class="flex justify-center items-center">
                                <svg class="animate-spin h-6 w-6 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                </svg>
                                <span>Loading Commissions...</span>
                            </div>
                        </td>
                    </tr>
                    <tr v-else class="bg-white">
                        <td class="p-4 border">
                            ${{ (commissionStats?.unpaid?.cents || 0) / 100 }} USD
                        </td>
                        <td class="p-4 border">
                            ${{ (commissionStats?.paid?.cents || 0) / 100 }} USD
                        </td>
                        <td class="p-4 border">
                            ${{ (commissionStats?.total?.cents || 0) / 100 }} USD
                        </td>
                        <td class="p-4 border">
                            ${{ (commissionStats?.gross_revenue?.cents || 0) / 100 }} USD
                        </td>
                        <td class="p-4 border">
                            ${{ (commissionStats?.net_revenue?.cents || 0) / 100 }} USD
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/store/auth";
import { AuthService } from '@/service/AuthService';
import { rewardfulService } from "@/service/rewardfulService";

const store = useAuthStore();
const { getUser } = storeToRefs(store);

const affiliateData = ref(null);
const commissionStats = ref(null);
const loading = ref(false);

const fetchAffiliateData = async () => {
    loading.value = true;  
    let userId = getUser.value?.user?.id;
    if (!userId) return;

    try {
        const affiliateId = await AuthService.getUserMeta(userId, "affiliateId", getUser.value.token);
        if (!affiliateId) return;

        const response = await rewardfulService.getAffiliate(affiliateId);
        affiliateData.value = response.data;
        commissionStats.value = response.data?.commission_stats?.currencies?.USD || {};
        console.log("Affiliate Data:", affiliateData.value);
        console.log("Commission Stats:", commissionStats.value);
    } catch (error) {
        console.error("Error fetching affiliate data:", error);
    }finally{
        loading.value = false;  
    }
};

onMounted(fetchAffiliateData);
</script>