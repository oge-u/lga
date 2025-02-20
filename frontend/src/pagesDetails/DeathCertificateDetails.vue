<template>
  <div class="death-certificate-details-page">
    <h2 class="title">Death Certificate Application Details - ID: {{ route.params.id }}</h2>

    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="loading" class="loading-message">Loading application details...</div>
    <div v-if="applicationDetails" class="details-container">
      <p><strong>Deceased First Name:</strong> {{ applicationDetails.deceased_first_name }}</p>
      <p><strong>Deceased Last Name:</strong> {{ applicationDetails.deceased_last_name }}</p>
      <p><strong>Deceased Other Names:</strong> {{ applicationDetails.deceased_other_names }}</p>
      <p><strong>Date of Death:</strong> {{ formatDate(applicationDetails.date_of_death) }}</p>
      <p><strong>Place of Death:</strong> {{ applicationDetails.place_of_death }}</p>
      <p><strong>Cause of Death:</strong> {{ applicationDetails.cause_of_death }}</p>
      <p><strong>Applicant Relationship:</strong> {{ applicationDetails.applicant_relationship }}</p>
      <p><strong>Applicant Phone Number:</strong> {{ applicationDetails.applicant_phone_number }}</p>
      <p><strong>Applicant Email Address:</strong> {{ applicationDetails.applicant_email_address }}</p>
      <p><strong>Applicant Address:</strong> {{ applicationDetails.applicant_address }}</p>
      <p><strong>Application Date:</strong> {{ formatDate(applicationDetails.application_date) }}</p>
      <p><strong>Status:</strong> {{ applicationDetails.status }}</p>
    </div>
    <div v-else-if="!loading && !error">
      <p class="no-details">Application details not found.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../utils/axios';

const route = useRoute();
const applicationDetails = ref(null);
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
  applicationDetails.value = null;

  try {
    const response = await api.get(`/applications/details/${applicationId}`); // API call to fetch details
    if (response.status === 200) {
      applicationDetails.value = response.data.application;
    } else if (response.status === 404) {
      error.value = 'Application details not found.';
    } else {
      error.value = 'Failed to load application details.';
    }
  } catch (err) {
    error.value = 'Error loading application details. Network issue?';
    console.error('Error fetching application details:', err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.death-certificate-details-page {
  padding: 30px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 28px;
  color: #2c3e50;
  margin-bottom: 20px;
}

.loading-message {
  color: #3498db;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
}

.details-container {
  margin-top: 20px;
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.details-container p {
  margin-bottom: 12px;
  font-size: 16px;
  line-height: 1.6;
}

.details-container strong {
  font-weight: bold;
  margin-right: 8px;
  color: #2c3e50;
}

.error-message {
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 5px;
}

.no-details {
  color: #e74c3c;
  font-size: 18px;
  font-weight: bold;
}

@media (max-width: 768px) {
  .death-certificate-details-page {
    padding: 20px;
  }

  .title {
    font-size: 24px;
  }

  .details-container {
    padding: 15px;
  }

  .details-container p {
    font-size: 14px;
  }
}
</style>
