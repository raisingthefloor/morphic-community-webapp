<!-- A dialog that accepts a single text field -->
<template>

  <b-modal @ok="onOK"
           @show="onShow"
           :id="dialogId"
           v-bind="$attrs"
  >

    <slot/>

    <template #modal-footer="{ ok, cancel }" >
      <b-alert :show="!!errorMessage" variant="danger" class="small p-2">{{ errorMessage }}</b-alert>
      <b-button v-if="!okOnly" @click="cancel()" variant="secondary">{{ cancelTitle || "Cancel" }}</b-button>
      <b-button @click="ok()" variant="primary">{{ okTitle || "OK" }}</b-button>
    </template>
  </b-modal>

</template>

<script>

export default {
    name: "Dialog",

    props: {
        id: String,
        okOnly: Boolean,
        okTitle: String,
        cancelTitle: String
    },
    data: function () {
        return {
            errorMessage: null,
            dialogId: this.id || this.generateId("dialog")
        };
    },
    methods: {
        onShow: function () {
            this.$emit("show");
        },
        /**
         * OK button was clicked. Raises an "ok" event, and closes the dialog. If the event object comes back with the
         * promise field set, then the dialog is closed when the promise resolves with true.
         * @param {Event} event BvModalEvent object.
         */
        onOK: function (event) {
            event.preventDefault();

            const okEvent = {
                promise: undefined
            };

            this.$emit("ok", okEvent);

            const p = okEvent.promise || Promise.resolve(true);

            p.then(success => {
                if (success) {
                    this.$emit("input", this.newValue);
                    this.hideDialog();
                }
            }).catch(err => {
                this.errorMessage = err.message;
            });

        },
        hideDialog: function () {
            this.$bvModal.hide(this.dialogId);
        }
    }
};
</script>

<style lang="scss">
.textInputDialog {
  .textInputDialogField .requiredText {
    display: none;
  }

  footer.modal-footer {
    flex-wrap: nowrap;

    .alert {
      margin-right: auto;
      width: fit-content;
    }
  }
}
</style>
