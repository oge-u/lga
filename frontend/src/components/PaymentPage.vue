<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../utils/axios';

const route = useRoute();
const router = useRouter();
const registrationId = route.params.id;
console.log("PaymentPage - Registration ID from route params:", registrationId);

const registration = ref({ id: '', service_id: null, user_id: null });
const servicePrice = ref(null);
const loading = ref(false);
const error = ref('');
const message = ref('');

const paymentData = ref({
  paymentMethod: '',
  transactionReference: '',
});

const fetchRegistrationDetails = async () => {
  loading.value = true;
  error.value = '';
  try {
    const adminToken = localStorage.getItem('adminToken');
    const url = `/applications/registrations/${registrationId}`;
    console.log("PaymentPage - Fetching registration details from URL:", url);
    const response = await api.get(url, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (response.status === 200) {
      registration.value = response.data.registration;
      console.log("PaymentPage - Registration details fetched:", registration.value);
      if (registration.value.service_id) {
        fetchServicePrice(registration.value.service_id);
      } else {
        error.value = 'Service information not available for this registration.';
      }
    } else {
      error.value = response.data.message || 'Failed to fetch registration details';
    }
  } catch (err) {
    error.value = 'Error fetching registration details';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const fetchServicePrice = async (serviceId) => {
  try {
    const adminToken = localStorage.getItem('adminToken');
    const url = `/services/${serviceId}/price`;
    console.log("PaymentPage - Fetching service price from URL:", url);
    const response = await api.get(url, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (response.status === 200) {
      servicePrice.value = response.data.price;
      console.log("PaymentPage - Service price fetched:", servicePrice.value);
    } else {
      console.error('Failed to fetch service price:', response.data.message);
    }
  } catch (err) {
    console.error('Error fetching service price:', err);
  }
};

const handlePayment = async () => {
  // ... your payment handling logic (no changes needed for this step)
};

onMounted(() => {
  if (!registrationId) {
    error.value = 'Registration ID is missing in the URL.';
    return;
  }
  fetchRegistrationDetails();
});
</script>

<template>
  <div v-if="loading" class="loading-container">Loading payment information...</div>
  <div v-else-if="error" class="error-message">{{ error }}</div>
  <div v-else class="payment-page-container">
    <h2 class="page-title">Payment Details</h2>
    <p class="service-price">Service Price: <span class="price-value">${{ servicePrice }}</span></p>
    <form @submit.prevent="handlePayment" class="payment-form">
      <div class="form-group">
        <label for="paymentMethod" class="form-label">Payment Method:</label>
        <select id="paymentMethod" v-model="paymentData.paymentMethod" required class="form-select">
          <option value="creditCard">Credit Card</option>
          <option value="paypal">PayPal</option>
          <!-- Add more payment methods as needed -->
        </select>
      </div>
      <div class="form-group">
        <label for="transactionReference" class="form-label">Transaction Reference:</label>
        <input type="text" id="transactionReference" v-model="paymentData.transactionReference" required class="form-input">
      </div>
      <button type="submit" class="submit-button">Submit Payment</button>
      <div v-if="message" class="success-message">{{ message }}</div>
    </form>
  </div>
</template>

<style scoped>
.payment-page-container {
  max-width: 600px;
  margin: 20px auto;
  padding: 30px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading-container {
  text-align: center;
  padding: 20px;
  font-size: 1.1em;
  color: #777;
}

.error-message {
  color: #dc3545;
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #f8d7da;
  background-color: #f8d7da;
  border-radius: 4px;
}

.success-message {
  color: #28a745;
  margin-top: 15px;
  padding: 10px;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
}


.page-title {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
}

.service-price {
  font-size: 1.2em;
  margin-bottom: 20px;
  text-align: center;
}

.price-value {
  font-weight: bold;
  color: #007bff; /* Example primary color */
}

.payment-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

.form-select,
.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1em;
}

.submit-button {
  padding: 12px 20px;
  background-color: #007bff; /* Example button color */
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1.1em;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-button:hover {
  background-color: #0056b3; /* Darker shade for hover */
}
</style>