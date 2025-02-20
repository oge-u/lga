<template>
  <div class="register-page">
    <div class="container register-container">
    <form @submit.prevent="handleSubmit" class="registration-form">
      <h2 class="form-title">Create Account</h2>
      <p class="form-subtitle">Register to access e-services</p>

      <div v-if="validationError" class="validation-error-message">
        {{ validationError }}
      </div>
      <div v-if="registrationSuccessMessage" class="registration-success-message">
        {{ registrationSuccessMessage }}
      </div>

      <div class="form-section">
        <h3 class="form-section-title">Personal Information</h3>
        <div class="form-grid">
          <div class="form-group">
            <label for="first-name" class="form-label">First Name</label>
            <input type="text" id="first-name" v-model="formData.firstName" class="form-input" placeholder="Enter first name">
          </div>
          <div class="form-group">
            <label for="last-name" class="form-label">Last Name</label>
            <input type="text" id="last-name" v-model="formData.lastName" class="form-input" placeholder="Enter last name">
          </div>
          <div class="form-group full-width">
            <label for="other-names" class="form-label">Other Names (Optional)</label>
            <input type="text" id="other-names" v-model="formData.otherNames" class="form-input" placeholder="Enter other names">
          </div>
          <!-- Add Password Field here -->
          <div class="form-group full-width">
            <label for="password" class="form-label">Password</label>
            <input type="password" id="password" v-model="formData.password" class="form-input" placeholder="Enter password">
          </div>
        </div>
      </div>

      <!-- ... (Rest of the form template - Contact Information, Other Information, Form Actions) ... -->
      <div class="form-section">
        <h3 class="form-section-title">Contact Information</h3>
        <div class="form-grid">
          <div class="form-group">
            <label for="phone-number" class="form-label">PHONE NUMBER</label>
            <input type="text" id="phone-number" v-model="formData.phoneNumber" class="form-input" placeholder="Enter phone number">
          </div>
          <div class="form-group">
            <label for="email-address" class="form-label">EMAIL ADDRESS</label>
            <input type="email" id="email-address" v-model="formData.emailAddress" class="form-input" placeholder="Enter email address">
          </div>
          <div class="form-group">
            <label for="nationality" class="form-label">NATIONALITY</label>
            <input type="text" id="nationality" v-model="formData.nationality" class="form-input" placeholder="Enter nationality">
          </div>
          <div class="form-group full-width">
            <label for="home-address" class="form-label">HOME ADDRESS</label>
            <textarea id="home-address" v-model="formData.homeAddress" class="form-input" placeholder="Enter home address"></textarea>
          </div>
          <div class="form-group">
            <label for="state" class="form-label">STATE</label>
            <input type="text" id="state" v-model="formData.state" class="form-input" placeholder="Enter state">
          </div>
          <div class="form-group">
            <label for="city" class="form-label">CITY</label>
            <input type="text" id="city" v-model="formData.city" class="form-input" placeholder="Enter city">
          </div>
          <div class="form-group">
            <label for="lga" class="form-label">LGA</label>
            <input type="text" id="lga" v-model="formData.lga" class="form-input" placeholder="Enter LGA">
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3 class="form-section-title">Other Information</h3>
        <div class="form-grid">
        
          <div class="form-group">
            <label for="identification-type" class="form-label">IDENTIFICATION TYPE</label>
            <input type="text" id="identification-type" v-model="formData.identificationType" class="form-input" placeholder="Enter identification type">
          </div>
          <div class="form-group">
            <label for="identification-number" class="form-label">IDENTIFICATION NUMBER</label>
            <input type="text" id="identification-number" v-model="formData.identificationNumber" class="form-input" placeholder="Enter identification number">
          </div>
          <div class="form-group">
            <label for="employment-status" class="form-label">EMPLOYMENT STATUS</label>
            <input type="text" id="employment-status" v-model="formData.employmentStatus" class="form-input" placeholder="Enter employment status">
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="submit-button">Register</button>
        <p class="login-link">Already have an account? <router-link to="/login">Login here</router-link></p>
      </div>
      </form>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import api from "../utils/axios";

const router = useRouter();

const formData = reactive({
  firstName: '',
  lastName: '',
  otherNames: '',
  password: '',
  phoneNumber: '',
  emailAddress: '',
  nationality: '',
  homeAddress: '',
  state: '',
  city: '',
  lga: '',
  identificationType: '',
  identificationNumber: '',
  employmentStatus: '',
});

const validationError = ref('');
const registrationSuccessMessage = ref('');
const requiredFields = [
    'firstName', 'lastName', 'password', 'phoneNumber', 'emailAddress',
    'nationality', 'homeAddress', 'state', 'city', 'lga', 'identificationType',
    'identificationNumber', 'employmentStatus'
];

const handleSubmit = async () => {
  console.log('handleSubmit function called');
  validationError.value = ''; // Clear previous validation error
  registrationSuccessMessage.value = ''; // Clear success message

  // Check if all required fields are filled
  for (const field of requiredFields) {
    if (!formData[field]) {
      validationError.value = 'Please fill in all required fields.';
      return; // Stop submission if any required field is empty
    }
  }

  try {
    console.log('Before api.post');
    const response = await api.post('/users/register', formData);
    console.log('api.post response:', response);

    if (response.status === 201) {
      registrationSuccessMessage.value = 'Registration successful! Taking you to your dashboard shortly...';
      setTimeout(() => {
        router.push('/user');
      }, 2000); // Redirect after 2 seconds (adjust as needed)
    } else {
      // Handle registration errors from backend (e.g., email already exists)
      const errorData = response.data;
      validationError.value = errorData.message || 'Registration failed. Please try again.';
      console.error('Registration failed:', errorData);
    }


  } catch (error) {
    console.error('Registration error:', error);
    validationError.value = 'An error occurred during registration. Please check your connection and try again.';
    // ... error handling ...
  }
};
</script>

<style scoped>
.register-page {
  background-color: var(--light-gray);
  padding-top: 4rem; /* Increased top padding */
  padding-bottom: 4rem; /* Increased bottom padding */
}

.register-container { /* Renamed from .container to .register-container for specificity */
  display: flex;
  flex-direction: column;
  gap: 2.5rem; /* Increased spacing between form sections */
  max-width: 750px; /* Slightly reduced max width for a more focused form */
  margin: 0 auto;
  padding: 3rem; /* Increased padding around the form container */
  background-color: var(--section-bg-white);
  border-radius: 0.75rem; /* More rounded corners for container */
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15); /* More pronounced shadow for depth */
}

.form-title {
  font-size: 2rem; /* Larger form title */
  font-weight: bold;
  color: var(--text-color-dark);
  margin-bottom: 0.8rem; /* Slightly reduced margin below title */
  text-align: center; /* Center the title */
}

.form-subtitle {
  color: var(--text-color-gray);
  text-align: center;
  margin-bottom: 2rem; /* Spacing below subtitle */
}

.form-section {
  margin-bottom: 1.5rem; /* Spacing below each form section */
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee; /* Light separator line for sections */
}

.form-section:last-of-type {
  border-bottom: none; /* Remove separator from last section */
  margin-bottom: 0; /* Remove bottom margin from last section */
  padding-bottom: 0;
}

.form-section-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--primary-green); /* Highlight section titles with primary green */
  margin-bottom: 1.2rem; /* Spacing below section title */
  text-align: left; /* Align section titles to left */
}


.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* Slightly wider min width for inputs */
  gap: 1.75rem; /* Increased gap in grid */
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-weight: 500; /* Slightly lighter font weight for labels */
  margin-bottom: 0.5rem; /* More spacing below label */
  color: var(--text-color-dark); /* Darker label text */
  display: block;
  font-size: 0.95rem; /* Slightly smaller label font size */
}

.form-input {
  padding: 1rem 1.2rem; /* Increased padding inside inputs */
  border: 1px solid #ddd; /* Lighter border color */
  border-radius: 0.5rem; /* More rounded input corners */
  font-size: 1rem;
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.3s ease, box-shadow 0.3s ease; /* Smooth transition for focus effect */
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-green);
  box-shadow: 0 0 0 2px rgba(0, var(--primary-green-r, 75), var(--primary-green-g, 64), 0.25); /* More subtle focus shadow */
}

textarea.form-input {
  min-height: 120px; /* Increased min height for textarea */
}

.form-actions {
  margin-top: 2.5rem; /* Increased margin above actions */
  text-align: center;
}

.submit-button {
  background-color: var(--primary-green);
  color: white;
  font-weight: bold;
  padding: 1rem 2rem; /* Larger button padding */
  border: none;
  border-radius: 0.5rem; /* Rounded button corners */
  cursor: pointer;
  font-size: 1.1rem; /* Slightly larger button font size */
  transition: background-color 0.3s ease, transform 0.3s ease; /* Smooth transition for button */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow for button */
}

.submit-button:hover {
  background-color: #005f52;
  transform: translateY(-2px); /* Slight lift on hover */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); /* Slightly stronger shadow on hover */
}

.submit-button:active {
  transform: translateY(0); /* No lift when active/pressed */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Reset shadow when active */
}


.login-link {
  margin-top: 1.5rem; /* Spacing above login link */
  font-size: 0.95rem;
  color: var(--text-color-gray);
}

.login-link a {
  color: var(--primary-green);
  text-decoration: none;
  font-weight: bold;
}

.login-link a:hover {
  text-decoration: underline;
}

.validation-error-message {
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
}

.registration-success-message {
  color: #155724;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  text-align: center;
}
</style>