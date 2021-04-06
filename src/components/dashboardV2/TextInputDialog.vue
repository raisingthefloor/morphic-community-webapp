<!-- A dialog that accepts a single text field -->
<template>
  <b-modal :id="id" :title="title"
           @ok="onOK"
           @cancel="onCancel"
           @show="newValue = value, changed = false"
           :ok-title="okTitle"
           :cancel-title="cancelTitle"
           :centered="centered"
  >
    <b-form-group :label="prompt">
      <b-form-input v-model="newValue"
                    ref="textInput"
                    autofocus required
                    :placeholder="placeholder"
                    @keydown.native.enter="onEnter"
                    @input="changed = true"
                    :state="changed ? newValue !== '' : null"
      />
      <small v-if="lowerText">{{lowerText}}</small>
    </b-form-group>
  </b-modal>

</template>

<script>

/**
 * Event object for the `ok` event.
 * @typedef {Object} TextInputOKEvent
 * @property {String} oldValue The original value.
 * @property {String} newValue The new value.
 * @property {Promise?} promise Resolves with true to dismiss the dialog.
 */

export default {
    name: "TextInputDialog",
    props: {
        /** Dialog title */
        title: String,
        /** Text above the field */
        prompt: String,
        /** Placeholder text for the input field */
        placeholder: String,
        /** Initial field value */
        value: String,
        /** Modal ID */
        id: String,
        /** Small text under the field */
        lowerText: String,
        okTitle: String,
        cancelTitle: String,
        centered: Boolean
    },
    data: function () {
        return {
            newValue: null,
            changed: false
        };
    },
    methods: {
        onEnter: function (event) {
            this.onOK(event);
        },
        /**
         * OK button was clicked. Raises an "ok" event, and closes the dialog. If the event object comes back with the
         * promise field set, then the dialog is closed when the promise resolves with true.
         * @param {Event} event BvModalEvent object.
         */
        onOK: function (event) {
            event.preventDefault();

            if (this.newValue === "") {
                this.changed = true;
                this.$refs.textInput.$el.focus();
                return;
            }

            const okEvent = {
                oldValue: this.value,
                newValue: this.newValue,
                promise: undefined
            };

            this.$emit("ok", okEvent);

            const p = okEvent.promise || Promise.resolve(true);

            p.then(success => {
                if (success) {
                    this.$emit("input", this.newValue);
                    this.hideDialog();
                }
            });

        },
        hideDialog: function () {
            this.$bvModal.hide(this.id);
        },
        onCancel: function () {

        }
    }
};
</script>

<style scoped>

</style>
