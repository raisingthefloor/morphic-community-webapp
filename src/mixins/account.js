
import * as communityService from "@/services/communityService";
import * as billingService from "@/services/billingService";
import * as userService from "@/services/userService";
import * as billing from "@/utils/billing";

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
            userDetails: {}
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
                this.loadBilling(),
                this.loadCommunities().then(this.loadMember),
                this.loadCommunity(),
                this.loadUser()
            ]).then(() => {
                this.accountLoaded = true;
            });
        },

        loadUser: async function () {
            this.userDetails = await userService.getUser(this.userId);
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
         * @private
         * @return {Promise} Resolves when complete.
         */
        loadBilling: function () {
            let plans;
            return this.isManager && this.hasAccount ? Promise.all([
                billing.getPlans().then(p => {
                    plans = p;
                }),
                billingService.getBillingInfo(this.communityId).then((r) => {
                    this.billingInfo = r.data;
                })
            ]).then(() => {
                this.plan = (this.billingInfo && this.billingInfo.plan_id && plans)
                    ? plans[this.billingInfo.plan_id]
                    : null;
            }) : Promise.resolve();
        }

    }
};
