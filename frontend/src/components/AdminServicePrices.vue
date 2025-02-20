<template>
  <div class="admin-service-prices">
    <h2>Manage Service Prices</h2>
    <div v-if="loading">Loading services...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Service Name</th>
            <th>Price</th>
            <th>Description</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="service in services" :key="service.id">
            <td>{{ service.id }}</td>
            <td>{{ service.service_name }}</td>
            <td>
              <div v-if="editId === service.id">
                <input type="number" v-model.number="editPrice" class="price-input"/>
              </div>
              <div v-else>
                {{ service.service_price }}
              </div>
            </td>
            <td>{{ service.description }}</td>
            <td>{{ formatDate(service.updated_at) }}</td>
            <td>
              <div v-if="editId === service.id">
                <button @click="updatePrice(service.id)" class="action-btn save-btn">Save</button>
                <button @click="cancelEdit" class="action-btn cancel-btn">Cancel</button>
              </div>
              <div v-else>
                <button @click="editService(service)" class="action-btn edit-btn">Edit</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="message" class="message success-message">{{ message }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../utils/axios';

const services = ref([]);
const loading = ref(false);
const error = ref('');
const message = ref('');

const editId = ref(null);
const editPrice = ref(null);

const fetchServices = async () => {
  loading.value = true;
  error.value = '';
  try {
    const adminToken = localStorage.getItem('adminToken');
    const response = await api.get('/services/services', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (response.status === 200) {
      services.value = response.data.services;
    } else {
      error.value = response.data.message || 'Failed to fetch services';
    }
  } catch (err) {
    error.value = 'Error fetching services';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const editService = (service) => {
  editId.value = service.id;
  editPrice.value = service.service_price;
  message.value = '';
};

const cancelEdit = () => {
  editId.value = null;
  editPrice.value = null;
};

const updatePrice = async (serviceId) => {
  try {
    const adminToken = localStorage.getItem('adminToken');
    const payload = { service_price: editPrice.value };
    const response = await api.patch(`/services/services/${serviceId}/price`, payload, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (response.status === 200) {
      message.value = response.data.message;
      // Refresh services list to reflect updated price
      await fetchServices();
      cancelEdit();
    } else {
      error.value = response.data.message || 'Failed to update price';
    }
  } catch (err) {
    error.value = 'Error updating price';
    console.error(err);
  }
};

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

onMounted(() => {
  fetchServices();
});
</script>

<style scoped>
.admin-service-prices {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

th, td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}

.price-input {
  width: 100px;
  padding: 5px;
}

.action-btn {
  padding: 6px 12px;
  margin-right: 5px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.edit-btn {
  background-color: #007bff;
  color: white;
}

.save-btn {
  background-color: #28a745;
  color: white;
}

.cancel-btn {
  background-color: #dc3545;
  color: white;
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
