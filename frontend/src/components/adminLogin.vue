<template>
  <div class="admin-login-page">
    <div class="container admin-login-container">
      <h2 class="form-title">Admin Login</h2>

      <div v-if="loginError" class="login-error-message">
        {{ loginError }}
      </div>

      <form @submit.prevent="handleSubmit" class="admin-login-form">
        <div class="form-group">
          <label for="admin-login-username" class="form-label">Username:</label>
          <input type="text" id="admin-login-username" v-model="loginFormData.username" class="form-input" placeholder="Enter your username">
        </div>
        <div class="form-group">
          <label for="admin-login-password" class="form-label">Password:</label>
          <input type="password" id="admin-login-password" v-model="loginFormData.password" class="form-input" placeholder="Enter your password">
        </div>
        <div class="form-actions">
          <button type="submit" class="login-button" :disabled="isSubmitting">
            <span v-if="isSubmitting">Logging in...</span>
            <span v-else>Login</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from "../utils/axios";

const router = useRouter();

const loginFormData = reactive({
  username: '',
  password: '',
});

const loginError = ref('');
const isSubmitting = ref(false);

const handleSubmit = async () => {
  loginError.value = '';
  isSubmitting.value = true;

  if (!loginFormData.username || !loginFormData.password) {
    loginError.value = 'Please enter both username and password.';
    isSubmitting.value = false;
    return;
  }

  try {
    const response = await api.post('/admin/login', loginFormData);

    if (response.status === 200) {
      const token = response.data.token; // Get JWT token from response
      localStorage.setItem('adminToken', token); // Store JWT in localStorage (or sessionStorage)
      localStorage.setItem('adminUsername', loginFormData.username); // Optionally store username

      // Redirect to Admin Dashboard
      router.push('/admin/dashboard');
    } else {
      loginError.value = response.data.message || 'Admin login failed. Please check your credentials.';
    }
  } catch (error) {
    loginError.value = 'Admin login failed. Please check your credentials and network connection.';
    console.error('Admin login error:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.admin-login-page {
  background-color: var(--light-gray);
  padding-top: 6rem;
  padding-bottom: 6rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.admin-login-container {
  max-width: 450px;
  width: 100%;
  margin: 0 auto;
  padding: 3rem;
  background-color: var(--section-bg-white);
  border-radius: 0.75rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.form-title {
  font-size: 2rem;
  font-weight: bold;
  color: var(--text-color-dark);
  margin-bottom: 0.8rem;
  text-align: center;
}

.form-group {
  margin-bottom: 2rem;
}

.form-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-color-dark);
  display: block;
  font-size: 0.95rem;
}

.form-input {
  padding: 1rem 1.2rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-green);
  box-shadow: 0 0 0 2px rgba(0, var(--primary-green-r, 75), var(--primary-green-g, 64), 0.25);
}

.form-actions {
  text-align: center;
  margin-top: 2.5rem;
}

.login-button {
  background-color: var(--primary-green);
  color: white;
  font-weight: bold;
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background-color 0.3s ease, transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.login-button:hover {
  background-color: #005f52;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.login-error-message {
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  text-align: center;
}
</style>