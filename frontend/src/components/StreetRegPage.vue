<template>
  <div class="street-registration-page">
    <h2>Street Registration</h2>
    <form @submit.prevent="handleSubmit" class="street-registration-form">
      <div class="form-group">
        <label for="streetName">Street Name:</label>
        <input type="text" id="streetName" v-model="formData.streetName" class="form-input"/>
      </div>
      <div class="form-group">
        <label for="lgaLocation">Local Government Area (LGA) Location:</label>
        <input type="text" id="lgaLocation" v-model="formData.lgaLocation" class="form-input"/>
      </div>
      <div class="form-group">
        <label for="communityName">Community Name (Optional):</label>
        <input type="text" id="communityName" v-model="formData.communityName" class="form-input"/>
      </div>
      <div class="form-group">
        <label for="numberOfHouses">Number of Houses (Optional):</label>
        <input type="number" id="numberOfHouses" v-model="formData.numberOfHouses" class="form-input"/>
      </div>
      <div class="form-group">
        <label for="streetLengthMeters">Street Length (Meters - Optional):</label>
        <input type="number" id="streetLengthMeters" v-model="formData.streetLengthMeters" class="form-input"/>
      </div>
      <div class="form-group">
        <label for="streetLightingStatus">Street Lighting Status:</label>
        <select id="streetLightingStatus" v-model="formData.streetLightingStatus" class="form-input">
          <option value="">Select Status</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
          <option value="partial">Partial</option>
        </select>
      </div>
      <div class="form-group">
        <label for="wasteDisposalSystemStatus">Waste Disposal System Status:</label>
        <select id="wasteDisposalSystemStatus" v-model="formData.wasteDisposalSystemStatus" class="form-input">
          <option value="">Select Status</option>
          <option value="functional">Functional</option>
          <option value="non_functional">Non-Functional</option>
          <option value="needs_improvement">Needs Improvement</option>
        </select>
      </div>
      <div class="form-group">
        <label for="registrationPurpose">Purpose of Registration (Optional):</label>
        <textarea id="registrationPurpose" v-model="formData.registrationPurpose" class="form-input"></textarea>
      </div>
      <div class="form-group">
        <label for="applicantEmailAddress">Your Email Address (Read-only):</label>
        <input type="email" id="applicantEmailAddress" v-model="formData.applicantEmailAddress" readonly class="form-input"/>
      </div>

      <button type="submit" class="submit-button">Register Street</button>
      <div v-if="message" class="message success-message">{{ message }}</div>
      <div v-if="error" class="message error-message">{{ error }}</div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import api from '../utils/axios';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const formData = reactive({
  streetName: '',
  lgaLocation: '',
  communityName: '',
  numberOfHouses: '',
  streetLengthMeters: '',
  streetLightingStatus: 'no', // Default value
  wasteDisposalSystemStatus: 'non_functional', // Default value
  registrationPurpose: '',
  applicantEmailAddress: '',
});

const message = ref('');
const error = ref('');

onMounted(() => {
    // In real app, get logged-in user's email from auth state/store
    const loggedInEmail = localStorage.getItem('userEmail'); // Example
    if (loggedInEmail) {
        formData.applicantEmailAddress = loggedInEmail;
    }
});

const handleSubmit = async () => {
  message.value = '';
  error.value = '';
  try {
    const response = await api.post('/applications/street-register', formData);
    if (response.status === 201) {
        
      message.value = response.data.message;
      const registrationId = response.data.registrationId;
      // Reset form (optional)
      Object.keys(formData).forEach(key => formData[key] = '');
      const loggedInEmail = localStorage.getItem('userEmail'); // Re-set email
      if (loggedInEmail) {
         formData.applicantEmailAddress = loggedInEmail;
      setTimeout(() => {
        router.push(`/payment/${registrationId}`);
      }, 2000);
      }
    } else { 
      error.value = response.data.message || 'Street registration failed.';
    }
  } catch (err) {
    error.value = 'Error registering street. Network issue?';
    console.error('Street registration error:', err);
  }
};
</script>

<style scoped>
.street-registration-page {
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
.form-input, select, textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 16px;
}
textarea {
  resize: vertical;
  min-height: 100px;
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