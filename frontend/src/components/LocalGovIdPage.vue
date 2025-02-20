<template>
  <div class="local-gov-id-page">
    <h2>Apply for Local Government ID</h2>
    <form @submit.prevent="handleSubmit" class="local-gov-id-form">
      <div class="form-group">
        <label for="applicantFirstName">First Name:</label>
        <input type="text" id="applicantFirstName" v-model="formData.applicantFirstName" class="form-input"/>
      </div>
      <div class="form-group">
        <label for="applicantLastName">Last Name:</label>
        <input type="text" id="applicantLastName" v-model="formData.applicantLastName" class="form-input"/>
      </div>
      <div class="form-group">
        <label for="applicantOtherNames">Other Names (Optional):</label>
        <input type="text" id="applicantOtherNames" v-model="formData.applicantOtherNames" class="form-input"/>
      </div>
      <div class="form-group">
        <label for="dateOfBirth">Date of Birth:</label>
        <input type="date" id="dateOfBirth" v-model="formData.dateOfBirth" class="form-input"/>
      </div>
      <div class="form-group">
        <label for="gender">Gender:</label>
        <select id="gender" v-model="formData.gender" class="form-input">
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div class="form-group">
        <label for="occupation">Occupation (Optional):</label>
        <input type="text" id="occupation" v-model="formData.occupation" class="form-input"/>
      </div>
      <div class="form-group">
        <label for="homeAddress">Home Address:</label>
        <input type="text" id="homeAddress" v-model="formData.homeAddress" class="form-input"/>
      </div>
      <div class="form-group">
        <label for="lgaOfOrigin">LGA of Origin:</label>
        <input type="text" id="lgaOfOrigin" v-model="formData.lgaOfOrigin" class="form-input"/>
      </div>
      <div class="form-group">
        <label for="phoneNumber">Phone Number:</label>
        <input type="tel" id="phoneNumber" v-model="formData.phoneNumber" class="form-input"/>
      </div>
      <div class="form-group">
        <label for="applicantEmailAddress">Email Address (Read-only):</label>
        <input type="email" id="applicantEmailAddress" v-model="formData.applicantEmailAddress" readonly class="form-input"/>
      </div>
      <div class="form-group">
        <label for="applicationReason">Reason for Application (Optional):</label>
        <textarea id="applicationReason" v-model="formData.applicationReason" class="form-input"></textarea>
      </div>

      <button type="submit" class="submit-button">Submit Application</button>
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
  applicantFirstName: '',
  applicantLastName: '',
  applicantOtherNames: '',
  dateOfBirth: '',
  gender: '',
  occupation: '',
  homeAddress: '',
  lgaOfOrigin: '',
  phoneNumber: '',
  applicantEmailAddress: '',
  applicationReason: '',
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
    const response = await api.post('/applications/lga-cert-apply', formData);
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
.local-gov-id-page {
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