<template>
  <b-form @submit.stop.prevent="onSubmit" role="form" aria-labelledby="community-heading">
    <b-alert variant="danger" :show="errorAlert">
      {{ errorMessage }}
    </b-alert>
    <b-alert variant="success" :show="successAlert">
      {{ successMessage }}
    </b-alert>
    <b-form-group>
      <label for="community-name">
        Community:
      </label>
     <b-input-group>
        <b-form-input
          v-model="$v.form.communityName.$model"
          :state="validateState('communityName')"
          placeholder="my-community"
          id="community-name"
        />
        <b-form-invalid-feedback>This is a required field.</b-form-invalid-feedback>
      </b-input-group>
    </b-form-group>
    <b-form-group>
      <label for="community-user-email">
        Enter your email:
      </label>
      <b-form-input
        v-model="$v.form.email.$model"
        :state="validateState('email')"
        placeholder="user@somewhere.com"
        id="community-user-email"
      />
      <b-form-invalid-feedback>This is a required field and must be a valid email address.</b-form-invalid-feedback>
    </b-form-group>
    <b-form-group>
      <label for="community-first-name">
        First name:
      </label>
      <b-form-input
        v-model="form.firstName"
        placeholder="Pat"
        id="community-first-name"
      />
    </b-form-group>
    <b-form-group>
      <label for="community-last-name">
        Last name:
      </label>
      <b-form-input
        v-model="form.lastName"
        placeholder="Smith"
        id="community-last-name"
      />
    </b-form-group>
    <b-form-group>
      <label for="community-user-password">
        Password:
      </label>
      <b-form-input
        v-model="$v.form.password.$model"
        :state="validateState('password')"
        placeholder="Must be at least 6 characters"
        type="password"
        id="community-user-password"
      />
      <b-form-invalid-feedback>This is a required field and must be at least 6 characters.</b-form-invalid-feedback>
    </b-form-group>
    <b-form-group>
      <label for="community-user-password-confirm">
        Password Confirmation:
      </label>
      <b-form-input
        v-model="$v.form.confirmPassword.$model"
        :state="validateState('confirmPassword')"
        placeholder="Re-enter password"
        type="password"
        id="community-user-password-confirm"
      />
      <b-form-invalid-feedback>This is a required field and must match password.</b-form-invalid-feedback>
    </b-form-group>
<!--     <br>
    <legend>Subscription Plan</legend>
    <b-form-group id="subscription-plans">
      <b-form-radio v-model="$v.form.subscriptionPlan.$model" name="bronze" value="bronze">
        <h5 class="text-bronze"><b>Bronze Tier</b></h5>
        <h6 class="mb-0"><b>$10</b>/mo for <b>10</b> member community</h6>
      </b-form-radio>
      <b-form-radio v-model="$v.form.subscriptionPlan.$model" name="silver" value="silver">
        <h5 class="text-secondary"><b>Silver Tier</b></h5>
        <h6 class="mb-0"><b>$15</b>/mo for <b>20</b> member community</h6>
      </b-form-radio>
      <b-form-radio v-model="$v.form.subscriptionPlan.$model" name="gold" value="gold">
        <h5 class="text-warning"><b>Gold Tier</b></h5>
        <h6 class="mb-0"><b>$20</b>/mo for <b>50</b> member community</h6>
      </b-form-radio>
      <b-form-invalid-feedback>This is a required field.</b-form-invalid-feedback>
    </b-form-group>
    <br>
    <legend>Payment Gateway</legend>
    <b-form-group id="payment-gateways">
      <b-form-radio v-model="$v.form.paymentOptions.$model" name="stripe" value="stripe">
        <img src="/img/payment-icon-stripe.svg" alt="Stripe">
      </b-form-radio>
      <b-form-invalid-feedback>This is a required field.</b-form-invalid-feedback>
    </b-form-group> -->
    <b-button type="submit" variant="primary">Create new Community</b-button>
  </b-form>
</template>

<style>
  #subscription-plans .custom-radio,
  #payment-gateways .custom-radio {
    background: white;
    border: 1px solid #ddd;
    padding: 1rem 1rem 1rem 2.5rem;
    margin-bottom: .5rem;
  }
  #subscription-plans label {
    width: 100%;
  }
  #payment-gateways img {
    height: 2rem;
    vertical-align: baseline;
  }
</style>

<script>
import { validationMixin } from 'vuelidate'
import { required, minLength, sameAs, email } from 'vuelidate/lib/validators'
import { ERROR_MAP, MESSAGES } from '@/utils/constants'

export default {
  mixins: [validationMixin],
  data () {
    return {
      form: {
        communityName: '',
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: ''
        // subscriptionPlan: 'bronze',
        // paymentOptions: 'stripe'
      },
      errorAlert: false,
      successAlert: false,
      errorMessage: null,
      successMessage: MESSAGES.successfulRegistration
    }
  },
  validations: {
    form: {
      communityName: {
        required
      },
      email: {
        required,
        email
      },
      password: {
        required,
        minLength: minLength(6)
      },
      confirmPassword: {
        required,
        sameAsPassword: sameAs('password')
      }
      // subscriptionPlan: {
      //   required
      // },
      // paymentOptions: {
      //   required
      // }
    }
  },
  methods: {
    validateState (name) {
      const { $dirty, $error } = this.$v.form[name]
      return $dirty ? !$error : null
    },
    async onSubmit () {
      this.$v.form.$touch()
      if (this.$v.form.$anyError) {
        return
      }
      this.$store.dispatch('register', this.$v.form.$model)
        .then(() => {
          this.successAlert = true
          this.$store.dispatch('login', this.$v.form.$model)
            .then(() => {
              setTimeout(() => {
                this.$store.dispatch('newCommunity', this.$v.form.$model.communityName)
                  .then(() => {
                    this.$router.push('/dashboard')
                  })
              }, 1000)
            })
        })
        .catch(err => {
          if (err.response) {
            if (err.response.data.error === 'existing_email') {
              this.errorMessage = ERROR_MAP[2]
            } else if (err.response.data.error === 'existing_username') {
              this.errorMessage = ERROR_MAP[3]
            } else {
              this.errorMessage = ERROR_MAP[err.response.status] || 'Something went wrong'
            }
          } else {
            this.errorMessage = ERROR_MAP[500]
          }
          this.errorAlert = true
        })
    }
  }
}
</script>
