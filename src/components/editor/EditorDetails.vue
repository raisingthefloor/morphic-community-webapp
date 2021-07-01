<!-- The details displayed above the bar editor -->
<template>
  <b-container id="EditorDetails"
               class="p-0"
               :class="{ 'border-bottom': !isLite }"
               fluid="1">

    <TextInputDialog id="barNameDialog"
                     title="Rename Bar"
                     prompt="Enter the new name for the bar"
                     v-model="barDetails.name"
                     @ok="renameBar"
    />

    <template v-if="isLite">
      <b-modal id="MemberDetailsDialog"
               hide-header
               ok-only
               ok-title="Close"
      >
        <MemberDetails v-if="memberDetails" id="MemberDetailsDialog" :member-details="memberDetails" :members="members" is-dialog />
      </b-modal>
      <b-modal id="BarSettingsDialog"
               hide-header
               ok-only
               ok-title="Close"
      >
        <BarSettings :bar-details="barDetails" is-dialog :member="memberDetails" @rename="showRenameBarDialog()"/>
      </b-modal>
    </template>

    <b-row no-gutters>
      <!-- details and tabs -->
      <b-col fluid>
        <div id="BarDetails">
          <!-- Bar name -->
          <div class="bar-name">
            <h2>
              {{barName}}

              <!-- rename bar -->
              <span v-if="barDetails.name !== 'Default'">
                        &nbsp;<small><b-button variant="link" @click="showRenameBarDialog()" Xv-b-modal="'barNameDialog'">rename</b-button></small>
                      </span>
            </h2>

          </div>
          <div class="mb-1">
            <span  class="lead">
            <template v-if="barMembers.length === 0">
              Shared bar
            </template>
            <template v-else-if="barMembers.length === 1">
              Bar for: <b>{{ barMembers[0].displayName }}</b>
            </template>
            <template v-else>
              Bar for: <b>{{ barMembers.length }} members</b>
            </template>
            </span>
            <b-link class="ml-4 onlyFocus"
                    v-b-modal="'MemberDetailsDialog'"
            >Person Details</b-link>
          </div>
          <div v-if="isLite" class="mb-2">
            <b-link v-b-modal="'BarSettingsDialog'"><b-icon-gear-fill/>Settings for this MorphicBar</b-link>
          </div>
        </div>

        <div v-if="!isLite" id="EditorTabs">
          <b-tabs class="editorTabs"
                  v-model="editorTabIndex"
                  small
                  :content-class="'bg-white border border-top-0 ' + (editorTabIndex ? '' : 'd-none')">

            <!-- hidden tab to simulate no tab being selected -->
            <b-tab title="" active title-item-class="d-none" class="d-none"/>

            <!-- Members tab -->
            <b-tab @click="editorTabIndex = (editorTabIndex === 1 ? 0 : 1)">
              <template #title>
                <b-icon-person-circle/>&nbsp;
                <span v-if="memberDetails">{{ memberDetails.displayName }} details ({{memberDetails.stateText}})</span>
                <span v-else-if="memberCount === 0">Unused Bar</span>
                <span v-else>Members ({{ memberCount }})</span>
              </template>
              <button @click="editorTabIndex = 0" type="button" aria-label="Close" class="close">×</button>

              <MemberDetails v-if="memberDetails" :member-details="memberDetails" :members="members" />

            </b-tab>

            <!-- Bar settings tab -->
            <b-tab @click="editorTabIndex = (editorTabIndex === 2 ? 0 : 2)" >
              <template #title>
                <b-icon-gear-fill/>
                Settings for this MorphicBar
              </template>
              <button @click="editorTabIndex = 0" type="button" aria-label="Close" class="close">×</button>

              <BarSettings :bar-details="barDetails" :member="memberDetails" @rename="showRenameBarDialog()"/>
            </b-tab>

          </b-tabs>

        </div>
      </b-col>

      <b-col id="EditorActions" lg="fluid" xs="6">
        <b-button variant="secondary"
                  v-b-modal="'copyBarDialog'"
                  v-t="'EditorDetails.copy-bar_button'" />

        <b-button variant="secondary"
                  :disabled="!isChanged || newBar"
                  @click="revertBar"
                  v-t="'EditorDetails.revert-bar_button'" />

        <b-button variant="primary"
                  style="visibility: hidden"
                  disabled
                  v-t="'EditorDetails.try-it_button'" />

        <b-button variant="primary"
                  :disabled="!isChanged"
                  @click="saveBar"
                  v-t="'EditorDetails.save-bar_button'" />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import TextInputDialog from "@/components/dialogs/TextInputDialog";
import * as Bar from "@/utils/bar";
import { getCommunityBar, updateCommunityBar } from "@/services/communityService";
import MemberDetails from "@/components/editor/MemberDetails";
import BarSettings from "@/components/editor/BarSettings";

export default {
    name: "EditorDetails",
    components: {BarSettings, MemberDetails, TextInputDialog},
    props: {
        /** @type {BarDetails} */
        barDetails: Object,
        /** @type {Array<BarDetails>} */
        barsList: Array,
        /** The members who use this bar.
         * @type {Array<CommunityMember>} */
        barMembers: Array,
        isChanged: Boolean,
        memberDetails: Object,
        members: Object,
        newBar: Boolean
    },
    data() {
        return {
            barSettings: {},
            editorTabIndex: 0
        };
    },
    computed: {
        /**
         * @return {String} The bar title.
         */
        barName: function () {
            return Bar.getBarName(this.barDetails);
        },
        memberCount: function () {
            return this.members?.length || 0;
        }
    },
    methods: {
        /**
         * Shows the bar name dialog
         */
        showRenameBarDialog: function () {
            this.$bvModal.show("barNameDialog");
        },

        /**
         * OK button on the bar name dialog clicked.
         * @param {TextInputOKEvent} event The event object.
         */
        renameBar: function (event) {
            // only saving the name - so, get the currently stored bar and change that.
            event.promise = getCommunityBar(this.communityId, this.barDetails.id).then(resp => {
                /** @type {BarDetails} */
                const bar = resp.data;
                bar.name = event.newValue;
                return updateCommunityBar(this.communityId, this.barDetails.id, bar).then(() => {
                    // Update the item in the full list, to reload it in the community manager component.
                    const listed = this.barsList.find(b => b.id === this.barDetails.id);
                    if (listed) {
                        listed.name = bar.name;
                    }
                    return true;
                });
            });
        },
        revertBar: function () {
            this.$emit("revert-bar");
        },
        saveBar: function () {
            this.$emit("save-bar");
        },
        closeTab: function () {
            this.editorTabIndex = 0;
        }
    }
};
</script>

<style lang="scss">

#BarDetails {
  min-width: 20em;
  flex-grow: 1;
  .bar-name {
    h2 {
      margin-bottom: 0;
    }
  }
}


#EditorActions {
  display: grid;
  align-content: center;
  grid-template-columns: auto auto;

  column-gap: 0.5rem;
  row-gap: 0.5rem;

  margin: 0.5em auto 0.5em auto;

  .btn {
    font-size: 0.9rem;
    min-width: max-content;
  }
}

#EditorTabs {
  display: flex;
  align-items: center;

  & > :not(:last-child) {
    margin-right: 1em;
  }

  .editorTabs {
    margin-bottom: -1px;
    .nav-tabs {
      flex-wrap: nowrap;
      white-space: nowrap;
    }
    .tab-content {
      position: absolute;
      z-index: 10;
      max-width: 70%;
      min-width: 25rem;
      border-radius: 0 3px 3px 3px;

      & > div {
        margin-top: 0;
        padding: 0.3rem;
      }

    }
    .hidden-tab {
      display: none;
    }
    .card {
      border: 0;
      .card-body {
        padding: 0.5rem;
      }
    }

  }

  .barSelection {
    width: unset !important;
  }

  .userInvitationStatusArea {
    flex-grow: 1;
    text-align: right;

    .dot {
      height: 13px;
      width: 13px;
      display: inline-block;
      border-radius: 50%;
      vertical-align: middle;

      &.active-state { background-color: #3bc03b; }
      &.invited-state { background-color: #f3c702; }
      &.uninvited-state { background-color: #f20202; }
    }

    .linkStyling {
      border: none;
      background: inherit;
      color: #069;
      cursor: pointer;
    }
  }
}

.tab-content .dialogCard .card-title {
  border-bottom: none !important;
  padding-bottom: 0;
  font-size: 1.1em;
}

</style>
