<template>
  <div class="applications">
    <h2>Club Association Applications</h2>
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
            <th>Club Association Name</th>
            <th>Nature of Club Association</th>
            <th>Registration Address</th>
            <th>LGA of Operation</th>
            <th>Contact Person Name</th>
            <th>Contact Person Phone</th>
            <th>Contact Person Email</th>
            <th>Registration Date</th>
            <th>Application Date</th>
            <th>Status</th>
            <th>Constitution Document</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="app in applications" :key="app.id">
            <td>{{ app.id }}</td>
            <td>{{ app.clubAssociationName }}</td>
            <td>{{ app.natureOfClubAssociation }}</td>
            <td>{{ app.registrationAddress }}</td>
            <td>{{ app.lgaOfOperation }}</td>
            <td>{{ app.contactPersonName }}</td>
            <td>{{ app.contactPersonPhone }}</td>
            <td>{{ app.contactPersonEmail }}</td>
            <td>{{ formatDate(app.registrationDate) }}</td>
            <td>{{ formatDate(app.applicationDate) }}</td>
            <td>{{ app.status }}</td>
            <td>
              <a
                v-if="app.constitutionDocumentPath"
                :href="app.constitutionDocumentPath"
                target="_blank"
                class="constitution-document"
              >
                View Document
              </a>
              <span v-else>No Document</span>
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

// Fetch Club Association Applications from the backend and transform data
const fetchApplications = async () => {
  loading.value = true;
  error.value = '';
  try {
    const adminToken = localStorage.getItem('adminToken');
    const response = await api.get('/admin/applications/club-associations', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (response.status === 200) {
      applications.value = (response.data.applications || []).map(app => ({
        id: app.id,
        clubAssociationName: app.club_association_name,
        natureOfClubAssociation: app.nature_of_club_association,
        registrationAddress: app.registration_address,
        lgaOfOperation: app.lga_of_operation,
        contactPersonName: app.contact_person_name,
        contactPersonPhone: app.contact_person_phone,
        contactPersonEmail: app.contact_person_email,
        registrationDate: app.registration_date,
        applicationDate: app.application_date,
        status: app.status,
        constitutionDocumentPath: app.constitution_document_path,
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
      `/admin/applications/club-associations/${appId}/approve`,
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
      `/admin/applications/club-associations/${appId}/reject`,
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

/* Action button styles */
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

/* Constitution document link styling */
.constitution-document {
  color: #007bff;
  text-decoration: none;
}

.constitution-document:hover {
  text-decoration: underline;
}
.service-price {
  font-weight: bold;
  margin-bottom: 1rem;
}

</style>
