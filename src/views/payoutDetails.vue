<template>
    <div class="bg-white p-6 rounded-lg shadow">
        <nav class="flex text-gray-600 text-sm mb-4">
            <router-link to="/payouts" class="hover:text-blue-500">Payouts</router-link>
            <span class="mx-2">/</span>
            <span class="text-gray-800">Payout Details</span>
        </nav>

        <h2 class="text-2xl font-semibold">Payout Details</h2>
        <p class="text-gray-600 mt-1 mb-4">Updated <span class="font-medium"> {{
            formatDate(payoutsData.paid_at) }}</span></p>

        <div class="overflow-x-auto">
            <table class="w-full border rounded-lg mb-5">
                <thead class="bg-gray-100 text-gray-700">
                    <tr>
                        <th class="p-3 text-left">State</th>
                        <th class="p-3 text-left">Amount</th>
                        <th class="p-3 text-left">Paid at</th>
                        <th class="p-3 text-left">Paid by</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="loadingPayouts">
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
                    <tr class="border-t" v-if="payoutsData.length !== 0">
                        <td class="p-4 text-left">
                            <span
                                class="inline-flex items-center rounded-md bg-green-50 px-3 py-1 text-sm font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">
                                {{ capitalize(payoutsData.state) }}
                            </span>
                        </td>
                        <td class="p-4">{{ payoutsData.amount / 100 }} {{ payoutsData.currency }}</td>
                        <td class="p-4">{{ formatDate(payoutsData.paid_at) || 'N/A' }}</td>
                        <td class="p-4">{{ payoutsData.paid_by_id }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

    <h5 class="text-lg font-semibold mt-5">Commissions Included in This Payout</h5>
    <div class="overflow-x-auto">
    <table class="w-full border rounded-lg mt-3">
        <thead class="bg-gray-100 text-gray-700">
            <tr>
                <th class="p-3 text-left">Description</th>
                <th class="p-3 text-left">Date</th>
                <th class="p-3 text-left">Customer</th>
                <th class="p-3 text-left">Sale Amount</th>
                <th class="p-3 text-left">Your Commission</th>
                <th class="p-3 text-left">Status</th>
            </tr>
        </thead>
        <tbody>
            <tr v-if="loadingCommission">
                <td colspan="6" class="py-4 text-center text-gray-500">
                    <div class="flex justify-center items-center">
                        <svg class="animate-spin h-6 w-6 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg"
                            fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        <span>Loading Commissions...</span>
                    </div>
                </td>
            </tr>
            <tr v-for="commission in commissionsData" :key="commission.id">
                <td class="p-4 text-left">
                    {{ commission.sale.description }}
                    <span class="block text-sm text-gray-500">
                        1 x {{ commission.sale.description }} (at {{ commission.sale.sale_amount_cents / 100
                        }}/each)
                    </span>
                </td>
                <td class="p-4 text-left">{{ formatDate(commission.created_at) }}</td>
                <td class="p-4 text-left">
                    <span class="font-mono text-sm text-gray-600">
                        {{ commission.sale.referral.customer.name || commission.sale.referral.id }}
                    </span>
                </td>
                <td class="p-4 text-left">
                    ${{ commission.sale.sale_amount_cents / 100 }} {{ commission.currency }}
                </td>
                <td class="p-4 text-left">
                    ${{ commission.amount / 100 }} {{ commission.currency }}
                </td>
                <td class="p-4 text-left">
                    <span :class="statusClasses[commission.state]"
                        class="inline-flex items-center rounded-md px-3 py-1 text-sm font-medium ring-1 ring-inset">
                        {{ capitalize(commission.state) }}
                    </span>
                </td>
            </tr>
        </tbody>
    </table>
</div>
    </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue';
import { rewardfulService } from "../service/rewardfulService";
import { useRoute } from 'vue-router';

const route = useRoute();
const payoutId = ref(route.params.id);
const payoutsData = ref([]);
const commissionsData = ref([]);
const loadingPayouts = ref(false);
const loadingCommission = ref(false);

const statusClasses = {
    paid: 'bg-green-50 text-green-700 ring-green-600/20',
    pending: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
};

const fetchSinglePayoutsData = async () => {
    if (!payoutId.value) return;

    loadingPayouts.value = true;
    loadingCommission.value = true;

    try {
        const response = await rewardfulService.getPayouts({ payoutId: payoutId.value });
        console.log("Payout Details:", response.data);

        payoutsData.value = response?.data;
        console.log("Updated Payouts Data:", payoutsData.value);
        fetchSingleCommissionData();
    } catch (error) {
        console.error("Error fetching payout data:", error);
        payoutsData.value = [];
    } finally {
        loadingPayouts.value = false;
    }
};

const fetchSingleCommissionData = async () => {
    if (!payoutsData.value || !payoutsData.value.commissions || payoutsData.value.commissions.length === 0) return;

    console.log("Commission data:", payoutsData.value.commissions);

    try {
        const responses = await Promise.all(
            payoutsData.value.commissions.map(async (commission) => {
                const response = await rewardfulService.getCommissions({ commissionId: commission.id });
                return response?.data;
            })
        );

        commissionsData.value = responses;
    } catch (error) {
        console.error("Error fetching commissions:", error);
        commissionsData.value = [];
    } finally {
        loadingCommission.value = false;
    }
};

onMounted(fetchSinglePayoutsData);

watchEffect(() => {
    console.log("Payout ID:", payoutId.value);
    console.log("commissionsData :", commissionsData.value);
});

const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '--';
const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

</script>