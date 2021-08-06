/**
 * Mix-in for accessibility helpers.
 * @type {Component}
 */
export const a11yMixin = {
    methods: {
        /**
         * Make a drop-down support focus wrapping.
         *
         * @param {BDropdown} dropdown The b-dropdown component.
         */
        a11yWrapDropdown: function (dropdown) {
            if (dropdown.focusNext.orig) {
                return;
            }
            const orig = dropdown.focusNext;

            dropdown.focusNext = (event, up) => {
                const items = dropdown.getItems();
                const index = items.indexOf(event.target);

                // When attempting to move beyond the limit, wrap the next focus by faking the selected item to the
                // one after/before the item at other end, and change the direction, before calling the real
                // focusNext().
                let newTarget;
                if (up && index === 0) {
                    newTarget = items[items.length - 2];
                } else if (!up && index >= items.length - 1) {
                    newTarget = items[1];
                }

                if (newTarget) {
                    // Create a dummy event object - this is all focusNext() requires.
                    const e = {
                        target: newTarget,
                        stopPropagation() {
                            event.stopPropagation();
                        },
                        preventDefault() {
                            event.preventDefault();
                        }
                    };
                    dropdown.focusNext.orig(e, !up);
                } else {
                    dropdown.focusNext.orig(event, up);
                }
            };

            dropdown.focusNext.orig = orig;
        }
    }
};
