<template>
  <div class="accountSettings">

    <div class="m-3">
      <b-link :to="{name:'Dashboard'}" >Back to Custom MorphicBar Tool</b-link>
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


    <AccountSettingItem icon="people-circle" title="My Morphic account">
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
            plan: {}
        };
    },
    props: {
        updatePayment: Boolean
    },
    mounted() {
        Promise.all([
            this.loadCommunity(),
            this.loadBilling()
        ]).then(() => {
            this.loaded = true;
            if (this.updatePayment) {
                this.$bvModal.show("PaymentDialog");
            }
        });
    },
    computed: {
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

        /**
         * Loads the community plan and billing details.
         * @return {Promise} Resolves when complete.
         */
        loadBilling: function () {
            let plans;
            return Promise.all([
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
            });
        }
    }
};
</script>
