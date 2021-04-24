<template>
  <b-modal id="modalEditGeneric"
           @ok="okClicked" @cancel="closeDialog(false)" @hide="onHide"
           size="lg" scrollable centered
           footer-bg-variant="light"
           :title="dialogTitle">

    <template #modal-footer="{ok, cancel, hide}" >
        <b-button @click="hide('remove')" variant="outline-danger" style="position: absolute; left: 0; margin-left: 20px"><b-icon icon="trash"/>Remove</b-button>
        <b-button @click="cancel()" variant="secondary">Cancel</b-button>
        <b-button @click="ok()"
                  variant="primary"
                  :disabled="button && button.data.isPlaceholder"
        >Save</b-button>
    </template>
    <div v-if="button">
      <b-form>
        <b-row>
          <b-col md="6">
            <!-- The button fields -->
            <div>
              <b-form-group v-if="showRelated"
                            :label="buttonGroup.editItemField"
                            label-for="barItem_selectOther"
                            >

                <div class="relatedSelection">
                  <b-dropdown variant="light"
                              ref="RelatedDropdown"
                              id="relatedDropdown"
                              menu-class=""
                              boundary="viewport"
                              @show="relatedDropdown(true)"
                              @hidden="relatedDropdown(false)"
                  >
                    <template #button-content>
                      <template v-if="!button.data.isPlaceholder">
                        <b-img v-if="relatedButtons[button.data.buttonKey].configuration.image_url" :src="getIconUrl(relatedButtons[button.data.buttonKey].configuration.image_url)" :alt="relatedButtons[button.data.buttonKey].configuration.label + ' logo'" />
                        {{
                          relatedButtons[button.data.buttonKey].data.catalogLabel || relatedButtons[button.data.buttonKey].configuration.label
                        }}
                      </template>
                      <template v-else>
                        {{selectionText}}
                      </template>
                    </template>


                    <template v-for="(item, buttonKey) in relatedButtons"
                              :class="buttonKey === button.data.buttonKey && 'selected'">

                      <b-dropdown-item-button v-if="!item.data.isPlaceholder"
                                              :key="buttonKey"
                                              @click="setButton(item)"
                      >
                      <b-img v-if="item.configuration.image_url" :src="getIconUrl(item.configuration.image_url)"
                             alt="" />{{ item.data.catalogLabel || item.configuration.label }}
                      </b-dropdown-item-button>
                  </template>

                  </b-dropdown>
                </div>

              </b-form-group>

              <BarItemFields v-if="!!button"
                             :bar-item="button"
                             :autofocus="!showRelated && !button.data.isPlaceholder"/>

              <div class="bg-silver rounded p-3">
                <p v-if="showExtra" class="text-right small mb-0">
                  (<b-link @click="showExtra = false">Hide</b-link>)
                </p>
                <p v-else class="small">
                  Optional: <b-link @click="showExtra = true">Customize the button (color &amp; picture)</b-link>
                </p>
                <div v-if="showExtra">
                  <h6><b>Color for button</b></h6>
                  <div class="bg-white rounded p-3 mb-4">
                    <div
                            v-for="(hex, name) in colors"
                            :key="name"
                            @click="changeColor(hex)"
                            :title="name"
                            :class="{ active: (button.configuration.color || colors.blue) === hex }"
                            class="colorBoxHolder"
                    >
                      <div :style="'background-color: ' + hex + ';'" class="colorBox"></div>
                    </div>
                  </div>

                  <h6><b>Picture for button</b></h6>
                  <div class="bg-white rounded p-3 compactIconHolder">
                    <!-- no image -->
                    <div class="iconBoxHolder" :class="{ active: (!button.configuration.image_url) }">
                      <div
                              @click="changeIcon('')"
                              :style="'border-color: ' + (button.configuration.color || colors.blue) + ';'"
                              class="iconBox"
                      >
                        <p>No image</p>
                      </div>
                    </div>

                    <!-- favicon -->
                    <div v-if="buttonFavicon" class="iconBoxHolder" :class="{ active: (button.configuration.favicon) }">
                      <div
                              @click="changeIcon('$favicon')"
                              :style="'border-color: ' + (button.configuration.color || colors.blue) + ';'"
                              class="iconBox"
                      >
                        <b-img :src="buttonFavicon" :style="'color: ' + (button.configuration.color || colors.blue) + ';'"/>
                      </div>
                    </div>

                    <div v-for="(filename, icon) in listedIcons"
                         :key="icon"
                         @click="changeIcon(icon)"
                         :class="{ active: button.configuration.image_url === icon }"
                         class="iconBoxHolder"
                    >
                      <div :style="'border-color: ' + (button.configuration.color || colors.blue) + ';'" class="iconBox">
                        <b-img :src="getIconUrl(icon)" :style="'color: ' + (button.configuration.color || colors.blue) + ';'"/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </b-col>

          <b-col md="6">
            <div class="max-height bg-silver rounded p-3 text-center">
              <p class="">This is the button you are making</p>
              <div class="barPreview rounded">
                <div class="previewHolder">
                  <PreviewItem :item="button" />
                </div>
              </div>
              <p class="" style="margin-top: 4em">{{ button.configuration.description }}</p>
            </div>
          </b-col>
        </b-row>
      </b-form>
    </div>
  </b-modal>

</template>

<style lang="scss">

.relatedSelection {
  .dropdown-menu {
    max-height: 400px;
    overflow-y: auto;
    position: fixed !important;
  }
  button img {
    margin-right: 0.5em;
    width: 32px;
    height: 32px;
  }
}

.relatedLink, ul.relatedButtons > li {
  position: relative;
  display: inline-block;
  margin-left: 30px;

  &.selected a {
    border-radius: 5px;
  }

  a {
    width: auto !important;
    display: inline-block !important;
    padding: 3px;
  }

  .imageWrapper {
    // Position the icon to the left, and remove it from the flow.
    display: inline-block;
    position: relative;
    left: -25px;
    width: 0;
    overflow: visible;

    img {
      transition: all 0.2s ease-in-out;
      max-width: 20px;
      width: 20px;
    }
  }

  a:hover {
    .imageWrapper img {
      transform: scale(1.5);
    }
  }

  &.noImage {
    img {
      display: none;
    }
  }
}

ul.relatedButtons {
  padding-left: 30px;
  list-style: none;

  li {
    width: calc(50% - 30px);
    margin-left: 0;
    margin-right: 30px;
  }
}
</style>

<script>
import PreviewItem from "@/components/dashboard/PreviewItem";
import { buttonCatalog, colors, defaultIcons, groupedButtons, groupedIcons, icons, allButtons } from "@/utils/constants";
import * as params from "@/utils/params";
import * as Bar from "@/utils/bar";
import BarItemFields from "@/components/dashboardV2/BarItemFields";
import { CONFIG } from "@/config/config";

export default {
    name: "EditButtonDialog",
    props: {
        /** @type {BarDetails} */
        bar: Object
    },

    components: {
        BarItemFields,
        PreviewItem
    },

    data() {
        return {
            /**
             * The item selected in the parent editor
             * @type {BarItem}
             */
            selectedItem: null,
            /**
             * The copy of the item currently being edited.
             * @type {BarItem}
             */
            button: null,
            showExtra: false,

            dialogClosed: null,

            colors: colors,
            groupedButtons: groupedButtons,
            /** @type {ButtonCatalog} Button catalog. */
            buttonCatalog: buttonCatalog,
            /** @type {ButtonCatalogItem} The group in the catalog for this button */
            buttonGroup: undefined,

            dialogTitle: "Edit button",

            // url for the favicon, if available
            buttonFavicon: null,
            /**
             * favicon availability for sites, which have already been checked
             * @type {Object<String,Bool>}
             */
            knownFavicons: {},

            fieldChanged: 0,

            relatedDropdownStyle: null

        };
    },

    computed: {
        document: function () {
            return document;
        },
        /**
         * Gets the icons to be shown in the list.
         * @return {Object<String,String>} The icons to list.
         */
        listedIcons: function () {
            const defaultIcon = defaultIcons[this.button.data.buttonKey];
            const iconKeys = [];

            if (this.button.configuration.subkind === "make" && this.button.data.parameters.url !== undefined) {
                // For custom url buttons, see if there's a pre-defined button for this site
                const host = this.getHost(this.button.configuration.url).replace(/^www\./, "");
                /** @type {BarItem} */
                const other = Object.values(allButtons).find(b => {
                    return b.configuration.url && host === this.getHost(b.configuration.url).replace(/^www\./, "");
                });

                if (other && other.configuration.image_url && !other.configuration.image_url.includes("/")) {
                    iconKeys.push(other.configuration.image_url);
                }
            }

            // Get the icons of the same category.
            const subkind = this.button.configuration.relatedSubkind || this.button.configuration.subkind;
            var group = subkind && groupedIcons[subkind];
            if (!group && this.button.configuration.subkind.startsWith("local-")) {
                group = groupedIcons[group.substr(6)];
            }

            if (group) {
                iconKeys.push.apply(iconKeys, group);
            }

            // Add the generic icons
            iconKeys.push.apply(iconKeys, groupedIcons.generic);

            const togo = {};
            if (defaultIcon) {
                togo[defaultIcon] = icons[defaultIcon];
            }

            iconKeys.forEach(key => {
                togo[key] = icons[key];
            });

            return togo;
        },

        /**
         * All buttons in the same category.
         * @return {Object<String,BarItem>} The buttons to list
         */
        relatedButtons: function () {
            return this.buttonCatalog[this.button.configuration.subkind].items;
        },

        showRelated: function () {
            return this.buttonGroup.related &&
                Object.values(this.relatedButtons).filter(item => !item.data.isPlaceholder).length > 1;
        },

        /**
         * Get the text for the site/app drop-down if nothing is selected
         * @return {String} The text to display on the drop-down.
         */
        selectionText: function () {
            let text;
            if (this.buttonGroup.selectionText) {
                text = this.buttonGroup.selectionText;
            } else {
                switch (this.button.kind || this.buttonGroup.kind) {
                case "link":
                    text = "Choose a site";
                    break;
                case "application":
                    text = "Choose an application";
                    break;
                default:
                    text = "Choose an action";
                    break;
                }
            }
            return text;
        }
    },

    methods: {
        changeColor: function (hex) {
            this.button.configuration.color = hex;
        },
        changeIcon: function (icon) {
            this.button.configuration.favicon = (icon === "$favicon");

            if (this.button.configuration.favicon) {
                this.getFavicon().then(url => {
                    this.button.configuration.image_url = url;
                });
            } else {
                this.button.configuration.image_url = icon;
            }
        },

        /**
         * Called when the OK button is clicked, to apply the changes.
         * @param {Event} e The event object.
         */
        okClicked: function (e) {
            e.preventDefault();
            this.closeDialog(true);
        },

        /**
         * The dialog hide event.
         * @param {Event} e The event object.
         */
        onHide: function (e) {
            if (e.trigger === "remove") {
                // The "Remove button" button was clicked.
                this.removeButton();
                // removeButton() will close the dialog, if required.
                e.preventDefault();
            }
        },
        /**
         * Closes the dialog.
         * @param {Boolean} applyChanges true to apply the changes.
         */
        closeDialog: function (applyChanges) {

            let promise;
            if (applyChanges) {
                promise = params.checkForProblems(this.button).then(() => {
                    if (params.hasProblem(this.button)) {
                        return this.showProblems().then(value => value || "cancel");
                    }
                });
            } else {
                promise = Promise.resolve();
            }

            promise.then((value) => {
                if (value !== "cancel") {
                    if (applyChanges) {
                        Object.assign(this.selectedItem, JSON.parse(JSON.stringify(this.button)));
                        if (this.selectedItem.data.isPlaceholder && !this.button.data.isPlaceholder) {
                            delete this.selectedItem.data.isPlaceholder;
                        }
                    }

                    this.$bvModal.hide("modalEditGeneric");
                    this.dialogClosed(applyChanges);
                }
            });
        },

        relatedDropdown: function (shown) {

            if (this.relatedDropdownStyle) {
                this.relatedDropdownStyle.remove();
                this.relatedDropdownStyle = null;
            }

            if (shown) {
                this.relatedDropdownStyle = document.createElement("style");
                document.head.appendChild(this.relatedDropdownStyle);

                const button = document.querySelector("#relatedDropdown > .btn");
                const rect = button.getBoundingClientRect();
                const styleSheet = this.relatedDropdownStyle.sheet;
                styleSheet.insertRule(`#relatedDropdown .dropdown-menu { left: ${rect.left}px !important; top: ${rect.bottom}px !important; transform: unset !important }`);
            }
        },

        /**
         * Shows a message of problems.
         * @return {Promise<Boolean>} true to continue with saving.
         */
        showProblems: function () {
            return this.showConfirm("This button still has some problems.", ["Continue", "Go back"]);
        },
        /**
         * Shows the dialog, editing the selected item.
         * @param {BarItem} selectedItem The item to edit.
         * @return {Promise<Boolean>} Resolves when the dialog is closed, value indicating if the item was updated.
         */
        showDialog: function (selectedItem) {
            this.selectedItem = selectedItem;
            this.button = JSON.parse(JSON.stringify(this.selectedItem));

            this.buttonGroup = buttonCatalog[this.button.configuration.subkind];
            this.dialogTitle = this.buttonGroup.editTitle;

            this.fixFavicon();
            this.$bvModal.show("modalEditGeneric");


            setTimeout(() => {
                // The drop-down doesn't support autofocus.
                if (this.showRelated && this.button.data.isPlaceholder) {
                    document.querySelector("#relatedDropdown button").focus();
                }
            }, 10);

            return new Promise((resolve) => {
                this.dialogClosed = resolve;
            });
        },

        /**
         * When a button in the related items drop-down tab is clicked, apply its content to the button being edited.
         * @param {BarItem} button The button in the catalog.
         */
        setButton: function (button) {
            this.button = JSON.parse(JSON.stringify(button));
            this.button.id = this.generateId(this.button);
            delete this.button.data.catalogItem;
            delete this.button.data.catalogLabel;
            delete this.button.is_primary;
            params.setInitial(this.button);
        },

        /**
         * Removes this button from the bar.
         */
        removeButton: function () {
            this.showConfirm("Do you want to remove this item from the bar?").then(result => {
                if (result) {
                    Bar.removeItem(this.selectedItem, this.bar);
                    this.closeDialog(false);
                    this.showMessage("Button removed");
                }
            });
        },

        fixFavicon: async function () {
            this.buttonFavicon = !CONFIG.DISABLE_FAVICONS && this.button.configuration.url && await this.getFavicon(this.button.configuration.url);
            // fix the image url, if it's a favicon
            if (this.button.configuration.favicon && this.button.configuration.url) {
                this.button.configuration.image_url = this.buttonFavicon;
            }
        },

        /**
         * Gets the favicon for the given url, after checking it is available.
         *
         * @param {String} url The url
         * @return {Promise<null|String>} Resolves with the favicon url.
         */
        getFavicon: async function (url) {
            let togo;

            if (!CONFIG.DISABLE_FAVICONS) {
                const lastCheck = this.knownFavicons[url];
                if (lastCheck === undefined) {
                    const host = this.getHost(url);

                    if (host) {
                        const imageUrl = `https://icons.duckduckgo.com/ip2/${host}.ico`;
                        // Check the url before trying to load it.
                        const result = await params.checkUrl(imageUrl);
                        togo = result.isProblem ? null : imageUrl;
                    }

                    this.knownFavicons[url] = togo;
                } else {
                    togo = lastCheck;
                }
            }
            return togo;
        },

        /**
         * Gets the host portion of a url.
         * @param {String} url The url.
         * @return {String} The host portion of the url.
         */
        getHost: function (url) {
            const getHost = /(.*?:\/\/)?([^/:]+)/;
            const m = url && getHost.exec(url);
            return m && m[2];
        }
    },
    watch: {
        button: {
            handler: function (newValue, oldValue) {
                params.applyParameters(this.button);

                this.fieldChanged = Math.random();

                if (this.button.configuration.url) {
                    // Update the favicon (delay the check for when the user is typing in the url).
                    if (this.faviconTimer) {
                        clearTimeout(this.faviconTimer);
                    }

                    if (this.knownFavicons[this.button.configuration.url] === undefined) {
                        this.faviconTimer = setTimeout(() => this.fixFavicon(), 1000);
                    } else {
                        this.fixFavicon();
                    }
                } else {
                    this.buttonFavicon = null;
                }
            },
            deep: true
        }
    }
};
</script>
