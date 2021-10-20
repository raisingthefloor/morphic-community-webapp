<template>
  <TwoColumnDialog
          id="PaymentDialog"
          dialog-class="paymentDialog"
          ref="PaymentDialog"

          :title="$t('PaymentDialog.title')"
          size="md"

          :ok-title="$t('PaymentDialog.submit_button')"
          :cancel-title="$t('PaymentDialog.cancel_button')"

          @ok="$event.promise = submitCard()"
          @show="onShow"
          @shown="onShown"

          v-bind="$attrs"

          :v="$v"

          :form-data="form"
  >
    <template #form v-show="loaded">
      <b-form :class="{loading: !loaded}" class="position-relative">
        <b-overlay :show="!loaded" no-wrap/>

        <ValidatedInput id="name"
                        :label="$t('PaymentDialog.form.name')"
                        :description="$t('PaymentDialog.form.name_description')"
                        :validation="$v.form.name"
        />

        <ValidatedInput id="card"
                        :label="$t('PaymentDialog.form.card')"
                        :description="$t('PaymentDialog.form.card_description')"
                        :validation="$v.form.card"
        >
          <div id="card-capture" />
        </ValidatedInput>

        <ValidatedInput id="address_line1"
                        :label="$t('PaymentDialog.form.address_line1')"
                        :validation="$v.form.address_line1"
        />
        <ValidatedInput id="address_line2"
                        :description="$t('PaymentDialog.form.address_line2_description')"
                        :validation="$v.form.address_line2"
        />

        <b-form-row>
          <ValidatedInput id="address_city"
                          class="col-5 pl-0"
                          :label="$t('PaymentDialog.form.address_city')"
                          :description="$t('PaymentDialog.form.address_city_description')"
                          :validation="$v.form.address_city"
          />
          <ValidatedInput id="address_state"
                          class="col-5"
                          :label="$t('PaymentDialog.form.address_state')"
                          :description="$t('PaymentDialog.form.address_state_description')"
                          :validation="$v.form.address_state"
          />
          <ValidatedInput id="address_country_group"
                          class="col-lg-6"
                          :label="$t('PaymentDialog.form.address_country')"
                          :description="$t('PaymentDialog.form.address_country_description')"
                          :validation="$v.form.address_zip"
          >
            <b-form-select id="address_country" :options="countryList" />
          </ValidatedInput>

          <ValidatedInput id="address_zip"
                          class="col-4"
                          :label="$t('PaymentDialog.form.address_zip')"
                          :description="$t('PaymentDialog.form.address_zip_description')"
                          :validation="$v.form.address_zip"
          />
        </b-form-row>


        <b-alert>
          <div id="card-errors" />
        </b-alert>

      </b-form>
    </template>

  </TwoColumnDialog>
</template>

<style lang="scss">

#PaymentDialog {
  &, .form-control {
    font-size: 0.9em !important;
  }

  .dialog-info {
    display: none;
  }


  #address_line1_group {
    margin-bottom: 0;
  }

  .form-row {
    align-items: flex-end;
    justify-content: space-between;
  }

  .loading {
    iframe {
      max-height: 2em;
    }
  }
}
</style>

<script>

import * as billingService from "@/services/billingService";
import ValidatedInput from "@/components/ValidatedInput";
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";
import TwoColumnDialog from "@/components/dialogs/TwoColumnDialog";

import { countries } from "@/utils/countries";

const stripeScriptId = "stripe-script";

function cardValidation(value, vm) {
    return !!this.validateCard(value);

}

export default {
    name: "PaymentDialog",
    components: {TwoColumnDialog, ValidatedInput},
    mixins: [validationMixin],
    data() {
        return {
            /** @type {Boolean} */
            loaded: false,
            /** @type {stripe.Stripe} */
            stripe: null,
            /** @type {stripe.elements.Element} */
            stripeElement: null,
            /** @type {stripe.TokenOptions} */
            form: {
                card: "",
                name: "",
                address_line1: "",
                address_line2: "",
                address_city: "",
                address_state: "",
                address_zip: "",
                address_country: ""
            },
            cardValidationError: null
        };
    },
    validations: {
        form: {
            card: {required, cardValidation},
            name: {required},
            address_line1: {},
            address_line2: {},
            address_city: {},
            address_state: {},
            address_zip: {},
            address_country: {}
        }
    },
    mounted() {
    },
    beforeDestroy() {
        this.removeStripe();
    },
    computed: {
        countryList: function () {
            return Object.entries(countries).map(entry => {
                return {value: entry[0], text: entry[1]};
            });
        }
    },
    methods: {
        onShow: function () {
            this.loaded = false;
        },
        onShown: async function () {
            this.loaded = false;
            await this.loadStripe();
            this.$nextTick(async () => {
                await this.showCard();
                this.loaded = true;
            });
        },
        /**
         * Add or remove the script tag for the stripe code.
         * @return {Promise<HTMLScriptElement>} The script tag.
         */
        loadStripe: function () {
            return new Promise((resolve, reject) => {
                const script = document.getElementById(stripeScriptId) || document.createElement("script");

                if (script.loaded) {
                    resolve(script);
                } else {
                    script.async = true;
                    script.onload = () => {
                        script.loaded = true;
                        resolve(script);
                    };

                    script.setAttribute("id", stripeScriptId);
                    script.setAttribute("src", "https://js.stripe.com/v3/");
                    document.head.appendChild(script);
                }
            });
        },

        showCard: function () {
            return new Promise(resolve => {
                // defined externally by Stripe
                // eslint-disable-next-line no-undef,new-cap
                this.stripe = Stripe(this.CONFIG.STRIPE_KEY);
                this.stripeElement = this.stripe.elements().create("card", {
                    hidePostalCode: true,
                    style: {
                        base: {
                            fontSize: "1.2rem"
                        }
                    },
                    classes: {
                        complete: "is-valid",
                        invalid: "is-invalid",
                        empty: "is-invalid"
                    }
                });

                const cardElement = document.querySelector("#card-capture");

                this.stripeElement.mount(cardElement);

                this.stripeElement.on("ready", () => this.$nextTick(resolve));

                this.stripeElement.on("change", e => {
                    this.form.card = e.empty ? "" : Math.random();
                    this.cardValidationError = !e.complete;
                    if (this.cardValidationError) {
                        this.$v.form.card.$message = e.error?.message || "Card information is incomplete";
                        this.$v.form.card.$touch();
                    } else {
                        this.$v.form.card.$message = null;
                    }
                });
                this.stripeElement.on("blur", e => {
                    cardElement.classList.toggle("is-invalid", this.cardValidationError);
                    this.form.card = this.form.card && Math.random();
                    this.$v.form.card.$touch();
                });
            });
        },

        validateCard: function (v) {
            return !this.cardValidationError;
        },

        removeStripe: function () {
            // eslint-disable-next-line no-unused-expressions
            document.getElementById(stripeScriptId)?.remove();
        },

        submitCard: async function () {
            delete this.form.card;
            const tokenResponse = await this.stripe.createToken(this.stripeElement, this.form);
            if (tokenResponse.error) {
                return Promise.reject(tokenResponse.error);
            } else {
                await billingService.updateBillingCard(this.communityId, tokenResponse.token.id);
            }

            return true;
        }
    }
};
</script>
