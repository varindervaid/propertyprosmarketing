<template>
    <div class="col-span-12">
        <div class="flex justify-between items-center mb-6">
            <div class="font-semibold text-xl">Overview</div>
        </div>
    </div>

    <div class="col-span-12 lg:col-span-6 xl:col-span-3" v-for="(item, index) in dashboardData" :key="index">
        <div class="card mb-0 p-4 shadow-lg rounded-lg bg-white dark:bg-gray-800">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-gray-500 dark:text-gray-400 font-medium mb-2">{{ item.label }}</span>
                    <div class="text-gray-900 dark:text-white font-medium text-xl">
                        {{ item.value }}
                    </div>
                </div>
                <div :class="item.iconBg" class="flex items-center justify-center rounded-full"
                    style="width: 2.5rem; height: 2.5rem">
                    <i :class="item.iconClass"></i>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { fetchDashboardData } from '@/service/firstPromoterService';
import { AuthService } from '@/service/AuthService';


export default {
    data() {
        return {
            dashboardData: [
                { key: "visitors_count", label: "Total Clicks", value: 0, iconClass: "pi pi-mouse", iconBg: "bg-blue-100 dark:bg-blue-400/10" },
                { key: "leads_count", label: "Total Leads", value: 0, iconClass: "pi pi-user-plus", iconBg: "bg-orange-100 dark:bg-orange-400/10" },
                { key: "sales_count", label: "Total Conversions", value: 0, iconClass: "pi pi-check", iconBg: "bg-cyan-100 dark:bg-cyan-400/10" },
                { key: "earningsCash", label: "Total Earnings (Cash)", value: "$0", iconClass: "pi pi-dollar", iconBg: "bg-green-100 dark:bg-green-400/10" },
                { key: "earningsCredits", label: "Total Earnings (Credits)", value: "0", iconClass: "pi pi-credit-card", iconBg: "bg-yellow-100 dark:bg-yellow-400/10" },
                { key: "pendingCash", label: "Pending Payouts (Cash)", value: "$0", iconClass: "pi pi-hourglass", iconBg: "bg-purple-100 dark:bg-purple-400/10" },
                { key: "pendingCredits", label: "Pending Payouts (Credits)", value: "0", iconClass: "pi pi-clock", iconBg: "bg-pink-100 dark:bg-pink-400/10" },
                { key: "approvedCash", label: "Approved Payouts (Cash)", value: "$0", iconClass: "pi pi-wallet", iconBg: "bg-gray-100 dark:bg-gray-400/10" },
                { key: "approvedCredits", label: "Approved Payouts (Credits)", value: "0", iconClass: "pi pi-star", iconBg: "bg-indigo-100 dark:bg-indigo-400/10" }
            ]
        };
    },
    async mounted() {
        try {
            const auth = JSON.parse(localStorage.getItem("auth"));
            if (!auth?.user?.user?.id) throw new Error("User ID not found");

            const userpromoter = await AuthService.getUserMeta(auth.user.user.id, "promoterId");
            if (!userpromoter?.userpromoterId) throw new Error("Promoter ID not found");

            const response = await fetchDashboardData(userpromoter.userpromoterId);
            let data = response.promotions;
            if (!data || !Array.isArray(data) || data.length === 0) return;

            const stats = data[0]; // Assuming API returns an array with one object

            this.dashboardData.forEach((item) => {
                const rawValue = stats[item.key] ?? 0;
                item.value = ["earningsCash", "pendingCash", "approvedCash"].includes(item.key)
                    ? `$${rawValue}`
                    : rawValue.toString();
            });

        } catch (error) {
            console.error("Error loading dashboard data:", error);
        }
    }
};
</script>