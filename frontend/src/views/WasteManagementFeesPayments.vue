<template>
  <div class="applications">
    <h2>Waste Management Fees Payments</h2>
    <div class="service-price" v-if="price !== null">
      Service Price: {{ price | currency }}
    </div>
    <div v-if="loading">Loading payments...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Property Address</th>
            <th>Property Type</th>
            <th>Payment Amount</th>
            <th>Payment Date</th>
            <th>Transaction Reference</th>
            <th>Payment Method</th>
            <th>Payment Status</th>
            <th>Application Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="payment in payments" :key="payment.id">
            <td>{{ payment.id }}</td>
            <td>{{ payment.propertyAddress }}</td>
            <td>{{ payment.propertyType }}</td>
            <td>{{ payment.paymentAmount }}</td>
            <td>{{ formatDate(payment.paymentDate) }}</td>
            <td>{{ payment.transactionReference }}</td>
            <td>{{ payment.paymentMethod }}</td>
            <td>{{ payment.paymentStatus }}</td>
            <td>{{ formatDate(payment.applicationDate) }}</td>
            <td>
              <!-- Show Approve/Reject buttons only if status is pending -->
              <button
                v-if="payment.paymentStatus && payment.paymentStatus.toLowerCase() === 'pending'"
                @click="approvePayment(payment.id)"
                class="action-btn approve-btn"
              >
                Approve
              </button>
              <button
                v-if="payment.paymentStatus && payment.paymentStatus.toLowerCase() === 'pending'"
                @click="rejectPayment(payment.id)"
                class="action-btn reject-btn"
              >
                Reject
              </button>
              <span v-else>{{ payment.paymentStatus }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../utils/axios';

const payments = ref([]);
const loading = ref(false);
const error = ref('');
const price = ref(null);

// Fetch Waste Management Fees Payments from the backend and transform data
const fetchPayments = async () => {
  loading.value = true;
  error.value = '';
  try {
    const adminToken = localStorage.getItem('adminToken');
    const response = await api.get('/admin/applications/waste-management-fees-payments', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (response.status === 200) {
      payments.value = (response.data.applications || []).map(payment => ({
        id: payment.id,
        propertyAddress: payment.property_address,
        propertyType: payment.property_type,
        paymentAmount: payment.payment_amount,
        paymentDate: payment.payment_date,
        transactionReference: payment.transaction_reference,
        paymentMethod: payment.payment_method,
        paymentStatus: payment.payment_status,
        applicationDate: payment.application_date,
      }));
    } else {
      error.value = response.data.message || 'Failed to fetch payments.';
    }
  } catch (err) {
    error.value = 'Error fetching payments. Please try again later.';
    console.error('Error fetching payments:', err);
  } finally {
    loading.value = false;
  }
};

// Fetch the price for the service using its id (example: id = 2 for Local Government ID)
const fetchServicePrice = async () => {
  try {
    const serviceId = 2; // Use the appropriate service id for Local Government ID
    const adminToken = localStorage.getItem('adminToken');
    const response = await api.get(`/services/${serviceId}/price`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (response.status === 200) {
      price.value = response.data.price;
    }
  } catch (err) {
    console.error('Error fetching service price:', err);
  }
};

const approvePayment = async (id) => {
  try {
    const adminToken = localStorage.getItem('adminToken');
    const response = await api.post(
      `/admin/applications/waste-management-fees-payments/${id}/approve`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    if (response.status === 200) {
      const idx = payments.value.findIndex(payment => payment.id === id);
      if (idx !== -1) {
        payments.value[idx].paymentStatus = 'Approved';
      }
      alert('Payment approved successfully.');
    } else {
      alert('Failed to approve payment: ' + (response.data.message || 'Unknown error'));
    }
  } catch (err) {
    console.error('Error approving payment:', err);
    alert('Error approving payment.');
  }
};

const rejectPayment = async (id) => {
  try {
    const adminToken = localStorage.getItem('adminToken');
    const response = await api.post(
      `/admin/applications/waste-management-fees-payments/${id}/reject`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    if (response.status === 200) {
      const idx = payments.value.findIndex(payment => payment.id === id);
      if (idx !== -1) {
        payments.value[idx].paymentStatus = 'Rejected';
      }
      alert('Payment rejected successfully.');
    } else {
      alert('Failed to reject payment: ' + (response.data.message || 'Unknown error'));
    }
  } catch (err) {
    console.error('Error rejecting payment:', err);
    alert('Error rejecting payment.');
  }
};

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

onMounted(() => {
  fetchPayments();
  fetchServicePrice();
});
</script>

<style scoped>
.applications {
  margin: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th,
td {
  padding: 12px 15px;
  border: 1px solid #ddd;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}

.error-message {
  color: red;
}

.action-btn {
  padding: 8px 16px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 4px;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.approve-btn {
  background-color: #4CAF50;
  color: white;
}

.approve-btn:hover {
  background-color: #45a049;
  transform: translateY(-2px);
}

.reject-btn {
  background-color: #f44336;
  color: white;
}

.reject-btn:hover {
  background-color: #e53935;
  transform: translateY(-2px);
}
.service-price {
  font-weight: bold;
  margin-bottom: 1rem;
}

</style>
