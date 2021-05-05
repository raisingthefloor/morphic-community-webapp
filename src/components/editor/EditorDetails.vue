<!-- The details displayed above the bar editor -->
<template>
  <b-container id="EditorDetails" class="border-bottom p-0">
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
                        <TextInputDialog id="barNameDialog"
                                         title="Rename Bar"
                                         prompt="Enter the new name for the bar"
                                         v-model="barDetails.name"
                                         @ok="renameBar"
                        />
                        &nbsp;<small><b-button variant="link" v-b-modal="'barNameDialog'">rename</b-button></small>
                      </span>
            </h2>

          </div>
          <div class="lead">
            <template v-if="barMembers.length === 0">
              Shared bar
            </template>
            <template v-else-if="barMembers.length === 1">
              Bar for: <b>{{ barMembers[0].displayName }}</b>
            </template>
            <template v-else>
              Bar for: <b>{{ barMembers.length }} members</b>
            </template>
          </div>
        </div>

        <div id="EditorTabs">
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

              <b-card>
                <b-card-title>
                  <span v-if="memberDetails"><b-icon-person-circle/> {{ memberDetails.first_name }}</span>
                  <span v-else-if="memberCount === 1"><b-icon-person-circle/> This Morphic Bar is used by 1 member</span>
                  <span v-else-if="memberCount > 0"><b-icon-people-fill/> This Morphic Bar is used by {{memberCount}} members</span>
                  <span v-else>This Morphic Bar is NOT used</span>
                </b-card-title>

                <!-- member's own bar -->
                <ul v-if="memberDetails" class="list-unstyled">
                  <li v-if="memberDetails.role === 'member'">
                    <b-button variant="link" v-b-modal.roleChangeConfirm>Make member a Group Manager</b-button>
                  </li>
                  <li v-else>
                    <b-button variant="link" v-b-modal.roleChangeConfirm>Remove group manager role from member</b-button>
                  </li>
                  <li>
                    <b-button variant="link" v-b-modal.deleteConfirm class="text-danger">Delete member</b-button>
                  </li>

                  <li v-if="!memberDetails.isCurrent">
                    <b-button variant="link" v-b-modal="'inviteMemberDialog'">{{ memberDetails.state === 'uninvited' ?
                      "Send Invitation" : "Re-invite member" }}
                    </b-button>
                  </li>
                </ul>

                <!-- community bar -->
                <ul v-else-if="memberCount > 0">
                  <li v-for="member in members" v-bind:key="member.id">
                    {{ member.first_name }} {{ member.last_name }}
                  </li>
                </ul>

                <!-- unused community bar -->
                <b-card-sub-title v-else>You can go back to the
                  <b-link to="/dashboard">Dashboard</b-link>
                  and invite members to use it.
                </b-card-sub-title>
              </b-card>

            </b-tab>

            <!-- Bar settings tab -->
            <b-tab @click="editorTabIndex = (editorTabIndex === 2 ? 0 : 2)" disabled title-item-class="notProduction">
              <template #title>
                <b-icon-gear-fill/>
                Morphic Bar settings
              </template>
              <button @click="editorTabIndex = 0" type="button" aria-label="Close" class="close">×</button>

              <b-card>
                <b-card-title>
                  <b-icon-gear-fill/>
                  Morphic Bar settings
                </b-card-title>

                <b-form-checkbox id="barOnRight" v-model="barSettings.barOnRight" name="barOnRight" value="true"
                                 unchecked-value="false">
                  Bar on the right of the screen
                </b-form-checkbox>
                <b-form-checkbox id="cannotClose" v-model="barSettings.cannotClose" name="cannotClose" value="true"
                                 unchecked-value="false">
                  Member cannot close bar
                </b-form-checkbox>
                <b-form-checkbox id="startsOpen" v-model="barSettings.startsOpen" name="startsOpen" value="true"
                                 unchecked-value="false">
                  Morphic Bar always starts open
                </b-form-checkbox>
              </b-card>
            </b-tab>

          </b-tabs>

        </div>
      </b-col>

      <b-col id="EditorActions" lg="fluid" xs="6">
        <b-button variant="outline-dark"
                  v-b-modal="'copyBarDialog'"
        >Copy bar from...
        </b-button>

        <b-button variant="outline-dark"
                  :disabled="!isChanged || newBar"
                  @click="revertBar"
        >Revert to user's current bar
        </b-button>

        <b-button variant="success"
                  style="visibility: hidden"
                  disabled
        >Try it
        </b-button>

        <b-button variant="success"
                  :disabled="!isChanged"
                  @click="saveBar"
        >Save bar
        </b-button>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import TextInputDialog from "@/components/dialogs/TextInputDialog";
import * as Bar from "@/utils/bar";
import { getCommunityBar, updateCommunityBar } from "@/services/communityService";

export default {
    name: "EditorDetails",
    components: {TextInputDialog},
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
  flex-grow: 1;
}

#EditorActions {
  display: grid;
  align-content: center;
  grid-template-columns: auto auto;

  column-gap: 0.5rem;
  row-gap: 0.5rem;

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

</style>
