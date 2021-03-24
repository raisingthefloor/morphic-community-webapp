<template>
  <b-form @submit.stop.prevent="onSubmit" role="form" aria-labelledby="community-heading">
    <b-alert variant="danger" :show="errorAlert">
      {{ errorMessage }}
    </b-alert>
    <ValidatedInput id="community-user-email"
                    label="Email"
                    :validation="$v.form.email"
                    placeholder="user@somewhere.com"
                    input-info="You will need to confirm using email send to you"
    />
    <ValidatedInput id="community-user-new-password"
                    label="Create Password for Morphic"
                    :validation="$v.form.password"
                    placeholder="Enter password"
                    type="password"
                    :errors="{minLength: 'Passwords must be at least 6 characters'}"
    />
      <ValidatedInput id="community-name"
                      label="What will you like to name the account?"
                      :validation="$v.form.communityName"
                      input-info="Examples: Your name, Organization name, others..."

      />
    <b-form-invalid-feedback>This is a required field and must match password.</b-form-invalid-feedback>
      <div style="display: flex; flex-direction: column; justify-content: flex-start; margin-bottom: 50px">
          <div>By Signing up for Morphic you are agreeing to the</div>
          <div><b-link>Terms of Use</b-link> and <b-link>Privacy Policies</b-link></div>
      </div>
      <div style="display: flex; justify-content: space-between">
          <b-link to="/">
              <b-button  variant="white" style="border: 1px solid black; width: 100px">Back</b-button>
          </b-link>
          <b-button type="submit" style="background-color: green; width: 100px">Sign up</b-button>
      </div>

  </b-form>
</template>

<style>
</style>

<script>
import { validationMixin } from "vuelidate";
import { email, minLength, required } from "vuelidate/lib/validators";
import { ERROR_MAP, MESSAGES } from "@/utils/constants";
import ValidatedInput from "@/components/ValidatedInput";

export default {
    components: {ValidatedInput},
    mixins: [validationMixin],
    data() {
        return {
            form: {
                communityName: "",
                email: "",
                password: ""
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
