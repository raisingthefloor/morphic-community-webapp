<template>
  <div>
    <b-navbar class="pb-3 pt-3" toggleable="lg" type="light" variant="light" id="top" ref="nav" tag="header">
      <b-navbar-brand to="/" :title="$t('Header.navbar-branding_title')">
        <img src="/img/logo-color.svg" alt="logo">
        <span v-t="'Header.navbar-branding'" class="ml-2" />
      </b-navbar-brand>

      <b-navbar-nav class="mr-auto">
        <b-nav-item :href="dashboardUrl" :active="!focusMode" v-if="isLoggedIn" exact-active-class="active"><b v-t="'Header.dashboard_link'" /></b-nav-item>
        <b-nav-item :href="focusedUrl" :active="focusMode" v-if="isLoggedIn" exact-active-class="active"><b v-t="'Header.focus-mode_link'" /></b-nav-item>
      </b-navbar-nav>

      <b-navbar-nav>
        <!--
        <b-nav-item v-if="isLoggedIn" exact-active-class="active" to="/my-community">
          <b-icon-person-fill></b-icon-person-fill>
          My Group
        </b-nav-item>
        -->
        <b-nav-item v-if="isLoggedIn" @click="logout" class="logout-nav-item">
          <b-icon-box-arrow-right aria-hidden="true" />
          <span v-t="'Header.logout_link'" />
        </b-nav-item>
      </b-navbar-nav>
    </b-navbar>
  </div>
</template>

<style lang="scss">
  header#top {

    a.nav-link:focus {
      outline: 0;
    }

    a.nav-link.active {
      color: white;
      background: #002957;
      border-bottom: 3px solid #84c661;
    }

    .logout-nav-item a.nav-link {
      color: black
    }

    .navbar-brand img {
      height: 2rem;
    }

    .mr-auto .nav-link {
      color: rgba(0, 0, 0, 0.65);
    }

  }
</style>

<script>

export default {
    computed: {
        isLoggedIn: function () {
            return this.$store.getters.isLoggedIn;
        },
        focusedUrl: function () {
            return this.getUrl(true).href;
        },
        dashboardUrl: function () {
            return this.getUrl(false).href;
        }
    },

    methods: {
        logout: function () {
            this.$store.dispatch("logout").then(() => {
                this.$router.push("/");
            });
        },
        getBarId: function () {
            return this.$route.query.barId;
        },
        getUrl: function (focused) {
            const barId = this.getBarId();
            if (barId) {
                const name = focused ? "Focused: Bar Editor" : "MorphicBar Editor";
                return this.$router.resolve({name: name, query: {barId: barId}});
            } else {
                const name = focused ? "Home: Bar and Member Page" : "Dashboard";
                return this.$router.resolve({name: name});
            }
        }
    }
};
</script>
