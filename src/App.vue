<template>
  <b-container v-if="loaded" fluid id="PageContainer">
    <Header />
    <router-view role="main" class="main" />
    <Footer />
  </b-container>
</template>

<style lang="scss">
  @import "styles/variables";

  body {
    font-family: 'Open Sans', sans-serif !important;
  }

  // this is shown when the recaptcha token is used by getRecaptchaToken()
  body:not(.show-recaptcha) .grecaptcha-badge {
    visibility: hidden;
  }

  // Put the footer at the bottom of the viewport, if the page is too short
  body {
    height: 100vh;
  }
  #PageContainer {
    padding: 0;
    display: flex;
    flex-direction: column;
    min-height: 100%;

    .main {
      flex-grow: 1;
    }
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
            mobileMatchMedia: null,
            headerHeight: 0,
            headerHeightStyle: null
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

        this.getHeaderHeight();
    },
    computed: {
        /**
         * Gets the classes for the body element.
         * @return {Object} The classes.
         */
        bodyClasses: function () {
            return {
                focusMode: this.focusMode,
                dashboardMode: !this.focusMode,
                isMobile: this.isMobile
            };
        }
    },
    watch: {
        bodyClasses: {
            deep: true,
            /**
             * Sets the classes of the body element, based on `this.bodyClasses`.
             */
            handler: function () {
                const add = [];
                const remove = [];
                for (const [key, value] of Object.entries(this.bodyClasses)) {
                    (value ? add : remove).push(key);
                }
                document.body.classList.remove(...remove);
                document.body.classList.add(...add);
            }
        }
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
                this.mobileMatchMedia = window.matchMedia("only screen and (max-width: 767.98px)");
                if (this.mobileMatchMedia.addEventListener) {
                    this.mobileMatchMedia.addEventListener("change", this.detectMobile);
                } else {
                    this.mobileMatchMedia.addListener(this.detectMobile);
                }
            }

            this.$store.commit("isMobile", this.mobileMatchMedia.matches);
        },

        getHeaderHeight() {
            const content = document.querySelector("#PageContainer > #top");
            let height = -1;
            if (content) {
                height = content.getBoundingClientRect().height;

                if (height !== this.headerHeight) {

                    if (!this.headerHeightStyle) {
                        this.headerHeightStyle = document.createElement("style");
                        document.head.appendChild(this.headerHeightStyle);
                    }

                    const styleSheet = this.headerHeightStyle.sheet;
                    styleSheet.insertRule(`.headerMarginTop { margin-top: ${height}px; }`);
                    this.headerHeight = height;
                }
            }
            console.log(height);
            // setTimeout(() => this.getHeaderHeight(), 1000);
        }
    }
};
</script>
