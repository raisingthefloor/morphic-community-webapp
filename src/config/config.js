
const href = new URL(location.href);

var ENV;
if (href.host === "communitynew.morphic.dev") {
    // Hack to force the dev site to always use the dev api server.
    ENV = "DEVELOPMENT";
} else {
    ENV = process.env.NODE_ENV ? process.env.NODE_ENV.toUpperCase() : "LOCAL";
}

/**
 * @typedef {Object} CONFIG
 * @property {String} API_URL The API server.
 * @property {String} RECAPTCHA_SITEKEY Site key for recaptcha.
 */

/**
 * @type {Object<String,CONFIG>}
 */
const CONF = {
    // Applies to all environments, unless overridden
    BASE: {
        RECAPTCHA_SITEKEY: "6LcAv7cZAAAAAFeZSLJK2JnKRp8PmD266Wgp-pDy"
    },

    // Local development (npm run dev)
    LOCAL: {
        // Local development server will redirect all API requests (/v1/*) to the local API server (see vue.config.js)
        API_URL: process.env.VUE_APP_API_URL ?? new URL(location.href).origin,
        // Valid for ste-test.net: to test locally, use localhost.ste-test.net
        RECAPTCHA_SITEKEY: href.host.match(/^[0-9.:]+$/) ? null : "6LcgxGoaAAAAACb4-Sdm1xj5UWQiuyYAieFZUhL4"
    },

    // "live" development (https://communitynew.morphic.dev)
    DEVELOPMENT: {
        API_URL: "https://api.morphic.dev"
    },

    // production
    PRODUCTION: {
        API_URL: "https://api.morphic.org"
    }
};

/**
 * @type {CONFIG}
 */
export const CONFIG = Object.assign({}, CONF.BASE, CONF[ENV]);
