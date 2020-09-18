<template>
  <div>
    <b-navbar class="pb-3 pt-3" toggleable="lg" type="light" variant="light" id="top">
      <h1>
        <b-navbar-brand to="/" title="Morphic Community">
          <img src="/img/logo-color.svg" alt="logo">
          Morphic Community
        </b-navbar-brand>
      </h1>

      <b-navbar-nav class="mr-auto">
        <b-nav-item to="/dashboard/" v-if="isLoggedIn" exact-active-class="active"><b>Dashboard</b></b-nav-item>
      </b-navbar-nav>

      <b-navbar-nav>
        <!--
        <b-nav-item v-if="isLoggedIn" exact-active-class="active" to="/my-community">
          <b-icon-person-fill></b-icon-person-fill>
          My Community
        </b-nav-item>
        -->
        <b-nav-item v-if="isLoggedIn" @click="logout">
          <b-icon-box-arrow-in-right></b-icon-box-arrow-in-right>
          Logout
        </b-nav-item>
      </b-navbar-nav>
    </b-navbar>
  </div>
</template>

<style>
  nav#top {
    margin: 1rem 0 0 0;
    border-radius: .3rem;
  }

  nav#top a.nav-link:focus {
    outline: 0;
  }
  nav#top a.nav-link.active {
    color: white;
    background: #002957;
    border-bottom: 3px solid #84c661;
  }

  .navbar-brand img {
    height: 2rem;
  }
</style>

<script>
import { MESSAGES } from '@/utils/constants'

export default {
  computed: {
    isLoggedIn: function () { return this.$store.getters.isLoggedIn },
    disableLogout: function () { return this.$store.getters.unsavedChanges }
  },
  methods: {
    logout: function () {
      if (this.disableLogout) {
        window.confirm(MESSAGES.logoutAlert)
      } else {
        this.$store.dispatch('logout')
          .then(() => {
            this.$router.push('/')
          })
      }
    }
  }
}
</script>
