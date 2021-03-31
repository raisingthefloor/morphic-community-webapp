<template>
  <b-navbar class="pb-3 pt-3" toggleable="lg" type="light" variant="light" id="top" ref="nav" tag="div" role="">
    <b-navbar-brand to="/" role="banner">
      <img src="/img/logo-color.svg" alt="">
      <span v-t="'Header.navbar-branding'" class="ml-2" />
    </b-navbar-brand>

    <b-navbar-nav v-if="$route.name !== 'Login'" role="navigation">
      <b-nav-item :href="dashboardUrl" :active="!focusMode" v-if="isLoggedIn" exact-active-class="active"><b v-t="'Header.dashboard_link'" /></b-nav-item>
      <b-nav-item :href="focusedUrl" :active="focusMode" v-if="isLoggedIn" exact-active-class="active"><b v-t="'Header.focus-mode_link'" /></b-nav-item>

      <b-nav-item v-if="isLoggedIn" @click="logout" class="logout-nav-item">
        <b-icon-box-arrow-right aria-hidden="true" />&nbsp;
        <span v-t="'Header.logout_link'" />
      </b-nav-item>
      <b-nav-item v-else href="#/login" class="logout-nav-item">
        <b-icon-box-arrow-in-right aria-hidden="true" />&nbsp;
        <span v-t="'Header.login_link'" />
      </b-nav-item>
    </b-navbar-nav>
  </b-navbar>
</template>

<style lang="scss">
  #top {
    display: flex;

    .navbar-nav {
      flex-grow: 1;
      & > :last-child {
        margin-left: auto;
      }
    }

    a.nav-link:focus {
      outline: 0;
    }

    a.nav-link.active {
      color: white;
      background: #002957;
      border-bottom: 3px solid #84c661;
    }

    .logout-nav-item {
      a.nav-link {
        color: black;
      }
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
