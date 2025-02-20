<template>
  <div class="dashboard-page">
    <aside class="dashboard-sidebar">
      <!-- Sidebar -->
      <div class="sidebar-header">
        <div class="logo">COQS ADMIN</div> <!-- Updated Logo Text to COQS ADMIN -->
        <button class="menu-toggle-button">
          ☰
        </button>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/admin/dashboard" class="nav-item active">
          <span class="nav-icon"> 🏠 </span>
          Dashboard
        </router-link>

        <router-link to="/admin/user-management" class="nav-item">
          <span class="nav-icon"> 👤 </span>
          Admin (Admin) Management
        </router-link>

          <router-link to="/admin/user-management" class="nav-item">
          <span class="nav-icon"> 👤 </span>
          Admin User Management
        </router-link>

        <div class="nav-item has-dropdown" @click="toggleDropdown('applicationManagement')">
          <span class="nav-icon"> 📄 </span>
          Application Management
          <span class="dropdown-arrow" :class="{ open: isDropdownOpen('applicationManagement') }"> ▼ </span>
        </div>
        <div class="dropdown" v-if="isDropdownOpen('applicationManagement')">
          <router-link to="/admin/applications/death-certificates" class="dropdown-item">
            - Death Certificates
          </router-link>
          <router-link to="/admin/applications/local-gov-ids" class="dropdown-item">
            - Local Government IDs
          </router-link>
          <router-link to="/admin/applications/club-registrations" class="dropdown-item">
            - Club Registrations
          </router-link>
          <router-link to="/admin/applications/waste-fees-payments" class="dropdown-item">
            - Waste Fees Payments
          </router-link>
          <router-link to="/admin/applications/street-registrations" class="dropdown-item">
            - Street Registrations
          </router-link>
          <router-link to="/admin/applications/business-registrations" class="dropdown-item">
            - Business Registrations
          </router-link>
          <router-link to="/admin/view-all-applications" class="dropdown-item">
            - View All Applications
          </router-link>
        </div>

         <router-link to="/admin/revenue" class="nav-item">  <!-- New: Revenue Generation -->
    <span class="nav-icon"> 📈 </span> <!-- Placeholder icon for Revenue -->
    Revenue Generation
  </router-link>

  <router-link to="/admin/clusters" class="nav-item">  <!-- New: Clusters Management -->
    <span class="nav-icon"> 📍 </span> <!-- Placeholder icon for Clusters -->
    Clusters Management
  </router-link>

  <router-link to="/service-prices" class="nav-item"> 
    <span class="nav-icon"> 📍 </span> 
    Services Management
  </router-link>

        <router-link to="/admin/settings" class="nav-item">
          <span class="nav-icon"> ⚙️ </span>
          Settings
        </router-link>
      </nav>
      <div class="sidebar-footer">
        © 2025 Osun State Government. <br> Admin Panel.
      </div>
    </aside>
    <main class="dashboard-main-content">
      <header class="dashboard-header">
        <div class="admin-profile">
          <span class="admin-name">Admin Dashboard</span>  <!-- Updated Header Text -->
        </div>
      </header>
      <div class="content-area">
        <h2>All Applications</h2>
        <div v-if="error" class="error-message">{{ error }}</div>
        <div v-if="loading">Loading applications...</div>
        <div v-else-if="applications.length > 0">
          <table>
            <thead>
              <tr>
                <th>Application ID</th>
                <th>Application Type</th>
                <th>Applicant Email</th>
                <th>Application Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="app in applications" :key="app.id">
                <td>{{ app.id }}</td>
                <td>{{ app.type }}</td>
                <td>{{ getApplicantEmail(app) }}</td>
                <td>{{ formatDate(app.application_date) }}</td>
                <td>{{ app.status }}</td>
                <td>
                  <button @click="viewAdminDetails(app)">View Details</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else>
          <p>No applications found.</p>
        </div>
        </div>

         <!-- NEW SECTION - Admin User Management Section -->
      <div class="content-area admin-user-management-section">
        <h2>Admin User Management</h2>
        <p>Manage admin users, assign roles, and create new admin accounts here.</p>

        <!-- Placeholder for Admin User List Table (will be added later) -->
        <div class="admin-user-list">
          <h3>Admin User List</h3>
          <p>Admin user list will be displayed here in a table.</p>
          <!-- Table for Admin User List will be added in subsequent steps -->
        </div>

        <!-- Placeholder for Admin Registration Form (will be added later) -->
        <div class="admin-registration-form-section">
          <h3>Register New Admin User</h3>
          <p>Form to register new admin users will be added here.</p>
          <!-- Admin Registration Form will be added in subsequent steps -->
        </div>
        </div>

              <!-- Revenue Generation Section - UPDATED TEMPLATE - TABLE LAYOUT -->
      <div class="content-area admin-revenue-section">
        <h2>Revenue Generation Summary</h2>  <!-- Updated Section Heading -->
        <p>View revenue generated by each service in a tabular format.</p>  <!-- Updated Description -->

        <div v-if="serviceError" class="error-message">{{ serviceError }}</div>
        <div v-if="serviceLoading">Loading revenue data...</div>
        <div v-else-if="revenueData" class="revenue-summary-table">  <!-- NEW - Revenue Summary Table Container -->
          <h3>Revenue Summary</h3>
          <table>
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Revenue (NGN)</th>
              </tr>
            </thead>
            <tbody>
              <tr> <!-- Row for Waste Management Fees -->
                <td>Waste Management Fees</td>
                <td>{{ formatCurrency(revenueData.wasteManagementFees) }}</td>
              </tr>
              <tr> <!-- Row for Death Certificates -->
                <td>Death Certificates</td>
                <td>{{ formatCurrency(revenueData.deathCertificate) }}</td>
              </tr>
              <!-- NEW - Rows for other services -->
              <tr>
                <td>Local Government IDs</td>
                <td>{{ formatCurrency(revenueData.localGovId) }}</td>
              </tr>
              <tr>
                <td>Club/Association Registrations</td>
                <td>{{ formatCurrency(revenueData.clubAssociationRegistration) }}</td>
              </tr>
              <tr>
                <td>Street Registrations</td>
                <td>{{ formatCurrency(revenueData.streetRegistration) }}</td>
              </tr>
              <tr>
                <td>Business Registrations</td>
                <td>{{ formatCurrency(revenueData.businessRegistration) }}</td>
              </tr>
            </tbody>
            <tfoot>  <!-- Footer row for total revenue -->
              <tr>
                <th>Total Revenue</th>
                <th>{{ formatCurrency(totalRevenue) }}</th>
              </tr>
            </tfoot>
          </table>
        </div>
        <div v-else-if="!serviceLoading">
          <p>No revenue data found.</p>
        </div>

       
      
        
        </div>
       

      <!-- Clusters Section - UPDATED TEMPLATE - CLUSTER LIST TABLE REMAINS THE SAME -->
      <div class="content-area admin-clusters-section">
        <h2>Clusters (Local Government Areas) Management</h2>
        <p>Manage Local Government Area clusters here.</p>

        <div class="cluster-management">
          <h3>Cluster List</h3>
          <div v-if="clusterError" class="error-message">{{ clusterError }}</div>
          <div v-if="clusterLoading">Loading clusters...</div>
          <div v-else-if="clustersList.length > 0">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cluster Name</th>
                  <th>LGA</th>
                  <th>Description</th>
                  <th>Assigned Admin</th>  <!-- NEW - Column for Assigned Admin -->
                  <th>Actions</th>
                </tr>
              </thead>
                           <tbody>
                <tr v-for="cluster in clustersList" :key="cluster.id">
                  <td>{{ cluster.id }}</td>
                  <td class="cluster-name-cell">  <!-- Added class "cluster-name-cell" for styling -->
                    <span v-if="editingClusterId !== cluster.id">  <!- Corrected v-if condition to use editingClusterId -->
                      {{ cluster.cluster_name }}
                    </span>
                    <input
                      v-else
                      type="text"
                      class="edit-cluster-input"
                      v-model="cluster.cluster_name"  
                      @keyup.enter="saveCluster(cluster)"
                      @blur="cancelEditCluster(cluster)"
                    />
                  </td>
                  <td class="cluster-lga-cell">  <!-- Added class "cluster-lga-cell" for styling -->
                    <span v-if="editingClusterId !== cluster.id"> <!- Corrected v-if condition to use editingClusterId -->
                      {{ cluster.lga }}
                    </span>
                    <input
                      v-else
                      type="text"
                      class="edit-cluster-input"
                      v-model="cluster.lga"       
                      @keyup.enter="saveCluster(cluster)"
                      @blur="cancelEditCluster(cluster)"
                    />
                  </td>
                  <td class="cluster-description-cell">  <!-- Added class "cluster-description-cell" for styling -->
                    <span v-if="editingClusterId !== cluster.id" class="description-display"> <!- Corrected v-if condition to use editingClusterId -->
                      {{ cluster.description }}
                    </span>
                    <textarea
                      v-else
                      class="edit-cluster-textarea"
                      v-model="cluster.description"  
                      @blur="cancelEditCluster(cluster)"
                    ></textarea>
                  </td>
                  <td>{{ cluster.adminUsername }}</td>
                  <td>
                    <button 
                      v-if="editingClusterId !== cluster.id"  
                      @click="editCluster(cluster)"
                    >Edit</button> <!- Corrected Button Text to "Edit" -->
                    <template v-else>
                      <button @click="saveCluster(cluster)" class="save-button">Save</button>
                      <button @click="cancelEditCluster(cluster)" class="cancel-button">Cancel</button>
                    </template>
                  </td>
                </tr>
              </tbody>

            </table>
          </div>
          <div v-else-if="!clusterLoading">
            <p>No clusters found.</p>
          </div>
        </div>

        <!-- Admin Registration Form Section - UPDATED TEMPLATE - ADDED "Assigned Admin" Dropdown -->
      <div class="content-area admin-registration-form-section">  <!-- Renamed class for clarity -->
        <h3>Register New Cluster</h3>
        <p>Use the form below to register a new LGA cluster.</p>

        <form @submit.prevent="registerNewCluster" class="admin-registration-form">  <!-- Renamed class for clarity -->
          <div class="form-group">
            <label for="new-cluster-name">Cluster Name:</label>
            <input type="text" id="new-cluster-name" v-model="newClusterFormData.clusterName" class="form-input" />
            <div v-if="clusterNameError" class="validation-error">{{ clusterNameError }}</div>
          </div>
          <div class="form-group">
            <label for="lga">Local Government Area (LGA):</label>
            <input type="text" id="lga" v-model="newClusterFormData.lga" class="form-input" />
            <div v-if="lgaError" class="validation-error">{{ lgaError }}</div>
          </div>
          <div class="form-group">
            <label for="description">Description (Optional):</label>
            <textarea id="description" v-model="newClusterFormData.description" class="form-input"></textarea>
          </div>

          <!-- NEW - Assigned Admin Dropdown -->
          <div class="form-group">
            <label for="assigned-admin">Assign Admin (Optional):</label>
            <select id="assigned-admin" v-model="newClusterFormData.adminId" class="form-input"> <!- NEW - v-model to newClusterFormData.adminId -->
              <option value="">No Admin Assigned</option>  <!- Option for no admin assigned -->
              <option v-for="admin in availableAdmins" :key="admin.id" :value="admin.id">
                {{ admin.username }} ({{ admin.adminRole }})
              </option>
            </select>
            <div v-if="registrationAdminRoleError" class="validation-error">{{ registrationAdminRoleError }}</div> <!---- Reusing registrationAdminRoleError for simplicity -->
          </div>


          <button type="submit" class="submit-button">Register Cluster</button>
          <div v-if="registrationMessage" class="message success-message">{{ registrationMessage }}</div>
          <div v-if="registrationError" class="message error-message">{{ registrationError }}</div>
        </form>
    </div>
    </div>


<!-- Admin User Management Section -->
      <div class="content-area admin-user-management-section">
        <h2>Admin User Management</h2>
        <p>Manage admin users, assign roles, and create new admin accounts here.</p>

        <!-- Admin User List Table - UPDATED TEMPLATE - DISPLAY USER LIST -->
        <div class="admin-user-list">
          <h3>Admin User List</h3>
          <div v-if="userError" class="error-message">{{ userError }}</div> <!- Error message for user list -->
          <div v-if="userLoading">Loading admin users...</div>  <!- Loading message for user list -->
          <div v-else-if="userList && userList.length > 0">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email Address</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in userList" :key="user.id">
                  <td>{{ user.id }}</td>
                  <td>{{ user.first_name }}</td>
<td>{{ user.last_name }}</td>
<td>{{ user.email_address }}</td>
<td>{{ formatDate(user.created_at) }}</td>
                  <td>
                    
                    <button @click="deleteUser(user)" class="delete-button">Delete User</button> <!- Placeholder Delete User Button -->
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else-if="!userLoading">
            <p>No users found.</p>
          </div>
        </div>

        
      </div>

      
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import api from "../utils/axios";
import { useRouter } from 'vue-router';


// NEW Reactive Data for User List Table
const userList = ref([]);
const userError = ref('');
const userLoading = ref(false);

// Applications Data
const applications = ref([]);
const error = ref('');
const loading = ref(false);
const router = useRouter();





const registrationMessage = ref('');
const registrationError = ref('');
const registrationUsernameError = ref(''); // Keeping these refs, might be reused or removed later
const registrationPasswordError = ref('');
const registrationConfirmPasswordError = ref('');
const registrationAdminRoleError = ref('');
const clusterNameError = ref(''); // NEW - Ref for cluster name validation error
const lgaError = ref('');   
const availableAdmins = ref([]);
const editingClusterId = ref(null);
const editStatusMessage = ref('');
const editStatusType = ref('');


// NEW Function to Cancel Cluster Edit Mode
const cancelEditCluster = () => {
  editingClusterId.value = null;
};

// NEW Reactive Data for Cluster Registration Form
const newClusterFormData = reactive({
  clusterName: '',
  lga: '',
  description: '',
});

const activeDropdown = ref(null);
const toggleDropdown = (dropdownName) => {
  activeDropdown.value = activeDropdown.value === dropdownName ? null : dropdownName;
};
const isDropdownOpen = (dropdownName) => activeDropdown.value === dropdownName;

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

const viewAdminDetails = (application) => {
  alert(`Admin View Details for ${application.type} application ID: ${application.id}`);
};

const getApplicantEmail = (application) => {
  if (application.type === 'Death Certificate') return application.applicant_email_address;
  if (application.type === 'Local Government ID') return application.applicant_email_address;
  if (application.type === 'Club/Association Registration') return application.contact_person_email;
  if (application.type === 'Waste Management Fees Payment') return application.applicantEmailAddress;
  if (application.type === 'Street Registration') return application.applicantEmailAddress;
  if (application.type === 'Business Registration') return application.contact_email_address;
  return 'N/A';
};

// Service Price Management Data
const editingServiceId = ref(null);
const servicesList = ref([]);
const serviceError = ref('');
const serviceLoading = ref(false);
const originalPrices = ref({});

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
};

const editServicePrice = (service) => {
  editingServiceId.value = service.id;
};

const cancelEditServicePrice = (service) => {
  service.service_price = originalPrices.value[service.id];
  editingServiceId.value = null;
};




const saveServicePrice = async (service) => {
  if (!editingServiceId.value) return;
  const serviceId = editingServiceId.value;
  const newPrice = service.service_price;
  serviceError.value = '';
  editStatusMessage.value = 'Saving price...';
  editStatusType.value = '';
  try {
    const response = await api.post(
      `/admin/services/${serviceId}/update-price`,
      { servicePrice: newPrice },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      }
    );
    if (response.status === 200) {
      editStatusMessage.value = `Price updated successfully for ${service.service_name}`;
      editStatusType.value = 'success';
      originalPrices.value[service.id] = newPrice;
      editingServiceId.value = null;
    } else if (response.status === 422) {
      const errorData = response.data;
      serviceError.value = errorData.message || 'Invalid price format. Please check.';
      editStatusMessage.value = errorData.message || 'Invalid price format. Please check.';
      editStatusType.value = 'error';
    } else {
      serviceError.value = response.data.message || 'Failed to update service price.';
      editStatusMessage.value = response.data.message || 'Failed to update service price.';
      editStatusType.value = 'error';
    }
  } catch (error) {
    serviceError.value = 'Error saving service price. Network issue?';
    editStatusMessage.value = 'Error saving service price. Network issue?';
    editStatusType.value = 'error';
    console.error('Error saving service price:', error);
  }
};

const fetchServicePrices = async () => {
  serviceLoading.value = true;
  serviceError.value = '';
  servicesList.value = [];
  originalPrices.value = {};

  const adminToken = localStorage.getItem('adminToken');
  if (!adminToken) {
    serviceError.value = 'Admin token not found. Please login as admin.';
    serviceLoading.value = false;
    return;
  }

  try {
    const response = await api.get('/admin/services/list', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (response.status === 200) {
      servicesList.value = response.data.services;
      servicesList.value.forEach(service => {
        originalPrices.value[service.id] = service.service_price;
      });
    } else {
      serviceError.value = response.data.message || 'Failed to fetch service prices.';
    }
  } catch (err) {
    serviceError.value = 'Error fetching service prices. Please check your connection and admin authentication.';
    console.error('Error fetching service prices:', err);
  } finally {
    serviceLoading.value = false;
  }
};

// Revenue Data (moved to top level so they're accessible in fetchRevenueData and template)
const revenueData = ref(null); // Stores revenue data from the backend
const revenueLoading = ref(false); // Loading state for revenue data
const revenueError = ref('');      // Error messages for revenue data

// Computed Property to Calculate Total Revenue
const totalRevenue = computed(() => {
  if (!revenueData.value) return 0;
  let total = 0;
  total += revenueData.value.wasteManagementFees || 0;
  total += revenueData.value.deathCertificate || 0;
  // Add additional services as needed...
  return total;
});

// Function to Fetch Revenue Data
const fetchRevenueData = async () => {
  revenueLoading.value = true;
  revenueError.value = '';
  revenueData.value = null;

  const adminToken = localStorage.getItem('adminToken');
  if (!adminToken) {
    revenueError.value = 'Admin token not found. Please login as admin.';
    revenueLoading.value = false;
    return;
  }

  try {
    const response = await api.get('/admin/revenue-data', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (response.status === 200) {
      revenueData.value = response.data.revenueData;
    } else {
      revenueError.value = response.data.message || 'Failed to fetch revenue data.';
    }
  } catch (err) {
    revenueError.value = 'Error fetching revenue data. Please check your connection and admin authentication.';
    console.error('Error fetching revenue data:', err);
  } finally {
    revenueLoading.value = false;
  }
};



// NEW Reactive Data for Clusters Management Section
const clustersList = ref([]);
const clusterError = ref('');
const clusterLoading = ref(false);

// NEW Function to Fetch Cluster List from Backend API
const fetchClusters = async () => {
  clusterLoading.value = true;
  clusterError.value = '';
  clustersList.value = [];
  const adminToken = localStorage.getItem('adminToken'); // Get admin JWT token

  if (!adminToken) {
    clusterError.value = 'Admin token not found. Please login as admin.';
    clusterLoading.value = false;
    return;
  }

  try {
    // Make API call to fetch cluster list (admin endpoint), include JWT in header
    const response = await api.get('/admin/clusters/list', {
      headers: {
        Authorization: `Bearer ${adminToken}`, // Include JWT token in header
      },
    });
    if (response.status === 200) {
      clustersList.value = response.data.clusters;
    } else {
      clusterError.value = response.data.message || 'Failed to fetch cluster list.';
    }
  } catch (err) {
    clusterError.value = 'Error fetching cluster list. Please check your connection and admin authentication.';
    console.error('Error fetching cluster list:', err);
  } finally {
    clusterLoading.value = false;
  }
};

// Updated Method to Handle Cluster Registration Form Submission (API Call)
const registerNewCluster = async () => { // Updated - API call implementation
  registrationMessage.value = '';
  registrationError.value = '';
  registrationUsernameError.value = ''; // Clear registration error refs
  registrationPasswordError.value = '';
  registrationConfirmPasswordError.value = '';
  registrationAdminRoleError.value = '';
  clusterNameError.value = '';         // Clear cluster-specific error refs
  lgaError.value = '';

  // Basic frontend validation (optional - backend validation is more important)
  if (!newClusterFormData.clusterName) {
    clusterNameError.value = 'Cluster Name is required.';
    return;
  }
  if (!newClusterFormData.lga) {
    lgaError.value = 'LGA Location is required.';
    return;
  }


  try {
    // ** Actual API call to register new cluster on backend **
    const response = await api.post('/admin/clusters/create', newClusterFormData, { // API call to create cluster
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`, // Include JWT token in header
      },
    });
    if (response.status === 201) {
      registrationMessage.value = response.data.message; // Success message
      // Reset registration form
      Object.keys(newClusterFormData).forEach(key => newClusterFormData[key] = '');
      fetchClusters(); // Refresh cluster list table after successful registration
    } else if (response.status === 409) {
      registrationError.value = response.data.message || 'Cluster registration failed: Cluster name already exists.'; // Username exists error
      registrationUsernameError.value = 'Cluster name already taken.'; // Specific error for username field (reusing usernameError ref for clusterNameError for simplicity in this example)
    }
     else if (response.status === 422) {
      // Backend validation errors
      const errorData = response.data;
      if (errorData.errors) {
        if (errorData.errors.clusterName) clusterNameError.value = errorData.errors.clusterName.msg; // Map clusterName error
        if (errorData.errors.lga) lgaError.value = errorData.errors.lga.msg;                // Map lga error
        registrationError.value = errorData.message || 'Validation failed. Please check the errors below.'; // Generic error message
      } else {
        registrationError.value = errorData.message || 'Cluster registration failed.'; // Fallback generic error
      }
    }
     else {
      registrationError.value = response.data.message || 'Admin registration failed.'; // Fallback generic error
    }
  } catch (err) {
    registrationError.value = 'Error during cluster registration. Network issue?';
    console.error('Cluster registration error:', err);
  }
};


// NEW Function to Fetch Available Admin Users for Dropdown
const fetchAvailableAdmins = async () => {
  // In a real app, you might want to filter this list (e.g., exclude Super Admins, or based on some criteria)
  try {
    const response = await api.get('/admin/users/list', { // Re-use existing admin user list endpoint
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
    if (response.status === 200) {
      availableAdmins.value = response.data.adminUsers; // Assign fetched admin user list to availableAdmins ref
    } else {
      console.error('Failed to fetch available admin users for dropdown:', response);
      // Handle error if needed (e.g., display error message to admin, though dropdown is optional)
    }
  } catch (err) {
    console.error('Error fetching available admin users for dropdown:', err);
    // Handle error if needed
  }
};


const saveCluster = async (cluster) => { // Updated saveCluster method (API Call)
  if (!editingClusterId.value) return; // Safety check - Exit if not in edit mode

  const clusterId = editingClusterId.value;
  const updatedClusterData = { // Prepare updated cluster data to send in request body
    clusterName: cluster.cluster_name,
    lga: cluster.lga,
    description: cluster.description,
  };

  editStatusMessage.value = 'Saving cluster...';
  editStatusType.value = '';

  try {
    // ** Actual API call to update cluster data on backend **
    const response = await api.post(`/admin/clusters/${clusterId}/update`, updatedClusterData, { // API call to update cluster
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`, // Include JWT token in header
      },
    });

    if (response.status === 200) {
      editStatusMessage.value = `Cluster "${cluster.cluster_name}" updated successfully!`;
      editStatusType.value = 'success';
      // No need to update clustersList here, as v-model directly updates cluster object

      setTimeout(() => {
        cancelEditCluster(); // Exit edit mode after success
      }, 1500); // Close modal after delay
    } else if (response.status === 422) {
      // Backend validation errors (if any - for cluster data)
      const errorData = response.data;
      editStatusMessage.value = errorData.message || 'Validation failed. Please check the form.';
      editStatusType.value = 'error';
      // You could potentially display field-specific validation errors here if needed, similar to Admin Registration form
    }
     else {
      editStatusMessage.value = response.data.message || 'Failed to update cluster.';
      editStatusType.value = 'error';
    }

  } catch (error) {
    editStatusMessage.value = 'Error saving cluster data. Network issue?';
    editStatusType.value = 'error';
    console.error('Error saving cluster data:', error);
  }
};


const editCluster = (cluster) => {
  editingClusterId.value = cluster.id; // Set editingClusterId to the ID of the cluster being edited
};


// NEW Function to Fetch User List from Backend API
const fetchUsers = async () => {
  userLoading.value = true;
  userError.value = '';
  userList.value = [];
  const adminToken = localStorage.getItem('adminToken');

  if (!adminToken) {
    userError.value = 'Admin token not found. Please login as admin.';
    userLoading.value = false;
    return;
  }

  try {
    const response = await api.get('/admin/registered-users/list', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('User API response:', response.data); // <-- Add this log

    if (response.status === 200) {
      // Make sure the property name matches what your backend sends:
      userList.value = response.data.users || [];
    } else {
      userError.value = response.data.message || 'Failed to fetch user list.';
    }
  } catch (err) {
    userError.value =
      'Error fetching user list. Please check your connection and admin authentication.';
    console.error('Error fetching user list:', err);
  } finally {
    userLoading.value = false;
  }
};



// Function to view user details
const viewUserDetails = (user) => {
  // Assuming user objects have been transformed to use camelCase keys
  alert(`User Details:
ID: ${user.id}
Name: ${user.firstName} ${user.lastName}
Email: ${user.emailAddress}
Joined: ${formatDate(user.createdAt)}`);
};

// Function to delete a user
const deleteUser = async (user) => {
  if (!confirm(`Are you sure you want to delete user ${user.firstName}?`)) {
    return;
  }
  try {
    const adminToken = localStorage.getItem('adminToken');
    // Adjust the endpoint as needed
    const response = await api.delete(`/admin/users/${user.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (response.status === 200) {
      // Remove the deleted user from the list
      userList.value = userList.value.filter(u => u.id !== user.id);
      alert("User deleted successfully");
    } else {
      alert("Error deleting user: " + (response.data.message || "Unknown error"));
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    alert("Error deleting user. Please try again.");
  }
};



onMounted(async () => {
  loading.value = true;
  error.value = '';
  applications.value = [];
  const adminToken = localStorage.getItem('adminToken');
  if (!adminToken) {
    error.value = 'Admin token not found. Please login as admin.';
    loading.value = false;
    router.push('/admin/login');
    return;
  }

  try {
    const response = await api.get('/admin/view-all-applications', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (response.status === 200) {
      applications.value = response.data.applications;
    } else {
      error.value = response.data.message || 'Failed to fetch applications.';
    }
  } catch (err) {
    error.value = 'Error fetching applications. Please check your connection and admin authentication.';
    console.error('Error fetching applications:', err);
  } finally {
    loading.value = false;
  }
  fetchServicePrices();
  fetchRevenueData();
   fetchClusters();
   fetchAvailableAdmins(); 
   fetchUsers();
});
</script>

<style scoped>
.dashboard-page {
  display: flex;
  min-height: 100vh;
  background-color: #f0f2f5; /* Example dashboard background color */
}

/* Sidebar Styles */
.dashboard-sidebar {
  width: 250px; /* Fixed sidebar width */
  background-color: #263238; /* Dark sidebar background */
  color: white;
  display: flex;
  flex-direction: column;
  height: 100vh; /* Full viewport height */
  position: sticky; /* Sticky sidebar */
  top: 0;
  left: 0;
  overflow-y: auto; /* Enable scroll if content overflows */
}

.sidebar-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.6rem;
  font-weight: bold;
  color: var(--header-apply-button-bg); /* Greenish logo text */
}

.menu-toggle-button {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  display: none; /* Hide initially, show on smaller screens if needed */
}

.sidebar-nav {
  padding: 0 1rem;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.8rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  color: white;
  transition: background-color 0.2s ease;
  cursor: pointer; /* Make nav items clickable */
}

.nav-item.active, .nav-item:hover {
  background-color: #37474f; /* Lighter background on hover/active */
}

.nav-item.has-dropdown {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-item.has-dropdown:hover, .nav-item.has-dropdown.active {
    background-color: #37474f;
}

.dropdown-arrow {
    transition: transform 0.2s ease;
}

.dropdown-arrow.open {
    transform: rotate(180deg);
}

.dropdown {
  padding-left: 1.5rem;
  overflow: hidden; /* Clip overflow content for animation */
}

.dropdown-item {
  display: block;
  padding: 0.7rem 1rem;
  margin-bottom: 0.2rem;
  border-radius: 0.3rem;
  text-decoration: none;
  color: white;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background-color: #37474f;
}


.nav-icon {
  margin-right: 0.8rem;
  font-size: 1.2rem;
  opacity: 0.8;
}

.sidebar-footer {
  padding: 1.5rem;
  text-align: center;
  font-size: 0.85rem;
  color: #ccc; /* Lighter footer text color */
  margin-top: auto; /* Push footer to bottom */
}

/* Main Content Styles */
.dashboard-main-content {
  flex-grow: 1;
  padding: 2rem;
  overflow-x: hidden; /* Prevent horizontal scroll */
}

.dashboard-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 2rem;
}

.user-profile {
  display: flex;
  align-items: center;
}

.profile-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 0.8rem;
  border: 2px solid white; /* White border for profile image */
}

.profile-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-weight: bold;
  color: var(--text-color-dark); /* Dark user name text */
}

.content-area {
  background-color: var(--section-bg-white); /* White content area background */
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08); /* Subtle shadow for content area */
}

/* Reusing Form Styles from Register/Login, adjusting for display */
.form-section {
  margin-bottom: 2rem;
}

.form-title {
  font-size: 1.6rem; /* Adjusted title size for dashboard */
  font-weight: bold;
  color: var(--text-color-dark);
  margin-bottom: 1.5rem;
  text-align: left;
}

.form-grid.display-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.2rem; /* Adjusted gap for display */
}

.form-group.display-group {
  display: flex;
  flex-direction: column;
}

.form-group.display-group.full-width {
  grid-column: 1 / -1;
}

.form-label.display-label {
  font-weight: 600; /* Slightly bolder label for display */
  margin-bottom: 0.2rem; /* Reduced margin for display labels */
  color: var(--text-color-gray);
  display: block;
  font-size: 0.9rem; /* Adjusted label size for display */
}

.form-value.display-value {
  color: var(--text-color-dark); /* Darker value text */
  font-size: 1rem; /* Adjusted value size for display */
  line-height: 1.5; /* Improved line height for values */
}


/* Responsive Styles - Adjust sidebar for smaller screens if needed */
@media (max-width: 768px) {
  .dashboard-sidebar {
    width: 80px; /* Example: smaller sidebar width on mobile */
    /* You might want to hide text labels in sidebar and only show icons on mobile */
  }
  .logo {
    font-size: 1.4rem;
  }
  .menu-toggle-button {
    display: block; /* Show menu button on mobile */
  }
  .dashboard-main-content {
    padding: 1.5rem;
  }
}

/* Profile Picture Styles */
.profile-image {
  position: relative; /* For edit icon positioning */
  cursor: pointer; /* Indicate clickable */
  transition: transform 0.2s ease;
}

.profile-image:hover {
  transform: scale(1.05);
}

.profile-image img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  display: block; /* Prevent extra space below image */
}

.edit-icon {
  position: absolute;
  bottom: -3px; /* Adjust as needed */
  right: -3px; /* Adjust as needed */
  background-color: var(--header-apply-button-bg); /* Or a suitable color */
  color: white;
  border-radius: 50%;
  width: 18px; /* Adjust size */
  height: 18px; /* Adjust size */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8em;
  border: 1px solid white;
}


/* Profile Picture Modal Styles */
.profile-picture-modal {
  position: fixed; /* Stay in place */
  z-index: 1; /* Sit on top */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: var(--section-bg-white);
  margin: 15% auto; /* 15% from the top and centered */
  padding: 20px;
  border: 1px solid #888;
  width: 80%; /* Could be more or less, depending on screen size */
  max-width: 500px;
  border-radius: 0.75rem;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  position: relative; /* For close button positioning */
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
  cursor: pointer;
}

.preview-container {
  margin-bottom: 15px;
  text-align: center;
}

.profile-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ddd;
  display: block;
  margin: 0 auto 10px; /* Center and add bottom margin */
}

.modal-actions {
  text-align: center;
  margin-top: 20px;
}

.modal-actions button {
  margin: 0 10px;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.upload-button {
  background-color: var(--primary-green);
  color: white;
}

.cancel-button {
  background-color: #ccc;
  color: #333;
}

.upload-message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
}

.upload-message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.upload-message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.content-area table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15); /* Subtle shadow for table */
  border-radius: 8px;
  overflow: hidden; /* To make rounded corners work with border */
}

.content-area th,
.content-area td {
  padding: 12px 15px; /* Increased padding */
  text-align: left;
  border-bottom: 1px solid #e0e0e0; /* Lighter border color */
}

.content-area th {
  background-color: #f5f5f5; /* Light gray header background */
  color: #555; /* Darker header text color */
  font-weight: 600; /* Bolder header text */
  text-transform: uppercase; /* Uppercase header text */
  font-size: 0.9rem;
}

.content-area tbody tr:nth-child(even) {
  background-color: #f9f9f9; /* Very light gray for even rows */
}

.content-area tbody tr:hover {
  background-color: #f2f2f2; /* Slightly darker gray on hover */
  transition: background-color 0.2s ease; /* Smooth hover transition */
}

.content-area td:last-child {
  text-align: center; /* Center align "Actions" column content */
}

.content-area button {
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  background-color: var(--primary-green);
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.content-area button:hover {
  background-color: #005f52;
  transform: translateY(-1px); /* Slight lift on hover */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* Subtle shadow on hover */
}

.content-area button:active {
  transform: translateY(0); /* Reset lift on active */
  box-shadow: none;
}

.content-area tbody tr:last-child td {
  border-bottom: none; /* Remove border from last row's bottom */
}


/* Optional: Adjustments for Error and Loading Messages */
.admin-dashboard-page .error-message {
  margin-top: 20px; /* Add margin above error message */
}

.admin-dashboard-page .loading {
  margin-top: 20px; /* Add margin above loading message */
  text-align: center;
  font-style: italic;
  color: #777;
}

.admin-user-management-section {
  margin-top: 30px; /* Add some top margin to separate from applications table */
}

.admin-user-management-section h2 {
  font-size: 1.8rem; /* Slightly smaller section title */
  margin-bottom: 15px;
}

.admin-user-management-section h3 {
  font-size: 1.3rem; /* Sub-section titles */
  margin-top: 20px;
  margin-bottom: 10px;
}

.admin-user-management-section p {
  color: #777; /* Gray placeholder text */
}

.admin-user-list,
.admin-registration-form-section {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #fefefe; /* Light background for subsections */
  margin-bottom: 20px;
}
.admin-user-management-section { }
.admin-user-management-section h2 { }
.admin-user-management-section h3 { }
.admin-user-management-section p { }
.admin-user-list, .admin-registration-form-section { }

/* Styles for Revenue Generation Section (NEW STYLES) */
.admin-revenue-section {
  margin-top: 30px; /* Add some top margin to separate from previous section */
}

.admin-revenue-section h2 {
  font-size: 1.8rem; /* Slightly smaller section title */
  margin-bottom: 15px;
}

.admin-revenue-section h3 {
  font-size: 1.3rem; /* Sub-section titles */
  margin-top: 20px;
  margin-bottom: 10px;
}

.admin-revenue-section p {
  color: #777; /* Gray placeholder text */
}

.revenue-summary {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #fefefe; /* Light background for revenue summary area */
  margin-bottom: 20px;
  text-align: center; /* Center align placeholder content */
}

/* Styles for Admin User Management Section - No changes here */
.admin-user-management-section { } /* ... styles ... */

/* Styles for Revenue Generation Section - No changes here */
.admin-revenue-section { } /* ... styles ... */

/* Styles for Clusters Section (NEW STYLES) */
.admin-clusters-section {
  margin-top: 30px; /* Add some top margin to separate from previous section */
}

.admin-clusters-section h2 {
  font-size: 1.8rem; /* Slightly smaller section title */
  margin-bottom: 15px;
}

.admin-clusters-section h3 {
  font-size: 1.3rem; /* Sub-section titles */
  margin-top: 20px;
  margin-bottom: 10px;
}

.admin-clusters-section p {
  color: #777; /* Gray placeholder text */
}

.cluster-management {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #fefefe; /* Light background for cluster management area */
  margin-bottom: 20px;
  text-align: center; /* Center align placeholder content */
}
/* New Styles for Revenue Summary Table */
.revenue-summary-table table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* Subtle shadow */
}

.revenue-summary-table th,
.revenue-summary-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.revenue-summary-table th {
  background-color: #f0f0f0; /* Light gray header */
  font-weight: bold;
  color: #555;
  text-transform: uppercase;
  font-size: 0.9rem;
}

.revenue-summary-table tbody tr:nth-child(even) {
  background-color: #f9f9f9; /* Light gray for even rows */
}

.revenue-summary-table tfoot th {
  background-color: var(--primary-green); /* Primary green for footer */
  color: white;
  font-weight: bold;
  text-align: right; /* Right align total revenue in footer */
}

.revenue-amount {
  font-weight: bold; /* Make revenue amounts bold */
  color: var(--primary-green); /* Highlight revenue amounts with primary green */
}

/* Optional: Adjustments for Error and Loading Messages in Revenue Section */
.admin-revenue-section .error-message {
  margin-top: 20px; /* Add margin above error message */
}

.admin-revenue-section .loading {
  margin-top: 20px; /* Add margin above loading message */
  text-align: center;
  font-style: italic;
  color: #777;
}


</style>