<template>
  <div class="accountSettings">

    <div class="m-3">
      <b-link v-if="$store.getters.hasAccount && $store.getters.role === 'manager'" :to="{name:'Dashboard'}" >
        <b-icon icon="arrow-return-right" rotate="180"/>Back to Custom MorphicBar Tool</b-link>
    </div>

    <AccountSettingItem icon="person-circle" title="My sign-in method">
      <template #lead>You have currently set up the following ways to sign into your Morphic account</template>

      <ul class="signInMethods list-unstyled">
        <li v-if="userDetails && userDetails.email"
            :class="{error:!userDetails.email_verified}"
            aria-labelledby="SignIn-email">
          <div class="d-flex">
            <div class="if-error" style="font-size: 1.5em; width: 1.8em">
              <b-iconstack style="vertical-align: top">
                <b-icon icon="circle-fill" variant="white" />
                <b-icon icon="exclamation-circle-fill" variant="danger" />
              </b-iconstack>
            </div>
            <dl role="presentation">
              <dt id="SignIn-email">Email &amp; Password</dt>
              <dd>
                {{ userDetails.email }}
                <span v-if="userDetails.email_verified">(confirmed)</span>
              </dd>
            </dl>
          </div>

          <div v-if="!userDetails.email_verified" class="mb-3">
            This email address is not confirmed. You will need to click a link sent you you by Morphic to confirm.
            Check your junk or spam folder or re-send the confirmation email.
          </div>

          <b-button v-if="!userDetails.email_verified"
                    variant="invert-dark"
                    @click="resendEmailConfirmation()"
                    class="mr-3">Re-send confirmation email</b-button>

          <b-button variant="invert-dark" v-b-modal="'ChangePasswordDialog'">Change password</b-button>

          <ChangePasswordDialog />

        </li>
      </ul>

    </AccountSettingItem>


    <AccountSettingItem v-if="isManager" icon="people-fill" title="My Morphic account">
      <div>
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
      </div>

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

  <!-- TODO: Account deletion on the API server
    <AccountSettingItem icon="gear-fill" title="Other actions for my personal account">
      <h3><b-icon icon="trash-fill" scale="1.2"/> Deleting my personal Morphic account</h3>
      <p>
        If you no longer want to use Morphic to personalize computers you use, you can delete your account. Deleting
        your account will erase all data and information associated with your account.
      </p>
      <p v-if="isManager">
        Since you have a Morphic Plus subscription, deleting your personal account will also delete all the MorphicBars
        that you manage for yourself and others.
      </p>
      <p v-else>
        Because you have accepted one or more invitations for MorphicBars, all MorphicBars and buttons that others have
        created specifically for you will also be deleted. This will remove all of the bars other people have created
        for you from their accounts. They will not be able to undo this.
      </p>

      <b-button variant="invert-danger" @click="deleteAccount()">Delete my account</b-button>
    </AccountSettingItem>
  -->
  </div>
</template>

<style lang="scss">

.accountSettings {
  width: 40em;

  .accountItem:not(:last-child) {
    margin-bottom: 1em;
  }

  h3 {
    font-size: 1.2em;
  }

}


</style>

<script>

import * as communityService from "@/services/communityService";
import * as billingService from "@/services/billingService";
import * as userService from "@/services/userService";
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
    props: {
    },
    async mounted() {
        Promise.all([
            this.loadBilling(),
            this.loadCommunities().then(this.loadMember),
            this.loadCommunity(),
            this.loadUser()
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
        },

        hasAccount: function () {
            return this.$store.getters.hasAccount;
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
        async deleteAccount() {
            const confirmed = await this.showConfirm("Are you sure you want to delete your account?",
                ["Delete my account", "No"],
                "Delete Account",
                {dangerous: true});

            if (confirmed) {
                this.$bvModal.msgBoxOk("Not implemented", {title: "Delete Account"});
            }
        },

        resendEmailConfirmation: async function () {
            await userService.resendEmailConfirmation(this.userId);
            this.showMessage("Confirmation email sent");
        },

        loadUser: async function () {
            this.userDetails = await userService.getUser(this.userId);
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
