<template>
  <b-container v-if="loaded" fluid id="PageContainer" :class="focusMode ? 'focusMode' : 'dashboardMode'">
    <Header />
    <div role="main" id="PageContent">
      <h1 v-if="heading" id="MainHeading" :class="{screenReader: hideHeading}">{{ heading }}</h1>
      <router-view />
    </div>
    <Footer />
  </b-container>
</template>

<style lang="scss">
  $primary-color: #002957;
  $secondary-color: #028004;

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
  .btn-light {
    border-color: #333 !important;
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
    //noinspection CssUnknownTarget
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

  button.btn.btn-link, a.btn.btn-link {
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

  .alignRight {
    display: block !important;
    margin-left: auto !important;
    width: fit-content;
  }

  // Link icons
  a > .b-icon:not(.noSpace):first-child {
    margin-right: 0.25em;
  }

  #MainHeading, h1 {
    font-size: 1.7rem;
  }

  // Hide something, but keep it available for screen-readers
  .screenReader {
    position: absolute !important;
    overflow: hidden;
    width: 1px;
    height: 1px;
    clip: rect(1px, 1px, 1px, 1px);
  }
</style>

<script>
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { loadLocaleMessagesAsync } from "@/i18n/i18n";
import * as errorHandler from "@/utils/errorHandler";

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
    computed: {
        /**
         * @return {String} The main heading for the page.
         */
        heading: function () {
            return !this.$route.meta.noHeading && (this.$route.meta.heading || this.$route.meta.title);
        },
        /**
         * Determines if the heading should be hidden.
         * @return {Boolean} true to hide the header.
         */
        hideHeading: function () {
            return !this.$route.meta.showHeading && (!this.isLite || this.$route.meta.hideHeading);
        }
    },
    mounted() {
        const work = [];
        // Set the locale to the lang= parameter on the URL, or use what was detected.
        const locale = this.$route.query.lang || this.$i18n.locale;
        work.push(this.setLocale(locale));
        Promise.all(work).then(() => {
            this.loaded = true;
        });

        errorHandler.useErrorHandler(this.showError);
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
