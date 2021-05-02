<template>
  <b-container v-if="loaded" fluid id="PageContainer" :class="focusMode ? 'focusMode' : 'dashboardMode'">
    <Header />
    <router-view role="main" />
    <Footer />
  </b-container>
</template>

<style lang="scss">
  @import "styles/variables";

  body {
    font-family: 'Open Sans', sans-serif !important;
  }

  #PageContainer {
    padding: 0;
  }

  // this is shown when the recaptcha token is used by getRecaptchaToken()
  body:not(.show-recaptcha) .grecaptcha-badge {
    visibility: hidden;
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
            loaded: false,
            /** @type {MediaQueryList} */
            mobileMatchMedia: null
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

        errorHandler.useErrorHandler(this.showError);

        this.detectMobile();
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
        },

        /**
         * Detects if the device could be a mobile device, and monitors the state.
         * $store.isMobile will be updated to match the current state.
         */
        detectMobile() {
            if (!this.mobileMatchMedia) {
                this.mobileMatchMedia = window.matchMedia("only screen and (max-width: 640px)");
                if (this.mobileMatchMedia.addEventListener) {
                    this.mobileMatchMedia.addEventListener("change", this.detectMobile);
                } else {
                    this.mobileMatchMedia.addListener(this.detectMobile);
                }
            }

            this.$store.commit("isMobile", this.mobileMatchMedia.matches);
        }
    }
};
</script>
