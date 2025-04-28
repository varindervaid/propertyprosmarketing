<template>
    <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-2xl font-semibold mb-4">Payouts</h2>
        <ul class="flex border-b mb-4">
            <li class="mr-4">
                <a href="#" @click.prevent="activeTab = 'due'"
                    :class="activeTab === 'due' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600'"
                    class="relative py-3 px-4 inline-block border-b-2 hover:border-blue-500">
                    Due
                    <span v-if="totals.due !== 0"
                        class="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-semibold text-white bg-red-500 rounded-full shadow">
                        {{ totals.due }}
                    </span>
                </a>
            </li>
            <li class="mr-4">
                <a href="#" @click.prevent="activeTab = 'pending'"
                    :class="activeTab === 'pending' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600'"
                    class="relative py-3 px-4 inline-block border-b-2 hover:border-blue-500">
                    Pending
                    <span v-if="totals.pending !== 0"
                        class="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-semibold text-white bg-red-500 rounded-full shadow">
                        {{ totals.pending }}
                    </span>
                </a>
            </li>
            <li>
                <a href="#" @click.prevent="activeTab = 'paid'"
                    :class="activeTab === 'paid' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600'"
                    class="relative py-3 px-4 inline-block border-b-2 hover:border-blue-500">
                    Paid
                    <span v-if="totals.paid !== 0"
                        class="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-semibold text-white bg-red-500 rounded-full shadow">
                        {{ totals.paid }}
                    </span>
                </a>
            </li>
        </ul>

        <!-- Table -->
        <div class="overflow-x-auto">
            <table class="w-full border rounded-lg">
                <thead class="bg-gray-100 text-gray-700">
                    <tr>
                        <th class="p-4 text-left">State</th>
                        <th class="p-4 text-center">Amount</th>
                        <th class="p-4 text-center">Paid</th>
                        <th class="p-4 text-center">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Loading State -->
                    <tr v-if="loading">
                        <td colspan="4" class="py-4 text-center text-gray-500">
                            <div class="flex justify-center items-center">
                                <svg class="animate-spin h-6 w-6 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg"
                                    fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                </svg>
                                <span>Loading Payouts...</span>
                            </div>
                        </td>
                    </tr>

                    <!-- No Data Found -->
                    <tr v-else-if="filteredPayouts.length === 0">
                        <td colspan="4" class="py-4 text-center text-gray-500">
                            <p class="text-lg">There are no {{ activeTab }} payouts.</p>
                        </td>
                    </tr>

                    <!-- Data Rows -->
                    <tr v-for="payout in filteredPayouts" :key="payout.id">
                        <td class="p-4 text-left">
                            <span
                                class="inline-flex items-center rounded-md bg-green-50 px-3 py-1 text-sm font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">
                                {{ capitalize(payout.state) }}
                            </span>
                        </td>
                        <td class="p-4 text-center">{{ payout.amount / 100 }} {{ payout.currency }}</td>
                        <td class="p-4 text-center">{{ formatDate(payout.paid_at) || 'N/A' }}</td>
                        <td class="p-4 text-center">
                            <router-link :to="`/payoutDetails/${payout.id}`" class="hover:text-blue-500">
                                <button type="button" class="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-blue-900 focus:outline-none bg-white rounded-lg border border-gray-200 
    hover:bg-blue-600 hover:text-white focus:z-10 focus:ring-4 focus:ring-gray-100 
    dark:focus:ring-gray-700 dark:bg-blue-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-blue-700
    transition-all duration-300 delay-400">
                                    View Details
                                </button>
                            </router-link>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { rewardfulService } from "../service/rewardfulService";
import { AuthService } from '@/service/AuthService';
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/store/auth";

const store = useAuthStore();
const { getUser } = storeToRefs(store);

const payoutsData = ref([]);
const activeTab = ref("due");
const loading = ref(false);
const firstLoad = ref(true);

const fetchPayoutsData = async () => {
    let userId = getUser.value?.user?.id;
    if (!userId) return;

    if (firstLoad.value) loading.value = true;

    try {
        const affiliate_id = await AuthService.getUserMeta(userId, "affiliateId", getUser.value.token);
        const response = await rewardfulService.getPayouts({ affiliate_id });

        payoutsData.value = Array.isArray(response?.data?.data) ? response.data.data : [];
        console.log("Updated Payouts Data:", payoutsData.value);
    } catch (error) {
        console.error("Error fetching payout data:", error);
        payoutsData.value = [];
    } finally {
        loading.value = false;
        firstLoad.value = false;
    }
};

onMounted(fetchPayoutsData);

const totals = computed(() => {
    const counts = { due: 0, pending: 0, paid: 0 };
    payoutsData.value.forEach(payout => {
        if (counts[payout.state] !== undefined) {
            counts[payout.state]++;
        }
    });
    return counts;
});

const filteredPayouts = computed(() => {
    return payoutsData.value.filter(payout => payout.state === activeTab.value);
});

const formatDate = (date) => date ? new Date(date).toLocaleDateString() : 'N/A';
const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

</script>