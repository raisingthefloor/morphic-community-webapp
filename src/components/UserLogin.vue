<template>
  <div>
    <h2 class="mb-3" id="user-login-heading" v-t="'UserLogin.heading'" />
    <b-alert variant="danger" :show="errorAlert">
      {{ errorMessage }}
    </b-alert>
    <b-form @submit.stop.prevent="onSubmit" role="form" aria-labelledby="user-login-heading">
      <ValidatedInput id="login-user-email"
                      :label="$t('UserLogin.email_label')"
                      :placeholder="$t('UserLogin.email_placeholder')"
                      :validation="$v.userInfo.email"
                      @input="storeResetEmail"
      />
<!--        <b-link to="/reset-password" variant="link">Forgot Password</b-link>-->
      <ValidatedInput id="login-user-password"
                      :label="$t('UserLogin.password_label')"
                      :validation="$v.userInfo.password"
                      type="password"
                      :linktext="$t('UserLogin.password-reset_link')"
                      to="/reset-password"
      />
         <div style="margin-top: 100px; height: 200px;">
             <b-link style="color: inherit; text-decoration: none;" to="/register">
                 <div style="height: 40px; border: 1px solid black; border-radius: 5px; width: 300px; display: flex; justify-content: center; align-items: center; margin-left: auto; margin-right: auto" v-t="'UserLogin.no-account_link'" />
             </b-link>
             <b-button type="submit"
                       id="loginButton"
                       :disabled="$v.userInfo.$anyError"
                       style="margin-top: 70px; background-color: green"

              v-t="'UserLogin.login_button'" />
         </div>
      <br/>
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
