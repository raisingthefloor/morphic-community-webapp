<template>
  <b-form @submit.stop.prevent="onSubmit" role="form" aria-labelledby="community-heading">
    <b-alert variant="danger" :show="errorAlert">
      {{ errorMessage }}
    </b-alert>
    <ValidatedInput id="email"
                    label="Email"
                    :validation="$v.form.email"
                    placeholder="user@somewhere.com"
                    description="You will need to confirm using email send to you"
    />
    <ValidatedInput id="new-password"
                    ref="newPassword"
                    label="Password"
                    :validation="$v.form.password"
                    placeholder="Enter password"
                    type="password"
                    :errors="{minLength: 'Passwords must be at least 6 characters'}"
                    password-toggle
                    password-confirm="new-password-confirm"
    />
    <ValidatedInput id="new-password-confirm"
                    ref="passwordConfirm"
                    label="Password confirmation"
                    :validation="$v.form.confirmPassword"
                    placeholder="Re-enter password"
                    type="password"
    />
    <ValidatedInput id="community-name"
                    label="What would you like to name the account?"
                    :validation="$v.form.communityName"
                    description="(examples: John Doe, Acme Corporation, Church)"

    />
    <b-form-invalid-feedback>This is a required field and must match password.</b-form-invalid-feedback>
      <div style="display: flex; flex-direction: column; justify-content: flex-start; margin-bottom: 50px">
          <b-link  v-if="createAccount" class="mb-3" style="color: inherit; text-decoration: none; border: 1px solid black; padding: 10px; border-radius: 5px; width: 270px" to="/" >
              {{ createAccount }}
          </b-link>
          <div>By signing up for Morphic you are agreeing to the</div>
          <div><b-link to="#">Terms of Use</b-link> and <b-link to="https://morphic.org/privacy-policy/">Privacy Policies</b-link></div>
      </div>
      <div style="display: flex; justify-content: space-between">
          <b-link style="color: inherit; text-decoration: none; border: 1px solid black; padding: 10px; border-radius: 5px" to="/">
              {{ backLink }}
          </b-link>
          <b-button type="submit" variant="success" class="w-25">{{ submitButtonText }}</b-button>
      </div>

  </b-form>
</template>

<style>
</style>

<script>
import { validationMixin } from "vuelidate";
import { email, minLength, required, sameAs } from "vuelidate/lib/validators";
import { ERROR_MAP, MESSAGES } from "@/utils/constants";
import ValidatedInput from "@/components/ValidatedInput";

export default {
    components: {ValidatedInput},
    props: {
        backLink: String,
        submitButtonText: String,
        createAccount: String,
        linkStyle: String
    },
    mixins: [validationMixin],
    data() {
        return {
            form: {
                communityName: "",
                email: "",
                password: "",
                confirmPassword: ""
            },
            errorAlert: false,
            errorMessage: null
        };
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
                sameAsPassword: sameAs("password")
            }
        }
    },
    methods: {
        validateState(name) {
            const { $dirty, $error } = this.$v.form[name];
            return $dirty ? !$error : null;
        },
        async onSubmit() {
            this.$v.form.$touch();
            if (this.$v.form.$anyError) {
                return;
            }
            this.$store.dispatch("register", this.$v.form.$model)
                .then(() => {
                    this.showMessage(MESSAGES.successfulRegistration);
                    this.$store.dispatch("login", this.$v.form.$model)
                        .then(() => {
                            this.$store.dispatch("newCommunity", this.$v.form.$model.communityName)
                                .then(() => {
                                    this.$router.push("/dashboard");
                                });
                        });
                })
                .catch(err => {
                    if (err.response) {
                        if (err.response.data.error === "existing_email") {
                            this.errorMessage = ERROR_MAP[2];
                        } else if (err.response.data.error === "existing_username") {
                            this.errorMessage = ERROR_MAP[3];
                        } else {
                            this.errorMessage = ERROR_MAP[err.response.status] || "Something went wrong";
                        }
                    } else {
                        this.errorMessage = ERROR_MAP[500];
                    }
                    this.errorAlert = true;
                });
        }
    }
};
</script>
