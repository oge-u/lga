<template>
  <div class="cluster-dashboard">
    <h2>Cluster Admin Dashboard</h2>
    
    <div v-if="loading">Loading dashboard data...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else>
      <h3>Your Clusters</h3>
      <div v-for="cluster in clusters" :key="cluster.id" class="cluster-card">
        <h4>{{ cluster.cluster_name }} ({{ cluster.lga }})</h4>
        <p>{{ cluster.description }}</p>
       
      </div>
      
      <h3>Your Businesses</h3>
      <table class="business-table">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Business Name</th>
            <th>Business Type</th>
            <th>Registration Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="biz in businessRegistrations" :key="biz.id">
            <td>{{ biz.user_id }}</td>
            <td>{{ biz.business_name }}</td>
            <td>{{ biz.business_type }}</td>
            <td>{{ formatDate(biz.registration_date) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../utils/axios';

const clusters = ref([]);
const businessRegistrations = ref([]);
const loading = ref(false);
const error = ref('');

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

const fetchDashboardData = async () => {
  loading.value = true;
  error.value = '';
  try {
    const token = localStorage.getItem('adminToken');
    const response = await api.get('/admin/cluster/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 200) {
      clusters.value = response.data.clusters;
      businessRegistrations.value = response.data.businessRegistrations;
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

onMounted(() => {
  fetchDashboardData();
});
</script>

<style scoped>
.cluster-dashboard {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
}
.cluster-card {
  border: 1px solid #ddd;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 5px;
}
.business-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}
.business-table th, .business-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}
.business-table th {
  background-color: #f4f4f4;
}
.error-message {
  color: red;
  padding: 10px;
  border: 1px solid red;
  border-radius: 4px;
}
</style>
