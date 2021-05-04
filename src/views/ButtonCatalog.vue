<template>
  <div id="ButtonCatalog"
       class="fill-height bg-silver" :class="{
                noResults: searchState === 'noResults',
                gotResults: searchState === 'gotResults',
                searchResults: !!searchState
               }">

    <!-- search -->
    <b-input-group id="search-group" class="catalogSearch" size="sm">
      <b-form-input type="search" placeholder="Search buttons" v-model="searchText"/>
      <b-input-group-append>
        <b-button variant="outline-secondary">
          <b-icon-search/>
        </b-button>
      </b-input-group-append>
    </b-input-group>

    <drop class="cut" mode="cut">
      <template v-slot:drag-image="">
        <img src="/img/trash.svg" style="height: 100px; width: 100px; margin-left: -50px; margin-top: -50px"/>
      </template>
      <ul v-for="(catalog, isSearchResult) in [buttonCatalog, searchResult]"
          :key="isSearchResult"
          class="buttonCatalogListing linkList list-unstyled"
          :class="{ searchResults: isSearchResult}"
          style="overflow-y: scroll; max-height: 630px;">

        <li v-if="isSearchResult && searchResult && searchResult.itemsFound.hidden">
          <small>No buttons where found while searching for '<code>{{searchText}}</code>'</small>
        </li>
        <template v-for="(buttonGroup, subkind) in catalog">
          <li v-if="!buttonGroup.hidden"
              :key="subkind"
              :ref="`catalogGroup_${subkind}`"
              class="catalogGroup"
              :class="{
                        hasSecondary: buttonGroup.hasSecondary,
                        showSecondary: secondaryItemsShown[subkind],
                        searchResult: buttonGroup.isSearchResult
                    }">

            <h3 v-if="buttonGroup.title">{{buttonGroup.title}}</h3>

            <ul class="buttonCatalogEntries">
              <template v-for="(button, buttonId) in buttonGroup.items">
                <li :key="button.data.buttonKey"
                    class="buttonCatalogEntry"
                    :class="{
                              noImage: !button.configuration.image_url && !button.data.isExpander,
                              secondaryItem: !button.is_primary,
                              expander: button.data.isExpander,
                          }"
                    :style="{order: button.searchResult && button.searchResult.order}"
                    :title="button.configuration.description"
                    :ref="'catalog_' + buttonId"
                    tabindex="-1"
                          @keypress="onCatalogItemKeyPress($event, button)"
                >
                  <!-- Render each button as draggable -->
                  <drag :data="button" type="catalogButtonWithImage">
                    <!-- Define looks when dragged -->
                    <template v-slot:drag-image>
                      <PreviewItem :item="button" :noImage="false" xclass="noImage"/>
                    </template>

                    <!-- Define looks when not selected -->
                    <b-button v-if="buttonId !== expandedCatalogButtonId"
                              variant="link"
                                    @click="expandCatalogButton(button, buttonId, subkind)"
                              :style="'color: ' + (button.configuration.color || colors.blue) + ';'"
                              class="buttonCatalogEntry nonExpandedCatalogEntry">
                      <div class="imageWrapper" :class="{expanderIcon:button.data.isExpander}">
                        <b-iconstack v-if="button.data.isExpander">
                          <b-icon stacked icon="circle-fill"/>
                          <b-icon stacked icon="caret-right-fill"
                                  scale="0.9"
                                  class="text-white"/>
                        </b-iconstack>

                        <b-img v-else-if="button.configuration.image_url"
                               :src="getIconUrl(button.configuration.image_url)" alt="Logo"/>
                      </div>
                            <span v-html="getCatalogItemLabel(button, buttonGroup.searchWords)" />
                    </b-button>
                    <!-- Define looks when selected (expanded) -->
                    <div v-else class="active" @click="expandedCatalogButtonId = undefined"
                    >
                      <div style="width: 100%; display: inline-flex; align-items: center;">
                        <b-img v-if="button.configuration.image_url" :src="getIconUrl(button.configuration.image_url)"
                               style="width: 20px; height: 20px; max-width: 20px; max-height: 20px;"/>
                        <b-img v-else :src="'/icons/bootstrap.svg'"
                               style="width: 20px; height: 20px; max-width: 20px; max-height: 20px;"></b-img>
                        <h3 style="margin-block-start: inherit; text-decoration-line: underline; margin-left: 0.5rem; margin-bottom: 0.05rem;">
                          {{button.configuration.label}}</h3>
                      </div>
                      <div class="description">{{button.configuration.description || "A button that enables the functionality described above"}}
                      </div>
                      <div class="help">To add this button, press ENTER, RETURN, or drag button below onto the bar</div>
                      <div class="buttons"
                           @click="$event.stopPropagation()"
                      >
                        <drag :data="button" type="catalogButtonNoImage">
                          <PreviewItem :item="button"
                                       :simplified="true" :noImage="true"
                                       class="noImage"
                                             @addToBarFromPreview="dropToBar($event)"
                                             @click="dropToBar($event, true)"
                          />
                        </drag>

                        <drag v-if="button.kind !== 'action'" :data="button" type="catalogButtonWithImage">
                          <template v-slot:drag-image>
                            <PreviewItem :item="button" :noImage="false" class="noImage"
                                               @click="dropToBar($event, true)"
                            />
                          </template>
                          <PreviewItem v-if="button.configuration.image_url"
                                       :item="button" :simplified="true" class="withImage"
                                             @addToBarFromPreview="dropToBar($event)"
                                             @click="dropToBar($event)"
                          />
                        </drag>
                      </div>
                    </div>
                  </drag>
                </li>
              </template>
            </ul>
          </li>
        </template>
      </ul>
    </drop>
  </div>
</template>

<style lang="scss">

#ButtonCatalog {
  padding: 0.5rem;

  .catalogSearch {
  }

  img:before {
    content: " ";
  }

  // Hide the listing if search is used
  &.searchResults {
    .buttonCatalogListing:not(.searchResults) {
      display: none;
    }
  }

  &:not(.searchResults) {
    .buttonCatalogListing.searchResults {
      display: none;
    }
  }

  .buttonCatalogListing {
    padding: 0.5rem;

    h3 {
      font-size: 1.30rem;
      margin-bottom: 6px;
      margin-top: 0;
      font-weight: bold;
    }

    .catalogGroup {
      margin-bottom: 1em;

      // Hide secondary items.
      &:not(.showSecondary, .searchResult) {
        .secondaryItem {
          display: none;
        }
      }

      &.showSecondary {
        .expanderIcon > * {
          transform: rotate(90deg) !important;
        }
      }

      .buttonCatalogEntries {
        display: flex;
        flex-direction: column;
        padding-left: 30px;
        list-style: none;

        .buttonCatalogEntry {
          position: relative;

          // show the primary items first
          &:not(.secondaryItem) {
            order: 0;
          }

          &.expander {
            order: 1;
          }

          &.secondaryItem {
            order: 2;
          }

          .imageWrapper {
            // Position the icon to the left, and remove it from the flow.
            display: inline-block;
            position: relative;
            left: -23px;
            width: 0;
            overflow: visible;

            & > * {
              transition: all 0.2s ease-in-out;
            }
          }

          .buttonsCatalogLink {
            text-align: left;

            &:hover {
              .imageWrapper > * {
                transform: scale(1.5);
              }
            }
          }

          &.noImage {
            img {
              display: none;
            }
          }

          .active {
            background-color: #e0f1d7;
            border: solid 1px #008145;
            border-radius: 5px;
            padding: 10px;

            .buttons {
              display: flex;
              justify-content: space-around;
              align-items: flex-end;
            }

            h3 {
              margin-top: 15px;
              font-size: 20px;
              margin-bottom: 0px;
            }

            div.description {
              font-size: 14px;
            }

            div.help {
              font-size: 14px;
              font-weight: bold;
              margin-top: 15px;
              line-height: 18px;
            }
          }
        }
      }
    }

    .nonExpandedCatalogEntry {
      width: 100%;
      display: block;

      img, svg {
        max-width: 16px;
        width: 16px;
        max-width: 16px;
        width: 16px;
        display: inline-block;
      }

      .buttonCatalogEntry {
        width: 100%;
        display: block;
      }
    }


  }
}



</style>

<script>
import PreviewItem from "@/components/dashboard/PreviewItem";
import { Drag, Drop } from "vue-easy-dnd";
import { allButtons, buttonCatalog, colors } from "@/utils/constants";
import * as search from "@/utils/search";

export default {
    name: "ButtonCatalog",
    components: {
        PreviewItem,
        Drag,
        Drop
    },
    props: {
        buttonCatalog: {}
    },
    data() {
        return {
            colors: colors,
            expandedCatalogButtonId: undefined,

            /**
             * Catalog search text
             * @type {String}
             */
            searchText: "",
            /** null, "gotResults" or "noResults" */
            searchState: null,
            showSearchResults: false,

            /** @type {ButtonCatalog} */
            searchResult: false,
            /**
             * The display of secondary items in each catalog group.
             * @type {Object<String,Boolean>}
             */
            secondaryItemsShown: Object.keys(buttonCatalog).reduce((map, key) => {
                map[key] = false;
                return map;
            }, {})
        };
    },
    methods: {
        dropToBar: function ($event) {
            this.$emit("drop-to-bar", $event);
        },
        /**
         * A key is pressed, while a catalog item is focused.
         * @param {KeyboardEvent} $event The event.
         * @param {BarItem} button The button.
         */
        onCatalogItemKeyPress: function ($event, button) {
            if ($event.key === "Enter") {
                this.dropToBar({data: button});
            }
        },
        expandCatalogButton: function (button, buttonId, subkind) {
            if (!button) {
                this.expandedCatalogButtonId = undefined;
                this.expandedCatalogButton = undefined;
            } else if (button.data.isExpander) {
                this.showSecondaryItems(subkind);
                this.expandedCatalogButtonId = undefined;
                this.expandedCatalogButton = undefined;
            } else {
                this.expandedCatalogButtonId = buttonId;
                this.expandedCatalogButton = button;
                this.$refs["catalog_" + buttonId][0].focus();
            }
        },

        /**
         * Returns the label for an item in the catalog.
         * @param {BarItem} button The button
         * @param {Array<String>} [searchWords] The words from the search, to highlight.
         * @return {String} Label for the item, as raw HTML.
         */
        getCatalogItemLabel: function (button, searchWords) {
            const label = button.data.catalogLabel || button.configuration.label;
            // escape any html
            const escaped = new Option(label).innerHTML;

            let html;
            if (searchWords && searchWords.length > 0) {
                const highlight = new RegExp(searchWords.join("|"), "gi");
                html = escaped.replace(highlight, "<b>$&</b>");
            } else {
                html = escaped;
            }

            return html;
        },
        searchCatalog() {
            if (this.searchText.length > 0) {
                const queryWords = this.searchText.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim().split(/\s+/g);
                // Only the top 20 - they are slow to render.
                const results = search.catalogSearch(queryWords)
                    .sort((a, b) => a.order - b.order)
                    .slice(0, 20);

                /** @type {ButtonCatalogItem} */
                const groups = {
                    itemsFound: {
                        isSearchResult: true,
                        searchWords: queryWords,
                        hasSecondary: false,
                        items: {},
                        hidden: results.length === 0
                    }
                };

                // Make a catalog group for the results.
                results.forEach(result => {
                    /** @type {BarItem} */
                    if (result.buttonKey) {
                        const item = JSON.parse(JSON.stringify(allButtons[result.buttonKey]));
                        item.searchResult = result;

                        groups.itemsFound.items[result.buttonKey] = item;
                    } else if (result.groupKey) {
                        groups[result.groupKey] = JSON.parse(JSON.stringify(buttonCatalog[result.groupKey]));
                    }
                });

                this.searchResult = groups;
                this.searchState = results.length > 0 ? "gotResults" : "noResults";
            } else {
                this.searchState = null;
                this.searchResult = null;
            }
        },

        /**
         * Toggles the catalog items under the "Other" - causes the secondary items to show/hide.
         * @param {String} subkind The catalog group id.
         * @param {Boolean} [show] true/false to show/hide, omit to toggle.
         */
        showSecondaryItems: function (subkind, show) {
            if (show === undefined) {
                this.secondaryItemsShown[subkind] = !this.secondaryItemsShown[subkind];
            } else {
                this.secondaryItemsShown[subkind] = show;
            }
        }

    },
    watch: {
        searchText: function () {
            this.expandCatalogButton(null);
            this.searchCatalog();
        }
    }
};
</script>
