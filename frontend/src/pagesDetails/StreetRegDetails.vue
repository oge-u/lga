<template>
  <div class="street-reg-details-page">
    <h2>Street Registration Details - ID: {{ route.params.id }}</h2>

    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="streetDetails">
      <p><strong>Street Name:</strong> {{ streetDetails.street_name }}</p>
      <p><strong>Loca Government Area:</strong> {{ streetDetails.lga_location }}</p>
      <p><strong>Community:</strong> {{ streetDetails.community_name }}</p>
      <p><strong>Number of Houses:</strong> {{ streetDetails.number_of_houses}}</p>
      <p><strong>Street Lightning:</strong> {{ streetDetails.street_lighting_status }}</p>
      <p><strong>Waste Disposal:</strong> {{ streetDetails.waste_disposal_system_status }}</p>
      <p><strong>Registration Date:</strong> {{ formatDate(streetDetails.application_date) }}</p>
      <p><strong>Status:</strong> {{ streetDetails.status }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../utils/axios';

const route = useRoute();
const streetDetails = ref(null);
const loading = ref(true);
const error = ref('');

const fetchStreetDetails = async () => {
  const applicationId = route.params.id;
  loading.value = true;
  error.value = '';

  try {
    const response = await api.get(`/applications/street-registration/details/${applicationId}`);
    
    if (response.status === 200) {
      streetDetails.value = response.data.application;  // Ensure correct data structure
    } else if (response.status === 404) {
      error.value = 'Street Registration Application not found.';
    } else {
      error.value = 'Failed to load street registration details.';
    }
  } catch (err) {
    error.value = 'Error loading street registration details. Please try again.';
    console.error('Error fetching street registration details:', err);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

onMounted(fetchStreetDetails);
</script>

<style scoped>
.street-reg-details-page {
  padding: 20px;
}
.error {
  color: red;
}
</style>
