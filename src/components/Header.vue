<template>
  <b-navbar toggleable="md" type="light" variant="light" id="top" ref="nav" tag="div" role="">
    <b-navbar-brand role="banner">
      <b-link to="/">
        <img src="/img/logo-wordmark.svg" alt="" />
      </b-link>
      <span class="headerTitle d-none"
            :class="{
               'd-xl-inline': isLite,
               'd-lg-inline': !isLite
            }"
            v-t="'Header.product-name'" />
    </b-navbar-brand>

    <template v-if="isLoggedIn">
      <b-navbar-toggle target="nav-actions" ref="navToggle"/>
      <b-collapse id="nav-actions" is-nav v-model="showMenu">
        <b-navbar-nav v-if="isLoggedIn" class="ml-auto loggedInNav">
          <b-nav-text>
            <b-button v-if="focusMode && !isMobile"
                      variant="invert-dark"
                      @click="showMenu = false; setFocusMode(false)" v-t="'Header.standard-mode_button'" />
            <b-button v-else-if="!isMobile"
                      variant="invert-dark"
                      @click="showMenu = false; setFocusMode(true)" v-t="'Header.focus-mode_button'" />
          </b-nav-text>

          <b-nav-text v-if="focusMode">
            <b-button variant="invert-dark" @click="showMenu = false; $router.push('/')" v-t="'Header.home_button'" />
          </b-nav-text>

          <b-nav-text>
            <b-button variant="invert-dark" @click="showMenu = false; logout()"><b-icon icon="box-arrow-right"/> {{ $t('Header.logout_button') }}</b-button>
          </b-nav-text>
        </b-navbar-nav>
      </b-collapse>
    </template>

    <b-navbar-nav v-else-if="$route.name !== 'Login'" class="ml-auto loggedOutNav">
      <b-nav-text>
        <b-button variant="invert-dark" :to="{name: 'Login'}"><b-icon icon="box-arrow-left"/> {{ $t('Header.login_button') }}</b-button>
      </b-nav-text>
    </b-navbar-nav>

    <!-- clicking outside the menu will close it -->
    <div v-show="showMenu" tabindex="0" class="onlyMobile modal-backdrop headerMarginTop" @focusin="$refs.navToggle && $refs.navToggle.$el.focus()" @click="showMenu = false"/>
  </b-navbar>
</template>

<style lang="scss">
  @import "~@/styles/bootstrap-util";

  #top {
    a.nav-link:focus {
      outline: 0;
    }

    a.nav-link.active {
      color: white;
      background: #002957;
      border-bottom: 3px solid #84c661;
    }

    padding-left: 0;
    padding-right: 0;
    padding-bottom: 0;

    & > :first-child {
      margin-left: 1rem;
    }

    max-width: 100%;
    overflow: hidden;

    .navbar-toggler, .navbar-collapse,  {
      margin-right: 1rem;
    }

    .navbar-brand {
      flex-grow: 0;
      margin-right: 0.5em;
      .headerTitle {
        margin-left: 2em;
        font-weight: bold;
      }
      img {
        height: 2.4rem;
      }
    }

    .loggedOutNav {
      margin-right: 1em;
    }

    #nav-actions {
      flex-grow: 1;

      .navbar-nav {
        button {
          margin-left: 1em;
          overflow: hidden;
        }
      }

      // When the buttons are collapsed, make them look like a menu
      &.navbar-collapse.show, &.navbar-collapse.collapsing {
        margin-right: 0;
        .navbar-text {
          margin: 0;
          padding: 0;
        }
        background-color: #000;
        .btn {
          text-align: left;
          margin: 0 0 -1px;

          width: 100%;
          border-radius: 0;

          font-size: 1.3em;
          padding: 0.5em 0.5em;
        }
      }
    }
  }
  body.menu-open {
    #top {
      .navbar-collapse {
        z-index: ($zindex-modal + 102);
      }

      .modal-backdrop {
        z-index: ($zindex-modal + 100);

        &:focus-within {
          background-color: red !important;
        }
      }
    }
  }
  //z-index: ($zindex-modal + 101);
</style>

<script>

export default {
    data() {
        return {
            showMenu: false
        };
    },
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

    mounted() {
        this.showMenu = false;
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
        },
        /**
         * Sets focus mode.
         * @param {Boolean} flag true to enable.
         */
        setFocusMode: function (flag) {
            this.$store.dispatch("forceFocusMode", !!flag);
        }
    },
    watch: {
        showMenu: function () {
            document.body.classList.toggle("menu-open", this.showMenu);
        }
    }
};
</script>
