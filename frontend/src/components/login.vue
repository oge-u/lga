<template>
  <div class="login-page">
    <div class="container login-container">
      <h2 class="form-title">Login</h2>

      <div v-if="loginError" class="login-error-message">
        {{ loginError }}
      </div>
      <div v-if="loginSuccessMessage" class="login-success-message">
        {{ loginSuccessMessage }}
      </div>

      <div class="form-group">
        <label for="login-email" class="form-label">EMAIL ADDRESS</label>
        <input type="email" id="login-email" v-model="loginFormData.emailAddress" class="form-input" placeholder="Enter your email">
      </div>
      <div class="form-group">
        <label for="login-password" class="form-label">PASSWORD</label>
        <input type="password" id="login-password" v-model="loginFormData.password" class="form-input" placeholder="Enter your password">
      </div>
      <div class="form-actions">
        <button @click.prevent="handleSubmit" class="login-button">Login</button>
        <p class="register-link">Don't have an account? <router-link to="/register">Register here</router-link></p>
      </div>
      <p class="register-link">Admin? <router-link to="/admin/login">Register here</router-link></p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from "../utils/axios";

const router = useRouter();

const loginFormData = reactive({
  emailAddress: '',
  password: '',
});

const loginError = ref('');
const loginSuccessMessage = ref('');

// Login.vue - handleSubmit function
const handleSubmit = async () => {
    // ... (rest of your handleSubmit code) ...

    try {
        const response = await api.post('/users/login', loginFormData);
        console.log('Login - API Response Status:', response.status); // *** ADD THIS LINE ***

        if (response.status === 200) {
            console.log('Login - Success block (status 200)'); // *** ADD THIS LINE ***
            loginSuccessMessage.value = 'Login successful! Taking you to your dashboard shortly...';
            localStorage.setItem('userEmail', loginFormData.emailAddress);
            setTimeout(() => {
                router.push('/user');
            }, 2000);
        } else {
            console.log('Login - Error block (status NOT 200)'); // *** ADD THIS LINE ***
            loginError.value = 'Login failed. Please check your credentials.';
            console.error('Login failed:', response.data);
        }
    } catch (error) {
        console.log('Login - Catch block (network error)'); // *** ADD THIS LINE ***
        loginError.value = 'Login failed. Please check your credentials and network connection.';
        console.error('Login error:', error);
    }

};
</script>

<style scoped>
.login-page {
  background-color: var(--light-gray);
  padding-top: 6rem; /* Increased top padding for centering */
  padding-bottom: 6rem; /* Increased bottom padding for centering */
  display: flex; /* Use flexbox for vertical centering */
  justify-content: center;
  align-items: center;
  min-height: 100vh; /* Ensure full viewport height */
}

.login-container {
  max-width: 450px; /* Slightly narrower container for login */
  width: 100%; /* Make container responsive */
  margin: 0 auto;
  padding: 3rem; /* Increased padding inside container */
  background-color: var(--section-bg-white);
  border-radius: 0.75rem; /* More rounded corners */
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15); /* More pronounced shadow */
}

.form-title {
  font-size: 2rem; /* Larger title */
  font-weight: bold;
  color: var(--text-color-dark);
  margin-bottom: 0.8rem; /* Reduced margin below title */
  text-align: center; /* Center title */
}

.form-subtitle {
  color: var(--text-color-gray);
  text-align: center;
  margin-bottom: 2.5rem; /* Increased spacing below subtitle */
  font-size: 1rem; /* Slightly larger subtitle font */
}

.form-group {
  margin-bottom: 2rem; /* Increased spacing between form groups */
}

.form-label {
  font-weight: 500; /* Slightly lighter font weight for labels */
  margin-bottom: 0.5rem;
  color: var(--text-color-dark);
  display: block;
  font-size: 0.95rem;
}

.form-input {
  padding: 1rem 1.2rem; /* Increased input padding */
  border: 1px solid #ddd; /* Lighter border */
  border-radius: 0.5rem; /* Rounded corners */
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
  margin-top: 2.5rem; /* Increased margin above actions */
}

.login-button {
  background-color: var(--primary-green);
  color: white;
  font-weight: bold;
  padding: 1rem 2rem; /* Larger button padding */
  border: none;
  border-radius: 0.5rem; /* Rounded button */
  cursor: pointer;
  font-size: 1.1rem; /* Larger button font size */
  transition: background-color 0.3s ease, transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%; /* Make button full width */
}

.login-button:hover {
  background-color: #005f52;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.login-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.register-link {
  margin-top: 2rem; /* Increased margin above register link */
  font-size: 0.95rem;
  color: var(--text-color-gray);
  text-align: center; /* Center register link */
  display: block; /* Ensure block display for centering */
}

.register-link a {
  color: var(--primary-green);
  text-decoration: none;
  font-weight: bold;
}

.register-link a:hover {
  text-decoration: underline;
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

.login-success-message {
  color: #155724;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  text-align: center;
}
</style>