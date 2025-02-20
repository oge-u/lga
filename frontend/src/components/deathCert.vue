<template>
  <div class="death-certificate-page">
    <h2>Death Certificate Request</h2>
    <form @submit.prevent="handleSubmit" class="death-certificate-form">
      <div class="form-group">
        <label for="deceasedFirstName">Deceased First Name:</label>
        <input type="text" id="deceasedFirstName" v-model="formData.deceasedFirstName" class="form-input"/>
      </div>
      <div class="form-group">
        <label for="deceasedLastName">Deceased Last Name:</label>
        <input type="text" id="deceasedLastName" v-model="formData.deceasedLastName" class="form-input"/>
      </div>
      <div class="form-group">
        <label for="deceasedOtherNames">Deceased Other Names (Optional):</label>
        <input type="text" id="deceasedOtherNames" v-model="formData.deceasedOtherNames" class="form-input"/>
      </div>
      <div class="form-group">
        <label for="dateOfDeath">Date of Death:</label>
        <input type="date" id="dateOfDeath" v-model="formData.dateOfDeath" class="form-input"/>
      </div>
      <div class="form-group">
        <label for="placeOfDeath">Place of Death:</label>
        <input type="text" id="placeOfDeath" v-model="formData.placeOfDeath" class="form-input"/>
      </div>
      <div class="form-group">
        <label for="causeOfDeath">Cause of Death (Optional):</label>
        <textarea id="causeOfDeath" v-model="formData.causeOfDeath" class="form-input"></textarea>
      </div>
      <div class="form-group">
        <label for="applicantRelationship">Your Relationship to Deceased:</label>
        <input type="text" id="applicantRelationship" v-model="formData.applicantRelationship" class="form-input"/>
      </div>
      <div class="form-group">
        <label for="applicantPhoneNumber">Your Phone Number:</label>
        <input type="tel" id="applicantPhoneNumber" v-model="formData.applicantPhoneNumber" class="form-input"/>
      </div>
      <div class="form-group">
        <label for="applicantEmailAddress">Your Email Address (Read-only):</label>
        <input type="email" id="applicantEmailAddress" v-model="formData.applicantEmailAddress" readonly class="form-input"/>
      </div>
      <div class="form-group">
        <label for="applicantAddress">Your Address:</label>
        <textarea id="applicantAddress" v-model="formData.applicantAddress" class="form-input"></textarea>
      </div>
      <button type="submit" class="submit-button">Submit Application</button>
      <div v-if="message" class="message success-message">{{ message }}</div>
      <div v-if="error" class="message error-message">{{ error }}</div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../utils/axios';


const route = useRoute();
const router = useRouter();

const formData = reactive({
  deceasedFirstName: '',
  deceasedLastName: '',
  deceasedOtherNames: '',
  dateOfDeath: '',
  placeOfDeath: '',
  causeOfDeath: '',
  applicantRelationship: '',
  applicantPhoneNumber: '',
  applicantEmailAddress: '',
  applicantAddress: '',
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
    const response = await api.post('/applications/death-cert-apply', formData);
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
      error.value = response.data.message || 'Application submission failed.';
    }
  } catch (err) {
    error.value = 'Error submitting application. Network issue?';
    console.error('Application submission error:', err);
  }
};
</script>

<style scoped>
.death-certificate-page {
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
.form-input, textarea {
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