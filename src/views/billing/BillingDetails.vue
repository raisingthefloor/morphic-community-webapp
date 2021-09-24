<template>
  <div class="ml-2 billingDetails">
    <div class="m-3">
      <b-link :to="{name:'AccountSettings'}" >
        <b-icon icon="arrow-return-right" rotate="180"/>Back to Morphic Account Settings</b-link>
    </div>

    <AccountSettingItem class="mb-5" :title="`Current subscription for ${community.name}`">

      <div class="no-shade">

        <div class="mb-2">Subscription type: {{plan.name}}</div>
        <div class="mb-3">
          <div class="pr-1">Number of people you have added:</div>
          <div class="font-weight-bold">{{community.member_count}} (out of {{community.member_limit}} maximum allowed on this subscription)</div>
        </div>

        <div>If you want to add more people, change your subscription below.</div>
      </div>

      <div class="no-shade">
        <div v-if="!billingInfo.card">No credit card on file</div>
        <div>
          {{plan.price_text}} {{ plan.months === 1 ? "per month" : `every ${plan.months} months` }}
        </div>

        <b-button variant="primary"
                  v-b-modal="'PaymentDialog'">
          {{ billingInfo && billingInfo.card ? "Change Card" : "Add Card" }}
        </b-button>

        <PaymentDialog ref="PaymentDialog" id="PaymentDialog"/>
      </div>
    </AccountSettingItem>


    <div>
      <h2>Change your Morphic Subscription</h2>

      <div class="plans">
        <div v-for="(plan, index) in (planData)"
             :key="index"
             class="plan"
             :class="{isSubscription: !plan.free}"
        >
          <h3 v-if="plan.size">Morphic Plus <div>{{plan.size}}</div></h3>
          <h3 v-else>Morphic <div>(Basic features only)</div></h3>

          <div class="info">
            <ul class="list-unstyled">
              <li v-if="!plan.size">Use the Basic MorphicBar (no custom MorphicBars)</li>
              <li v-if="plan.size">Make and use custom MorphicBars for yourself</li>
              <li v-if="plan.size">Make up to 5 MorphicBars each for up to {{plan.size}} other people</li>
              <li>Transfer your AT settings to any computer with Morphic on it</li>
            </ul>
          </div>
          <div class="pricing">
            <div v-if="plan.free">
              Free!
            </div>
            <div v-else-if="plan.monthly && plan.yearly">
              {{plan.monthly.monthly_price_text}} per month ({{plan.monthly.annual_price_text}} over 12 months)<br/>
              or<br/>
              {{plan.yearly.price_text}} (12 month) subscription
            </div>
          </div>
          <div>
            <b-button variant="primary">
              {{ plan.size ? `Morphic Plus ${plan.size}` : `Basic features only` }}
            </b-button>
          </div>

        </div>
      </div>

    </div>
  </div>

</template>

<style lang="scss">
@import "~@/styles/bootstrap-util";

.billingDetails {
  h2 {
    font-size: 1.4em;
  }
  h3 {
    font-size: 1.2em;
  }
  .plans {
    display: flex;
    flex-wrap: wrap;

    .plan {
      display: flex;
      flex-direction: column;

      width: 20em;

      margin: 1em;

      background-color: $gray-200;
      border-radius: 1em !important;
      padding: 7px 7px 1em 7px;

      text-align: center;

      & > * {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }

      h3  {
        font-weight: normal;
        height: 4em;
      }

      &.isSubscription h3 > div {
        font-size: 2em;
      }

      .info {
        background-color: white;
        display: unset;
        flex-grow: 1;
        padding: 1em 2em;
        li {
          margin-bottom: 1em;
        }
      }

      .pricing {
        height: 10em;
        position: relative;
      }
    }

    @include media-breakpoint-down(sm) {
      display: block;
      .plan {
        width: unset;
        margin-bottom: 2em;
        .pricing {
          height: unset;
          padding: 1em 0;
        }
      }
    }
  }
}
</style>

<script>

import PaymentDialog from "@/components/dialogs/PaymentDialog";
import { accountMixin } from "@/mixins/account";
import AccountSettingItem from "@/components/AccountSettingItem";

/**
 * @typedef {Object} PlanInfo
 * @property {BillingPlan} monthly
 * @property {BillingPlan} yearly
 * @property {Number} size
 */

export default {
    name: "BillingDetails",
    components: {AccountSettingItem, PaymentDialog},
    mixins: [accountMixin],
    data() {
        return {
            /** @type {Boolean} */
            loaded: false
        };
    },
    props: {
        updatePayment: Boolean
    },
    computed: {
        /**
         * @return {Array<PlanInfo>} the plan data.
         */
        planData: function () {
            const plans = [
                {
                    free: true
                },
                {
                    yearly: this.allPlans["plus-5"],
                    monthly: this.allPlans["plus-5-monthly"]
                },
                {
                    yearly: this.allPlans["plus-15"],
                    monthly: this.allPlans["plus-15-monthly"]
                }
            ];

            return plans.map(p => {
                const plan = p.yearly || p.monthly;
                p.size = plan ? plan.member_limit : 0;
                return p;
            });

        }
    },
    async mounted() {
        this.loaded = false;
        await Promise.all([
            this.loadBilling(),
            this.loadCommunity()
        ]);
        this.loaded = true;

        this.$forceUpdate();

        if (this.updatePayment) {
            this.$bvModal.show("PaymentDialog");
        }
    },
    methods: {
    }
};
</script>
