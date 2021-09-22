<template>
  <div class="accountSettings">

    <div class="m-3">
      <b-link v-if="$store.getters.hasAccount && $store.getters.role === 'manager'" :to="{name:'Dashboard'}" >
        <b-icon icon="arrow-return-right" rotate="180"/>Back to Custom MorphicBar Tool</b-link>
    </div>

    <AccountSettingItem icon="person-circle" title="My sign-in method">
      <template #lead>You have currently set up the following ways to sign into your Morphic account</template>

      <ul class="signInMethods list-unstyled">
        <li aria-labelledby="SignIn-email">
          <dl role="presentation">
            <dt id="SignIn-email">Email &amp; Password</dt>
            <dd>user@example.com (confirmed)</dd>
          </dl>
          <b-button variant="invert-dark" v-b-modal="'ChangePasswordDialog'">Change password</b-button>

          <ChangePasswordDialog />

        </li>
      </ul>

    </AccountSettingItem>


    <AccountSettingItem v-if="isManager" icon="people-fill" title="My Morphic account">
      <div class="lead font-weight-bold">{{ community.name }}</div>

      <b-button variant="invert-dark" v-b-modal="'AccountNameDialog'">Change account name</b-button>

      <div class="mt-3 mb-2">Subscription type: {{plan.name}}</div>
      <div class="d-flex flex-wrap">
        <span class="pr-1">Number of people you have added:</span>
        <b>{{community.member_count}} (out of {{community.member_limit}} maximum allowed on this subscription)</b>
      </div>

      <TextInputDialog id="AccountNameDialog"
                       title="Rename Account"
                       prompt="Enter the new name for the account"
                       :value="community.name"
                       @ok="renameAccount($event.newValue)"
      />

    </AccountSettingItem>

    <AccountSettingItem v-if="hasAccount" icon="envelope-open" title="MorphicBars I have accepted">
      <template #lead>
        Listed below are the MorphicBars you have accepted from others and that are managed by them on your behalf.
<!--        If you "remove" their bar(s), then you will no longer have access to the bar(s) that they manage for you.-->
      </template>

      <ul class="list-unstyled">
        <!-- TODO: unable to get invitation details from the API server -->
        <li v-for="(memberCommunity) in memberCommunities" :key="memberCommunity.id" :aria-labelledby="`${memberCommunity.id}_name`">
          <span :id="`${memberCommunity.id}_label`">
            <b :id="`${memberCommunity.id}_name`">{{memberCommunity.name}}</b>
            has provided the following bar(s) for you:
          </span>

          <ul :aria-labelledby="`${memberCommunity.id}_label`" class="mb-3">
            <li v-for="bar in (memberBars[memberCommunity.id])" :key="bar.id">
              {{bar.name}}
            </li>
          </ul>
<!--          <b-button variant="invert-dark">Remove</b-button>-->
        </li>
      </ul>
    </AccountSettingItem>

  </div>
</template>

<style lang="scss">

.accountSettings {
  width: 40em;

  .accountItem:not(:last-child) {
    margin-bottom: 1em;
  }

}


</style>

<script>

import * as communityService from "@/services/communityService";
import * as billingService from "@/services/billingService";
import * as billing from "@/utils/billing";
import AccountSettingItem from "@/components/AccountSettingItem";
import ChangePasswordDialog from "@/components/dialogs/ChangePasswordDialog";
import TextInputDialog from "@/components/dialogs/TextInputDialog";

export default {
    name: "AccountSettings",
    components: {TextInputDialog, ChangePasswordDialog, AccountSettingItem},
    data() {
        return {
            /** @type {Boolean} */
            loaded: false,
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
            /** @type {CommunityMember} */
            memberDetails: {},
            /**
             * The bars for each community
             * @type {Object<GUID,BarDetails>}
             */
            memberBars: {}
        };
    },
    props: {
    },
    async mounted() {
        Promise.all([
            await this.loadBilling(),
            await this.loadCommunities().then(this.loadMember),
            await this.loadCommunity()
        ]).then(() => {
            this.loaded = true;
            this.$forceUpdate();
        });
    },
    computed: {
        /**
         * Communities the user is a manager of.
         * @return {Array<Community>} The communities.
         */
        managerCommunities: function () {
            return this.allCommunities.filter(c => c.role === "manager");
        },

        /**
         * Communities the user is a non-manager of.
         * @return {Array<Community>} The communities.
         */
        memberCommunities: function () {
            return this.allCommunities.filter(c => c.role === "member");
        },

        isManager: function () {
            return this.$store.getters.role === "manager";
        }
    },
    methods: {
        /**
         * Renames the account, and refreshes the community data.
         * @param {String} newName The new name of the account.
         * @return {Promise} Resolves when complete.
         */
        async renameAccount(newName) {
            await communityService.updateCommunity(this.communityId, newName, this.community.default_bar_id);
            this.showMessage("Account name updated");
            await this.loadCommunity();
        },

        /**
         * Loads the community details.
         * @return {Promise} Resolves when complete.
         */
        loadCommunity: function () {
            return communityService.getCommunity(this.communityId).then((community) => {
                this.community = community.data;
            });
        },

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
         * @return {Promise<void>}
         */
        loadMember: async function () {
            this.memberDetails = {};
            this.memberBars = {};
            await Promise.all(this.memberCommunities.map(async community => {

                const member = (await communityService.getCommunityMember(community.id, community.member_id)).data;
                this.memberDetails[community.id] = member;

                this.memberBars[community.id] = await Promise.all(member.bar_ids.map(async barId => {
                    return (await communityService.getCommunityBar(community.id, barId)).data;
                }));
            }));
        },

        /**
         * Loads the community plan and billing details.
         * @return {Promise} Resolves when complete.
         */
        loadBilling: function () {
            let plans;
            return this.isManager ? Promise.all([
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
</script>
