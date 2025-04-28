<template>
    <div class="p-6 bg-gray-100 min-h-screen">
      <!-- Heading -->
      <h2 class="text-2xl font-bold mb-4">Top Performing Affiliates</h2>
  
      <!-- Top Affiliates Table -->
      <div class="bg-white p-4 rounded-lg shadow-md">
        <table class="w-full text-left">
          <thead class="bg-gray-200">
            <tr>
              <th class="p-3">Rank</th>
              <th class="p-3">Affiliate</th>
              <th class="p-3">Referrals</th>
              <th class="p-3">Conversions</th>
              <th class="p-3">Conversion Rate (%)</th>
              <th class="p-3">Retention (Days)</th>
              <th class="p-3">Revenue ($)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(affiliate, index) in topAffiliates" :key="affiliate.id" class="border-b">
              <td class="p-3 font-bold">{{ index + 1 }}</td>
              <td class="p-3">{{ affiliate.name }}</td>
              <td class="p-3">{{ affiliate.referrals }}</td>
              <td class="p-3">{{ affiliate.conversions }}</td>
              <td class="p-3 text-green-600">{{ affiliate.conversionRate.toFixed(2) }}%</td>
              <td class="p-3">{{ affiliate.retention }} days</td>
              <td class="p-3 text-blue-600 font-semibold">${{ affiliate.revenue.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Revenue Growth Chart -->
      <h2 class="text-2xl font-bold mt-6 mb-4">Revenue Growth</h2>
      <div class="bg-white p-4 rounded-lg shadow-md">
        <BarChart :data="revenueChartData" />
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from "vue";
  import { BarChart } from "vue-chart-3"; // Install vue-chart-3 for charts
  import { Chart, registerables } from "chart.js";
  Chart.register(...registerables);
  
  export default {
    components: { BarChart },
    setup() {
      const topAffiliates = ref([]);
      const revenueChartData = ref([]);
  
      const fetchData = async () => {
        const [affiliateRes, referralRes, commissionRes] = await Promise.all([
          fetch("/api/affiliates"),
          fetch("/api/referrals"),
          fetch("/api/commissions"),
        ]);
  
        const affiliates = await affiliateRes.json();
        const referrals = await referralRes.json();
        const commissions = await commissionRes.json();
  
        // Compute metrics for top affiliates
        const computedAffiliates = affiliates.map((aff) => {
          const relevantCommissions = commissions.filter((c) => c.affiliate.id === aff.id);
          const relevantReferrals = referrals.filter((r) => r.affiliate.id === aff.id);
  
          // Compute conversion rate
          const conversionRate = aff.conversions / (aff.visitors || 1) * 100;
  
          // Compute client retention (average duration of referrals)
          const retentionDays =
            relevantReferrals.length > 0
              ? relevantReferrals.reduce((sum, ref) => sum + (new Date(ref.expires_at) - new Date(ref.created_at)) / (1000 * 60 * 60 * 24), 0) /
                relevantReferrals.length
              : 0;
  
          // Compute revenue from commissions
          const revenue = relevantCommissions.reduce((sum, com) => sum + com.amount, 0);
  
          return {
            id: aff.id,
            name: `${aff.first_name} ${aff.last_name}`,
            referrals: aff.leads,
            conversions: aff.conversions,
            conversionRate,
            retention: retentionDays.toFixed(1),
            revenue,
          };
        });
  
        // Sort by revenue
        topAffiliates.value = computedAffiliates.sort((a, b) => b.revenue - a.revenue);
  
        // Prepare revenue growth chart data
        revenueChartData.value = {
          labels: computedAffiliates.map((a) => a.name),
          datasets: [
            {
              label: "Revenue ($)",
              data: computedAffiliates.map((a) => a.revenue),
              backgroundColor: "#4CAF50",
            },
          ],
        };
      };
  
      onMounted(fetchData);
  
      return { topAffiliates, revenueChartData };
    },
  };
  </script>