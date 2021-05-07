
/**
 * Mix-in for dialogs.
 * @type {Component}
 */
export const dialogMixin = {
    data: function () {
        return {
            errorMessage: null,
            dialogId: this.id || this.generateId("dialog")
        };
    },
    computed: {
        /**
         * Attributes for a b-modal.
         * @return {Object<String,String>} A modified $attrs object
         */
        dialogAttrs: function () {
            // Make some adjustments to the dialogs for mobiles
            const attrs = {
                ...this.$attrs,
                largeDialog: this.isMobile,
                // Stop the back-drop covering the header (the dialog will be stretched over the screen anyway)
                hideBackdrop: this.isMobile,
                noCloseOnBackdrop: this.isMobile,
                // The buttons take up too much space when the on-screen keyboard is open
                scrollable: !this.isMobile
            };

            attrs.dialogClass = `${attrs.dialogClass} mobile-headerMarginTop mobile-headerMinHeight`;

            return attrs;
        }
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
