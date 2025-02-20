<template>
  <div class="dashboard-page">
    <aside class="dashboard-sidebar">
      <!-- Sidebar - No changes needed here -->
      <div class="sidebar-header">
        <div class="logo">COQS</div>
        <button class="menu-toggle-button">
          ☰
        </button>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-item active">
          <span class="nav-icon"> 🏠 </span>
          Dashboard
        </router-link>
        <div class="nav-item has-dropdown" @click="toggleDropdown('requestCertificate')">
          <span class="nav-icon"> 📄 </span>
          Request Certificate
          <span class="dropdown-arrow" :class="{ open: isDropdownOpen('requestCertificate') }"> ▼ </span>
        </div>
        <div class="dropdown" v-if="isDropdownOpen('requestCertificate')">
          <router-link to="/request-certificate/for-you" class="dropdown-item">
            - For you
          </router-link>
          <router-link to="/request-certificate/for-child" class="dropdown-item">
            - For your child
          </router-link>
        </div>
        <router-link to="/death-certificate" class="nav-item">
          <span class="nav-icon"> 💀 </span> <!-- Death Certificate Icon -->
          Death Certificate
        </router-link>

        <router-link to="/local-government-id" class="nav-item">
          <span class="nav-icon"> 🆔 </span> <!-- Local Government ID Icon -->
          Local Government ID
        </router-link>

        <router-link to="/club-association-registration" class="nav-item">
          <span class="nav-icon"> 🤝 </span> <!-- Club/Association Registration Icon -->
          Club/Association Registration
        </router-link>

        <router-link to="/waste-management-fees" class="nav-item">
          <span class="nav-icon"> 🗑️ </span> <!-- Waste Management Fees Icon -->
          Waste Management Fees
        </router-link>

        <router-link to="/street-registration" class="nav-item">
          <span class="nav-icon"> 🏘️ </span> <!-- Street Registration Icon -->
          Street Registration
        </router-link>

        <router-link to="/business-registration" class="nav-item">
          <span class="nav-icon"> 💼 </span> <!-- Business Registration Icon -->
          Business Registration
        </router-link>

        <router-link to="/convert-certificate" class="nav-item">
          <span class="nav-icon"> 🔄 </span>
          Convert Certificate
        </router-link>
        <router-link to="/view-applications" class="nav-item">
          <span class="nav-icon"> 👁️ </span>
          View Applications
        </router-link>
      </nav>
      <div class="sidebar-footer">
        © 2025 LocalGovernment. <br> All Rights Reserved.
      </div>
    </aside>
    <main class="dashboard-main-content">
      <header class="dashboard-header">
        <div class="user-profile">
          <div class="profile-image" @click="editProfilePicture">
            <img :src="profilePictureUrl || defaultProfileImage" alt="Profile Picture">
            <div class="edit-icon" v-if="!isEditingProfile">✏️</div>
          </div>
          <span class="user-name">{{ userData?.firstName }} {{ userData?.lastName }}</span>  <!-- Dynamic User Name -->
        </div>
      </header>
      <div class="content-area">
        <div class="form-section" v-if="userData"> <!-- Conditionally render sections if userData is loaded -->
          <h2 class="form-title">CONTACT INFORMATION</h2>
          <div class="form-grid display-grid">
            <div class="form-group display-group">
              <span class="form-label display-label">PHONE NUMBER</span>
              <span class="form-value display-value">{{ userData.phoneNumber }}</span> <!-- Dynamic Phone Number -->
            </div>
            <div class="form-group display-group">
              <span class="form-label display-label">EMAIL ADDRESS</span>
              <span class="form-value display-value">{{ userData.emailAddress }}</span> <!-- Dynamic Email Address -->
            </div>
            <div class="form-group display-group">
              <span class="form-label display-label">NATIONALITY</span>
              <span class="form-value display-value">{{ userData.nationality }}</span> <!-- Dynamic Nationality -->
            </div>
            <div class="form-group display-group full-width">
              <span class="form-label display-label">HOME ADDRESS</span>
              <span class="form-value display-value">{{ userData.homeAddress }}</span> <!-- Dynamic Home Address -->
            </div>
            <div class="form-group display-group">
              <span class="form-label display-label">STATE</span>
              <span class="form-value display-value">{{ userData.state }}</span> <!-- Dynamic State -->
            </div>
            <div class="form-group display-group">
              <span class="form-label display-label">CITY</span>
              <span class="form-value display-value">{{ userData.city }}</span> <!-- Dynamic City -->
            </div>
            <div class="form-group display-group">
              <span class="form-label display-label">LGA</span>
              <span class="form-value display-value">{{ userData.lga }}</span> <!-- Dynamic LGA -->
            </div>
          </div>
        </div>

        <div class="form-section" v-if="userData"> <!-- Conditionally render sections if userData is loaded -->
          <h2 class="form-title">OTHER INFORMATION</h2>
          <div class="form-grid display-grid">
            <div class="form-group display-group">
              <span class="form-label display-label">PID</span>
              <span class="form-value display-value">{{ userData.pid }}</span> <!-- Dynamic PID -->
            </div>
            <div class="form-group display-group">
              <span class="form-label display-label">IDENTIFICATION TYPE</span>
              <span class="form-value display-value">{{ userData.identificationType }}</span> <!-- Dynamic ID Type -->
            </div>
            <div class="form-group display-group">
              <span class="form-label display-label">IDENTIFICATION NUMBER</span>
              <span class="form-value display-value">{{ userData.identificationNumber }}</span> <!-- Dynamic ID Number -->
            </div>
            <div class="form-group display-group">
              <span class="form-label display-label">EMPLOYMENT STATUS</span>
              <span class="form-value display-value">{{ userData.employmentStatus }}</span> <!-- Dynamic Employment Status -->
            </div>
          </div>
        </div>

        <!-- Profile Picture Upload Modal - No changes needed here -->
        <div v-if="isEditingProfile" class="profile-picture-modal">
          <div class="modal-content">
            <span class="close-button" @click="cancelEditProfilePicture">×</span>
            <h3>Change Profile Picture</h3>
            <div class="preview-container">
              <img :src="profilePicturePreviewUrl || defaultProfileImage" alt="Profile Preview" class="profile-preview">
            </div>
            <input type="file" @change="onFileChange" accept="image/*" ref="fileInput">
            <div class="modal-actions">
              <button @click="uploadProfilePicture" class="upload-button">Upload</button>
              <button @click="cancelEditProfilePicture" class="cancel-button">Cancel</button>
            </div>
            <div v-if="uploadStatusMessage" class="upload-message" :class="uploadStatusType">
              {{ uploadStatusMessage }}
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import defaultProfileImage from '../assets/img.png';
import { useRouter } from 'vue-router';
import api from "../utils/axios";

const router = useRouter();
const userData = ref(null);
const error = ref('');
const activeDropdown = ref(null);


// Profile Picture Logic - No changes needed here
const profilePictureUrl = ref('');
const profilePicturePreviewUrl = ref('');
const isEditingProfile = ref(false);
const fileInput = ref(null);
const uploadStatusMessage = ref('');
const uploadStatusType = ref('');

const editProfilePicture = () => {
  isEditingProfile.value = true;
};

const cancelEditProfilePicture = () => {
  isEditingProfile.value = false;
  profilePicturePreviewUrl.value = '';
  uploadStatusMessage.value = '';
  uploadStatusType.value = '';
};

const onFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      profilePicturePreviewUrl.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const uploadProfilePicture = async () => {
  const file = fileInput.value.files[0];
  if (!file) {
    uploadStatusMessage.value = 'Please select a profile picture to upload.';
    uploadStatusType.value = 'error';
    return;
  }

  const formData = new FormData();
  formData.append('profilePicture', file);
  formData.append('emailAddress', userData.value.emailAddress);

  uploadStatusMessage.value = 'Uploading...';
  uploadStatusType.value = '';

  try {
    const response = await api.post('/users/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 200) {
      uploadStatusMessage.value = 'Profile picture updated successfully!';
      uploadStatusType.value = 'success';
      profilePictureUrl.value = response.data.profilePictureUrl;
      setTimeout(() => {
        cancelEditProfilePicture();
      }, 1500);
    } else {
      uploadStatusMessage.value = response.data.message || 'Profile picture upload failed.';
      uploadStatusType.value = 'error';
      console.error('Profile picture upload failed:', response);
    }
  } catch (error) {
    uploadStatusMessage.value = 'Error uploading profile picture. Please check your connection.';
    uploadStatusType.value = 'error';
    console.error('Error uploading profile picture:', error);
  }
};


const toggleDropdown = (dropdownName) => {
  activeDropdown.value = activeDropdown.value === dropdownName ? null : dropdownName;
};

const isDropdownOpen = (dropdownName) => {
  return activeDropdown.value === dropdownName;
};

onMounted(async () => {
  const loggedInEmail = localStorage.getItem('userEmail');

  if (!loggedInEmail) {
    error.value = 'User email not found. Please login again.';
    return;
  }

  try {
    const response = await api.get(`/users/user/${loggedInEmail}`);
    if (response.status === 200) {
      userData.value = response.data.user;
      // For now, we'll just use a default profile image. In a real app, you'd fetch the profilePictureUrl from the backend user data
      // profilePictureUrl.value = userData.value.profile_picture_url || ''; // Example if backend returns URL
    } else {
      error.value = 'Failed to load user data.';
      console.error('Failed to load user data:', response);
    }
  } catch (err) {
    error.value = 'Error fetching user data. Please check your connection.';
    console.error('Error fetching user data:', err);
  }
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
</style>