<template>
  <div class="business-reg-details-page">
    <h2 class="title">Business Registration Details - ID: {{ route.params.id }}</h2>

    <!-- Error message -->
    <div v-if="error" class="error-message">{{ error }}</div>

    <!-- Loading message -->
    <div v-if="loading" class="loading-message">Loading business registration details...</div>

    <!-- Display application details if available -->
    <div v-if="businessRegDetails" class="details-container">
      <p><strong>Business Name:</strong> {{ businessRegDetails.business_name }}</p>
      <p><strong>Business Type:</strong> {{ businessRegDetails.business_type }}</p>
      <p><strong>Business Address:</strong> {{ businessRegDetails.business_address }}</p>
      <p><strong>Registration Date:</strong> {{ formatDate(businessRegDetails.registration_date) }}</p>
      <p><strong>Status:</strong> {{ businessRegDetails.status }}</p>
      <!-- Add more fields if necessary -->
    </div>

    <!-- Message if no details are found -->
    <div v-else-if="!loading && !businessRegDetails">
      <p>Business registration details not found.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../utils/axios';  

const route = useRoute();
const businessRegDetails = ref(null);
const loading = ref(false);
const error = ref('');

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};
onMounted(async () => {
  const applicationId = route.params.id;
  loading.value = true;
  error.value = '';
  businessRegDetails.value = null;

  try {
    const response = await api.get(`/applications/business-register/details/${applicationId}`);
    if (response.status === 200) {
      businessRegDetails.value = response.data.application;  // Corrected the response structure
    } else if (response.status === 404) {
      error.value = 'Business registration details not found.';
    } else {
      error.value = 'Failed to load business registration details.';
    }
  } catch (err) {
    error.value = 'Error loading business registration details. Network issue?';
    console.error('Error fetching business registration details:', err);
  } finally {
    loading.value = false;
  }
});

</script>

<style scoped>
.business-reg-details-page {
  padding: 30px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 12px;
}

.details-container {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #fff;
}

.details-container p {
  margin-bottom: 10px;
  line-height: 1.6;
}

.details-container strong {
  font-weight: bold;
  margin-right: 5px;
}

.error-message, .loading-message {
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
}

@media (max-width: 768px) {
  .business-reg-details-page {
    padding: 20px;
  }

  .title {
    font-size: 20px;
  }

  .details-container p {
    font-size: 14px;
  }
}
</style>
