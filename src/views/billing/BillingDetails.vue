<template>
  <b-container>
    <h2>Billing Information</h2>

    <div v-if="loaded" class="billingDetails d-flex flex-column">
      <b-card>
        <b-card-title>Payment Card on file</b-card-title>

        <ul class="list-unstyled" role="presentation">
          <li>
            Card:
            <span v-if="billingInfo && billingInfo.card">{{billingInfo.card.last4}}</span>
            <span v-else>None</span>
          </li>
        </ul>

        <b-button variant="primary"
                  v-b-modal="'PaymentDialog'">
          {{ billingInfo && billingInfo.card ? "Change Card" : "Add Card" }}
        </b-button>

      </b-card>

      <b-card>
        <b-card-title>Next billing date</b-card-title>
        <ul v-if="plan && billingInfo" class="list-unstyled" role="presentation">
          <li>
            {{plan.price_text}} {{ plan.months === 1 ? "per month" : `every ${plan.months} months` }}
          </li>
          <li>{{plan.name}} ({{plan.member_limit}} members)</li>
        </ul>

        <b-button :to="{ name: 'Plans' }" variant="primary">Change Plan</b-button>
      </b-card>
    </div>

    <PaymentDialog ref="PaymentDialog" id="PaymentDialog"/>
  </b-container>


</template>

<style lang="scss">
.billingDetails {
  width: fit-content;
  max-width: 25em;
  .card {
    margin: 0.5em 0;
  }
}
</style>

<script>

import * as communityService from "@/services/communityService";
import * as billingService from "@/services/billingService";
import * as billing from "@/utils/billing";
import PaymentDialog from "@/components/dialogs/PaymentDialog";

export default {
    name: "BillingDetails",
    components: {PaymentDialog},
    data() {
        return {
            /** @type {Boolean} */
            loaded: false,
            /** @type {Community} */
            community: null,
            /** @type {BillingInfo} */
            billingInfo: null,
            /** @type {BillingPlan} */
            plan: null
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
