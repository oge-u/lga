<template>
  <div class="club-association-reg-details-page">
    <h2>Club/Association Registration Details - ID: {{ route.params.id }}</h2>

    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="clubDetails">
      <p><strong>Club Name:</strong> {{ clubDetails.club_association_name }}</p>
      <p><strong>Nature of Association:</strong> {{ clubDetails.nature_of_club_association }}</p>
      <p><strong>Address:</strong> {{ clubDetails.registration_address }}</p>
      <p><strong>Contact Person Name:</strong> {{ clubDetails.contact_person_name }}</p>
      <p><strong>Contact Person Email:</strong> {{ clubDetails.contact_person_email }}</p>
      <p><strong>Contact Person Phone:</strong> {{ clubDetails.contact_person_phone }}</p>
      <p><strong>Registration Date:</strong> {{ formatDate(clubDetails.registration_date) }}</p>
      <p><strong>Status:</strong> {{ clubDetails.status }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../utils/axios';

const route = useRoute();
const clubDetails = ref(null);
const loading = ref(true);
const error = ref('');

const fetchClubDetails = async () => {
  const applicationId = route.params.id;
  loading.value = true;
  error.value = '';

  try {
    const response = await api.get(`/applications/club-registration/details/${applicationId}`);
    
    if (response.status === 200) {
      clubDetails.value = response.data.application;  // Ensure correct data structure
    } else if (response.status === 404) {
      error.value = 'Club Registration Application not found.';
    } else {
      error.value = 'Failed to load club registration details.';
    }
  } catch (err) {
    error.value = 'Error loading club registration details. Please try again.';
    console.error('Error fetching club registration details:', err);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

onMounted(fetchClubDetails);
</script>

<style scoped>
.club-association-reg-details-page {
  padding: 20px;
}
.error {
  color: red;
}
</style>
