<!-- List of members on the side panel -->
<template>
  <div id="MembersList" class="panelSection">

    <!-- expand/collapse all buttons -->
    <div v-show="orderedMembers.length > 1" class="buttonRow">
      <b-button @click="$emit('expandClick', 'MembersList', true)"
                variant="link"
                class="expandAll"
                expand-group="MembersList"
      >{{ $t('MembersList.expand-all') }}</b-button>
      <b-button @click="$emit('expandClick', 'MembersList', false)"
                variant="link"
                class="collapseAll"
                expand-group="MembersList"
      >{{ $t('MembersList.collapse-all') }}</b-button>
    </div>

    <!-- Expanding section for a member -->
    <div v-for="(member) in orderedMembers"
         :key="member.id"
         class="panelBox"
         :class="{
            active: activeMemberId === member.id || member.bar_ids.includes(activeBarId),
          }"
    >
      <!-- member's name -->
      <h4 :ref="member.id"
          class="memberName"
          expand-group="MembersList"
          :class="{
            expandable: !(activeMemberId === member.id || member.bar_ids.includes(activeBarId)),
            expanded: expandedMembers.includes(member.id)
          }"
          @click="$emit('expandClick', $refs[member.id][0])"
      >
        <span>{{ member.displayName }}</span>

        <!-- the +/- expander button -->
        <span class="expander">
          <b-iconstack scale="1.2">
            <b-icon icon="circle-fill" variant="link" scale="1.1" />
            <b-icon icon="plus" variant="white" scale="1.4" class="expandIcon" />
            <b-icon icon="dash" variant="white" scale="1.4" class="collapseIcon"/>
          </b-iconstack>
        </span>
      </h4>

      <!-- member details (expanding) -->
      <div class="expandableContent">

        <!-- uninvited -->
        <div v-if="member.state === 'uninvited'">
          {{ $t('MembersList.not-invited') }}<br/>
          <b-button v-bind="buttonAttrs" variant="secondary" v-b-modal="'membersList-inviteMemberDialog'" @click="invitingMember = member">{{ $t('MembersList.invite_button') }}</b-button>
        </div>

        <!-- invited -->
        <div v-else-if="member.state === 'invited'">
          {{ $t('MembersList.invitation-not-accepted') }}<br/>
          <b-button v-bind="buttonAttrs" variant="secondary" v-b-modal="'membersList-inviteMemberDialog'" @click="invitingMember = member">{{ $t('MembersList.re-invite_button') }}</b-button>
        </div>

        <!-- Member's bars - currently, there's only 1 bar per person  -->
        <BarsList :member="member"
                  :active-bar-id="activeBarId"
                  :bars="bars"
                  :button-attrs="buttonAttrs"
                  @newbar="$emit('newbar', $event)"
        />
      </div>
    </div>

    <div class="">
      <b-button v-b-modal="'addMemberDialog'"
                v-bind="buttonAttrs"
                class="addNew"
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
import * as Bar from "@/utils/bar";
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
        buttonAttrs: Object
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
    }
};
</script>
