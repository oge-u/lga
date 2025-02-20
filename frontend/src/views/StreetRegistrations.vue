<template>
  <div class="applications">
    <h2>Street Registrations</h2>
    <div class="service-price" v-if="price !== null">
      Service Price: {{ price | currency }}
    </div>
    <div v-if="loading">Loading registrations...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Street Name</th>
            <th>LGA Location</th>
            <th>Community Name</th>
            <th>Number of Houses</th>
            <th>Street Length (Meters)</th>
            <th>Street Lighting Status</th>
            <th>Waste Disposal System Status</th>
            <th>Registration Purpose</th>
            <th>Application Date</th>
            <th>Status</th>
            <th>Survey Map</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="app in applications" :key="app.id">
            <td>{{ app.id }}</td>
            <td>{{ app.streetName }}</td>
            <td>{{ app.lgaLocation }}</td>
            <td>{{ app.communityName }}</td>
            <td>{{ app.numberOfHouses }}</td>
            <td>{{ app.streetLengthMeters }}</td>
            <td>{{ app.streetLightingStatus }}</td>
            <td>{{ app.wasteDisposalSystemStatus }}</td>
            <td>{{ app.registrationPurpose }}</td>
            <td>{{ formatDate(app.applicationDate) }}</td>
            <td>{{ app.status }}</td>
            <td>
              <a
                v-if="app.surveyMapPath"
                :href="app.surveyMapPath"
                target="_blank"
                class="survey-map-link"
              >
                View Map
              </a>
              <span v-else>No Map</span>
            </td>
            <td>
              <!-- Show Approve/Reject buttons if status is pending -->
              <button
                v-if="app.status && app.status.toLowerCase() === 'pending'"
                @click="approveRegistration(app.id)"
                class="action-btn approve-btn"
              >
                Approve
              </button>
              <button
                v-if="app.status && app.status.toLowerCase() === 'pending'"
                @click="rejectRegistration(app.id)"
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

// Fetch street registrations from the backend and transform data
const fetchRegistrations = async () => {
  loading.value = true;
  error.value = '';
  try {
    const adminToken = localStorage.getItem('adminToken');
    const response = await api.get('/admin/applications/street-registrations', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (response.status === 200) {
      applications.value = (response.data.applications || []).map(app => ({
        id: app.id,
        streetName: app.street_name,
        lgaLocation: app.lga_location,
        communityName: app.community_name,
        numberOfHouses: app.number_of_houses,
        streetLengthMeters: app.street_length_meters,
        streetLightingStatus: app.street_lighting_status,
        wasteDisposalSystemStatus: app.waste_disposal_system_status,
        registrationPurpose: app.registration_purpose,
        applicationDate: app.application_date,
        status: app.status,
        surveyMapPath: app.survey_map_path,
      }));
    } else {
      error.value = response.data.message || 'Failed to fetch registrations.';
    }
  } catch (err) {
    error.value = 'Error fetching registrations. Please try again later.';
    console.error('Error fetching registrations:', err);
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

const approveRegistration = async (id) => {
  try {
    const adminToken = localStorage.getItem('adminToken');
    const response = await api.post(
      `/admin/applications/street-registrations/${id}/approve`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    if (response.status === 200) {
      const idx = applications.value.findIndex(app => app.id === id);
      if (idx !== -1) {
        applications.value[idx].status = 'Approved';
      }
      alert('Registration approved successfully.');
    } else {
      alert('Failed to approve registration: ' + (response.data.message || 'Unknown error'));
    }
  } catch (err) {
    console.error('Error approving registration:', err);
    alert('Error approving registration.');
  }
};

const rejectRegistration = async (id) => {
  try {
    const adminToken = localStorage.getItem('adminToken');
    const response = await api.post(
      `/admin/applications/street-registrations/${id}/reject`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    if (response.status === 200) {
      const idx = applications.value.findIndex(app => app.id === id);
      if (idx !== -1) {
        applications.value[idx].status = 'Rejected';
      }
      alert('Registration rejected successfully.');
    } else {
      alert('Failed to reject registration: ' + (response.data.message || 'Unknown error'));
    }
  } catch (err) {
    console.error('Error rejecting registration:', err);
    alert('Error rejecting registration.');
  }
};

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

onMounted(() => {
  fetchRegistrations();
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

.survey-map-link {
  color: #007bff;
  text-decoration: none;
}

.survey-map-link:hover {
  text-decoration: underline;
}
.service-price {
  font-weight: bold;
  margin-bottom: 1rem;
}

</style>
