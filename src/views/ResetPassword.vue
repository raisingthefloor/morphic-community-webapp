<template>
  <b-jumbotron class="mb-0" bg-variant="light">
    <b-row class="pt-5 pb-5">
      <b-col md="3">
      </b-col>
      <b-col md="6">
        <h3 v-t="'reset-password.heading'" />
        <p class="lead" v-t="'reset-password.instructions'" />
        <br />
        <b-form @submit.stop.prevent="onSubmit">
          <b-alert variant="danger" :show="errorAlert">
            {{ errorMessage }}
          </b-alert>
          <ValidatedInput id="login-user-email"
                          :label="$t('reset-password.enter-your-email-address')"
                          placeholder="user@example.com"
                          :validation="$v.form.email"
          />

          <b-row>
            <b-col md="6">
              <b-link to="/" variant="success" class="ml-1" v-t="'reset-password.return-to-login_link'" />
            </b-col>

            <b-col md="6" style="text-align: right" >
              <b-button type="submit" variant="primary" v-t="'reset-password.reset-password_button'" />
            </b-col>
          </b-row>
        </b-form>
      </b-col>
      <b-col md="3">
      </b-col>
    </b-row>
  </b-jumbotron>
</template>

<script>
import { required, email } from "vuelidate/lib/validators";
import { ERROR_MAP, MESSAGES } from "@/utils/constants";
import ValidatedInput from "@/components/ValidatedInput";

export default {
    components: {ValidatedInput},
    data() {
        return {
            form: {
                email: this.$store.getters.resetPasswordEmail || ""
            },
            errorAlert: false,
            errorMessage: null,
            recaptchaToken: null,
            firstName: ""
        };
    },
    validations: {
        form: {
            email: {
                required,
                email
            }
        }
    },
    async mounted() {
        this.recaptchaToken = await this.getRecaptchaToken("requestpasswordreset");
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
            const body = {
                email: this.$v.form.$model.email,
                g_recaptcha_response: this.recaptchaToken
            };
            this.$store.dispatch("resetPassword", body)
                .then(() => {
                    this.showMessage(MESSAGES.successfulReset);
                    this.$router.push("/");
                })
                .catch(err => {
                    if (err.response) {
                        this.errorMessage = (err.response.message ? err.response.message : (ERROR_MAP[err.response.status] ? ERROR_MAP[err.response.status] : "Something went wrong"));
                    } else {
                        this.errorMessage = ERROR_MAP[500];
                    }
                    this.errorAlert = true;
                });
        }
    }
};
</script>
