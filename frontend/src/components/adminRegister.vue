<template>
  <div class="admin-register-page">
    <h2>Admin Registration</h2>
    <form @submit.prevent="handleSubmit" class="admin-register-form">
      <div class="form-group">
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="formData.username" class="form-input" />
        <div v-if="usernameError" class="validation-error">{{ usernameError }}</div>  
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="formData.password" class="form-input" />
        <div v-if="passwordError" class="validation-error">{{ passwordError }}</div>  
      </div>
      <div class="form-group">
        <label for="confirmPassword">Confirm Password:</label>
        <input type="password" id="confirmPassword" v-model="formData.confirmPassword" class="form-input" />
        <div v-if="confirmPasswordError" class="validation-error">{{ confirmPasswordError }}</div> 
      </div>
      <!-- Optional: Admin Role Field -->
      <div class="form-group" v-if="showAdminRole">  
        <label for="adminRole">Admin Role (Optional):</label>
        <select id="adminRole" v-model="formData.adminRole" class="form-input">
          <option value="">Select Role</option>
          <option value="admin">Admin</option>
          <option value="superadmin">Super Admin</option>
          <option value="clusteradmin">Cluster Admin</option>
          <option value="bursaryadmin">Bursary Admin</option>
        </select>
        <div v-if="adminRoleError" class="validation-error">{{ adminRoleError }}</div> <!- Display admin role error -->
      </div>

      <button type="submit" class="submit-button">Register Admin User</button>
      <div v-if="message" class="message success-message">{{ message }}</div>
      <div v-if="error" class="message error-message">{{ error }}</div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import api from '../utils/axios';

const formData = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  adminRole: 'admin', // Default role
});

const message = ref('');
const error = ref('');
const usernameError = ref('');    // Refs for specific field errors
const passwordError = ref('');
const confirmPasswordError = ref('');
const adminRoleError = ref('');

const showAdminRole = ref(true); // Example: Conditionally show Admin Role field (you can control this based on user type, etc.)


const handleSubmit = async () => {
  message.value = '';
  error.value = '';
  usernameError.value = '';     // Clear field-specific errors
  passwordError.value = '';
  confirmPasswordError.value = '';
  adminRoleError.value = '';


  if (formData.password !== formData.confirmPassword) {
    confirmPasswordError.value = "Passwords do not match."; // Set confirmPasswordError ref
    return;
  }

  try {
    const response = await api.post('/admin/register', formData);
    if (response.status === 201) {
      message.value = response.data.message;
      // Reset form on success (optional)
      Object.keys(formData).forEach(key => formData[key] = '');
    } else if (response.status === 409) {
      error.value = response.data.message || 'Registration failed: Username already exists.';
    }      else if (response.status === 422) {
      // Backend validation errors (e.g., password too short)
      const errorData = response.data;
      if (errorData.errors) {
        // Example - Map backend errors to frontend error refs (adjust based on your backend error response structure)
        if (errorData.errors.username) usernameError.value = errorData.errors.username.msg; // <-- CORRECT MAPPING
        if (errorData.errors.password) passwordError.value = errorData.errors.password.msg; // <-- CORRECT MAPPING
        if (errorData.errors.adminRole) adminRoleError.value = errorData.errors.adminRole.msg; // <-- CORRECT MAPPING
        error.value = errorData.message || 'Validation failed. Please check the errors below.'; // Generic error message
      } else {
        error.value = errorData.message || 'Admin registration failed.'; // Fallback generic error
      }
    }
  } catch (err) {
    error.value = 'Error during admin registration. Network issue?';
    console.error('Admin registration error:', err);
  }
};
</script>


<style scoped>
.admin-register-page {
  max-width: 500px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-input, select, textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 16px;
}

.submit-button {
  background-color: #007bff;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
}

.message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
}

.message.success-message {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error-message {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>