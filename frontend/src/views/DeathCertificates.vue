<template>
  <div class="applications">
    <h2>Death Certificate Applications</h2>
    <div class="service-price" v-if="price !== null">
      Service Price: {{ price | currency }}
    </div>
    <div v-if="loading">Loading applications...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Applicant</th>
            <th>Date Submitted</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="app in applications" :key="app.id">
            <td>{{ app.id }}</td>
            <td>{{ app.applicantName }}</td>
            <td>{{ formatDate(app.createdAt) }}</td>
            <td>{{ app.status }}</td>
            <td>
              <button 
                v-if="app.status && app.status.toLowerCase() === 'pending'" 
                @click="approveApplication(app.id)"
                 class="action-btn approve-btn"
              >
                Approve
              </button>
              <button 
                v-if="app.status && app.status.toLowerCase() === 'pending'" 
                @click="rejectApplication(app.id)"
                class="action-btn delete-btn"
              >
                Reject
              </button>
              <span v-else>{{ app.status }}</span>
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

// Reactive data
const applications = ref([]);
const loading = ref(false);
const error = ref('');
const price = ref(null);

// Fetch applications from backend
const fetchApplications = async () => {
  loading.value = true;
  error.value = '';
  try {
    const adminToken = localStorage.getItem('adminToken');
    const response = await api.get('/admin/applications/death-certificates', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (response.status === 200) {
      // Assuming response.data.applications is an array of applications
      // Transform keys if needed (for example, snake_case to camelCase)
      applications.value = (response.data.applications || []).map(app => ({
        id: app.id,
        applicantName: app.applicant_name,
        createdAt: app.created_at,
        status: app.status, // e.g., "Pending", "Approved", "Rejected"
        // Include other fields as needed
      }));
    } else {
      error.value = response.data.message || 'Failed to fetch applications.';
    }
  } catch (err) {
    error.value = 'Error fetching applications. Please try again later.';
    console.error('Error fetching applications:', err);
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

const approveApplication = async (appId) => {
  try {
    const adminToken = localStorage.getItem('adminToken');
    const response = await api.post(`/admin/applications/death-certificates/${appId}/approve`, {}, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (response.status === 200) {
      // Update the application status locally
      const idx = applications.value.findIndex(app => app.id === appId);
      if (idx !== -1) {
        applications.value[idx].status = 'Approved';
      }
      alert('Application approved successfully.');
    } else {
      alert('Failed to approve application: ' + (response.data.message || 'Unknown error'));
    }
  } catch (err) {
    console.error('Error approving application:', err);
    alert('Error approving application.');
  }
};

const rejectApplication = async (appId) => {
  try {
    const adminToken = localStorage.getItem('adminToken');
    const response = await api.post(`/admin/applications/death-certificates/${appId}/reject`, {}, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (response.status === 200) {
      const idx = applications.value.findIndex(app => app.id === appId);
      if (idx !== -1) {
        applications.value[idx].status = 'Rejected';
      }
      alert('Application rejected successfully.');
    } else {
      alert('Failed to reject application: ' + (response.data.message || 'Unknown error'));
    }
  } catch (err) {
    console.error('Error rejecting application:', err);
    alert('Error rejecting application.');
  }
};

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

onMounted(() => {
  fetchApplications();
  fetchServicePrice();
});
</script>

<style scoped>
/* Add your styles here */
.action-btn {
  padding: 8px 16px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 4px;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

/* Approve Button Styles */
.approve-btn {
  background-color: #4CAF50;
  color: white;
}

.approve-btn:hover {
  background-color: #45a049;
  transform: translateY(-2px);
}

/* Delete Button Styles */
.delete-btn {
  background-color: #f44336;
  color: white;
}

.delete-btn:hover {
  background-color: #e53935;
  transform: translateY(-2px);
}

/* Optional: Style the table rows and cells for better readability */
table {
  width: 100%;
  border-collapse: collapse;
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
.service-price {
  font-weight: bold;
  margin-bottom: 1rem;
}

</style>
