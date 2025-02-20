<template>
  <div class="login-container">
    <h2>Admin Login</h2>
    <form @submit.prevent="login">
      <input v-model="username" type="text" placeholder="Enter Username" required />
      <input v-model="password" type="password" placeholder="Enter Password" required />
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: ''
    };
  },
  methods: {
    async login() {
  try {
    console.log('Sending:', { username: this.username, password: this.password });

    const response = await fetch('http://localhost:5000/api/admin/otheradmins/login', { // ✅ Full URL
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: this.username,
        password: this.password
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json(); // ✅ Directly parse JSON
    console.log('Parsed Response:', data);

    if (data.token) {
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('role', data.role);
      this.$router.push(
        data.role === 'clusteradmin' ? '/cluster-admin' : '/bursury-admin'
      );
    } else {
      alert('Login failed.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
}
  }
};
</script>

<style scoped>
/* Add your styles here */
</style>
