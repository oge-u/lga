<template>
  <div>
    <Header />

    <main class="main-content">
      <section class="hero-section">
        <div class="container hero-content">
          <h1 class="hero-title">Obtain Your Osun State and Local Government of Origin Certificate with a Few Clicks.</h1>
          <p class="hero-subtitle">Empowering your Identity, Simplifying the Process</p>
          <button class="hero-apply-button">APPLY NOW</button>
        </div>
        <div class="hero-image-container">
          <img src="../assets/img.png" alt="Smiling Person" class="hero-image" /> <!-- Hero Image -->
        </div>
      </section>

      <section id="about" class="content-section bg-light-mint">
        <div class="container about-section-content">
          <div class="about-section-text">
            <h2 class="section-title">About</h2>
            <p class="section-description">The Osun State of Origin and Local Government of Origin Certificate Portal offers a streamlined procedure for acquiring the official State of Origin and Local Government of Origin Certificate. Our mission is to empower individuals by preserving and commemorating their distinct identities, thereby showcasing the rich heritage of our state.</p>
            <p class="section-description">Recognizing the significance of this document in establishing one's roots and local connections, we at Osun State have developed a user-friendly platform designed to enhance the application process; ensuring it is efficient, secure, and devoid of unnecessary complications.</p>
            <button class="about-get-started-button">GET STARTED</button>
          </div>
          <div class="about-section-image-container">
            <img src="../assets/img.png" alt="Smiling Woman" class="about-section-image" /> <!-- About Section Image -->
          </div>
        </div>
      </section>


<section class="feature-cards-section">
        <div class="container">
          <div class="feature-cards-grid">
            <!-- Feature Card 1 -->
            <div class="feature-card card-animate">
              <h2 class="card-title">Request for a Service</h2>
              <p class="card-description">You can apply for any of the e-services available on this platform ranging from Birth Certificate, Marriage Registration, Local Government Identification, etc.</p>
              <button
                class="feature-button"
                @click="handleRequestService"
              >
                Click here
              </button>
            </div>
            <!-- Feature Card 2 - Middle Card -->
            <div class="feature-card card-animate feature-card-middle">
              <h2 class="card-title">Manage your Requests</h2>
              <p class="card-description">You can register and login to your account to manage your applications, payments, invoices, certificates, etc., as well as track your requests in real-time.</p>
              <button
                class="feature-button"
                @click="handleManageRequests"
              >
                Click here
              </button>
            </div>
            <!-- Feature Card 3 -->
            <div class="feature-card card-animate">
              <h2 class="card-title">Check your Request Status</h2>
              <p class="card-description">You can check the status of your application or request using the unique Request ID sent to your email on completion of your application or request.</p>
              <button
                class="feature-button"
                @click="handleCheckStatus"
              >
                Click here
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="how-to-apply" class="content-section">
        <div class="container">
          <h2 class="section-title">How to Apply</h2>
          <p class="section-description">Follow these Four simple steps to obtain your certificate of origin.</p>
          <div class="how-to-apply-steps">
            <!-- Step 1 -->
            <div class="how-to-apply-step card-animate">
              <div class="how-to-apply-icon-container">
                <img src="../assets/img.png" alt="Create Account Icon" class="how-to-apply-icon" /> <!-- Placeholder Icon -->
              </div>
              <h3 class="how-to-apply-step-title">Create an Account.</h3>
              <p class="how-to-apply-step-description">Begin by creating your personalized account on our platform, login in and request for certificate.</p>
            </div>
            <!-- Step 2 -->
            <div class="how-to-apply-step card-animate">
              <div class="how-to-apply-icon-container">
                <img src="../assets/img.png" alt="Fill Details Icon" class="how-to-apply-icon" /> <!-- Placeholder Icon -->
              </div>
              <h3 class="how-to-apply-step-title">Fill in Your Details.</h3>
              <p class="how-to-apply-step-description">Provide the necessary information to complete your application.</p>
            </div>
            <!-- Step 3 -->
            <div class="how-to-apply-step card-animate">
              <div class="how-to-apply-icon-container">
                <img src="../assets/img.png" alt="Upload Documents Icon" class="how-to-apply-icon" /> <!-- Placeholder Icon -->
              </div>
              <h3 class="how-to-apply-step-title">Upload Supporting Documents.</h3>
              <p class="how-to-apply-step-description">Attach your passport and Your NIN and other requested document to verify your identity and establish your connection to Osun state.</p>
            </div>
            <!-- Step 4 -->
            <div class="how-to-apply-step card-animate">
              <div class="how-to-apply-icon-container">
                <img src="../assets/img.png" alt="Get Certificate Icon" class="how-to-apply-icon" /> <!-- Placeholder Icon -->
              </div>
              <h3 class="how-to-apply-step-title">Get Certificate.</h3>
              <p class="how-to-apply-step-description">After Submission, your application will be approved and your certificate will be sent to your email for your use, incase if you didn't get an email proceed to check your dashboard. You can print at liberty.</p>
            </div>
          </div>
          <div class="text-center">
            <button class="how-to-apply-get-started-button">GET STARTED</button>
          </div>
        </div>
      </section>

      <section class="services-section">
        <div class="container">
          <h2 class="services-title">AVAILABLE E-SERVICES</h2>
          <div class="service-cards-grid">
            <!-- Service Card 1 -->
            <a href="#" class="service-card card-animate">
              <div class="icon-container">
                <img :src="birthCertificateIcon" alt="Birth Certificate" class="service-icon" />
              </div>
              <h3 class="service-title">Birth Certificate</h3>
            </a>
            <!-- Service Card 2 -->
            <a href="#" class="service-card card-animate">
              <div class="icon-container">
                <img :src="deathCertificateIcon" alt="Death Certificate" class="service-icon" />
              </div>
              <h3 class="service-title">Death Certificate</h3>
            </a>
            <!-- Service Card 3 -->
            <a href="#" class="service-card card-animate">
              <div class="icon-container">
                <img :src="localGovIdIcon" alt="Local Government ID" class="service-icon" />
              </div>
              <h3 class="service-title">Local Government ID</h3>
            </a>
            <!-- Service Card 4 -->
            <a href="#" class="service-card card-animate">
              <div class="icon-container">
                <img :src="clubRegistrationIcon" alt="Club/Assoc. Registration" class="service-icon" />
              </div>
              <h3 class="service-title">Club/Assoc. Registration</h3>
            </a>
            <!-- Service Card 5 -->
            <a href="#" class="service-card card-animate">
              <div class="icon-container">
                <img :src="wasteManagementIcon" alt="Waste Management Fees" class="service-icon" />
              </div>
              <h3 class="service-title">Waste Management Fees</h3>
            </a>
            <!-- Service Card 6 -->
            <a href="#" class="service-card card-animate">
              <div class="icon-container">
                <img :src="streetRegistrationIcon" alt="Street Registration" class="service-icon" />
              </div>
              <h3 class="service-title">Street Registration</h3>
            </a>
            <!-- Service Card 7 -->
            <a href="#" class="service-card card-animate">
              <div class="icon-container">
                <img :src="ticketingIcon" alt="Ticketing" class="service-icon" />
              </div>
              <h3 class="service-title">Ticketing</h3>
            </a>
            <!-- Service Card 8 -->
            <a href="#" class="service-card card-animate">
              <div class="icon-container">
                <img :src="otherFeesIcon" alt="Other Fees" class="service-icon" />
              </div>
              <h3 class="service-title">Other Fees</h3>
            </a>
          </div>
        </div>
      </section>

      <section id="faq" class="content-section bg-light-gray">
        <div class="container">
          <h2 class="section-title">Frequently Asked Questions</h2>
          <div class="faq-items">
            <!-- FAQ Item 1 -->
            <div class="faq-item">
              <div class="faq-question-row" @click="faq1Open = !faq1Open">
                <h3 class="faq-question">How do I apply for my State of Origin Certificate?</h3>
                <span class="faq-toggle-icon" :class="{ 'open': faq1Open }">▼</span> <!-- Down arrow icon -->
              </div>
              <div class="faq-answer" :class="{ 'open': faq1Open }">
                <p>To apply for your State of Origin Certificate, navigate to the "How to Apply" section on our website. Follow the four simple steps outlined there, which include creating an account, filling in your details, uploading supporting documents, and finally obtaining your certificate.</p>
              </div>
            </div>
            <!-- FAQ Item 2 -->
            <div class="faq-item">
              <div class="faq-question-row" @click="faq2Open = !faq2Open">
                <h3 class="faq-question">After login, what is next?</h3>
                <span class="faq-toggle-icon" :class="{ 'open': faq2Open }">▼</span>
              </div>
              <div class="faq-answer" :class="{ 'open': faq2Open }">
                <p>After logging in to your account, the next step is to navigate to the service you require, such as the State of Origin Certificate application. You will then be prompted to fill out the necessary forms and upload the required documents as per the application process.</p>
              </div>
            </div>
            <!-- FAQ Item 3 -->
            <div class="faq-item">
              <div class="faq-question-row" @click="faq3Open = !faq3Open">
                <h3 class="faq-question">How long should I wait before getting my certificate?</h3>
                <span class="faq-toggle-icon" :class="{ 'open': faq3Open }">▼</span>
              </div>
              <div class="faq-answer" :class="{ 'open': faq3Open }">
                <p>The processing time for your certificate application may vary. However, we strive to process applications as efficiently as possible. You will receive a notification via email once your certificate is ready. You can also track the status of your application in your dashboard after logging in.</p>
              </div>
            </div>
          </div>
          <div class="text-center">
            <button class="faq-read-more-button">READ MORE</button>
          </div>
        </div>
      </section>

      <section id="contact" class="content-section">
        <div class="container">
          <h2 class="section-title">Contact Us</h2>
          <p class="section-description text-center">If you have any questions or need assistance, please feel free to contact us through the following channels:</p>
          <div class="contact-buttons">
            <!-- Contact Button 1 - Chat with us -->
            <a href="#" class="contact-button card-animate">
              <div class="contact-icon-container">
                <img src="../assets/img.png" alt="WhatsApp Icon" class="contact-icon" /> <!-- Placeholder Icon -->
              </div>
              <span class="contact-button-text">Chat with us</span>
            </a>
            <!-- Contact Button 2 - Email us -->
            <a href="#" class="contact-button card-animate">
              <div class="contact-icon-container">
                <img src="../assets/img.png" alt="Email Icon" class="contact-icon" /> <!-- Placeholder Icon -->
              </div>
              <span class="contact-button-text">Email us</span>
            </a>
            <!-- Contact Button 3 - Call us -->
            <a href="#" class="contact-button card-animate">
              <div class="contact-icon-container">
                <img src="../assets/img.png" alt="Call Icon" class="contact-icon" /> <!-- Placeholder Icon -->
              </div>
              <span class="contact-button-text">Call us</span>
            </a>
          </div>
        </div>
      </section>

      

     
    </main>

    <Footer />
  </div>
</template>

<script setup>
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';

// Example icons - replace with actual paths in your assets/icons folder
import birthCertificateIcon from '../assets/img.png'; // Using ../assets/img.png as placeholder icons
import deathCertificateIcon from '../assets/img.png';
import localGovIdIcon from '../assets/img.png';
import clubRegistrationIcon from '../assets/img.png';
import wasteManagementIcon from '../assets/img.png';
import streetRegistrationIcon from '../assets/img.png';
import ticketingIcon from '../assets/img.png';
import otherFeesIcon from '../assets/img.png';

import { ref } from 'vue';

const handleRequestService = () => {
  alert('Request Service Clicked!');
};
const handleManageRequests = () => {
  alert('Manage Requests Clicked!');
};
const handleCheckStatus = () => {
  alert('Check Status Clicked!');
};

// FAQ Accordion State
const faq1Open = ref(false);
const faq2Open = ref(false);
const faq3Open = ref(false);

</script>

<style scoped>
/* Styles are now defined in src/style.css, no need for scoped styles here unless component-specific */
.feature-cards-section {
  padding-bottom: 4rem; /* Increased padding */
}

.feature-cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

@media (min-width: 768px) {
  .feature-cards-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Slick Feature Card Styles */
.feature-card {
  background-color: white;
  padding: 1.75rem; /* Increased padding */
  border-radius: 0.75rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12); /* Slightly stronger shadow */
  text-align: center;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.feature-card-middle {
  background-color: var(--feature-card-mid-color);
}

.feature-card:hover {
  box-shadow: 0 9px 18px rgba(0, 0, 0, 0.22); /* Stronger shadow on hover */
  transform: scale(1.04); /* Slightly more scale up */
}

.card-title {
  font-size: 1.4rem; /* Larger title */
  font-weight: bold;
  margin-bottom: 1.1rem; /* Adjusted margin */
  color: var(--text-color-dark);
}

.card-description {
  color: var(--text-color-gray);
  margin-bottom: 1.5rem; /* Increased spacing */
  line-height: 1.7; /* Improved line height */
}

.feature-button {
  background-color: var(--feature-button-color); /* Use variable for button color */
  color: white;
  font-weight: bold;
  padding: 0.8rem 1.7rem; /* Further adjusted button padding */
  border: none;
  border-radius: 0.4rem; /* Slightly more rounded button corners */
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 1rem; /* Ensure button font size is reasonable */
}

.feature-button:hover {
  background-color: #005f52; /* Darken on hover */
}

.feature-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 100, 82, 0.5);
}

.services-section {
  background-color: var(--light-gray);
  padding-top: 4rem;
  padding-bottom: 4rem;
}

.services-title {
  font-size: 2.2rem; /* Larger service title */
  font-weight: bold;
  color: var(--primary-green);
  text-align: center;
  margin-bottom: 3rem; /* Increased spacing */
}

.service-cards-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-row: repeat(2, 1fr);
  gap: 2rem; /* Increased gap */
}

/* Service Card Styles */
.service-card {
  background-color: white;
  padding: 1.5rem; /* Increased padding */
  border-radius: 0.75rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* Slightly stronger shadow */
  text-align: center;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
  display: block; /* To make <a> tag fill the card area */
  text-decoration: none; /* Remove underline from link */
  color: inherit; /* Inherit text color from parent */
}

.service-card:hover {
  box-shadow: 0 7px 15px rgba(0, 0, 0, 0.2); /* Stronger shadow on hover */
  transform: translateY(-6px); /* More vertical lift */
}


.icon-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem; /* Increased spacing */
}

.service-icon {
  height: 50px; /* Further increased icon size */
  width: 50px;
}

.service-title {
  font-size: 1.2rem; /* Larger service title */
  font-weight: bold;
  margin: 0;
  color: var(--text-color-dark);
}
</style>