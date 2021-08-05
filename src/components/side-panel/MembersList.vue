<!-- List of members on the side panel -->
<template>
  <div id="MembersList">

    <!-- expand/collapse all buttons -->
    <div v-show="orderedMembers.length > 1" class="buttonRow">
      <b-button ref="ExpandAllButton"
                @click="expandAll(true)"
                variant="link"
                class="expandAll"
                :aria-label="$t('MembersList.expand-all_aria-label')"
      >{{ $t('MembersList.expand-all') }}</b-button>
      <b-button ref="CollapseAllButton"
                @click="expandAll(false)"
                variant="link"
                class="collapseAll"
                :aria-label="$t('MembersList.collapse-all_aria-label')"
      >{{ $t('MembersList.collapse-all') }}</b-button>
    </div>

    <ul class="list-unstyled" :aria-labelledby="ariaLabelledby">
      <!-- Expanding section for a member -->
      <li v-for="(member) in orderedMembers"
           :key="member.id"
           class="panelDetails expandable"
           :class="{
              active: activeMemberId === member.id || member.bar_ids.includes(activeBarId),
              expanded: activeMemberId === member.id || member.bar_ids.includes(activeBarId)
            }"
           :ref="`MemberDetails_${member.id}`"
          :aria-labelledby="`MemberHeader_${member.id}`"
      >
        <div class="header" :id="`MemberHeader_${member.id}`"
             @click.self="expandMember(member.id)"
        >
          <!-- member's name -->
          <h3 :id="`MemberHeader_${member.id}`"
              class="memberName"
              @click.self="expandMember(member.id)">{{ member.displayName }}</h3>

          <!-- the expander icon -->
          <b-button variant="none" class="expander"
                    v-b-toggle="`Collapse_${member.id}`"
                    :aria-label="$t('MembersList.expand_button_arial-label', {name: member.displayName})"
          >
            <b-icon icon="caret-down-square-fill" variant="morphic-blue" scale="1.3" />
          </b-button>
          <!-- the user settings button -->
          <b-button variant="none" class="memberSettings whenExpanded"
                    @click="$emit('memberDetails', member)"
                    v-b-tooltip.hover="$t('MembersList.settings_tooltip', {name : member.displayName})"
                    :aria-label="$t('MembersList.settings_tooltip', {name : member.displayName})">
            <b-icon icon="gear-fill" variant="morphic-blue" scale="1.3" />
          </b-button>
        </div>

        <!-- member details (expanding) -->
        <b-collapse :id="`Collapse_${member.id}`"
                    @show="onMemberExpand(member.id, true, false)"
                    @hide="onMemberExpand(member.id, false, false)"
                    @shown="onMemberExpand(member.id, true, true)"
                    @hidden="onMemberExpand(member.id, false, true)"
                    :visible="activeMemberId === member.id"
        >

          <!-- uninvited -->
          <div v-if="member.state === 'uninvited'">
            {{ $t('MembersList.not-invited') }}<br/>
            <b-button v-bind="buttonAttrs" variant="secondary"
                      v-b-modal="'membersList-inviteMemberDialog'"
                      :aria-label="$t('MembersList.invite_button_aria-label', {name: member.displayName})"
                      @click="invitingMember = member">{{ $t('MembersList.invite_button') }}</b-button>
          </div>

          <!-- invited -->
          <div v-else-if="member.state === 'invited'">
            {{ $t('MembersList.invitation-not-accepted') }}<br/>
            <b-button v-bind="buttonAttrs" variant="link"
                      v-b-modal="'membersList-inviteMemberDialog'"
                      :aria-label="$t('MembersList.re-invite_button_aria-label', {name: member.displayName})"
                      @click="invitingMember = member">{{ $t('MembersList.re-invite_button') }}</b-button>
          </div>

          <BarsList :member="member"
                    :active-bar-id="activeBarId"
                    :bars="bars"
                    :button-attrs="buttonAttrs"
                    @newbar="$emit('newbar', $event)"
                    @active="onMemberExpand(member.id)"
                    class="border-top"
          />
        </b-collapse>
      </li>
    </ul>
    <div class="">
      <b-button v-b-modal="'addMemberDialog'"
                v-bind="buttonAttrs"
                variant="morphic-blue"
                class="addNew border-white"
      ><b-icon icon="person-plus-fill"/> {{ $t('MembersList.add-member_button') }}</b-button>
    </div>
    <div v-if="!anyMembers">
      <em>{{ $t('MembersList.no-members', {subscription: "+5", maxMembers: 5}) }}</em>
    </div>


    <InviteMemberDialog id="membersList-inviteMemberDialog"
                        :member="invitingMember" />

    <TextInputDialog id="addMemberDialog"
                     title="Add new member"
                     prompt="Enter the name of the new member"
                     clear
                     @ok="$event.promise = addMember($event.newValue)"
    />

  </div>
</template>

<style lang="scss">
</style>

<script>
import TextInputDialog from "@/components/dialogs/TextInputDialog";
import BarsList from "@/components/side-panel/BarsList";
import InviteMemberDialog from "@/components/dialogs/InviteMemberDialog";

export default {
    name: "MembersList",
    components: {InviteMemberDialog, BarsList, TextInputDialog},
    props: {
        /** @type {Array<CommunityMember>} */
        members: Array,
        activeMemberId: String,
        /** @type {Array<GUID>} The members to show expanded */
        expandedMembers: Array,
        /** @type {Array<BarDetails>} */
        bars: Array,
        activeBarId: String,
        /** @type {Community} */
        community: Object,
        // variant attribute for buttons
        buttonAttrs: Object,
        ariaLabelledby: String
    },
    computed: {
        /**
         * Gets the ordered list of members.
         * @return {Array<CommunityMember>} The members.
         */
        orderedMembers: function () {
            return this.members.filter(m => !m.isCurrent).sort((a, b) => {
                return a.displayName.localeCompare(b.displayName);
            });
        },
        anyMembers: function () {
            return this.orderedMembers.length > 0;
        }
    },
    data() {
        return {
            /** @type {CommunityMember} */
            invitingMember: null
        };
    },
    mounted() {
        this.updateExpandAllButtons();
    },
    methods: {
        /**
         * Adds a new member
         * @param {String} name Name of the new member.
         * @return {Promise} Resolves when complete.
         */
        addMember(name) {

            const event = {
                name: name,
                promise: null
            };

            // let the parent component deal with it.
            this.$emit("addMember", event);

            return event.promise;
        },

        isCommunityBar: function (barId) {
            for (let i = 0; i < this.bars.length; i++) {
                if (this.bars[i].id === barId) {
                    return this.bars[i].is_shared;
                }
            }
            return false;
        },

        /**
         * Get the .panelDetails element for a member.
         * @param {GUID} id The member id.
         * @return {HTMLElement} The .panelDetails element.
         */
        memberDetailsElem: function (id) {
            const ref = this.$refs[`MemberDetails_${id}`];
            return ref && ref[0];
        },

        /**
         * Called when a member's details are expanded or collapsed
         * @param {GUID} id member id.
         * @param {Boolean} expanded true if expanded.
         * @param {Boolean} complete true if the transition is complete.
         */
        onMemberExpand: function (id, expanded, complete) {
            const elem = this.memberDetailsElem(id);

            elem.classList.toggle("expanded", expanded);
            elem.classList.toggle("anim", !complete);

            /** @type {HTMLElement} */
            const settings = elem.querySelector(".memberSettings");
            settings.toggleAttribute("disabled", !expanded);

            this.updateExpandAllButtons();
        },

        /**
         * Updates the state of the expand-all and collapse-all buttons
         */
        updateExpandAllButtons: function () {
            // See if all are expanded or collapsed.
            const noneExpanded = this.$el.querySelector(".panelDetails.expandable.expanded") === null;
            const allExpanded = !noneExpanded && this.$el.querySelector(".panelDetails.expandable:not(.expanded)") === null;

            // Because clicking a button will disable itself, the focus will disappear to the document. Instead, disable
            // using aria and styling.
            this.$refs.CollapseAllButton.setAttribute("aria-disabled", noneExpanded);
            this.$refs.CollapseAllButton.classList.toggle("disabled", noneExpanded);
            this.$refs.ExpandAllButton.setAttribute("aria-disabled", allExpanded);
            this.$refs.ExpandAllButton.classList.toggle("disabled", allExpanded);
        },

        /**
         * Expand or collapse the details of a member.
         * @param {GUID} id The member id.
         * @param {Boolean} expand true/false to expand/collapse, undefined to toggle
         */
        expandMember: function (id, expand) {
            const elem = this.memberDetailsElem(id);
            const isExpanded = expand === undefined ? 0 : elem.classList.contains("expanded");
            if (expand !== isExpanded) {
                /** @type {HTMLElement} */
                const expander = elem.querySelector(".expander");
                expander.click();
            }
        },

        /**
         * Expands or collapses details for all members.
         * @param {Boolean} expand true to expand, false to collapse
         */
        expandAll: function (expand) {
            this.orderedMembers.forEach(member => {
                this.expandMember(member.id, expand);
            });
        }
    }
};
</script>
