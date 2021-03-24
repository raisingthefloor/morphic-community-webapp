<template>
  <b-container fluid id="PageContainer" :class="focusMode ? 'focusMode' : 'dashboardMode'">
    <Header />
    <router-view />
    <Footer />
  </b-container>
</template>

<style lang="scss">
  $primary-color: #002957;
  $secondary-color: #84c661;

  body {
    font-family: 'Open Sans', sans-serif !important;
      a {
          color: #005BDF
      }
  }

  .fill-height {
    min-height: 100%;
  }
  .btn-primary {
    background-color: $primary-color !important;
    border-color: $primary-color !important;
  }
  .btn-success {
    background-color: $secondary-color !important;
    border-color: $secondary-color !important;
  }

  .bg-silver {
    background: #eee;
  }

  .text-bronze {
    color: #cd7f32;
  }

  .text-gold {
    color: gold;
  }

  .text-silver {
    color: silver;
  }

  .rounded {
    border-radius: 1rem;
  }

  #PageContainer {
    padding: 0;
  }

  .desktop {
    background: url(/img/background-editor.png);
    position: relative;
    display: flex;

    .preview-bar {
      padding-bottom: 5rem;
    }

    .openDrawerIconHolder {
      cursor: pointer;
      .b-icon {
        // margin-left: -19px;
        right: 104px;
        font-size: 2em;
        position: absolute;
        bottom: 25px;
        background: black;
        color: white;
        border-radius: 100%;
        border: 1px solid black;
      }
    }
  }

  .logoHolder {
    padding-top: 15px;
    padding-bottom: 15px;

    img {
      width: 3rem;
      height: 3rem;
    }
  }

  button.btn.btn-link {
    padding: 0;
    vertical-align: baseline;
    text-align: left;
  }

  // this is shown when the recaptcha token is used by getRecaptchaToken()
  body:not(.show-recaptcha) .grecaptcha-badge {
    visibility: hidden;
  }

  // hide things that are not production-ready, or vice-versa
  body.production .notProduction, body:not(.production) .onlyProduction {
    display: none;
  }
</style>

<script>
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { loadLocaleMessagesAsync } from "@/i18n/i18n";
export default {
    name: "App",

    components: {
        Header,
        Footer
    },
    data() {
        return {
            loaded: false
        };
    },
    mounted() {
        const work = [];
        // Set the locale to the lang= parameter on the URL, or use what was detected.
        const locale = this.$route.query.lang || this.$i18n.locale;
        work.push(this.setLocale(locale));
        Promise.all(work).then(() => {
            this.loaded = true;
        });
    },
    methods: {
        /**
         * Set the local of the page.
         * @param {String} locale Identifier of the locale.
         * @return {Promise<String>} Resolves when complete.
         */
        setLocale(locale) {
            return loadLocaleMessagesAsync(locale).catch(() => {
                // Let the page load anyway.
            });
        }
    }
};
</script>
