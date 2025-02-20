<template>
  <div class="club-association-reg-page">
    <h2>Club/Association Registration</h2>

    <!-- Display the service price (read-only) -->
    <div class="price-display">
      Service Price:
      <input type="text" :value="servicePrice" readonly class="price-input" />
    </div>

    <form @submit.prevent="handleSubmit" class="club-association-reg-form">
      <div class="form-group">
        <label for="clubAssociationName">Club/Association Name:</label>
        <input type="text" id="clubAssociationName" v-model="formData.clubAssociationName" class="form-input"/>
      </div>
      <div class="form-group">
        <label for="natureOfClubAssociation">Nature of Club/Association (Optional):</label>
        <textarea id="natureOfClubAssociation" v-model="formData.natureOfClubAssociation" class="form-input"></textarea>
      </div>
      <div class="form-group">
        <label for="registrationAddress">Registration Address:</label>
        <input type="text" id="registrationAddress" v-model="formData.registrationAddress" class="form-input"/>
      </div>
      <div class="form-group">
        <label for="lgaOfOperation">LGA of Operation:</label>
        <input type="text" id="lgaOfOperation" v-model="formData.lgaOfOperation" class="form-input"/>
      </div>
      <div class="form-group">
        <label for="contactPersonName">Contact Person Name:</label>
        <input type="text" id="contactPersonName" v-model="formData.contactPersonName" class="form-input"/>
      </div>
      <div class="form-group">
        <label for="contactPersonPhone">Contact Person Phone Number:</label>
        <input type="tel" id="contactPersonPhone" v-model="formData.contactPersonPhone" class="form-input"/>
      </div>
      <div class="form-group">
        <label for="contactPersonEmail">Contact Person Email Address (Read-only):</label>
        <input type="email" id="contactPersonEmail" v-model="formData.contactPersonEmail" readonly class="form-input"/>
      </div>
      <div class="form-group">
        <label for="registrationDate">Registration Date:</label>
        <input type="date" id="registrationDate" v-model="formData.registrationDate" class="form-input"/>
      </div>
      <button type="submit" class="submit-button">Register Club/Association</button>
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
  clubAssociationName: '',
  natureOfClubAssociation: '',
  registrationAddress: '',
  lgaOfOperation: '',
  contactPersonName: '',
  contactPersonPhone: '',
  contactPersonEmail: '',
  registrationDate: '',
});

// New reactive variable to store the service price
const servicePrice = ref(null);

const message = ref('');
const error = ref('');

onMounted(() => {
  // Set the logged-in user's email (simulate authentication)
  const loggedInEmail = localStorage.getItem('userEmail');
  if (loggedInEmail) {
    formData.contactPersonEmail = loggedInEmail;
  }
  // Fetch the service price for Club/Association Registration (assuming service id 3)
  fetchServicePrice();
});

const fetchServicePrice = async () => {
  try {
    const adminToken = localStorage.getItem('adminToken');
    // Change '3' to the correct service id for Club/Association Registration in your services table
    const response = await api.get('/services/3/price', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (response.status === 200) {
      servicePrice.value = response.data.price;
    }
  } catch (err) {
    console.error('Error fetching service price:', err);
  }
};

const handleSubmit = async () => {
  message.value = '';
  error.value = '';
  try {
    // Include the service price in the payload
    const payload = {
      ...formData,
      servicePrice: servicePrice.value,
    };
    const response = await api.post('/applications/club-register', payload);
    if (response.status === 201) {
      message.value = response.data.message;
      const registrationId = response.data.registrationId;
      // Reset the form (optional), but preserve the price
      Object.keys(formData).forEach(key => formData[key] = '');
      const loggedInEmail = localStorage.getItem('userEmail');
      if (loggedInEmail) {
        formData.contactPersonEmail = loggedInEmail;
        setTimeout(() => {
        router.push(`/payment/${registrationId}`);
      }, 2000);
      }
    } else {
      error.value = response.data.message || 'Club/Association registration failed.';
    }
  } catch (err) {
    error.value = 'Error registering club/association. Network issue?';
    console.error('Club/Association registration error:', err);
  }
};
</script>

<style scoped>
.club-association-reg-page {
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

/* Price display styling */
.price-display {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
}
.price-input {
  border: none;
  background: transparent;
  font-weight: bold;
  font-size: 18px;
}
</style>
