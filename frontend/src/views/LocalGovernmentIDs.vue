<template>
  <div class="applications">
    <h2>Local Government ID Applications</h2>
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
            <th>Applicant Name</th>
            <th>Date of Birth</th>
            <th>Email</th>
            <th>Gender</th>
            <th>Home Address</th>
            <th>LGA of Origin</th>
            <th>Occupation</th>
            <th>Phone Number</th>
            <th>Application Reason</th>
            <th>Application Date</th>
            <th>Status</th>
            <th>Passport Photo</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="app in applications" :key="app.id">
            <td>{{ app.id }}</td>
            <td>{{ app.applicantName }}</td>
            <td>{{ app.dateOfBirth }}</td>
            <td>{{ app.emailAddress }}</td>
            <td>{{ app.gender }}</td>
            <td>{{ app.homeAddress }}</td>
            <td>{{ app.lgaOfOrigin }}</td>
            <td>{{ app.occupation || 'N/A' }}</td>
            <td>{{ app.phoneNumber }}</td>
            <td>{{ app.applicationReason || 'N/A' }}</td>
            <td>{{ formatDate(app.applicationDate) }}</td>
            <td>{{ app.status }}</td>
            <td>
              <img
                v-if="app.passportPhotoPath"
                :src="app.passportPhotoPath"
                alt="Passport Photo"
                class="passport-photo"
              />
              <span v-else>No Photo</span>
            </td>
            <td>
              <!-- Show Approve/Reject buttons only if status is pending -->
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
                class="action-btn reject-btn"
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

const applications = ref([]);
const loading = ref(false);
const error = ref('');
const price = ref(null);

// Fetch applications from backend and transform snake_case fields to camelCase
const fetchApplications = async () => {
  loading.value = true;
  error.value = '';
  try {
    const adminToken = localStorage.getItem('adminToken');
    const response = await api.get('/admin/applications/local-gov-ids', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (response.status === 200) {
      applications.value = (response.data.applications || []).map(app => ({
        id: app.id,
        applicantName: app.applicant_first_name + ' ' + app.applicant_last_name,
        dateOfBirth: app.date_of_birth,
        emailAddress: app.email_address,
        gender: app.gender,
        homeAddress: app.home_address,
        lgaOfOrigin: app.lga_of_origin,
        occupation: app.occupation,
        phoneNumber: app.phone_number,
        applicationReason: app.application_reason,
        applicationDate: app.application_date,
        status: app.status,
        passportPhotoPath: app.passport_photo_path,
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
    const response = await api.post(
      `/admin/applications/local-gov-ids/${appId}/approve`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    if (response.status === 200) {
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
    const response = await api.post(
      `/admin/applications/local-gov-ids/${appId}/reject`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
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
/* Base styles for action buttons */
.service-price {
  font-weight: bold;
  margin-bottom: 1rem;
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

/* Approve Button */
.approve-btn {
  background-color: #4CAF50;
  color: white;
}
.approve-btn:hover {
  background-color: #45a049;
  transform: translateY(-2px);
}

/* Reject Button */
.reject-btn {
  background-color: #f44336;
  color: white;
}
.reject-btn:hover {
  background-color: #e53935;
  transform: translateY(-2px);
}

/* Table styling */
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

/* Passport photo styling */
.passport-photo {
  width: 50px;
  height: auto;
  border-radius: 4px;
}
</style>
