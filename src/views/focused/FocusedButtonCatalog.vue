<template>
  <div class="focusButtonCatalog">
      <h1>Button Catalog: Buttons you can add</h1>
      <a href="#">How to use the morphic button catalog</a>
      <p />
      <em>Click on button name to configure and add to MorphicBar</em>
      <p />
      <b-button variant="warning" :to="{ name: 'Focused: Bar Editor', query: { barId: barDetails.id, memberId: memberId } }">
        Cancel
      </b-button>
      <p />
      <ul class="buttonCatalogListing linkList list-unstyled mb-0">
        <!-- Button catalog headings -->
        <li v-for="(buttonGroup, subkind) in buttonCatalog" :key="subkind" class="buttonCatalogHeader">
          <h3 :class="'header_' + subkind">{{buttonGroup.title}}</h3>
          <ul class="buttonCatalogEntries">
            <li v-for="(button, buttonKey) in buttonGroup.items" :key="buttonKey" class="buttonCatalogEntry">
              <b-button v-if="currentlyActiveButton != buttonKey" @click="buttonActivated(buttonKey, button)" :style="'color: ' + (button.configuration.color || colors.blue) + ';'"  class="buttonCatalogEntry nonExpandedCatalogEntry">
                <b-img v-if="button.configuration.image_url" :src="getIconUrl(button.configuration.image_url)" :alt="item.configuration.label + ' logo'" />
                  {{ button.configuration.label }}
              </b-button>

              <div v-else class="active" style="max-width: 400px">
                <div style="width: 100%; display: inline-flex; align-items: center;">
                  <b-img v-if="button.configuration.image_url" :src="getIconUrl(button.configuration.image_url)" style="width: 20px; height: 20px; max-width: 20px; max-height: 20px;"/>
                  <b-img v-else :src="'/icons/bootstrap.svg'" style="width: 20px; height: 20px; max-width: 20px; max-height: 20px;"></b-img>
                  <h3 style="margin-block-start: inherit; text-decoration-line: underline; margin-left: 0.5rem; margin-bottom: 0.05rem;">{{button.configuration.label}}</h3>
                </div>
                <div class="description">{{button.configuration.description || "A button that enables the functionality described above"}}</div>
                <div class="help" v-if="button.kind == 'action'">To add this button, click the option below</div>
                <div class="help" v-else>To add this button, click on one of the options below</div>
                <div class="buttons">
                  <div class="buttonPreview" @click="addButtonToBar(button, false)">
                    <PreviewItem :item="button" :simplified="true" :noImage="true" class="noImage"  />
                    <span class="explainer" v-if="button.kind != 'action'">Configure and add button {{button.configuration.label}} without icon</span>
                    <span class="explainer" v-else>Add {{button.configuration.label}} button. No icon</span>
                  </div>
                  <div v-if="button.kind != 'action'" class="buttonPreview" @click="addButtonToBar(button, true)">
                    <PreviewItem :item="button" :simplified="true" class="withImage"  />
                    <span class="explainer">Configure and add button {{button.configuration.label}} with icon</span>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    <b-button variant="warning" :to="{ name: 'Focused: Bar Editor', query: { barId: barDetails.id, memberId: memberId } }">
      Cancel
    </b-button>
  </div>
</template>

<style lang="scss">

  .buttonCatalogHeader {
      h3 {
        font-size: 1.30rem;
        margin-bottom: 6px;
        margin-top: 15px;
        font-weight: bold;
      }
    .buttonCatalogEntries {
      padding-inline-start: 17px;
      list-style: none;
      .buttonCatalogEntry {
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
      .buttonPreview {
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;

        .explainer {
          text-align: center;
          font-size: 13px;
        }
      }
    }

  }

</style>

<script>

import PreviewItem from "@/components/dashboard/PreviewItem";
import { saveCommunityBar, getCommunityBar, createCommunityBar, getCommunityMember, updateCommunityMember } from "@/services/communityService";
import { buttonCatalog, colors, icons, subkindIcons } from "@/utils/constants";
import { predefinedBars } from "@/utils/predefined";
import * as Bar from "@/utils/bar";

export default {
    name: "MemberInvite",
    components: {
        PreviewItem
    },
    methods: {
        buttonActivated: function (buttonId, button) {
            if (button.data.focusedLink) {
                const target = this.$el.getElementsByClassName("header_" + button.data.focusedLink)[0];
                if (target) {
                    target.scrollIntoView();
                }
            } else {
                this.currentlyActiveButton = buttonId;
            }
        },
        addButtonToBar: function (button, withImage) {
            /** @type {BarItem} */
            const barItem = Bar.addItem(this.barDetails, button);

            // delete image if required
            if (!withImage && barItem.configuration.image_url) {
                delete barItem.configuration.image_url;
            }

            this.checkBarTypeAndSave();
        },
        checkBarTypeAndSave() { // TODO duplicate of FocusedButtonEdit function
            // if we're editing a member's bar and it was previously a community bar:
            if (this.memberId && this.barDetails.is_shared) {
                this.saveAsNewPersonalBar();
            } else {
                this.saveBar();
            }
        },
        saveAsNewPersonalBar: function () { // TODO duplicate of FocusedButtonEdit function
            this.barDetails.name = `${this.memberDetails.first_name} ${this.memberDetails.last_name}`.trim();
            this.barDetails.is_shared = false;
            delete this.barDetails.id;
            createCommunityBar(this.communityId, this.barDetails).then((resp) => {
                if (resp.status === 200) {
                    this.memberDetails.bar_id = resp.data.bar.id;
                    this.barDetails = resp.data.bar;
                    updateCommunityMember(this.communityId, this.memberDetails.id, this.memberDetails)
                        .then((resp) => {
                            if (resp.status === 200) {
                                this.editButton();
                            }
                        })
                        .catch(err => { // failed to update member
                            console.error(err);
                        });
                }
            }).catch(err => { // failed to create a community
                console.error(err);
            });
        },
        saveBar: function () { // TODO duplicate of FocusedButtonEdit function
            saveCommunityBar(this.communityId, this.barId, this.barDetails)
                .then(() => {
                    this.editButton();
                })
                .catch(err => {
                    console.error(err);
                });
        },
        editButton() {
            this.$router.push({
                path: "/focused/button-edit",
                query: {
                    barId: this.barDetails.id,
                    buttonIndex: this.barDetails.items.length - 1,
                    communityId: this.communityId,
                    memberId: this.memberId
                }
            });
        }
    },
    computed: {
        memberId: function () { return this.$route.query.memberId; },
        barId: function () { return this.$route.query.barId; }
    },
    mounted() {
    // load bar and content (incl. button)
        getCommunityBar(this.communityId, this.barId).then(b => {
            this.barDetails = b.data;
        });
        // load member if set:
        if (this.memberId) {
            getCommunityMember(this.communityId, this.memberId)
                .then((resp) => {
                    this.memberDetails = resp.data;
                })
                .catch(err => {
                    console.error(err);
                });
        }
    },
    watch: {
        predefinedButtons: function (newValue, oldValue) {
            if (!this.dragPredefinedButton) {
                this.predefinedButtons = oldValue;
                this.dragPredefinedButton = true;
            }
        }
    },
    data() {
        return {
            // data for the community manager
            community: {},
            barsList: [],
            membersList: [],
            currentlyActiveButton: undefined,
            buttonCatalog: buttonCatalog,
            barDetails: {},
            predefinedBars: predefinedBars,
            colors: colors,
            icons: icons,
            subkindIcons: subkindIcons
        };
    }
};
</script>
