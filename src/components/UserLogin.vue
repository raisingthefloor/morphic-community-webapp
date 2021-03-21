<template>
  <div>
    <h2 class="mb-3" id="user-login-heading">Login</h2>
    <b-alert variant="danger" :show="errorAlert">
      {{ errorMessage }}
    </b-alert>
    <b-form @submit.stop.prevent="onSubmit" role="form" aria-labelledby="user-login-heading">
      <ValidatedInput id="login-user-email"
                      label="Enter your email"
                      placeholder="user@example.com"
                      :validation="$v.userInfo.email"
                      @input="storeResetEmail"
      />
      <ValidatedInput id="login-user-password"
                      label="Enter your password"
                      :validation="$v.userInfo.password"
                      type="password"
      />

      <b-form-checkbox-group>
        <b-form-checkbox
          v-model="userInfo.keep_logged"
          value="1"
          unchecked-value="0"
        >
          Keep me logged in
        </b-form-checkbox>
        <b-button type="submit"
                  id="loginButton"
                  variant="primary"
                  :disabled="$v.userInfo.$anyError"
        >Login</b-button>
      </b-form-checkbox-group>
      <br/>
      <b-link to="/reset-password" variant="link">Forgot Password</b-link>
    </b-form>
  </div>
</template>

<style lang="scss">
#loginButton {
  padding-left: 2em;
  padding-right: 2em;
  float: right;
}
</style>

<script>
import { validationMixin } from "vuelidate";
import { required, email } from "vuelidate/lib/validators";
import { ERROR_MAP } from "@/utils/constants";
import ValidatedInput from "@/components/ValidatedInput";


export default {
    components: {ValidatedInput},
    mixins: [validationMixin],
    data() {
        return {
            userInfo: {
                email: "",
                password: "",
                keep_logged: 1
            },
            errorAlert: false,
            errorMessage: null
        };
    },
    validations: {
        userInfo: {
            email: {
                required,
                email
            },
            password: {
                required
            }
        }
    },
    methods: {
        storeResetEmail() {
            this.$store.commit("reset_password_email", this.userInfo.email);
        },
        onSubmit() {
            this.$v.userInfo.$touch();
            if (this.$v.userInfo.$anyError) {
                return;
            }
            this.$store.dispatch("login", this.$v.userInfo.$model)
                .then((dest) => {
                    this.userInfo.email = "";
                    this.userInfo.password = "";
                    this.$router.push(dest);
                })
                .catch(err => {
                    if (err.response) {
                        if (err.response.data.error === "invalid_credentials") {
                            this.errorMessage = ERROR_MAP[1];
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
