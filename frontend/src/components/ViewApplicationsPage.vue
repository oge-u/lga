<template> 
  <div class="view-applications-page">
    <h2>My Applications</h2>
    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="loading">Loading applications...</div>
    <div v-else-if="applications.length > 0">
      <table>
        <thead>
          <tr>
            <th>Application Type</th>
            <th>Application Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="app in applications" :key="app.id">
            <td>{{ app.type }}</td>
            <td>{{ formatDate(app.application_date) }}</td>
            <td>{{ app.status }}</td>
            <td>
              <button @click="viewDetails(app)">View Details</button>
              <!-- Download button only if status is "Approved" -->
              <button 
                v-if="app.status === 'Approved'" 
                @click="downloadApplication(app)" 
                class="download-button">
                Download
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <p>No applications found.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../utils/axios';
import { useRouter } from 'vue-router'; 

const applications = ref([]);
const error = ref('');
const loading = ref(false);
const router = useRouter();

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

const viewDetails = (application) => {
  const routes = {
    'Death Certificate': `/application/death-certificate/details/${application.id}`,
    'Local Government ID': `/application/lga-cert-apply/details/${application.id}`,
    'Club/Association Registration': `/application/club-register/details/${application.id}`,
    'Waste Management Fees Payment': `/application/pay-waste-fees/details/${application.id}`,
    'Street Registration': `/application/street-register/details/${application.id}`,
    'Business Registration': `/application/business-register/details/${application.id}`
  };

  if (routes[application.type]) {
    router.push(routes[application.type]);
  } else {
    alert(`Details view not implemented for ${application.type}`);
  }
};

const downloadApplication = async (application) => {
  try {
   const typeMappings = {
  "Local Government ID": "local-gov-id",
  "Death Certificate": "death-cert",
  "Business Registration": "business-reg",
  "Waste Management Fees Payment": "waste-fees",
  "Street Registration": "street-reg",
  "Club/Association Registration": "club-register",
};

const formattedType = typeMappings[application.type] || application.type;
const response = await api.get(`/applications/generate-pdf/${formattedType}/${application.id}`, {
  responseType: 'blob',
});


    if (response.status !== 200 || !response.data) {
      throw new Error('Failed to download the file.');
    }

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${application.type}-Application-${application.id}.pdf`);
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Download error:', err);
    alert('Failed to download the file. Please try again.');
  }
};


onMounted(async () => {
  loading.value = true;
  error.value = '';
  applications.value = [];
  try {
    const loggedInEmail = localStorage.getItem('userEmail');
    if (!loggedInEmail) {
      error.value = 'User email not found. Please login again.';
      loading.value = false;
      return;
    }

    const response = await api.get(`/applications/view-all?emailAddress=${loggedInEmail}`);
    if (response.status === 200) {
      applications.value = response.data.applications;
    } else {
      error.value = response.data.message || 'Failed to fetch applications.';
    }
  } catch (err) {
    error.value = 'Error fetching applications. Network issue?';
    console.error('Error fetching applications:', err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.view-applications-page {
  max-width: 900px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f0f0f0;
  font-weight: bold;
}

tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

button {
  padding: 8px 12px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
}

.download-button {
  background-color: #28a745;
  color: white;
  margin-left: 8px;
}

.download-button:hover {
  background-color: #218838;
}

.error-message {
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
}
</style>
