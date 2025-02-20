<template>
  <div class="waste-management-details-page">
    <h2>Waste Management Registration Details - ID: {{ route.params.id }}</h2>

    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="wasteDetails">
      <p><strong>Property Address:</strong> {{ wasteDetails.property_address }}</p>
      <p><strong>Prorperty Type:</strong> {{ wasteDetails.property_type }}</p>
      <p><strong>Registration Date:</strong> {{ formatDate(wasteDetails.application_date) }}</p>
      <p><strong>Status:</strong> {{ wasteDetails.status }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../utils/axios';

const route = useRoute();
const wasteDetails = ref(null);
const loading = ref(true);
const error = ref('');

const fetchWasteManagementDetails = async () => {
  const applicationId = route.params.id;
  loading.value = true;
  error.value = '';

  try {
    const response = await api.get(`/applications/waste-management/details/${applicationId}`);

    if (response.status === 200) {
      wasteDetails.value = response.data.application;  // Ensure correct data structure
    } else if (response.status === 404) {
      error.value = 'Waste Management Registration Application not found.';
    } else {
      error.value = 'Failed to load waste management registration details.';
    }
  } catch (err) {
    error.value = 'Error loading waste management registration details. Please try again.';
    console.error('Error fetching waste management details:', err);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

onMounted(fetchWasteManagementDetails);
</script>

<style scoped>
.waste-management-details-page {
  padding: 20px;
}
.error {
  color: red;
}
</style>
