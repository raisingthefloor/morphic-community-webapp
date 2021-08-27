import Vue from "vue";
import VueRouter from "vue-router";
import store from "@/store";

// General Marketing, Login and Register Components
import Home from "@/views/Home.vue";
import Registration from "@/views/Registration";

import ResetPassword from "@/views/ResetPassword.vue";

import MyCommunity from "@/views/MyCommunity.vue";
import MyCommunities from "@/views/MyCommunities.vue";

import Plans from "@/views/billing/Plans.vue";
import BillingDetails from "@/views/billing/BillingDetails.vue";
import NoSubscription from "@/views/billing/NoSubscription.vue";

import EarlyReleaseProgram from "@/views/billing/EarlyReleaseProgram.vue";

// Dashboard Components
import Dashboard from "@/views/Dashboard.vue";
import MorphicBarPreconfigured from "@/views/MorphicBarPreconfigured.vue";
import MorphicBarEditor from "@/views/MorphicBarEditor.vue";

import RegistrationInvite from "@/views/RegistrationInvite";

// Email call-backs
import AcceptInvite from "@/views/email/AcceptInvite.vue";

Vue.use(VueRouter);

/**
 * Meta-data for a route.
 *
 * All pages require authentication, unless explicitly stated otherwise with the `public` field.
 *
 * @typedef {Object} RouteMeta
 * @property {String} title The page title.
 * @property {String} heading The page heading (if different to the title).
 * @property {Boolean} noHeading Do not render the heading.
 * @property {Boolean} showHeading Do not show the heading.
 *
 * @property {Boolean|"only"} public true if this page can be accessed without authentication. "only" if it can only
 *  be accessed without authentication (authenticated users are redirected away).
 * @property {Boolean} noAccount true if an authenticated user with no account can access.
 * @property {Boolean} redirect true if this is not a real page, just used to redirect to another (hides routing errors).
 * @property {Boolean} authHome true if this the default home page for authenticated users ("/dashboard").
 * @property {Boolean} home true if this the home page ("/").
 */

/**
 * @typedef {RouteRecord} AppRouteRecord
 * @property {RouteMeta} meta Extra route data
 */

/**
 * @type {Array<AppRouteRecord>}
 */
const routes = [
    {
        // Redirects to /login or /dashboard (or whatever the user's home page is)
        path: "/",
        name: "Home",
        meta: {
            home: true,
            public: true,
            redirect: true
        }
    },
    {
        path: "/login",
        name: "Login",
        component: Home,
        meta: {
            title: "Sign in to Morphic",
            noHeading: true,
            public: "only"
        }
    },
    {
        path: "/session-timed-out",
        name: "Home-session-timed-out",
        component: Home,
        props: { messageId: "sessionTimedOut" },
        meta: {
            title: "Home",
            public: "only"
        }
    },
    {
        path: "/my-community",
        name: "MyCommunity",
        component: MyCommunity,
        meta: {
            title: "My Community",
            showHeading: true
        }
    },
    {
        path: "/my-communities",
        name: "MyCommunities",
        component: MyCommunities,
        meta: {
            title: "My Groups"
        }
    },
    {
        path: "/billing/plans",
        name: "Plans",
        component: Plans,
        meta: {
            title: "Plans"
        }
    },
    {
        path: "/billing/no-subscription",
        name: "NoSubscription",
        component: NoSubscription,
        meta: {
            title: "No Subscription",
            showHeading: true,
            noAccount: true
        }
    },
    {
        path: "/early-release-program",
        name: "EarlyReleaseProgram",
        component: EarlyReleaseProgram,
        meta: {
            title: "MorphicBar Early Release Program",
            showHeading: true,
            public: true
        }
    },
    {
        path: "/early-release-program/join",
        name: "EarlyReleaseProgram.Join",
        component: EarlyReleaseProgram,
        meta: {
            title: "MorphicBar Early Release Program",
            noAccount: true
        }
    },
    {
        path: "/billing/details",
        name: "BillingDetails",
        component: BillingDetails,
        meta: {
            title: "Billing"
        }
    },
    {
        path: "/reset-password",
        name: "Reset Password",
        component: ResetPassword,
        meta: {
            title: "Reset Password",
            public: "only"
        }
    },

    // Dashboard mockups, needs to be properly renamed and re-arranged when starting to implement the API
    {
        path: "/dashboard",
        name: "Dashboard",
        component: Dashboard,
        meta: {
            title: "Home: MorphicBar Customization Tool",
            authHome: true
        }
    },
    {
        path: "/dashboard/morphicbar-preconfigured",
        name: "MorphicBar Preconfigured",
        component: MorphicBarPreconfigured,
        meta: {
            title: "Pick a bar"
        }
    },
    {
        path: "/dashboard/morphicbar-editor/",
        name: "MorphicBar Editor",
        component: MorphicBarEditor,
        props: route => ({ catalogView: !!route.query.catalogView }),
        meta: {
            title: "MorphicBar Editor",
            hideHeading: true,
            isEditorPage: true
        }
    },
    {
        path: "/register",
        name: "Register",
        component: Registration,
        meta: {
            title: "Register",
            public: "only"
        }
    },
    {
        path: "/register/invite",
        name: "Register",
        component: RegistrationInvite,
        meta: {
            title: "Register",
            public: "only"
        }
    },
    // Email call-backs
    {
        path: "/invite/:action/:id/:page",
        name: "Email.Invite",
        component: AcceptInvite,
        props: true,
        meta: {
            title: "Invitation to Morphic",
            public: true
        }
    }
];

const router = new VueRouter({
    routes
});

const authHomeRoute = routes.find(r => r.meta.authHome);
const homeRoute = routes.find(r => r.meta.home);

router.beforeEach((to, from, next) => {

    // Merge the route meta data
    /** @type {RouteMeta} */
    const meta = to.matched.reduce((obj, cur) => Object.assign(obj, cur.meta), {});

    let redirect;

    if (meta.home) {
        // the home page, /
        if (store.getters.isLoggedIn) {
            if (store.getters.beforeLoginPage) {
                // redirect back to the page visited before login
                redirect = store.getters.beforeLoginPage;
                store.commit("beforeLoginPage", undefined);
            } else if (!store.getters.hasAccount || !store.getters.isManager) {
                // no account - tell them to get one.
                redirect = {name: "NoSubscription"};
            } else {
                // redirect to the auth home page
                redirect = store.getters.homePage || authHomeRoute.path;
            }
        } else {
            // show the login form
            redirect = {name: "Login"};
        }
    } else if (!meta.public && !store.getters.isLoggedIn) {
        // User needs to be authenticated for this page.
        store.commit("beforeLoginPage", to.fullPath);
        redirect = {name: "Login"};
    } else if (meta.public === "only" && store.getters.isLoggedIn) {
        // Authenticated users can't access this page.
        redirect = homeRoute.path;
    } else if (!meta.public && !meta.noAccount && !store.getters.hasAccount) {
        // only account holders can access this page
        redirect = homeRoute.path;
    }

    next(redirect);
});

// Make the router not report navigation failures, due to redirecting from / to a different page.
const routerPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location, onComplete, onAbort) {
    let result;
    if (onComplete || onAbort) {
        result = routerPush.call(this, location, onComplete, onAbort);
    } else {
        result = routerPush.call(this, location).catch(reason => {
            // Resolve navigation failures to the home page.
            const ignore = VueRouter.isNavigationFailure(reason) && reason.to?.meta?.redirect;
            return ignore
                ? reason
                : Promise.reject(reason);
        });
    }

    return result;
};

router.afterEach((to) => {
    Vue.nextTick(() => {
        document.title = to.meta.title;
    });
});

export default router;
