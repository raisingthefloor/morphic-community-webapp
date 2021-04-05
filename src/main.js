import Vue from "vue";
import Vuex from "vuex";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { BootstrapVue, BootstrapVueIcons } from "bootstrap-vue";
import Vuelidate from "vuelidate";
import { VueReCaptcha } from "vue-recaptcha-v3";
import { HTTP } from "@/services/index";
import { icons } from "@/utils/constants";
import * as Bar from "@/utils/bar";
import { CONFIG } from "@/config/config";
import externalLinks from "@/config/externalLinks";
import { getErrorMessage } from "@/utils/errorHandler";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import i18n from "./i18n/i18n";

const token = localStorage.getItem("token");
if (token) {
    HTTP.defaults.headers.common.Authorization = `Bearer ${token}`;
}

HTTP.interceptors.response.use(undefined, function (err) {
    return new Promise((resolve, reject) => {
        if (err.message.indexOf("401") > 1) {
            store.dispatch("logout");
            resolve();
        }
        throw err;
    });
});

Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);
Vue.use(Vuelidate);
Vue.use(Vuex);
if (CONFIG.RECAPTCHA_SITEKEY) {
    Vue.use(VueReCaptcha, {
        siteKey: CONFIG.RECAPTCHA_SITEKEY
    });
}

var toastSheet;

Vue.mixin({
    methods: {
        getErrorMessage: getErrorMessage,
        /**
         * Makes an array from value, if it's not an array.
         * @param {Array|Object} value The value.
         * @return {Array} The value if it's an array, otherwise an array containing the value.
         */
        makeArray(value) {
            return (value === null || value === undefined)
                ? []
                : (Array.isArray(value) ? value : [value]);
        },
        showMessage(message, title, options) {

            if (!toastSheet) {
                const navHeight = document.querySelector("#top .navbar-nav").getBoundingClientRect().bottom;
                toastSheet = document.createElement("style");
                toastSheet.innerHTML = `.toast-height {margin-top:${navHeight}px}`;
                document.body.appendChild(toastSheet);
            }

            this.$root.$bvToast.toast(message, Object.assign({
                variant: "success",
                title: title,
                noCloseButton: !title,
                toastClass: "toast-height",
                toaster: "b-toaster-top-center"
            }, options));
        },

        showError(message, title, options) {
            this.$root.$bvToast.toast(message, Object.assign({
                variant: "danger",
                title: title,
                toaster: "b-toaster-top-center",
                autoHideDelay: 30000,
                solid: true
            }, options));
        },

        /**
         * Shows a modal message with yes/no buttons.
         *
         * Wrapper for $bvModal.msgBoxConfirm.
         *
         * @see https://bootstrap-vue.org/docs/components/modal#modal-message-boxes
         * @param {String} message The main message.
         * @param {Array<String>} [buttons] Text for the two buttons (default: ["Yes","No"])
         * @param {String} [title] A title for the dialog.
         * @param {BvMsgBoxOptions} options Options passed to $bvModal.msgBoxConfirm (b-modal props)
         * @return {Promise<Boolean>} Resolve to true for 'yes'
         */
        showConfirm(message, buttons, title, options) {
            return this.$bvModal.msgBoxConfirm(message, Object.assign({
                title: title,
                okTitle: (buttons && buttons[0]) || "Yes",
                cancelTitle: (buttons && buttons[1]) || "No",
                centered: true
            }, options));
        },

        /**
         * Displays a modal dialog, resolving when the dialog is dismissed.
         * @param {String} modalId The id of the modal dialog.
         * @return {Promise<String>} Resolves with the trigger value of the modal's hide event.
         */
        showModalDialog(modalId) {
            return new Promise((resolve, reject) => {

                const onHide = (event, id) => {
                    if (id === modalId) {
                        resolve(event.trigger);
                        this.$root.$off("bv::modal::hide", onHide);
                    }
                };

                this.$root.$on("bv::modal::hide", onHide);

                this.$bvModal.show(modalId);
            });

        },

        /**
         * Gets the url of an icon
         * @param {String} image The icon identified (from image_url)
         * @return {String} The url.
         */
        getIconUrl(image) {
            var togo;
            if (image) {
                if (image.includes("/")) {
                    togo = image;
                } else {
                    if (!image.includes(".")) {
                        togo = icons[image];
                    }
                    togo = "/icons/" + togo;
                }
            }
            return togo;
        },
        /**
         * Generates an ID for a button.
         * @param {BarItem} item The button.
         * @return {String} The ID.
         */
        generateId(item) {
            if (typeof(item) === "string") {
                return item + Math.floor(Math.random() * 10e10);
            } else {
                return Bar.generateId(item);
            }
        },

        /**
         * Gets the recaptcha token.
         * @param {String} action The recaptcha action.
         * @return {Promise<String>} Resolves with the token.
         */
        async getRecaptchaToken(action) {
            if (this.$recaptchaLoaded) {
                await this.$recaptchaLoaded();
                return await this.$recaptcha(action);
            }
        },

        /**
         * Show or hide the recaptcha badge (this needs to be shown when the token is used for something).
         * @param {Boolean} show true to show.
         */
        showRecaptchaBadge(show) {
            document.body.classList.toggle("show-recaptcha", !!show);
        },

        /**
         * Validates a form, sets the focus to the first invalid field.
         * @param {Object} model The validation model (this.$v, or a validation group within it)
         * @return {Boolean} true if the form is valid.
         */
        validateForm(model) {
            model.$touch();
            const valid = !model.$anyError;
            if (!valid) {
                const field = this.$el.querySelector(".is-invalid, :invalid");
                if (field) {
                    field.focus();
                }
            }

            return valid;
        }
    },
    mounted() {
        // Hide the badge by default.
        this.showRecaptchaBadge(false);

        // Apply the production-only condition
        document.body.classList.toggle("production", this.CONFIG.PRODUCTION);
    },
    computed: {
        /**
         * Determines if the page is currently in focused mode.
         * @return {Boolean} true if in focus mode.
         */
        focusMode: function () {
            return this.$route.path.includes("/focused/");
        },
        isLoggedIn: function () { return this.$store.getters.isLoggedIn; },
        hasAccount: function () { return this.$store.getters.hasAccount; },
        communityId: function () { return this.$store.getters.communityId; },
        userId: function () { return this.$store.getters.userId; },
        console: () => console,
        CONFIG: () => CONFIG,
        externalLinks: () => externalLinks
    }
});

Vue.config.productionTip = false;
new Vue({
    router,
    store,
    i18n,
    render: h => h(App)
}).$mount("#app");
