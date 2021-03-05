<!-- form input group for a text input field, which handles validation -->
<template>
  <b-form-group
          :label="labelText"
          :label-for="inputId"
  >
    <b-form-input
            :value="value || (validation && validation.$model)"
            @input="onInput"
            :state="state"
            :placeholder="placeholder"
            :id="inputId"
            :type="type"
            :autocomplete="autocomplete"
    />
    <b-form-invalid-feedback>
      <span v-if="state === false">{{ errorText }}</span>
    </b-form-invalid-feedback>
  </b-form-group>
</template>

<style lang="scss">

</style>

<script>

const defaultErrorMessages = {
    email: "Please enter a valid email address",
    required: "Required",
    sameAsPassword: "Passwords do not match"
};

export default {
    name: "ValidatedInput",
    components: {},
    props: {
        /** The $v object for the value */
        validation: Object,
        /** Error messages, for each validation rule */
        errors: Object,
        label: String,
        id: String,
        placeholder: String,
        type: String,
        noComma: Boolean,
        value: String,
        autocomplete: String
    },
    data() {
        return {
            labelText: this.noComma ? this.label : `${this.label}:`,
            inputId: this.id || "input" + Math.random(),
            errorMessages: Object.assign({}, defaultErrorMessages, this.errors)
        };
    },
    computed: {
        state: function () {
            return (this.validation && this.validation.$anyDirty) ? !this.validation.$anyError : null;
        },
        errorText: function () {
            let result;
            if (this.state === false) {
                for (const [key, value] of Object.entries(this.validation)) {
                    if (!key.startsWith("$") && !value) {
                        result = this.errorMessages[key];
                        break;
                    }
                }
            }
            return result;
        }
    },
    methods: {
        onInput($event) {
            if (this.validation) {
                this.validation.$model = $event;
            }
            this.$emit("input", $event);
        }
    }
};
</script>
