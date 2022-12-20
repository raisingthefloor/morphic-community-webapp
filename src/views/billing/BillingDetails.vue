<template>
  <div class="ml-2 billingDetails" :class="{loaded:loaded}">
    <b-overlay :show="!loaded" no-wrap opacity="1"/>
    <div class="m-3">
      <b-link :to="{name:'AccountSettings'}" >
        <b-icon icon="arrow-return-right" rotate="180"/>Back to Morphic Account Settings</b-link>
    </div>

    <AccountSettingItem class="mb-5" :title="`Current subscription for ${community.name}`">

      <template v-if="plan.isBasic">
        <div class="no-shade">
          <div>Subscription type: {{plan.name}}</div>
        </div>

      </template>
      <template v-else>
        <div class="no-shade">

          <div class="mb-2">Subscription type: {{plan.name}}</div>
          <div class="mb-3">
            <div class="pr-1">Number of people you have added:</div>
            <div class="font-weight-bold">{{community.member_count}} (out of {{community.member_limit}} maximum allowed on this subscription)</div>
          </div>

          <!-- <div>If you want to add more people, change your subscription below.</div> -->
        </div>

        <!-- <div class="no-shade">
          <div v-if="!billingInfo.card">No credit card on file</div>

          <div v-if="billingInfo.coupon">Coupon used: <b>{{billingInfo.coupon.code}}</b></div>

          <div v-if="billingInfo.coupon && !plan.price">
            {{getCouponFreeText(plan.coupon)}}
          </div>
          <div v-else-if="!plan.isBasic">
            {{plan.price_text}} {{ plan.months === 1 ? "per month" : `every ${plan.months} months` }}
          </div>

          <b-button variant="primary"
                    v-b-modal="'PaymentDialog'">
            {{ billingInfo && billingInfo.card ? "Change Card" : "Add Card" }}
          </b-button>

          <PaymentDialog ref="PaymentDialog" id="PaymentDialog"/>
        </div> -->
      </template>
    </AccountSettingItem>


    <!-- <div>
      <h2>Change your Morphic Subscription</h2>

      <div class="plans" v-if="planList">
        <div v-for="(plan, index) in (planList.filter(p => !p.hide))"
             :key="index"
             class="plan"
             :class="{isSubscription: !plan.free}"
        >
          <h3 v-if="plan.member_limit">Morphic Plus <div>{{plan.member_limit}}</div></h3>
          <h3 v-else>Morphic <div>(Basic features only)</div></h3>

          <div class="info">
            <ul class="list-unstyled">
              <li v-if="plan.free">Use the Basic MorphicBar (no custom MorphicBars)</li>
              <li v-if="!plan.free">Make and use custom MorphicBars for yourself</li>
              <li v-if="!plan.free">Make up to 5 MorphicBars each for up to {{plan.member_limit}} other people</li>
              <li>Transfer your AT settings to any computer with Morphic on it</li>
            </ul>
          </div>
          <div class="pricing">
            <div v-if="plan.free">
              Free!
            </div>
            <div v-else-if="plan.monthly">
              {{plan.monthly.monthly_price_text}} per month ({{plan.monthly.annual_price_text}} over 12 months)<br/>
              or<br/>
              {{plan.price_text}} (12 month) subscription
            </div>
            <div v-if="plan.specialCoupon" class="font-weight-bold text-morphic-green mt-3">
              {{plan.specialCoupon.notice}}
            </div>
          </div>
          <div>
            <b-button :class="{invisible: !plan.member_limit}" variant="primary" v-b-modal="'PrePaymentDialog'" @click="selectedPlan = plan; applyCoupon(null)">
              {{ plan.member_limit ? `Morphic Plus ${plan.member_limit}` : `Basic features only` }}
            </b-button>
          </div>

        </div>
      </div>

      <b-modal v-if="selectedPlan"
               id="PrePaymentDialog"
               :title="selectedPlan.name"
               @ok="submittingPlan = true; submitPayment($event).finally(() => {submittingPlan = false})"
               :ok-disabled="!payFrequency || submittingPlan"
               :modal-class="{submitting: submittingPlan}"
      >
        <div v-if="selectedPlan.specialCoupon" class="d-flex align-items-start rounded-lg border p-3 special-coupon">
          <img src="/img/logo-color.svg" width="70" class="m-2" alt=""/>
          <div class="pl-3 pr-3 d-flex flex-column align-items-center">
            <div class="mb-2">{{selectedPlan.specialCoupon.text}}</div>
            <b-button variant="morphic-green" @click="applyCoupon(selectedPlan.specialCoupon.code)">{{selectedPlan.specialCoupon.button}}</b-button>
          </div>
        </div>

        <b-form-group label="Coupon Code" :state="couponState">

          <b-input-group>
            <b-form-input id="coupon" v-model="couponCodeInput" :disabled="couponState" />

            <b-input-group-append>
              <b-button variant="invert-dark"
                        size="sm"
                        @click="applyCoupon(couponCodeInput)"
                        :class="{loading: checkingCoupon}"
                        :disabled="couponState || checkingCoupon">Apply coupon</b-button>
            </b-input-group-append>
          </b-input-group>

          <template #valid-feedback>Coupon applied: "{{couponCode}}" (<b-button variant="link" @click.prevent="applyCoupon()">clear coupon</b-button>)</template>
          <template #invalid-feedback>{{couponError}}</template>
        </b-form-group>


        <b-form-group v-for="(pp, frequency) in (paymentRadios)"
                      :key="frequency"
                      :description="frequency !== 'free' && `(Renews automatically every ${frequency} until canceled)`">
          <b-form-radio v-model="payFrequency"
                        name="payFrequency"
                        :value="frequency"
                        :disabled="pp.disabled">
            {{pp.price_text}} {{ radioText[frequency] }}
          </b-form-radio>
        </b-form-group>


      </b-modal>


    </div> -->
  </div>
</template>

<style lang="scss">
@import "~@/styles/bootstrap-util";

.billingDetails {
  position: relative;
  &:not(.loaded) > :not(.b-overlay) {
    opacity: 0;
  }
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

#PrePaymentDialog {
  .form-group small {
    padding-left: $custom-control-gutter + $custom-control-indicator-size;
    margin-top: 0;
  }
  .form-group .invalid-feedback, .form-group .valid-feedback {
    font-size: 1rem !important;
  }
  .rounded-lg {
    border-radius: 0.8em !important;
  }
}

</style>

<script>

import PaymentDialog from "@/components/dialogs/PaymentDialog";
import { accountMixin } from "@/mixins/account";
import AccountSettingItem from "@/components/AccountSettingItem";
import * as billingService from "@/services/billingService";

/**
 * @typedef {BillingPlan} PlanInfo
 * @property {BillingPlan} monthly The monthly payment plan
 * @property {Boolean} free true if it's not a plus subscription
 */

const couponErrors = {
    unknown: "Not a valid coupon",
    expired: "Coupon expired",
    inactive: "Coupon is no longer valid",
    invalid_email: "Coupon is not valid for your email address",
    wrong_plan: "Coupon is not valid for this plan"
};

export default {
    name: "BillingDetails",
    components: {AccountSettingItem, PaymentDialog},
    mixins: [accountMixin],
    data() {
        return {
            /** @type {Boolean} */
            loaded: false,
            /** @type {Array<PlanInfo>} */
            planList: null,
            /** @type {PlanInfo} */
            selectedPlan: null,
            couponCode: null,
            couponState: null,
            couponError: null,
            couponCodeInput: null,
            couponLastChecked: null,

            checkingCoupon: false,
            submittingPlan: false,

            payPlan: {
                /** @type {DiscountedPlan} */
                monthly: null,
                /** @type {DiscountedPlan} */
                yearly: null
            },
            radioText: {
                month: "per month monthly subscription",
                year: "per year annual subscription"
            },
            payFrequency: null
        };
    },
    props: {
        updatePayment: Boolean
    },
    async mounted() {
        await this.loadData();
        if (this.updatePayment) {
            this.$bvModal.show("PaymentDialog");
        }
    },
    computed: {

        /**
         * Plans for the payment radios
         * @return {{month: DiscountedPlan, year: DiscountedPlan}} Payment plan radio buttons
         */
        paymentRadios: function () {
            const isFree = this.payPlan.yearly.price === 0 && this.payPlan.monthly.price === 0;

            const coupon = isFree && this.payPlan.yearly.coupon;
            const freeText = coupon && this.getCouponFreeText(coupon);

            return isFree ? {
                year: {...this.selectedPlan, disabled: true},
                month: {...this.selectedPlan.monthly, disabled: true},
                free: {...this.payPlan.yearly, price_text: `${freeText}!`}
            } : {
                year: this.payPlan.yearly,
                month: this.payPlan.monthly
            };
        }

    },
    methods: {
        /**
         * Gets the text for how long a coupon is free.
         * @param {Coupon} coupon The coupon
         * @return {String} The text.
         */
        getCouponFreeText: function (coupon) {
            let freeText;
            switch (coupon?.duration) {
            case "repeating":
                if (coupon.duration_months === 12) {
                    freeText = "Free for one year";
                } else {
                    freeText = `Free for ${coupon.duration_months} months`;
                }
                break;
            case "forever":
                freeText = "Free forever";
                break;
            case null:
            case undefined:
                break;
            default:
                freeText = "Free";
                break;
            }

            return freeText;
        },
        loadData: async function () {
            this.loaded = false;
            await Promise.all([
                this.loadBilling(),
                this.loadCommunity()
            ]);

            this.planList = [
                {
                    free: true,
                    hide: true
                },
                {
                    ...this.allPlans["plus-5"],
                    monthly: this.allPlans["plus-5-monthly"]
                },
                {
                    ...this.allPlans["plus-15"],
                    monthly: this.allPlans["plus-15-monthly"]
                }
            ];

            this.loaded = true;

            this.$forceUpdate();
        },
        /**
         * Applies a coupon to the selected plan.
         * @param {String} couponCode The coupon code.
         * @return {Promise<void>} Resolves when complete
         */
        applyCoupon: async function (couponCode) {
            this.couponCode = null;
            this.couponState = null;
            this.couponError = null;
            this.payFrequency = null;
            this.couponLastChecked = couponCode;

            if (couponCode) {

                this.checkingCoupon = true;
                let couponResponse;
                try {
                    couponResponse = await billingService.checkCoupon(this.communityId, {
                        yearly: this.selectedPlan.id,
                        monthly: this.selectedPlan.monthly.id
                    }, couponCode.replace(/[^a-zA-Z0-9]/g, ""), "");
                } finally {
                    this.checkingCoupon = false;
                }

                const discounts = couponResponse.discounted_plans;
                if (!couponResponse.error && discounts) {
                    // If both plans return an error, then it's not a good coupon.
                    couponResponse.error = discounts.yearly.error && discounts.monthly.error;
                }

                if (couponResponse.error) {
                    this.couponError = couponErrors[couponResponse.error] || couponErrors.unknown;
                    this.payPlan.yearly = {...this.selectedPlan};
                    this.payPlan.monthly = {...this.selectedPlan.monthly};
                } else {
                    // Update the plan
                    this.payPlan.yearly = discounts.yearly.coupon?.active ? discounts.yearly : this.selectedPlan;
                    this.payPlan.monthly = discounts.monthly.coupon?.active ? discounts.monthly : this.selectedPlan.monthly;
                }

                const coupon = this.payPlan.yearly.coupon || this.payPlan.monthly.coupon;
                this.couponState = !!coupon;
                this.couponCode = coupon?.code;

                if (this.payPlan.yearly.price === 0 && this.payPlan.monthly.price === 0) {
                    this.payFrequency = "free";
                }

            } else {
                this.payPlan.yearly = this.selectedPlan;
                this.payPlan.monthly = this.selectedPlan.monthly;
            }
        },

        submitPayment: async function ($event) {
            $event.preventDefault();

            let payPlan;
            switch (this.payFrequency) {
            case "year":
            case "free":
                payPlan = this.payPlan.yearly;
                break;
            case "month":
                payPlan = this.payPlan.monthly;
                break;
            default:
                this.paymentPlanNotSelected = true;
                return;
            }

            if (!this.couponCode && this.couponLastChecked !== this.couponCodeInput) {
                const applyCoupon = await this.showConfirm("You've entered a coupon, but have not applied it.", ["Apply Coupon", "Skip"], "Coupon not applied");
                if (applyCoupon) {
                    this.applyCoupon(this.couponCodeInput);
                    return;
                }
            }

            if (payPlan.coupon?.code) {
                await billingService.setCoupon(this.communityId, payPlan.coupon.code);
            }

            await billingService.updateBillingInfo(this.communityId, payPlan.id, this.billingInfo.contact_member_id);

            this.$nextTick(() => this.$bvModal.hide($event.componentId));

            this.loadData();
        }
    }
};
</script>
