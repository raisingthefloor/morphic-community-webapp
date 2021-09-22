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

export default {
    name: "AccountSettings",
    components: {ChangePasswordDialog, AccountSettingItem},
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
