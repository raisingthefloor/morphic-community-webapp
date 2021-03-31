<!-- form input group for a text input field, which handles validation -->
<template>
  <div>
    <b-form-group
        :label="labelText"
        :label-for="inputId"
    >

      <template #label>{{labelText}}<span v-if="required" class="requiredText" aria-hidden="true">Required</span></template>

      <b-form-input
          :value="value || (validation && validation.$model)"
          @input="onInput"
          @blur="onBlur"
          :state="state"
          :placeholder="placeholder"
          :id="inputId"
          :type="type"
          :autocomplete="autocomplete"
          class="h-20 w-80"
          :aria-required="required"
          :autofocus="autofocus"
      />

      <template #invalid-feedback>
        <span v-if="state === false">{{ errorText }}&nbsp;</span>
      </template>

      <template #description>
      <div v-if="to && linktext" style="display: flex; justify-content: flex-end; align-items: center;">
          <b-link :to="to" variant="link" style="font-size: 1rem;" >{{linktext}}</b-link>
      </div>
      </template>

      <span>{{inputInfo}}</span>
    </b-form-group>
  </div>
</template>

<style lang="scss">
.requiredText {
  float: right;
  margin-top: 0.5em;
  font-size: 0.9rem;
}
.invalid-feedback span {
  font-size: 0.9rem;
}
</style>

<script>

const defaultErrorMessages = {
    email: "Please enter a valid email address.",
    required: "This field is required",
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
        noColon: Boolean,
        value: String,
        autocomplete: String,
        linktext: String,
        to: String,
        inputInfo: String,
        autofocus: Boolean
    },
    data() {
        return {
            inputId: this.id || "input" + Math.random(),
            errorMessages: Object.assign({}, defaultErrorMessages, this.errors),
            currentValue: this.value || (this.validation && this.validation.$model)
        };
    },
    computed: {
        state: function () {
            return (this.validation && this.validation.$anyDirty) ? !this.validation.$anyError : null;
        },
        required: function () {
            return this.validation && this.validation.required !== undefined;
        },
        labelText: function () {
            return this.noColon ? this.label : `${this.label}:`;
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
        },
        inputValue: function () {
            return this.currentValue;
        }
    },
    methods: {
        onInput($event) {
            if (this.validation) {
                this.validation.$model = $event;
            }
            this.currentValue = $event;
            this.$emit("input", $event);
        },
        onBlur($event) {
            if (this.validation) {
                this.validation.$touch();
            }
        }
    }
};
</script>
