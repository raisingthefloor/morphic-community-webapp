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
import MemberInvite from "@/views/MemberInvite.vue";

// Focused Components
import FocusedHome from "@/views/focused/FocusedHome.vue";
import FocusedBarEditor from "@/views/focused/FocusedBarEditor.vue";
import FocusedButtonCatalog from "@/views/focused/FocusedButtonCatalog.vue";
import FocusedPeopleUsingBar from "@/views/focused/FocusedPeopleUsingBar.vue";
import FocusedPersonPage from "@/views/focused/FocusedPersonPage.vue";
import FocusedButtonEdit from "@/views/focused/FocusedButtonEdit.vue";
import FocusedAddCommunityBar from "@/views/focused/FocusedAddCommunityBar.vue";
import RegistrationInvite from "@/views/RegistrationInvite";


Vue.use(VueRouter);

/**
 * Meta-data for a route.
 *
 * All pages require authentication, unless explicitly stated otherwise with the `public` field.
 *
 * @typedef {Object} RouteMeta
 * @property {String} title The page title.
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
            title: "Home :: Morphic",
            public: "only"
        }
    },
    {
        path: "/session-timed-out",
        name: "Home-session-timed-out",
        component: Home,
        props: { messageId: "sessionTimedOut" },
        meta: {
            title: "Home :: Morphic",
            public: "only"
        }
    },
    {
        path: "/my-community",
        name: "MyCommunity",
        component: MyCommunity,
        meta: {
            title: "My Community :: Morphic"
        }
    },
    {
        path: "/my-communities",
        name: "MyCommunities",
        component: MyCommunities,
        meta: {
            title: "My Groups :: Morphic"
        }
    },
    {
        path: "/billing/plans",
        name: "Plans",
        component: Plans,
        meta: {
            title: "Plans :: Morphic"
        }
    },
    {
        path: "/billing/no-subscription",
        name: "NoSubscription",
        component: NoSubscription,
        meta: {
            title: "Plans :: No Subscription",
            noAccount: true
        }
    },
    {
        path: "/early-release-program",
        name: "EarlyReleaseProgram",
        component: EarlyReleaseProgram,
        meta: {
            title: "MorphicBar Early Release Program",
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
            title: "Billing :: Morphic"
        }
    },
    {
        path: "/reset-password",
        name: "Reset Password",
        component: ResetPassword,
        meta: {
            title: "Reset Password :: Morphic",
            public: "only"
        }
    },

    // Dashboard mockups, needs to be properly renamed and re-arranged when starting to implement the API
    {
        path: "/dashboard",
        name: "Dashboard",
        component: Dashboard,
        meta: {
            title: "Dashboard :: Morphic",
            authHome: true
        }
    },
    {
        path: "/dashboard/morphicbar-preconfigured",
        name: "MorphicBar Preconfigured",
        component: MorphicBarPreconfigured,
        meta: {
            title: "Pick a bar :: Morphic"
        }
    },
    {
        path: "/dashboard/morphicbar-editor/",
        name: "MorphicBar Editor",
        component: MorphicBarEditor,
        meta: {
            title: "MorphicBar Editor :: Morphic"
        }
    },
    {
        path: "/dashboard/member-invite",
        name: "Member Invite",
        component: MemberInvite,
        meta: {
            title: "Member Invite :: Morphic"
        }
    },
    {
        path: "/register",
        name: "Register",
        component: Registration,
        meta: {
            title: "Register :: Morphic",
            public: "only"
        }
    },
    {
        path: "/register/invite",
        name: "Register",
        component: RegistrationInvite,
        meta: {
            title: "Register :: Morphic",
            public: "only"
        }
    },
    // {
    //   path: '/dashboard/member/:memberId',
    //   name: 'Member Editor',
    //   component: MemberEditor,
    //   meta: {
    //     title: 'Member Details :: Morphic',
    //     authRoute: true
    //   }
    // },

    // Mobile-Focused-Accessible CM Webapp
    {
        path: "/focused/home",
        name: "Home: Bar and Member Page",
        component: FocusedHome,
        meta: {
            title: "Focused :: Home"
        }
    },
    {
        path: "/focused/bar-editor",
        name: "Focused: Bar Editor",
        component: FocusedBarEditor,
        meta: {
            title: "Focused :: Bar Editor"
        }
    },
    {
        path: "/focused/add-community-bar",
        name: "Focused: Add Group Bar",
        component: FocusedAddCommunityBar,
        meta: {
            title: "Focused :: Add group Bar"
        }
    },
    {
        path: "/focused/button-catalog",
        name: "Focused: Button Catalog",
        component: FocusedButtonCatalog,
        meta: {
            title: "Focused :: Button Catalog"
        }
    },
    {
        path: "/focused/people-using-bar",
        name: "Focused: Members using bar",
        component: FocusedPeopleUsingBar,
        meta: {
            title: "Focused :: Members using bar"
        }
    },
    {
        path: "/focused/person",
        name: "Focused: Member",
        component: FocusedPersonPage,
        meta: {
            title: "Focused :: Member"
        }
    },
    {
        path: "/focused/button-edit",
        name: "Focused: Button edit",
        component: FocusedButtonEdit,
        meta: {
            title: "Focused :: Button edit"
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
            } else if (!store.getters.hasAccount) {
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
