<template>
  <div>
    <h2 class="mb-3" id="user-login-heading" style="font-weight: bold">Sign into Morphic</h2>
    <b-alert variant="danger" :show="errorAlert">
      {{ errorMessage }}
    </b-alert>
    <b-form @submit.stop.prevent="onSubmit" role="form" aria-labelledby="user-login-heading">
      <ValidatedInput id="login-user-email"
                      label="Sign in with Email"
                      placeholder="user@example.com"
                      :validation="$v.userInfo.email"
                      @input="storeResetEmail"
      />
<!--        <b-link to="/reset-password" variant="link">Forgot Password</b-link>-->
      <ValidatedInput id="login-user-password"
                      label="Password for Morphic"
                      :validation="$v.userInfo.password"
                      type="password"
                      linktext="Forget Password?"
                      to="/reset-password"
      />
         <div style="margin-top: 100px; height: 200px;">
             <b-link style="color: inherit; text-decoration: none;" to="/register">
                 <div style="height: 40px; border: 1px solid black; border-radius: 5px; width: 300px; display: flex; justify-content: center; align-items: center; margin-left: auto; margin-right: auto">
                     I do not have Morphic account yet
                 </div>
             </b-link>
             <b-button type="submit"
                       id="loginButton"
                       :disabled="$v.userInfo.$anyError"
                       style="margin-top: 70px; background-color: green"

             >Sign in</b-button>
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
