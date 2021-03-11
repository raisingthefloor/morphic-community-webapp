<!--
Displays the subscription plans - either for a new user, or to change an existing community
-->
<template>
  <b-form-radio-group v-if="monthlyPlans && longPlans" plain style="margin-bottom: 1.5em">
    <p v-if="!community">Not sure how many members you will have? You can upgrade your subscription whenever you need to.</p>

    <b-row v-for="(monthly) in [false, true]"
           :key="monthly"
    >
      <b-col md="4"
             v-for="(plan) in (monthly ? monthlyPlans : longPlans)"
             :key="plan.id"
             class="planContainer"
      >
        <b-form-radio class="planCard"
                      plain
                      :value="plan.id"
                      v-model="selectedPlanId"
                      :disabled="!plan.available"
                      :class="{
                            currentPlan: currentPlan && currentPlan.id === plan.id,
                            selectedPlan: selectedPlanId === plan.id,
                            unavailable: !plan.available
                          }"
        >

          <b-icon v-if="selectedPlanId === plan.id" icon="check-circle-fill" class="check" />

          <div class="planHeader">
            <div v-if="!monthly" class="planImage">
              <b-img v-if="plan.size === 'basic'" src="/img/person.svg"/>
              <b-img v-if="plan.size === 'medium'" src="/img/people.svg"/>
              <b-img v-if="plan.size === 'large'" src="/img/group.svg"/>
            </div>

            <h4>{{plan.name}}</h4>
          </div>

          <div class="planBody">
            <strong class="currentPlanOnly text-primary">Your current plan</strong>
            <p>Manage up to {{plan.member_limit}} members</p>
            <p>
              {{plan.monthly_price_text}} per month<br/>
              <span v-if="monthly">automatically renews monthly until canceled</span>
              <span v-else-if="plan.months === 6">(paid semiannually)</span>
              <span v-else-if="plan.months === 12">(paid annually)</span>
            </p>
            <p v-if="!monthly && plan.savings_text">
              Savings of {{ plan.savings_text }} with {{(plan.months === 6) ? "6 month" : "annual"}} payment discount.
            </p>

            <p v-if="!plan.available" class="text-danger">Your current group is too large for this plan.</p>

          </div>
        </b-form-radio>
      </b-col>
    </b-row>



    <b-row>
      <b-col md="8">
        <div class="hasIcon">
          <b-icon icon="info-circle-fill" variant="info"/>
          <span>
                Morphic also offers enterprise plans for larger groups, universities, companies, and organizations.
                For more information <b-link>contact us</b-link>.
              </span>
        </div>
      </b-col>
      <b-col md="4" style="text-align: right">
        <b-button variant="primary" :disabled="!newPlanSelected" size="lg">Continue to Payment</b-button>
      </b-col>
    </b-row>
  </b-form-radio-group>

</template>

<style lang="scss">

@use 'sass:color';
@import "~bootstrap/scss/bootstrap";

.planContainer {
  margin-bottom: 1em;

  .alert, .alert * {
    position: absolute;
    left: 50%;
    transform: translate(-50%, 0);
    opacity: 0.95;
    width: fit-content;
    z-index: 5;
  }

  .planCard {
    position: relative;
    height: 100%;

    // Make the cards and content the same height.
    &, label  {
      display: flex;
      align-items: stretch;
      flex-direction: column;
      :last-child {
        flex-grow: 1;
      }
    }

    // Hide the radio control
    input[type="radio"] {
      position: absolute;
      opacity: 0;
    }

    border-radius: 20px;
    overflow: hidden;

    // The tick in the corner
    .check {
      position: absolute;
      color: white;
      font-size: 40px;
      top: 0.2em;
      right: 0.2em;
      z-index: 5;
    }

    .planHeader {
      text-align: center;
      padding: 1em 1em 0;
      position: relative;

      .planImage {
        position: relative;
        margin-bottom: 1em;

        img {
          width: 100%;
          max-height: 5em;
        }

        height: 5em;
      }
    }

    .planBody {
      padding: 0.5em;
      text-align: center;
      background-color: white;
      margin: 10px;
      border-radius: 10px;
    }

    &:not(.currentPlan) .currentPlanOnly {
      display: none;
    }

    background-color: $gray-300;

    &:not(.unavailable, .selectedPlan):hover {
      background-color: $gray-400;
    }

    &:not(.unavailable) label {
      cursor: pointer;
    }

    &.selectedPlan {
      background-color: $success;
    }
    &.currentPlan {
      &, &:hover {
        background-color: $primary;
      }
      &:not(.selectedPlan) {
        background-color: color.scale($primary, $lightness:33%);
        &:hover {
          background-color: color.scale($primary, $lightness: 20%);
        }

      }
    }

  }
}

.hasIcon {
  display: flex;
  align-items: stretch;
  .b-icon {
    font-size: x-large;
  }
  & > :nth-child(2) {
    margin-left: 0.5em;
  }
}

</style>


<script>
import * as billing from "@/utils/billing";

export default {
    name: "PlanPicker",
    props: {
        /**
         * Billing info for the current community (if already part of a community)
         * @type {BillingInfo}
         */
        billingInfo: Object,
        /**
         * The community (if part of a community)
         * @type {Community}
         */
        community: Object
    },
    data() {
        return {
            /** @type {BillingPlans} */
            plans: null,
            /** @type {Array<CommunityMember>} */
            members: [],
            /** @type {GUID} */
            selectedMember: null,
            expandedMembers: {},
            /** @type {Array<BillingPlan>} */
            monthlyPlans: null,
            /** @type {Array<BillingPlan>} */
            longPlans: null,
            /** @type {String} */
            selectedPlanId: null,
            sizeNames: billing.sizeNames
        };
    },
    computed: {
        userId: function () { return this.$store.getters.userId; },
        /**
         * The current plan for the community.
         * @return {BillingPlan} The plan.
         */
        currentPlan: function () {
            return this.plans && this.billingInfo ? this.plans[this.billingInfo.plan_id] : null;
        },
        /**
         * Determines if a new plan has been selected, and the payment button should be enabled.
         * @return {Boolean} true if a new plan is selected.
         */
        newPlanSelected: function () {
            return !!(this.selectedPlanId && this.plans && this.plans[this.selectedPlanId] &&
                (!this.billingInfo || this.selectedPlanId !== this.billingInfo.plan_id) &&
                this.isPlanAvailable(this.plans[this.selectedPlanId]));
        }
    },
    methods: {
        /**
         * Determines if a given plan is available, for the current community size.
         * @param {BillingPlan} plan The plan to check.
         * @return {Boolean} true if the plan is suitable for the current community size.
         */
        isPlanAvailable: function (plan) {
            return !this.community || plan.member_limit >= this.community.member_count;
        }
    },
    mounted() {
        billing.getPlans().then(plans => {
            this.plans = plans;

            Object.values(this.plans).forEach(plan => {
                plan.available = this.isPlanAvailable(plan);
            });

            this.monthlyPlans = [
                this.plans["basic-1-month"],
                this.plans["midsize-1-month"],
                this.plans["large-1-month"]
            ];
            this.longPlans = [
                this.plans["basic-6-month"],
                this.plans["midsize-6-month"],
                this.plans["large-6-month"]
            ];

            this.selectedPlanId = this.billingInfo.plan_id;
        });
    }
};
</script>

