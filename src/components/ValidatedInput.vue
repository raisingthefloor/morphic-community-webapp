<!-- form input group for a text input field, which handles validation -->
<template>
  <div>
    <b-form-group
        :label="labelText"
        :label-for="inputId"
        label-cols="9"
        label-align="left"
        class="mb-0"
        style="height: 30px"
    >
    <div style="display: flex; justify-content: flex-end; align-items: center;">
        <b-link  :to="to" variant="link" style="font-size: 15px;" >{{linktext}}</b-link>
   </div>
    </b-form-group>
    <b-form-group>
      <b-form-input
          :value="value || (validation && validation.$model)"
          @input="onInput"
          :state="state"
          :placeholder="placeholder"
          :id="inputId"
          :type="type"
          :autocomplete="autocomplete"
          style="height: 40px"
      />
      <span>{{inputInfo}}</span>
      <b-form-invalid-feedback>
        <span v-if="state === false">{{ errorText }}</span>
      </b-form-invalid-feedback>
    </b-form-group>
  </div>
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
        autocomplete: String,
        linktext: String,
        to: String
        autocomplete: String,
        linktext: String,
        to: String,
        inputInfo: String
    },
    data() {
        return {
            labelText: this.noComma ? this.label : `${this.label}:`,
            inputId: this.id || "input" + Math.random(),
            errorMessages: Object.assign({}, defaultErrorMessages, this.errors),
            currentValue: this.value || (this.validation && this.validation.$model)
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
        }
    }
};
</script>
