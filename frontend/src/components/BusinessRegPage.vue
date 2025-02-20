<template>
  <div class="business-registration-page">
    <h2>Business Registration</h2>
    <form @submit.prevent="handleSubmit" class="business-registration-form">
      <div class="form-group">
        <label for="businessName">Business Name:</label>
        <input type="text" id="businessName" v-model="formData.businessName" class="form-input" />
      </div>
      <div class="form-group">
        <label for="businessType">Business Type:</label>
        <select id="businessType" v-model="formData.businessType" class="form-input">
          <option value="">Select Type</option>
          <option value="sole_proprietorship">Sole Proprietorship</option>
          <option value="partnership">Partnership</option>
          <option value="limited_liability_company">Limited Liability Company (LLC)</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div class="form-group">
        <label for="businessSector">Business Sector:</label>
        <input type="text" id="businessSector" v-model="formData.businessSector" class="form-input" />
      </div>
      <div class="form-group">
        <label for="businessAddress">Business Address:</label>
        <input type="text" id="businessAddress" v-model="formData.businessAddress" class="form-input" />
      </div>
      <!-- Dropdown for clusters -->
      <div class="form-group">
        <label for="cluster">Local Government (Select Cluster):</label>
        <select id="cluster" v-model="formData.cluster_id" class="form-input">
          <option value="">Select Cluster</option>
          <option v-for="cluster in clusters" :key="cluster.id" :value="cluster.id">
            {{ cluster.cluster_name }} ({{ cluster.lga }})
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="contactEmailAddress">Contact Email Address (Read-only):</label>
        <input type="email" id="contactEmailAddress" v-model="formData.contactEmailAddress" readonly class="form-input" />
      </div>
      <div class="form-group">
        <label for="contactPhoneNumber">Contact Phone Number:</label>
        <input type="tel" id="contactPhoneNumber" v-model="formData.contactPhoneNumber" class="form-input" />
      </div>
      <div class="form-group">
        <label for="registrationDate">Registration Date:</label>
        <input type="date" id="registrationDate" v-model="formData.registrationDate" class="form-input" />
      </div>

      <button type="submit" class="submit-button">Register Business</button>
      <div v-if="message" class="message success-message">{{ message }}</div>
      <div v-if="error" class="message error-message">{{ error }}</div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import api from '../utils/axios';
import { useRouter } from 'vue-router';

const router = useRouter();

// Update formData to include cluster_id instead of free-text LGA of Operation.
const formData = reactive({
  businessName: '',
  businessType: '',
  businessSector: '',
  businessAddress: '',
  cluster_id: '',  // This will hold the selected cluster id
  contactEmailAddress: '',
  contactPhoneNumber: '',
  registrationDate: '',
});

const clusters = ref([]); // Will store the list of clusters fetched from backend
const message = ref('');
const error = ref('');

onMounted(() => {
  // Simulate getting logged-in user's email from auth state/store
  const loggedInEmail = localStorage.getItem('userEmail');
  if (loggedInEmail) {
    formData.contactEmailAddress = loggedInEmail;
  }
  fetchClusters();
});

// Fetch clusters from backend; endpoint: GET /api/clusters
const fetchClusters = async () => {
  try {
    const adminToken = localStorage.getItem('adminToken');
    const response = await api.get('/admin/clusters/list', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (response.status === 200) {
      clusters.value = response.data.clusters;
    } else {
      error.value = response.data.message || 'Failed to fetch clusters';
    }
  } catch (err) {
    error.value = 'Error fetching clusters';
    console.error('Fetch clusters error:', err);
  }
};

const handleSubmit = async () => {
  message.value = '';
  error.value = '';
  try {
    const response = await api.post('/applications/business-register', formData);
    if (response.status === 201) {
      message.value = response.data.message;
      const registrationId = response.data.registrationId;
      // Reset form (optional)
      Object.keys(formData).forEach(key => formData[key] = '');
      const loggedInEmail = localStorage.getItem('userEmail');
      if (loggedInEmail) {
        formData.contactEmailAddress = loggedInEmail;
      }
      // Redirect to payment page with registration id
      setTimeout(() => {
        router.push(`/payment/${registrationId}`);
      }, 2000);
    } else {
      error.value = response.data.message || 'Business registration failed.';
    }
  } catch (err) {
    error.value = 'Error registering business. Network issue?';
    console.error('Business registration error:', err);
  }
};
</script>

<style scoped>
.business-registration-page {
  max-width: 700px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.form-group {
  margin-bottom: 15px;
}
label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
.form-input, select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 16px;
}
.submit-button {
  background-color: #007bff;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
}
.message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
}
.success-message {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}
.error-message {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>
