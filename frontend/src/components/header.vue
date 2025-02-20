<template>
  <header class="website-header">
    <div class="container header-content">
      <div class="logo-area">
        <img src="../assets/img.png" alt="Logo" class="logo-image" /> <!-- Using ../assets/img.png for logo -->
      </div>
      <nav class="header-nav">
        <a href="#" class="nav-link">Home</a>
        <a href="#about" class="nav-link">About</a>
        <a href="#how-to-apply" class="nav-link">How to Apply</a>
        <a href="#" class="nav-link">Verify</a>
        <a href="#" class="nav-link">Support</a>
        <a href="#" class="nav-link">Login</a>
        <button class="header-apply-button">APPLY NOW</button>
      </nav>
    </div>
  </header>
</template>

<script setup>
import logo from '../assets/img.png'; // Example import, adjust path - using ../assets/img.png
</script>

<style scoped>
/* Styles are now defined in src/style.css, no need for scoped styles here unless component-specific */
</style>