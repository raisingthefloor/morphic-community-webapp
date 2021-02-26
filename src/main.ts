import Vue from "vue";
import Vuex from "vuex";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { BootstrapVue, BootstrapVueIcons } from "bootstrap-vue";
// @ts-ignore
import Vuelidate from "vuelidate";
import { HTTP } from "@/services/index";
import { icons } from "@/utils/constants";
import * as Bar from "@/utils/bar";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

const token = localStorage.getItem("token");
if (token) {
    HTTP.defaults.headers.common.Authorization = `Bearer ${token}`;
}

HTTP.interceptors.response.use(undefined, function (err) {
    return new Promise<void>((resolve, reject) => {
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

var toastSheet: HTMLStyleElement;

Vue.mixin({
    methods: {
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
                const nav = document.querySelector("nav#top .navbar-nav");
                if (nav) {
                    const navHeight = nav.getBoundingClientRect().bottom;
                    toastSheet = document.createElement("style");
                    toastSheet.innerHTML = `.toast-height {margin-top:${navHeight}px}`;
                    document.body.appendChild(toastSheet);
                }
            }

            this.$root.$bvToast.toast(message, Object.assign({
                variant: "success",
                title: title,
                noCloseButton: !title,
                toastClass: "toast-height",
                toaster: "b-toaster-top-center"
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
            return Bar.generateId(item);
        }

    },
    computed: {
        /**
         * Determines if the page is currently in focused mode.
         * @return {Boolean} true if in focus mode.
         */
        focusMode: function () {
            // @ts-ignore
            return this.$route.path.includes("/focused/");
        },
        // @ts-ignore
        communityId: function () { return this.$store.getters.communityId; },
        // @ts-ignore
        userId: function () { return this.$store.getters.userId; },
        console: () => console
    }
});

Vue.config.productionTip = false;
new Vue({
    router,
    store,
    render: h => h(App)
}).$mount("#app");
