<template>
  <div class="bursury-dashboard">
    <h2>Bursary Admin Dashboard</h2>
    <div v-if="loading">Loading dashboard data...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else>
      <div class="revenue-summary">
        <h3>Total Revenue: {{ totalRevenueFormatted }}</h3>
      </div>

      <!-- Revenue Breakdown by Service -->
      <div class="service-revenue">
        <h3>Revenue Breakdown by Service</h3>
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="service in serviceRevenue" :key="service.service_name">
              <td>{{ service.service_name }}</td>
              <td>{{ formatCurrency(service.totalRevenue) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Recent Payments -->
      <div class="recent-payments">
        <h3>Recent Payments</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Registration ID</th>
              <th>Service</th>
              <th>Amount</th>
              <th>Payment Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in recentPayments" :key="payment.id">
              <td>{{ payment.id }}</td>
              <td>{{ payment.registration_id }}</td>
              <td>{{ payment.service_name }}</td>
              <td>{{ formatCurrency(payment.payment_amount) }}</td>
              <td>{{ formatDate(payment.payment_date) }}</td>
              <td>{{ payment.payment_status }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../utils/axios';

const loading = ref(false);
const error = ref('');
const totalRevenue = ref(0);
const serviceRevenue = ref([]); // Store revenue per service
const recentPayments = ref([]);

const fetchDashboardData = async () => {
  loading.value = true;
  error.value = '';
  try {
    const adminToken = localStorage.getItem('adminToken');
    const response = await api.get('/admin/payments/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (response.status === 200) {
      totalRevenue.value = response.data.totalRevenue;
      serviceRevenue.value = response.data.serviceRevenue;
      recentPayments.value = response.data.recentPayments;
    } else {
      error.value = response.data.message || 'Failed to fetch dashboard data';
    }
  } catch (err) {
    error.value = 'Error fetching dashboard data';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
};

const totalRevenueFormatted = computed(() => formatCurrency(totalRevenue.value));

onMounted(() => {
  fetchDashboardData();
});
</script>

<style scoped>
.bursury-dashboard {
  max-width: 900px;
  margin: 20px auto;
  padding: 20px;
}

.error-message {
  color: red;
  padding: 10px;
  border: 1px solid red;
  border-radius: 4px;
}

.revenue-summary,
.service-revenue,
.recent-payments {
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

th, td {
  padding: 8px;
  border: 1px solid #ddd;
  text-align: left;
}

th {
  background-color: #f0f0f0;
}
</style>
