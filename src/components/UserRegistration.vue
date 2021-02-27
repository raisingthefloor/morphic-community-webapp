<template>
  <b-form @submit.stop.prevent="onSubmit" role="form" aria-labelledby="community-heading">
    <b-alert variant="danger" :show="errorAlert">
      {{ errorMessage }}
    </b-alert>

    <ValidatedInput id="community-name"
                    label="Community"
                    :validation="$v.form.communityName"
                    placeholder="my-community"
    />
    <ValidatedInput id="community-user-email"
                    label="Enter your email"
                    :validation="$v.form.email"
                    placeholder="user@somewhere.com"
    />
    <ValidatedInput id="community-first-name"
                    label="First name"
                    v-model="form.firstName"
                    placeholder="Pat"
    />
    <ValidatedInput id="community-last-name"
                    label="Last name"
                    v-model="form.lastName"
                    placeholder="Smith"
    />
    <ValidatedInput id="community-user-new-password"
                    label="Password"
                    :validation="$v.form.password"
                    placeholder="Enter password"
                    type="password"
                    :errors="{minLength: 'Passwords must be at least 6 characters'}"
    />

    <ValidatedInput id="community-user-new-password-confirm"
                    label="Password confirmation"
                    :validation="$v.form.confirmPassword"
                    placeholder="Re-enter password"
                    type="password"
    />
    <b-form-invalid-feedback>This is a required field and must match password.</b-form-invalid-feedback>
    <b-button type="submit" variant="primary">Create new Community</b-button>
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
    mixins: [validationMixin],
    data() {
        return {
            form: {
                communityName: "",
                email: "",
                firstName: "",
                lastName: "",
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
