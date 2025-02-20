<template>
  <div class="local-gov-id-details-page">
    <h2>Local Government ID Application Details - ID: {{ route.params.id }}</h2>

    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="lgaDetails">
      <p><strong>Full Name:</strong> {{ lgaDetails.full_name }}</p>
      <p><strong>Gender:</strong> {{ lgaDetails.gender }}</p>
      <p><strong>Date of Birth:</strong> {{ formatDate(lgaDetails.date_of_birth) }}</p>
      <p><strong>Residential Address:</strong> {{ lgaDetails.residential_address }}</p>
      <p><strong>State of Origin:</strong> {{ lgaDetails.state_of_origin }}</p>
      <p><strong>Local Government Area:</strong> {{ lgaDetails.lga }}</p>
      <p><strong>Contact Email:</strong> {{ lgaDetails.contact_email }}</p>
      <p><strong>Contact Phone:</strong> {{ lgaDetails.contact_phone }}</p>
      <p><strong>Application Status:</strong> {{ lgaDetails.status }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../utils/axios';

const route = useRoute();
const lgaDetails = ref(null);
const loading = ref(true);
const error = ref('');

const fetchLocalGovernmentDetails = async () => {
  const applicationId = route.params.id;
  loading.value = true;
  error.value = '';

  try {
    const response = await api.get(`/applications/lga-registration/details/${applicationId}`);

    if (response.status === 200) {
      lgaDetails.value = response.data.application;  // Ensure correct data structure
    } else if (response.status === 404) {
      error.value = 'Local Government Registration Application not found.';
    } else {
      error.value = 'Failed to load local government registration details.';
    }
  } catch (err) {
    error.value = 'Error loading local government registration details. Please try again.';
    console.error('Error fetching local government details:', err);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

onMounted(fetchLocalGovernmentDetails);
</script>

<style scoped>
.local-gov-id-details-page {
  padding: 20px;
}
.error {
  color: red;
}
</style>
