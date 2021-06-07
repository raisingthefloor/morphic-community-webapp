<template>
  <div id="preview-holder" class="desktop mt-3" @click="$emit('click', $event)">
    <drop mode="cut" class="dragToDelete desktop-portion">
      <template v-slot:drag-image="">
        <img src="/img/trash.svg" style="height: 100px; width: 100px; margin-left: -50px; margin-top: -50px" />
      </template>

      <!-- Bar item problems -->
      <div class="desktop-alerts">
        <b-alert v-for="(error) in barDetails.errors"
                 :key="error.key"
                 show
                 variant="warning"
        >
          <div @mouseenter="highlight(true, error.item, error.duplicates)"
               @mouseleave="highlight(false, error.item, error.duplicates)"
               @click="showEditDialog(error.item)"
               :title="error.details"
          >

            <b-icon-exclamation-triangle-fill v-if="!error.level || error.level === 'error'" variant="danger" />
            <b-icon-info-circle-fill v-if="error.level === 'warn'" variant="info" />
            &nbsp;

            <!-- Duplicated labels -->
            <template
                    v-if="error.type === 'duplicate' && error.item.configuration.label === error.duplicates[0].configuration.label">
              <BarItemLink :bar-item="error.item"
                           @click="showEditDialog(error.item)"
                           @mouseover="highlight(false, error.item)"
                           @mouseleave="highlight(true, error.item)"
              />
              is duplicated.
            </template>

            <!-- Duplicated actions -->
            <template v-else-if="error.type === 'duplicate'">
              <BarItemLink :bar-item="error.item"
                           @click="showEditDialog(error.item)"
                           @mouseover="highlight(false, error.item)"
                           @mouseleave="highlight(true, error.item)"
              />

              performs the same action as
              <BarItemLink :bar-item="error.duplicates[0]"
                           @click="showEditDialog(error.duplicates[0])"
                           @mouseenter="highlight(false, error.duplicates)"
                           @mouseleave="highlight(true, error.duplicates)"
              />
            </template>

            <!-- Generic problem -->
            <template v-else>
              <BarItemLink :bar-item="error.item"
                           @click="showEditDialog(error.item)"
              />
              :
              {{ error.message }}
            </template>

          </div>
        </b-alert>
      </div>

    </drop>

    <!-- Buttons Bar -->
    <div id="preview-bar">
      <div class="barPreviewEditor" ref="myref">
        <drop-list :items="barDetails.items"
                   :class="openDrawer && 'showDrawer'"
                   class="buttonsList draggable-area"
                   @insert="dropToBar"
                   @reorder="dragReorder">
          <template v-slot:item="{item}">
            <drag :key="item.id"
                  @dragstart="setDragInProgress(true)"
                  @dragend="setDragInProgress(false)"
                  @click="showEditDialog(item, $event)"
                  @cut="removeButton(item, barDetails.items)"
                  class="buttonDragger">
              <div :key="item.id" class="previewHolder" :ref="buttonRef(item)">
                <PreviewItem :item="item" />
              </div>
            </drag>
          </template>
          <template v-slot:feedback="{data}">
            <div class="item feedback button-feedback" :key="data.id"></div>
          </template>
        </drop-list>
      </div>
      <div class="logoHolder">
        <b-img src="/img/logo-color.svg" alt="Morphic Logo" />
      </div>
      <div class="openDrawerIconHolder">
        <span @click="openDrawer = !openDrawer" class="">
          <b-icon :icon="openDrawer ? 'arrow-right-circle-fill' : 'arrow-left-circle-fill'"></b-icon>
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
#preview-holder.desktop {
  width: 100%;
  height: 600px;
  position: relative;
  display: flex;

  //noinspection CssUnknownTarget
  background: url(/img/background-editor.png);

  margin-top: 0 !important;

  .desktop-portion {
    display: inline-block;
    flex-grow: 1;
  }

  .desktop-alerts {
    height: 100%;
    display: flex;
    justify-content: flex-end;
    flex-direction: column;

    .alert {
      width: fit-content;
      padding: 0;

      & > div {
        padding: 5px;
      }

      margin: 0 5px 10px 5px;

      transition: box-shadow 0.2s ease;
      cursor: pointer;

      &:hover {
        box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.4);
      }

      svg {
        margin: 0 0.2em;
      }

    }
  }

  .preview-bar {
    padding-bottom: 5rem;
  }

  #preview-bar {
    border: 1px solid #002957;
    background: white;
    // vertical line separating bar from drawer
    background-image: linear-gradient(#000, #000);
    background-size: 1px 100%;
    background-repeat: no-repeat;
    background-position: right 122px bottom 0px;

    display: flex;
    justify-content: center;
    align-content: center;

    // flex columns don't expand the container, so rotate the text flow here, and make the buttonList flex-direction to row
    writing-mode: vertical-rl;

    .barPreviewEditor {
      min-width: 120px;
      flex-grow: 1;

      .buttonsList {
        height: 100%;

        display: inline-flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: flex-start;
        align-content: flex-start;

        // Hide the drawer by limiting the width
        &:not(.showDrawer) {
          width: 120px !important;
          overflow: hidden;
        }

        & > div {
          min-width: 50px;
        }

        // Place-holder for dropping a new button.
        .button-feedback, .feedback {
          display: block;
          background-color: #e5f4ed;
          border: 2px dashed rgb(16 141 74);
          height: 50px;
          min-width: 95px;
          margin-left: 10px;
          margin-right: 10px;
          border-radius: 10px;
          margin-top: 10px;

          &.clickDropSpot {
            margin-top: 0px;
          }
        }
      }

      .buttonDragger {
        writing-mode: horizontal-tb;
        margin: 10px 10px 0 10px;
      }
    }

    .logoHolder {
      writing-mode: initial;
      text-align: center;
      width: 120px;
      padding: 15px 0 15px 0;

      img {
        width: 3rem;
        height: 3rem;
      }
    }

    .openDrawerIconHolder {
      cursor: pointer;

      & > span {
        cursor: pointer;
      }

      .b-icon {
        // margin-left: -19px;
        right: 104px;
        font-size: 2em;
        position: absolute;
        bottom: 25px;
        background: black;
        color: white;
        border-radius: 100%;
        border: 1px solid black;
      }
    }
  }

  #preview-bar, #preview-drawer {
    .buttonCatalogEntry {
      .active {
        background-color: transparent;
        border: 0;
        width: initial;

        .buttons {
          button.withImage {
            display: none;
          }

          display: flex;
          justify-content: space-around;
          align-items: flex-end;
        }

        h3, div.description, div.help {
          display: none;
        }
      }
    }
  }
}

</style>

<script>
import { Drag, Drop, DropList } from "vue-easy-dnd";
import BarItemLink from "@/components/editor/BarItemLink";
import PreviewItem from "@/components/dashboard/PreviewItem";

export default {
    name: "DesktopBarEditor",
    components: {
        BarItemLink,
        PreviewItem,
        Drag,
        Drop,
        DropList
    },
    props: {
        barDetails: {}
    },
    data() {
        return {
            openDrawer: true,
            dragInProgress: false
        };
    },
    methods: {
        /**
         * Returns the ref id for a button.
         * @param {BarItem} button The button
         * @return {String} The ref id.
         */
        buttonRef: function (button) {
            return "button_" + button.id;
        },

        /**
         * Highlight some buttons
         * @param {Boolean} value true to highlight
         * @param {Array<BarItem>} buttons The buttons to highlight
         */
        highlight(value, buttons) {
            for (let a = 1; a < arguments.length; a++) {
                this.makeArray(arguments[a]).forEach(button => {
                    const preview = this.$refs[this.buttonRef(button)];
                    if (preview) {
                        preview.classList.toggle("highlight", !!value);
                    }
                });
            }
        },
        dropToBar: function (event, noImage) {
            this.$emit("item-dropped", {
                item: event.data,
                noImage: noImage || event.type === "catalogButtonNoImage",
                index: event.index
            });
            return true;
        },
        dragReorder: function (event) {
            event.apply(this.barDetails.items);
            this.onBarChanged();
        },

        // used to avoid bug where a "click" event is triggered at end of drag
        setDragInProgress: function (newValue) {
            this.dragInProgress = newValue;
        },

        /**
         * Shows the edit button dialog.
         * @param {BarItem} [item] The item to edit.
         */
        showEditDialog: function (item) {
            if (!this.dragInProgress) {
                this.$emit("edit-item", item);
            }
        },

        removeButton: function (item, itemList) {
            const compareObjects = function (x, y) {
                for (const key in x) {
                    if (x[key] !== y[key]) {
                        return false;
                    } else {
                        if (x[key] instanceof Object && y[key] instanceof Object) {
                            if (compareObjects(x[key], y[key]) === false) {
                                return false;
                            }
                        }
                    }
                }
                return true;
            };
            const index = itemList.findIndex(x => compareObjects(x, item));
            itemList.splice(index, 1);
            this.onBarChanged();
        },

        onBarChanged: function () {
            this.$emit("bar-changed");
        }
    }
};

</script>
<style lang="scss">
$primary-color: #002957;
$secondary-color: #84c661;

#preview-holder.desktop {
  width: 100%;
  height: 600px;
  position: relative;
  display: flex;

  //noinspection CssUnknownTarget
  background: url(/img/background-editor.png);

  margin-top: 0 !important;

  #preview-bar {
    border: 1px solid #002957;
    background: white;
    // vertical line separating bar from drawer
    background-image: linear-gradient(#000, #000);
    background-size: 1px 100%;
    background-repeat: no-repeat;
    background-position: right 122px bottom 0px;

    display: flex;
    justify-content: center;
    align-content: center;

    // flex columns don't expand the container, so rotate the text flow here, and make the buttonList flex-direction to row
    writing-mode: vertical-rl;

  }
}

</style>
