import Vue from "vue";
import VueRouter from "vue-router";
import store from "@/store";

// General Marketing, Login and Register Components
import Home from "@/views/Home.vue";
import Terms from "@/views/Terms.vue";
import Registration from "@/views/Registration";

import ResetPassword from "@/views/ResetPassword.vue";

import MyCommunity from "@/views/MyCommunity.vue";
import MyCommunities from "@/views/MyCommunities.vue";

import Plans from "@/views/billing/Plans.vue";
import BillingDetails from "@/views/billing/BillingDetails.vue";

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


Vue.use(VueRouter);

const routes = [
    {
        path: "/",
        name: "Home",
        component: Home,
        meta: {
            title: "Home :: Morphic",
            locked: true
        }
    },
    {
        path: "/session-timed-out",
        name: "Home-session-timed-out",
        component: Home,
        props: { messageId: "sessionTimedOut" },
        meta: {
            title: "Home :: Morphic",
            locked: true
        }
    },
    {
        path: "/terms-of-use",
        name: "Terms of Use",
        component: Terms,
        meta: {
            title: "Terms Of Use :: Morphic"
        }
    },
    // {
    //   path: '/registration',
    //   name: 'Registration',
    //   component: Registration,
    //   meta: {
    //     title: 'Community Registration :: Morphic',
    //     locked: true
    //   }
    // },
    {
        path: "/my-community",
        name: "MyCommunity",
        component: MyCommunity,
        meta: {
            title: "My Community :: Morphic",
            authRoute: true
        }
    },
    {
        path: "/my-communities",
        name: "MyCommunities",
        component: MyCommunities,
        meta: {
            title: "My Groups :: Morphic",
            authRoute: true
        }
    },
    {
        path: "/billing/plans",
        name: "Plans",
        component: Plans,
        meta: {
            title: "Plans :: Morphic",
            authRoute: true
        }
    },
    {
        path: "/billing/details",
        name: "BillingDetails",
        component: BillingDetails,
        meta: {
            title: "Billing :: Morphic",
            authRoute: true
        }
    },
    {
        path: "/reset-password",
        name: "Reset Password",
        component: ResetPassword,
        meta: {
            title: "Reset Password :: Morphic"
        }
    },

    // Dashboard mockups, needs to be properly renamed and re-arranged when starting to implement the API
    {
        path: "/dashboard",
        name: "Dashboard",
        component: Dashboard,
        meta: {
            title: "Dashboard :: Morphic",
            authRoute: true
        }
    },
    {
        path: "/dashboard/morphicbar-preconfigured",
        name: "MorphicBar Preconfigured",
        component: MorphicBarPreconfigured,
        meta: {
            title: "Pick a bar :: Morphic",
            authRoute: true
        }
    },
    {
        path: "/dashboard/morphicbar-editor/",
        name: "MorphicBar Editor",
        component: MorphicBarEditor,
        meta: {
            title: "MorphicBar Editor :: Morphic",
            authRoute: true
        }
    },
    {
        path: "/dashboard/member-invite",
        name: "Member Invite",
        component: MemberInvite,
        meta: {
            title: "Member Invite :: Morphic",
            authRoute: true
        }
    },
    {
        path: "/register",
        name: "Register",
        component: Registration,
        meta: {
            title: "Register :: Morphic"
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
            title: "Focused :: Home",
            authRoute: true
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

router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.authRoute)) {
        if (store.getters.isLoggedIn) {
            next();
            return;
        }
        next("/");
    } else if (to.matched.some(record => record.meta.locked)) {
        if (!store.getters.isLoggedIn) {
            next();
            return;
        }
        next("/dashboard");
    } else {
        next();
    }
});

router.afterEach((to) => {
    Vue.nextTick(() => {
        document.title = to.meta.title;
    });
});

export default router;
