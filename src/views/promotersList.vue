<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const promoters = ref([]); // Reactive variable to store API data

const fetchPromoters = async () => {
    try {
        const response = await axios.get('https://firstpromoter.com/api/v1/promoters/list', {
            headers: { 'X-API-KEY': '5ccaa61589d14c73646651d0a46f3935' },
        });
        promoters.value = response.data || [];
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

const copyReferral = (referralLink) => {
    navigator.clipboard.writeText(referralLink)
        .then(() => {
            alert('Referral link copied to clipboard!');
        })
        .catch(err => {
            console.error('Failed to copy:', err);
        });
};

onMounted(fetchPromoters);
</script>

<template>
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th scope="col" class="px-6 py-3">Email</th>
                    <th scope="col" class="px-6 py-3">Commission Earned</th>
                    <th scope="col" class="px-6 py-3">Status</th>
                    <th scope="col" class="px-6 py-3">Referral Link</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="promoter in promoters" :key="promoter.id"
                    class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td class="px-6 py-4">
                        {{ promoter.email }}
                    </td>
                    <td class="px-6 py-4">
                        ${{ promoter.commission_earned || '0.00' }}
                    </td>
                    <td class="px-6 py-4">
                        {{ promoter.status }}
                    </td>
                    <td class="px-6 py-4 flex items-center space-x-2">
                        <!-- View Referral Link Icon -->
                        <a v-if="promoter.promotions[0]?.referral_link" :href="promoter.promotions[0]?.referral_link"
                            target="_blank" class="text-blue-500 hover:text-blue-700 transition">
                            <Eye class="w-5 h-5" />
                        </a>

                        <!-- Copy Icon -->
                        <button v-if="promoter.promotions[0]?.referral_link"
                            @click="copyReferral(promoter.promotions[0].referral_link)"
                            class="text-green-500 hover:text-green-700 transition">
                            <Copy class="w-5 h-5" />
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>