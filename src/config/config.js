
const href = new URL(location.href);

var ENV;
if (href.host === "communitynew.morphic.dev") {
    // Hack to force the dev site to always use the dev api server.
    ENV = "DEVELOPMENT";
} else {
    ENV = process.env.NODE_ENV ? process.env.NODE_ENV.toUpperCase() : "LOCAL";
}


const CONF = {
    LOCAL: {
        // Local development server will redirect all API requests (/v1/*) to the local API server (see vue.config.js)
        API_URL: process.env.VUE_APP_API_URL ?? new URL(location.href).origin
    },
    DEVELOPMENT: {
        API_URL: "https://api.morphic.dev"
    },
    PRODUCTION: {
        API_URL: "https://api.morphic.org"
    }
};

export const CONFIG = CONF[ENV];
export const RECAPTCHATOKEN = '6LcAv7cZAAAAAFeZSLJK2JnKRp8PmD266Wgp-pDy'
