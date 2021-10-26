
import * as communityService from "@/services/communityService";
import * as billingService from "@/services/billingService";
import * as userService from "@/services/userService";
import * as billing from "@/utils/billing";

const billingInfoCache = {
    /** @type {Promise} */
    loading: undefined,
    /** @type {BillingInfo} */
    data: undefined
};

/**
 * Mix-in used by the account and billing pages, for account management related things.
 * @type {Component}
 */
export const accountMixin = {
    data: function () {
        return {
            accountLoaded: false,

            /** @type {Community} */
            community: {},
            /** @type {BillingInfo} */
            billingInfo: {},
            /** @type {Object<String,BillingPlan>} */
            allPlans: {},
            /** @type {BillingPlan} */
            plan: {},
            /**
             * Communities the user belongs to.
             * @type {Array<Community>}
             */
            allCommunities: [],
            /** @type {Object<GUID,CommunityMember>} */
            memberDetails: {},
            /**
             * The bars for each community
             * @type {Object<GUID,BarDetails>}
             */
            memberBars: {},

            /** @type {UserDetails} */
            userDetails: null
        };
    },
    computed: {
        /** @return {Boolean} true if the user is a manager */
        isManager: function () {
            return this.$store.getters.role === "manager";
        },

        /** @return {Boolean} true if the user has an account (is part of a community) */
        hasAccount: function () {
            return this.$store.getters.hasAccount;
        }
    },
    methods: {

        /**
         * Loads all the account data.
         * @return {Promise} Resolves when complete.
         */
        accountLoadAll: function () {
            this.accountLoaded = false;
            return Promise.all([
                this.loadUser(),
                this.loadBilling(true),
                this.loadCommunities().then(this.loadMember),
                this.loadCommunity()
            ]).finally(() => {
                this.accountLoaded = true;
            });
        },

        loadUser: async function () {
            try {
                this.userDetails = await userService.getUser(this.userId);
            } finally {
                // Potential fix for bug that's hard to reproduce, where the user's email isn't being displayed.
                if (!this.userDetails?.email) {
                    setTimeout(() => this.loadUser(), 1000);
                }
            }
        },

        /**
         * Loads the community details.
         * @private
         * @return {Promise} Resolves when complete.
         */
        loadCommunity: function () {
            return this.hasAccount && communityService.getCommunity(this.communityId).then((community) => {
                this.community = community.data;
            });
        },

        /**
         * Loads all community details.
         * @private
         * @return {Promise} Resolves when complete.
         */
        loadCommunities: async function () {
            const communities = (await communityService.getUserCommunities(this.userId))?.data?.communities || [];

            this.communityBars = {};
            this.allCommunities = await Promise.all(communities.map(c => {
                return communityService.getCommunity(c.id).then(r => {
                    return {...r.data, role: c.role, member_id: c.member_id};
                });
            }));

            return this.allCommunities;
        },

        /**
         * Load the member and bar details of the user for each community the user is a member of.
         * @private
         * @return {Promise} Resolves when complete.
         */
        loadMember: function () {
            this.memberDetails = {};
            this.memberBars = {};
            return Promise.all(this.memberCommunities.map(async community => {

                const member = (await communityService.getCommunityMember(community.id, community.member_id)).data;
                this.memberDetails[community.id] = member;

                this.memberBars[community.id] = await Promise.all(member.bar_ids.map(async barId => {
                    return (await communityService.getCommunityBar(community.id, barId)).data;
                }));
            }));
        },

        /**
         * Loads the community plan and billing details.
         *
         * Billing info can be loaded in multiple components on a page, so results are cached.
         *
         * @param {Boolean} force Always update from the service.
         * @return {Promise} Resolves when complete.
         */
        loadBilling: function (force) {
            // Return early if already loaded
            if (billingInfoCache.loading) {
                if (!force || !billingInfoCache.data) {
                    return billingInfoCache.loading.then(() => {
                        this.billingInfo = billingInfoCache.data;
                    });
                }
            }

            const planPromise = billing.getPlans().then(p => {
                this.allPlans = p;
            });

            billingInfoCache.loading = this.isManager && this.hasAccount ? Promise.all([
                planPromise,
                billingService.getBillingInfo(this.communityId).then((r) => {
                    this.billingInfo = (billingInfoCache.data = r.data);
                    return this.getAccountState(this.billingInfo);
                })
            ]).then(async () => {
                this.plan = (this.billingInfo && this.billingInfo.plan_id && this.allPlans)
                    ? this.allPlans[this.billingInfo.plan_id]
                    : null;
                if (this.billingInfo.coupon?.code) {
                    const couponResponse = await billingService.checkCoupon(this.communityId, {plan: this.billingInfo.plan_id}, this.billingInfo.coupon.code);
                    if (couponResponse.discounted_plans?.plan) {
                        this.plan = Object.assign({}, this.plan, couponResponse.discounted_plans.plan);
                    }
                }
            }) : planPromise;

            return billingInfoCache.loading;
        },

        /**
         * Gets the state of the account.
         * @param {BillingInfo} billingInfo Billing info
         * @return {AccountState} The account state
         */
        getAccountState: async function (billingInfo) {
            /** @type {AccountState} */
            const accountState = {
                plan_id: billingInfo.plan_id,
                billingInfo
            };

            if (billingInfo.plan_id === "basic") {
                accountState.basic = true;
            } else if (!billingInfo.card && !billingInfo.coupon?.active) {
                accountState.trial = true;

                if (billingInfo.trial_end_days >= 0) {
                    accountState.message = this.$tc("account.state-message.trial", billingInfo.trial_end_days);
                    accountState.warn = true;
                    accountState.reason = "trial";
                } else {
                    accountState.message = this.$t("account.state-message.trial-end");
                    accountState.disabled = true;
                    accountState.reason = "trial-ended";
                }
            }

            await this.$store.dispatch("accountState", accountState);
            return accountState;
        }
    }
};
