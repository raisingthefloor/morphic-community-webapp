<template>
  <div>
    <!-- MODALs: BEGIN -->
    <EditButtonDialog ref="editDialog" :bar="barDetails" />
    <InviteMemberDialog id="inviteMemberDialog" :member="memberDetails" />
    <CopyBarDialog id="copyBarDialog" :bars="barsList" :members="membersList" :current-bar="barDetails" @change="onBarChanged" />

    <b-modal id="roleChangeConfirm" @ok="changeMemberRole" title="Change Member Role" footer-bg-variant="light" ok-title="Change Role">
      <p class="my-4">Please confirm this role change?</p>
    </b-modal>
        <b-modal id="deleteConfirm" @ok="deleteMember" title="Delete Member" footer-bg-variant="light" ok-title="Delete">
      <p class="my-4">Please confirm the deletion of this member?</p>
    </b-modal>
    <b-modal id="barDeleteConfirm" @ok="deleteBar" title="Delete Bar" footer-bg-variant="light" ok-title="Delete">
      <p class="my-4">Please confirm the deletion of this bar?</p>
    </b-modal>

    <b-modal id="unsavedChanges" title="Unsaved Changes">
      <p>You have made some changes to this bar, but they are not saved yet.</p>
      <p>If you leave now, the recent modifications will be lost.</p>

      <template #modal-footer="{ ok, cancel, hide }">
        <b-button @click="cancel()" variant="secondary">Cancel</b-button>
        <b-button @click="hide('no-save')" variant="secondary">Continue, without saving</b-button>
        <b-button @click="hide('save')" variant="primary">Save</b-button>
      </template>
    </b-modal>
    <!-- MODALs: END -->

    <!-- EDITOR v2 -->
    <b-row no-gutters id="EditorContainer">
      <b-col md="2">
        <SidePanel :community="community" :bars="barsList" :members="membersList" :activeMemberId="activeMemberId" :activeBarId="barDetails.id" @reload="loadAllData()" />
      </b-col>
      <b-col md="8">
        <div id="barEditor" class="pt-2">

          <!-- Bar info, actions, and editor tabs -->
          <EditorDetails ref="EditorDetails"
                         :bar-details="barDetails"
                         :bars-list="barsList"
                         :bar-members="barMembers"
                         :is-changed="isChanged"
                         :member-details="memberDetails"
                         :new-bar="newBar"
                         @save-bar="saveBar()" @revert-bar="revertBar()"
                         />

          <!-- the desktop -->
          <div id="preview-holder" class="desktop mt-3" @click="$refs.EditorDetails.closeTab()">
            <drop mode="cut" class="dragToDelete desktop-portion">
              <template v-slot:drag-image="">
                <img src="/img/trash.svg" style="height: 100px; width: 100px; margin-left: -50px; margin-top: -50px"/>
              </template>

              <!-- Bar item problems -->
              <div class="desktop-alerts" >
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

                    <b-icon-exclamation-triangle-fill v-if="!error.level || error.level === 'error'" variant="danger"/>
                    <b-icon-info-circle-fill v-if="error.level === 'warn'" variant="info"/>
                    &nbsp;

                    <!-- Duplicated labels -->
                    <template v-if="error.type === 'duplicate' && error.item.configuration.label === error.duplicates[0].configuration.label">
                      <BarItemLink :bar-item="error.item"
                                   @click="showEditDialog(error.item)"
                                   @mouseover="highlight(false, error.item)"
                                   @mouseleave="highlight(true, error.item)"
                      /> is duplicated.
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
                        />:
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
                    </drag>o
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
        </div>
      </b-col>

      <!-- Button Catalogue -->
      <b-col md="2">
        <ButtonCatalog ref="ButtonCatalog"
                       :button-catalog="buttonCatalog"
                       @drop-to-bar="dropToBar($event)" />
      </b-col>
    </b-row>
  </div>
</template>

<style lang="scss">
  $primary-color: #002957;
  $secondary-color: #84c661;

  #EditorContainer {

  }

  #barEditor {
    padding-left: 15px;
    padding-right: 15px;
  }

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

          max-width: 400px;
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
  }

  .max-height {
    height: 100%;
  }
  #removeBar .nav-link {
    color: #dc3545 !important;
  }

  .compactIconHolder {
    height: 22rem;
    overflow-y: auto;
    .iconBoxHolder {
      margin-left: .5rem !important;
    }
  }

  .colorBoxHolder {
    display: inline-block;
    cursor: pointer;
    margin: 0 .25rem;
    width: 2.6rem;
    height: 2.6rem;
    .colorBox {
      width: 2rem;
      height: 2rem;
    }
  }

  .iconBoxHolder {
    display: inline-block;
    cursor: pointer;
    width: 5.25rem;
    height: 5.25rem;
    margin: .75rem 0 .75rem .75rem;
    .iconBox {
      background: white;
      border: 1px solid black;
      border-radius: 100%;
      padding: .75rem;
      width: 4.5rem;
      height: 4.5rem;
      text-align: center;
      img {
        width: 3rem;
        height: 3rem;
      }
      p {
        width: 3rem;
        height: 3rem;
        line-height: 100%;
        margin: 0;
      }
    }
  }

  .colorBoxHolder, .iconBoxHolder {
    padding: .3rem;
    &.active {
      padding: .1rem;
      border: .2rem solid green;
    }
  }

  #modalEditGeneric {
    padding: .5rem 1rem 0 0;
    border-bottom: none;
  }

  .text-disabled {
    color: gray;
    &:active, &:focus, &:hover {
      cursor: not-allowed;
      color: gray !important;
      text-decoration: none !important;
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

</style>

<script>

import SidePanel from "@/components/side-panel/SidePanel";
import PreviewItem from "@/components/dashboard/PreviewItem";
import {
    createCommunityBar,
    deleteCommunityBar,
    deleteCommunityMember,
    getCommunity,
    getCommunityBar,
    getCommunityBars,
    getCommunityMembers,
    updateCommunityBar,
    updateCommunityMember
} from "@/services/communityService";
import { buttonCatalog, MESSAGES } from "@/utils/constants";
import { predefinedBars } from "@/utils/predefined";
import { Drag, Drop, DropList } from "vue-easy-dnd";
import * as Bar from "@/utils/bar";
import EditButtonDialog from "@/components/editor/EditButtonDialog";
import BarItemLink from "@/components/editor/BarItemLink";
import ButtonCatalog from "@/components/editor/ButtonCatalog";
import InviteMemberDialog from "@/components/dialogs/InviteMemberDialog";
import CopyBarDialog from "@/components/dialogs/CopyBarDialog";
import EditorDetails from "@/components/editor/EditorDetails";

export default {
    name: "MorphicBarEditor",
    components: {
        EditorDetails,
        ButtonCatalog,
        CopyBarDialog,
        InviteMemberDialog,
        BarItemLink,
        EditButtonDialog,
        SidePanel,
        PreviewItem,
        Drag,
        Drop,
        DropList
    },
    methods: {
        buttonRef: function (button) {
            return "button_" + button.id;
        },
        dropToBar: function (event, noImage) {
            this.addBarItem(event.data, event.index, noImage || event.type === "catalogButtonNoImage");
            return true;
        },
        dragReorder: function (event) {
            event.apply(this.barDetails.items);
            this.onBarChanged();
        },

        /**
         * Add an item to the bar.
         * @param {BarItem} catalogButton The new button, from the catalog.
         * @param {Number} [insertAt] The index of the new button.
         * @param {Boolean} [noImage] True if the button shall have no image.
         */
        addBarItem: function (catalogButton, insertAt, noImage) {
            /** @type {BarItem} */
            const barItem = Bar.addItem(this.barDetails, catalogButton, insertAt);
            if (noImage) {
                barItem.configuration.image_url = "";
            }

            // close any expanded button
            this.$refs.ButtonCatalog.expandCatalogButton(null);
            this.onBarChanged();


            var showEdit;
            if (barItem.data.isPlaceholder) {
                showEdit = true;
            } else {
                showEdit = barItem.data.hasError;
            }

            // Edit the button, if it has parameterised fields.
            if (showEdit) {
                this.showEditDialog(barItem);
            }
        },

        /**
         * Called when the bar changes, after it is loaded.
         */
        onBarChanged: function () {
            this.isChanged = true;
            this.storeUnsavedBar();
        },

        storeUnsavedBar: function () {
            this.barSelectedInDropdown = "customized";
            Bar.checkBar(this.barDetails);
            this.$store.dispatch("unsavedChanges", this.isChanged);
            this.$store.dispatch("unsavedBar", this.isChanged && this.barDetails);
        },

        revertBar: function () {
            if (window.confirm("Are you sure you want reload last saved version of the bar? This means you will lose all unsaved changes!")) {
                this.isChanged = false;
                this.barDetails = JSON.parse(JSON.stringify(this.originalBarDetails));
                this.barSelectedInDropdown = this.barDetails.id;
            }
        },
        dropOnClickToAdd: function (event) {
            this.dropToBar(event);
        },
        changeUserBarToCommunityBar: function () {
            if (this.isChanged || !this.barDetails.is_shared) {
                if (!confirm("Warning! Changing to a different group bar will delete all MorphicBar customizations for this member.")) {
                    return;
                }
            }

            // if we've made it to this point, either the the user was already using a community bar, or has accepted to loose customized data
            updateCommunityMember(this.community.id, this.memberDetails.id, {
                first_name: this.memberDetails.first_name,
                last_name: this.memberDetails.last_name,
                bar_id: this.barSelectedInDropdown,
                role: this.memberDetails.role
            }).then(r => {
                getCommunityBar(this.community.id, this.barSelectedInDropdown).then(newBarDetails => {
                    this.barDetails = newBarDetails.data;
                    this.isChanged = false;
                    this.newBar = false;
                    this.memberDetails.bar_id = this.barSelectedInDropdown;
                    this.updateOriginalBarDetails();
                });
            });
        },
        // used to avoid bug where a "click" event is triggered at end of drag
        setDragInProgress: function (newValue) {
            this.dragInProgress = newValue;
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

        loadAllData: function () {
            this.loadBarData();
            this.loadBarMembers();
            this.getCommunityData();
        },

        /** Loads the initial bar data */
        loadBarData: async function () {
            var barId = this.$route.query.barId;

            // If there is a bar unsaved, redirect to that one instead.
            /** @type {BarDetails} */
            const unsavedBar = this.$store.getters.unsavedBar;
            if (unsavedBar && unsavedBar.id !== barId) {
                const barName = Bar.getBarName(unsavedBar);
                const message = `There is already a bar (${barName}) that has unsaved changes. The recent changes will be lost if you continue.`;
                const ok = await this.showConfirm(message,
                    ["Continue", `Go to ${barName}`],
                    "Unsaved Changes",
                    {
                        cancelVariant: "primary"
                    }
                );

                if (!ok) {
                    this.$router.push(this.getBarEditRoute(unsavedBar));
                    return;
                }
            }


            if (barId === "new") {
                // Create a new empty bar.
                this.newBar = true;
                this.barDetails = this.newBarDetails;
            } else if (barId.indexOf("predefined") !== -1) {
                // Create a bar from the predefined collection.
                const bar = this.predefinedBars.find(function (predefined) {
                    return predefined.id === barId;
                });

                if (bar) {
                    this.newBar = true;
                    this.barDetails = this.newBarDetails;
                    this.barDetails.items = bar.items;
                    this.addBar();
                }
            } else {
                const unsavedBar = this.$store.getters.unsavedBar;
                if (unsavedBar && unsavedBar.id === barId) {
                    this.barDetails = unsavedBar;
                    this.onBarChanged();
                } else {
                    // Load a saved bar.
                    getCommunityBar(this.communityId, barId)
                        .then(resp => {
                            this.barDetails = resp.data;
                            this.updateOriginalBarDetails();
                        })
                        .catch(err => {
                            console.error(err);
                        });
                }
            }
        },
        addIds: function (items) {
            items.forEach(item => { item.id = this.generateId(item); });
        },
        // hack to refresh css rendering due to bars being fucked up in their CSS
        refreshBar() {
            const myref = this.$refs.myref;
            if (myref) {
                myref.classList.toggle("minWidth1px");
            }
        },
        distributeItems: function (items) {
            // add id's
            this.addIds(items);
            // items.map(item => item.id = this.generateId(item));
        },
        deleteMember: function () {
            deleteCommunityMember(this.communityId, this.memberDetails.id)
                .then((resp) => {
                    if (resp.status === 200) {
                        this.showMessage(MESSAGES.successfulMemberDelete);
                        this.$router.push("/dashboard");
                    }
                })
                .catch(err => {
                    console.error(err);
                });
        },
        changeMemberRole: function () {
            if (this.memberDetails.role === "member") {
                this.memberDetails.role = "manager";
            } else {
                this.memberDetails.role = "member";
            }
            updateCommunityMember(this.communityId, this.memberDetails.id, this.memberDetails)
                .then((resp) => {
                    if (resp.status === 200) {
                        this.showMessage(MESSAGES.successfulRoleChange);
                    }
                })
                .catch(err => {
                    console.error(err);
                });
        },
        updateOriginalBarDetails: function () {
            this.originalBarDetails = JSON.parse(JSON.stringify(this.barDetails));
        },
        addPersonalBar: function () {
            if (this.barDetails.is_shared) {
                this.onSave = true;

                this.barDetails.name = this.memberDetails.first_name;
                this.barDetails.is_shared = false;

                const data = this.barDetails;
                // const drawerItems = this.drawerItems.concat(this.drawerItemsSecond)
                // data.items = this.primaryItems.concat(drawerItems)

                createCommunityBar(this.communityId, data)
                    .then((resp) => {
                        if (resp.status === 200) {
                            this.memberDetails.bar_id = resp.data.bar.id;
                            updateCommunityMember(this.communityId, this.memberDetails.id, this.memberDetails)
                                .then((resp) => {
                                    if (resp.status === 200) {
                                        this.showMessage(MESSAGES.barUpdated);
                                        this.isChanged = false;
                                        this.updateOriginalBarDetails();
                                    }
                                })
                                .catch(err => {
                                    console.error(err);
                                });
                        }
                    })
                    .catch(err => {
                        console.error(err);
                    });
            } else {
                this.saveBar();
            }
        },
        addBar: function () {
            this.onSave = true;
            const data = this.barDetails;
            data.is_shared = true;
            // const drawerItems = this.drawerItems.concat(this.drawerItemsSecond)
            // data.items = this.primaryItems.concat(drawerItems)

            createCommunityBar(this.communityId, data)
                .then((resp) => {
                    if (resp.status === 200) {
                        this.showMessage(MESSAGES.barAdded);
                        this.isChanged = false;
                        this.updateOriginalBarDetails();

                        this.$router.push("/dashboard");
                    }
                })
                .catch(err => {
                    console.error(err);
                });
        },

        /**
         * Saves the bar.
         * @return {Promise} Resolves when complete.
         */
        saveBar: function () {
            this.onSave = true;
            const data = this.barDetails;
            // const drawerItems = this.drawerItems.concat(this.drawerItemsSecond)
            // data.items = this.primaryItems.concat(drawerItems)

            // Set the image_path for the items, for images which the client does not have locally.
            data.items.forEach(item => {
                item.configuration.image_path = this.getIconUrl(item.configuration.image_url);
            });

            return updateCommunityBar(this.communityId, this.$route.query.barId, data)
                .then((resp) => {
                    if (resp.status === 200) {
                        this.showMessage(MESSAGES.barUpdated);
                        this.isChanged = false;
                        this.updateOriginalBarDetails();
                    }
                });
        },
        deleteBar: function () {
            deleteCommunityBar(this.communityId, this.$route.query.barId)
                .then((resp) => {
                    if (resp.status === 200) {
                        this.showMessage(MESSAGES.successfulBarDelete);
                        this.$router.push("/dashboard");
                    }
                })
                .catch(err => {
                    console.error(err);
                });
        },

        /**
         * Shows the edit button dialog.
         * @param {BarItem} [item] The item to edit.
         */
        showEditDialog: function (item) {
            if (!this.dragInProgress) {
                this.selectedItem = item;
                this.editDialog.showDialog(item).then(changed => {
                    Bar.checkBar(this.barDetails);
                    if (changed) {
                        this.onBarChanged();
                    }
                    this.$forceUpdate();
                });
            }
        },
        loadBarMembers: function () {
            getCommunityBars(this.communityId)
                .then(resp => {
                    const barsData = resp.data.bars;
                    getCommunityMembers(this.communityId)
                        .then((resp) => {
                            this.barsList = barsData;
                            this.membersList = resp.data.members;
                            this.membersList = this.membersList.map(m => { return m.bar_id ? m : Object.assign(m, { bar_id: this.community.default_bar_id }); });
                        })
                        .catch(err => {
                            console.error(err);
                        });
                })
                .catch(err => {
                    console.error(err);
                });
        },
        getCommunityData: function () {
            getCommunity(this.communityId)
                .then((community) => {
                    this.community = community.data;
                })
                .catch(err => {
                    console.error(err);
                });
        },
        /**
         * Update the filtered arrays of bars.
         */
        updateBarLists() {
            this.sharedBars = [];
            this.userBars = [];
            this.barsList.forEach(bar => {
                const list = bar.is_shared
                    ? this.sharedBars
                    : this.userBars;
                list.push(bar);
            });
        },

        /**
         * Gets the edit route for a bar.
         * @param {BarDetails} bar The bar.
         * @return {Object} The route.
         */
        getBarEditRoute: function (bar) {
            let route;
            if (!bar.is_shared) {
                var member = this.membersList.find(m => m.bar_id === bar.id);
                route = member && Bar.getUserBarEditRoute(member, this.community.default_bar_id);
            }

            return route || Bar.getBarEditRoute(bar);
        },
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
        /**
         * Confirms if the user wants to leave the page, if there have been unsaved changes
         * @return {Promise<Boolean>} Resolves with true to move to the next page.
         */
        leavePage: async function () {
            var nextPage = true;
            if (this.isChanged) {
                const dialogResult = await this.showModalDialog("unsavedChanges");

                switch (dialogResult) {
                case "save":
                    await this.saveBar();
                    break;
                case "no-save":
                    break;
                default:
                    nextPage = false;
                    break;
                }
            }

            if (nextPage) {
                // Discard the current bar, if moving to another page.
                this.isChanged = false;
                this.storeUnsavedBar();
            }

            return nextPage;
        }
    },
    computed: {
        /**
         * Gets the bar members which this bar belongs to.
         * @return {Array<CommunityMember>} The members this bar belongs to, empty array for shared bars.
         */
        barMembers: function () {
            return this.barDetails.is_shared
                ? []
                : this.membersList.filter(m => m.bar_id === this.barDetails.id).sort((a, b) => b.isCurrent);
        },
        activeMemberId: function () {
            var memberId;
            if (this.barMembers.length === 1) {
                memberId = this.barMembers[0].id;
            } else if (this.barMembers.some(m => m.id === this.$route.query.memberId)) {
                memberId = this.$route.query.memberId;
            }

            return memberId;
        },

        /**
         * The details of the selected member, as identified by activeMemberId
         * @return {CommunityMember|null} The member.
         */
        memberDetails: function () {
            return this.activeMemberId && this.membersList.find(m => m.id === this.activeMemberId);
        },

        editDialog: function () { return this.$refs.editDialog; }

    },
    mounted() {
        this.loadAllData();
    },
    watch: {
        "barDetails.is_shared": function (newValue, oldValue) {
            this.barSelectedInDropdown = newValue ? this.memberDetails.bar_id : "customized";
        },
        "barDetails.items": function (newValue, oldValue) {
            this.distributeItems(newValue);
        },
        "memberDetails.id": function (newValue, oldValue) {
            this.updateBarLists();
            if (this.barDetails.is_shared) {
                this.barSelectedInDropdown = this.memberDetails.bar_id;
            }
        },
        barsList: function (newValue) {
            this.updateBarLists();
        },
        makeAButtons: function (newValue, oldValue) {
            if (!this.dragMakeAButton) {
                this.makeAButtons = oldValue;
                this.dragMakeAButton = true;
            }
        },
        predefinedButtons: function (newValue, oldValue) {
            if (!this.dragPredefinedButton) {
                this.predefinedButtons = oldValue;
                this.dragPredefinedButton = true;
            }
        },
        drawerItemsSecond: function (newValue, oldValue) {
            if (oldValue.length !== newValue.length) {
                this.isChanged = true;
            }
            let item = {};
            if (newValue && newValue.length > 0) {
                for (let i = 0; i < newValue.length; i++) {
                    if (newValue[i].is_primary === true) {
                        item = newValue[i];
                        item.is_primary = false;
                    }
                }
            }
        },
        isChanged: function () {
            this.storeUnsavedBar();
        },
        "$route.query": function () {
            this.initialChangesPrimaryItems = false;
            this.initialChangesDrawerItems = false;
            this.loadAllData();
        }
    },
    async beforeRouteUpdate(to, from, next) {
        const proceed = this.$store.getters.isLoggedIn ? await this.leavePage() : true;
        next(proceed);
    },
    async beforeRouteLeave(to, from, next) {
        const proceed = this.$store.getters.isLoggedIn ? await this.leavePage() : true;
        next(proceed);
    },
    beforeUpdate() {
        this.refreshBar();
    },
    data() {
        return {
            // messages
            leavePageMessage: MESSAGES.leavePageAlert,
            barSelectedInDropdown: "",
            // flags
            addToBar: false,
            addToDrawer: false,
            newBar: false,
            openDrawer: true,
            editDialogShown: false,
            tab: 0,
            dragFromEditor: false,
            isChanged: false,
            editBarName: false,
            onSave: false,
            initialChangesPrimaryItems: false,
            initialChangesDrawerItems: false,
            // data for the community manager
            community: {},
            /**
             * All bars
             * @type {Array<BarDetails>} */
            barsList: [],
            /**
             * Group Bars
             * @type {Array<BarDetails>}
             */
            sharedBars: [],
            /**
             * User specific bars.
             * @type {Array<BarDetails>}
             */
            userBars: [],
            /** All community members
             * @type {Array<CommunityMember>} */
            membersList: [],

            /** @type {ButtonCatalog} Button catalog. */
            buttonCatalog: buttonCatalog,
            dragInProgress: false,

            // storage
            buttonStorage: {},
            /**
             * The selected item.
             * @type {BarItem}
             */
            selectedItem: {
                /** @type {BarItemConfiguration} */
                configuration: {
                    label: "hi",
                    color: "",
                    image_url: ""
                },
                data: {}
            },
            invitationEmail: "",
            /** @type {BarDetails} */
            barDetails: {},
            originalBarDetails: {},

            // configurations
            preview: {
                drawer: {
                    w: 2,
                    h: 6
                },
                bar: {
                    h: 100
                }
            },
            newBarDetails: {
                name: "New Bar",
                is_shared: false,
                items: []
            },
            predefinedBars: predefinedBars,
            checkBarTimer: null
        };
    }
};
</script>
