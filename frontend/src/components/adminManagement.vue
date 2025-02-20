<template>
  <div class="admin-user-management-page">
    <h2>Admin User Management</h2>
    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="loading">Loading admin users...</div>
    <div v-else-if="adminUsers.length > 0">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Role</th>
            <th>Clusters Assigned</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="admin in adminUsers" :key="admin.id">
            <td>{{ admin.id }}</td>
            <td>{{ admin.username }}</td>
            <td>{{ admin.admin_role }}</td>
            <td>
              <span v-if="admin.assignedClusters && admin.assignedClusters.length">
                {{ getClusterNames(admin.assignedClusters).join(', ') }}
              </span>
              <span v-else>No Clusters</span>
            </td>
            <td>{{ formatDate(admin.created_at) }}</td>
            <td>
              <button @click="editAdmin(admin)">Edit Role</button>
              <button @click="openClusterAssignModal(admin)">Assign Clusters</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Admin Role Edit Modal -->
      <div v-if="editingAdmin" class="admin-edit-modal">
        <div class="modal-content">
          <span class="close-button" @click="cancelEditAdmin">×</span>
          <h3>Edit Admin Role</h3>
          <p>
            Editing Role for User: {{ editingAdmin.username }} (ID: {{ editingAdmin.id }})
          </p>
          <div class="form-group">
            <label for="edit-admin-role">New Role:</label>
            <select id="edit-admin-role" v-model="editedAdminRole" class="form-input">
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
              <!-- New option to remove admin role -->
              <option value="user">User (Remove Admin Role)</option>
            </select>
          </div>
          <div class="modal-actions">
            <button @click="saveAdminRole" class="save-button">Save Role</button>
            <button @click="cancelEditAdmin" class="cancel-button">Cancel</button>
          </div>
          <div v-if="editStatusMessage" class="message" :class="editStatusType">{{ editStatusMessage }}</div>
        </div>
      </div>

<!-- Cluster Assignment Modal -->
<div v-if="assigningAdmin" class="admin-edit-modal">
  <!-- Inside your cluster assignment modal -->
<div class="modal-content">
  <span class="close-button" @click="cancelClusterAssign">×</span>
  <h3>Assign Clusters</h3>
  <p>
    Assign clusters to admin: {{ assigningAdmin.username }} (ID: {{ assigningAdmin.id }})
  </p>
  <div class="form-group">
    <label for="cluster-select">Select Clusters:</label>
    <!-- Multi-select dropdown -->
    <select id="cluster-select" v-model="selectedClusters" multiple class="form-input">
      <option v-for="cluster in clusters" :key="cluster.id" :value="cluster.id">
        {{ cluster.cluster_name }} ({{ cluster.lga }})
      </option>
    </select>
  </div>
  <div class="modal-actions">
    <button @click="saveClusterAssignments" class="save-button">Save Assignments</button>
    
    <button v-if="selectedClusters.length" @click="removeClusterAssignments" class="cancel-button">Remove Assignment(s)</button>
    <button @click="cancelClusterAssign" class="cancel-button">Cancel</button>
  </div>
  <div v-if="clusterAssignMessage" class="message" :class="clusterAssignType">{{ clusterAssignMessage }}</div>
</div>




      </div>

      <!-- Admin Registration Form Section -->
      <div class="admin-registration-form-section">
        <h3>Register New Admin User</h3>
        <p>Use the form below to register a new admin user account.</p>
        <form @submit.prevent="registerNewAdmin" class="admin-registration-form">
          <div class="form-group">
            <label for="new-admin-username">Username:</label>
            <input type="text" id="new-admin-username" v-model="newAdminFormData.username" class="form-input" />
            <div v-if="registrationUsernameError" class="validation-error">{{ registrationUsernameError }}</div>
          </div>
          <div class="form-group">
            <label for="new-admin-password">Password:</label>
            <input type="password" id="new-admin-password" v-model="newAdminFormData.password" class="form-input" />
            <div v-if="registrationPasswordError" class="validation-error">{{ registrationPasswordError }}</div>
          </div>
          <div class="form-group">
            <label for="new-admin-confirm-password">Confirm Password:</label>
            <input type="password" id="new-admin-confirm-password" v-model="newAdminFormData.confirmPassword" class="form-input" />
            <div v-if="registrationConfirmPasswordError" class="validation-error">{{ registrationConfirmPasswordError }}</div>
          </div>
          <div class="form-group">
            <label for="new-admin-role">Admin Role:</label>
            <select id="new-admin-role" v-model="newAdminFormData.adminRole" class="form-input">
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
              <option value="clusteradmin">Cluster Admin</option>
          <option value="bursaryadmin">Bursary Admin</option>
            </select>
            <div v-if="registrationAdminRoleError" class="validation-error">{{ registrationAdminRoleError }}</div>
          </div>
          <button type="submit" class="submit-button">Register New Admin</button>
          <div v-if="registrationMessage" class="message success-message">{{ registrationMessage }}</div>
          <div v-if="registrationError" class="message error-message">{{ registrationError }}</div>
        </form>
      </div>
      
    </div>
    <div v-else>
      <p>No admin users found.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import api from "../utils/axios";
import { useRouter } from 'vue-router';

const router = useRouter();

const adminUsers = ref([]);
const clusters = ref([]); // Array for clusters data
const error = ref('');
const loading = ref(false);

// Helper: Format date
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

// Helper: Map cluster IDs to cluster names
const getClusterNames = (clusterIds) => {
  if (!clusters.value || clusters.value.length === 0) return clusterIds;
  return clusterIds.map(id => {
    const cluster = clusters.value.find(c => c.id === id);
    return cluster ? cluster.cluster_name : id;
  });
};

const editingAdmin = ref(null);
const editedAdminRole = ref('');
const editStatusMessage = ref('');
const editStatusType = ref('');

const editAdmin = (admin) => {
  editingAdmin.value = admin;
  editedAdminRole.value = admin.admin_role;
  editStatusMessage.value = '';
  editStatusType.value = '';
};

const cancelEditAdmin = () => {
  editingAdmin.value = null;
  editedAdminRole.value = '';
  editStatusMessage.value = '';
  editStatusType.value = '';
};

const saveAdminRole = async () => {
  if (!editingAdmin.value) return;
  const adminId = editingAdmin.value.id;
  const newRole = editedAdminRole.value;
  editStatusMessage.value = 'Saving role...';
  editStatusType.value = '';
  try {
    const response = await api.post(`/admin/users/${adminId}/update-role`, { newRole }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
    });
    if (response.status === 200) {
      editStatusMessage.value = `Role updated to ${newRole} for user ${editingAdmin.value.username}`;
      editStatusType.value = 'success';
      editingAdmin.value.admin_role = newRole;
      const index = adminUsers.value.findIndex(admin => admin.id === adminId);
      if (index !== -1) {
        adminUsers.value[index].admin_role = newRole;
      }
      setTimeout(() => {
        cancelEditAdmin();
      }, 1500);
    } else {
      editStatusMessage.value = response.data.message || 'Failed to update admin role.';
      editStatusType.value = 'error';
    }
  } catch (error) {
    editStatusMessage.value = 'Error saving role. Please try again.';
    editStatusType.value = 'error';
    console.error('Error saving admin role:', error);
  }
};

const newAdminFormData = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  adminRole: 'admin', // Default role
});

const registrationMessage = ref('');
const registrationError = ref('');
const registrationUsernameError = ref('');
const registrationPasswordError = ref('');
const registrationConfirmPasswordError = ref('');
const registrationAdminRoleError = ref('');

// Register a new admin
const registerNewAdmin = async () => {
  registrationMessage.value = '';
  registrationError.value = '';
  registrationUsernameError.value = '';
  registrationPasswordError.value = '';
  registrationConfirmPasswordError.value = '';
  registrationAdminRoleError.value = '';

  if (newAdminFormData.password !== newAdminFormData.confirmPassword) {
    registrationConfirmPasswordError.value = "Passwords do not match.";
    return;
  }

  try {
    const response = await api.post('/admin/register', newAdminFormData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
    });
    if (response.status === 201) {
      registrationMessage.value = response.data.message;
      Object.keys(newAdminFormData).forEach(key => newAdminFormData[key] = '');
    } else if (response.status === 409) {
      registrationError.value = response.data.message || 'Registration failed: Username already exists.';
      registrationUsernameError.value = 'Username already taken.';
    } else if (response.status === 422) {
      const errorData = response.data;
      if (errorData.errors) {
        if (errorData.errors.username) registrationUsernameError.value = errorData.errors.username.msg;
        if (errorData.errors.password) registrationPasswordError.value = errorData.errors.password.msg;
        if (errorData.errors.adminRole) registrationAdminRoleError.value = errorData.errors.adminRole.msg;
        registrationError.value = errorData.message || 'Validation failed. Please check the errors below.';
      } else {
        registrationError.value = errorData.message || 'Admin registration failed.';
      }
    }
  } catch (err) {
    registrationError.value = 'Error during admin registration. Network issue?';
    console.error('Admin registration error:', err);
  }
};

// Cluster assignment for admins
const assigningAdmin = ref(null);
const selectedClusters = ref([]); // Array of cluster IDs to assign
const clusterAssignMessage = ref('');
const clusterAssignType = ref('');

const openClusterAssignModal = async (admin) => {
  assigningAdmin.value = admin;
  // Pre-fill with already assigned clusters if available
  selectedClusters.value = admin.assignedClusters ? [...admin.assignedClusters] : [];
  if (!clusters.value.length) {
    await fetchClusters();
  }
};

const cancelClusterAssign = () => {
  assigningAdmin.value = null;
  selectedClusters.value = [];
  clusterAssignMessage.value = '';
  clusterAssignType.value = '';
};

const saveClusterAssignments = async () => {
  if (!assigningAdmin.value) return;
  const adminId = assigningAdmin.value.id;
  try {
    const adminToken = localStorage.getItem('adminToken');
    const payload = {
      admin_id: adminId,
      cluster_ids: selectedClusters.value,
    };
    const response = await api.put('/admin/clusters/assign', payload, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (response.status === 200) {
      clusterAssignMessage.value = response.data.message;
      clusterAssignType.value = 'success';
      assigningAdmin.value.assignedClusters = [...selectedClusters.value];
      const index = adminUsers.value.findIndex(admin => admin.id === adminId);
      if (index !== -1) {
        adminUsers.value[index].assignedClusters = [...selectedClusters.value];
      }
      setTimeout(() => {
        cancelClusterAssign();
      }, 1500);
    } else {
      clusterAssignMessage.value = response.data.message || 'Failed to assign clusters';
      clusterAssignType.value = 'error';
    }
  } catch (error) {
    if (error.response && error.response.status === 409) {
      clusterAssignMessage.value = error.response.data.message + ' (Conflicts: ' + error.response.data.conflicts.join(', ') + ')';
    } else {
      clusterAssignMessage.value = 'Error assigning clusters';
    }
    clusterAssignType.value = 'error';
    console.error('Error assigning clusters:', error);
  }
};

const removeClusterAssignments = async () => {
  try {
    const adminToken = localStorage.getItem('adminToken');
    // For each selected cluster, call the delete endpoint
    for (const clusterId of selectedClusters.value) {
      await api.delete(`/admin/clusters/${clusterId}/assignment`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    }
    clusterAssignMessage.value = 'Selected cluster assignments removed successfully.';
    clusterAssignType.value = 'success';

    // Update the admin's local state so that removed clusters no longer appear.
    const adminId = assigningAdmin.value.id;
    const adminIndex = adminUsers.value.findIndex(admin => admin.id === adminId);
    if (adminIndex !== -1) {
      // Remove the deleted cluster IDs from assignedClusters
      adminUsers.value[adminIndex].assignedClusters =
        adminUsers.value[adminIndex].assignedClusters.filter(
          id => !selectedClusters.value.includes(id)
        );
    }
    // Clear the selection
    selectedClusters.value = [];
  } catch (error) {
    clusterAssignMessage.value = 'Error removing cluster assignments';
    clusterAssignType.value = 'error';
    console.error('Error removing cluster assignments:', error);
  }
};



const fetchClusters = async () => {
  try {
    const adminToken = localStorage.getItem('adminToken');
    const response = await api.get('/admin/clusters/list', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (response.status === 200) {
      clusters.value = response.data.clusters;
    } else {
      console.error('Failed to fetch clusters:', response.data.message);
    }
  } catch (error) {
    console.error('Error fetching clusters:', error);
  }
};

onMounted(async () => {
  loading.value = true;
  error.value = '';
  adminUsers.value = [];
  const adminToken = localStorage.getItem('adminToken');
  if (!adminToken) {
    error.value = 'Admin token not found. Please login as admin.';
    loading.value = false;
    return;
  }
  try {
    const response = await api.get('/admin/users/list', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (response.status === 200) {
      adminUsers.value = response.data.adminUsers;
    } else {
      error.value = response.data.message || 'Failed to fetch admin users.';
    }
  } catch (err) {
    error.value = 'Error fetching admin users. Please check your connection and admin authentication.';
    console.error('Error fetching admin users:', err);
  } finally {
    loading.value = false;
  }
});

</script>

<style scoped>
.admin-user-management-page {
  max-width: 800px;
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
  padding: 6px 10px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
}

.error-message {
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
}

.admin-edit-modal {
  position: fixed;
  z-index: 2;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #fff;
  margin: 10% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  max-width: 500px;
  border-radius: 0.75rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: relative;
}

.close-button {
  color: #aaa;
  position: absolute;
  top: 8px;
  right: 16px;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

.close-button:hover,
.close-button:focus {
  color: black;
  text-decoration: none;
}

.modal-actions {
  margin-top: 20px;
  text-align: center;
}

.modal-actions button {
  margin: 0 10px;
}

.save-button {
  background-color: #28a745;
  color: white;
}

.cancel-button {
  background-color: #ccc;
  color: #333;
}

.admin-registration-form-section {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #fff;
}

.admin-registration-form-section h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
}

.admin-registration-form-section .form-group {
  margin-bottom: 15px;
}

.admin-registration-form-section label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.admin-registration-form-section .form-input,
.admin-registration-form-section select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 1rem;
}

.admin-registration-form-section .submit-button {
  background-color: #28a745;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.admin-registration-form-section .submit-button:hover {
  background-color: #005f52;
}

.validation-error {
  color: #721c24;
  font-size: 0.9rem;
  margin-top: 4px;
  display: block;
}

.message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
}
</style>
