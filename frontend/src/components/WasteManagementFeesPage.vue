<template>
  <div class="waste-management-fees-page">
    <h2>Pay Waste Management Fees</h2>
    <form @submit.prevent="handleSubmit" class="waste-management-fees-form">
      <div class="form-group">
        <label for="propertyAddress">Property Address:</label>
        <input type="text" id="propertyAddress" v-model="formData.propertyAddress" class="form-input"/>
      </div>
      <div class="form-group">
        <label for="propertyType">Property Type:</label>
        <select id="propertyType" v-model="formData.propertyType" class="form-input">
          <option value="">Select Type</option>
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
        </select>
      </div>
      <div class="form-group">
        <label for="paymentAmount">Payment Amount (NGN):</label>
        <input type="number" id="paymentAmount" v-model="formData.paymentAmount" class="form-input" step="0.01"/>
      </div>
      <div class="form-group">
        <label for="paymentDate">Payment Date:</label>
        <input type="date" id="paymentDate" v-model="formData.paymentDate" class="form-input"/>
      </div>
      <div class="form-group">
        <label for="paymentMethod">Payment Method:</label>
        <select id="paymentMethod" v-model="formData.paymentMethod" class="form-input">
          <option value="">Select Method</option>
          <option value="online">Online Payment (Simulated)</option>
          <option value="bank_transfer">Bank Transfer</option>
        </select>
      </div>
      <div class="form-group">
        <label for="applicantEmailAddress">Your Email Address (Read-only):</label>
        <input type="email" id="applicantEmailAddress" v-model="formData.applicantEmailAddress" readonly class="form-input"/>
      </div>

      <button type="submit" class="submit-button">Make Payment</button>
      <div v-if="message" class="message success-message">
        {{ message }} <span v-if="transactionReference">Transaction Ref: {{ transactionReference }}</span>
      </div>
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
  propertyAddress: '',
  propertyType: '',
  paymentAmount: '',
  paymentDate: '',
  paymentMethod: '',
  applicantEmailAddress: '',
});

const message = ref('');
const error = ref('');
const transactionReference = ref('');

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
  transactionReference.value = '';
  try {
    const response = await api.post('/applications/pay-waste-fees', formData);
    if (response.status === 201) {
      message.value = response.data.message;
      const registrationId = response.data.registrationId;
      console.log('Frontend - applications.value after API response:', message.value);
      transactionReference.value = response.data.transactionReference;
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
      error.value = response.data.message || 'Payment failed.';
    }
  } catch (err) {
    error.value = 'Error processing payment. Network issue?';
    console.error('Payment error:', err);
  }
};
</script>

<style scoped>
.waste-management-fees-page {
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