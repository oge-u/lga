<template>
  <button @click="logout">Log Out</button>
</template>

<script>
export default {
  methods: {
    logout() {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('role');
      this.$router.push('/'); // Redirect to login page
    }
  }
};
</script>
