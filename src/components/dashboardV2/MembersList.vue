<!-- List of members on the side panel -->
<template>
  <div id="MembersList" class="panelSection">
    <div class="">
      <b-button @click="$router.push({ name: 'Member Invite' })"
                variant="success"
                class="addNewLink"
                size="sm"
      ><b-icon icon="person-plus-fill"/> {{ $t('MembersList.add-member_button') }}</b-button>
    </div>

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
            active: activeMemberId === member.id,
          }"
    >
      <!-- member's name -->
      <h4 :ref="member.id"
          class="memberName"
          expand-group="MembersList"
          :class="{
            expandable: activeMemberId !== member.id
          }"
          @click="$emit('expandClick', $refs[member.id][0])"
      >
          {{ member.fullName }}
        <!-- the +/- expander button -->
        <span class="expander">
          <b-iconstack>
            <b-icon icon="circle-fill" variant="success" scale="1.1" />
            <b-icon icon="plus" variant="white" scale="1.4" class="expandIcon" />
            <b-icon icon="dash" variant="white" scale="1.4" class="collapseIcon"/>
          </b-iconstack>
        </span>
      </h4>

      <!-- member details (expanding) -->
      <div class="expandableContent">

        <!-- uninvited -->
        <div v-if="member.state === 'uninvited'">
          {{ $t('MembersList.not-invited') }}
          <b-button variant="light" size="sm" v-b-modal="'inviteMemberDialog'" @click="invitingMember = member">{{ $t('MembersList.invite_button') }}</b-button>
        </div>

        <!-- invited -->
        <div v-else-if="member.state === 'invited'">
          {{ $t('MembersList.invitation-not-accepted') }}
          <b-button variant="light" size="sm" v-b-modal="'inviteMemberDialog'" @click="invitingMember = member">{{ $t('MembersList.re-invite_button') }}</b-button>
        </div>

        <!-- Member's bars - currently, there's only 1 bar per person  -->
        <div>
          <b-button variant="success" size="sm"
                    :disabled="!isCommunityBar(member.bar_id)"
                    @click="$emit('newbar', member)"
          >{{ $t('MembersList.add-bar_button') }}</b-button>
        </div>

        <ul class="list-unstyled">
          <li :class="{ active: member.bar_id === activeBarId }">
            <b-link v-if="!isCommunityBar(member.bar_id)"
                    :to="getBarEditRoute(member)"
                    class="barLink"
            >{{ getMemberBarName(member) }}
            </b-link>
          </li>
        </ul>
      </div>
    </div>

    <!-- The CM counts as a member of the Community, so by default there's always one member -->
    <ul v-if="false" class="list-unstyled">
      <li v-for="(member, index) in orderedMembers" :key="member.id" :class="{ active: member.id === activeMemberId }">
        <b-link :to="getBarEditRoute(member)" :ref="'member' + index" class="stretched-link">
          <b v-if="member.bar_id === activeBarId">{{ member.first_name || "No name" }} {{ member.last_name }}</b>
          <span v-else>{{ member.first_name || "No name" }} {{ member.last_name }}</span>
          <span v-if="isCommunityBar(member.bar_id)" v-b-tooltip.hover title="Using a group bar">*&nbsp;</span>
          <b-icon v-if="member.role === 'manager'" icon="people-fill" variant="dark" v-b-tooltip.hover title="Member is a group manager"></b-icon>
          <b-icon v-if="member.state === 'uninvited'" icon="exclamation-circle-fill" variant="dark" v-b-tooltip.hover title="Has not accepted invitation"></b-icon>
        </b-link>
        <div v-if="member.id === activeMemberId">
          <div v-if="member.state === 'uninvited'" class="small pb-2">
            Uninvited, you can send them an invitation<br>
            <b-button size="sm" variant="light" class="btn-block" @click="getEmailAndSendInvite(member)">Send Invitation</b-button>
          </div>
          <div v-else-if="member.state === 'invited'" class="small pb-2">
            Invited, but has not accepted the invitation yet<br>
            <b-button size="sm" variant="light" class="btn-block" @click="getEmailAndSendInvite(member)">Resend Invitation</b-button>
          </div>
        </div>
      </li>
    </ul>


    <TextInputDialog v-if="invitingMember"
                     id="inviteMemberDialog"
                     :title="$t('MembersList.invite-member_title', {name: invitingMember.fullName})"
                     :prompt="$t('MembersList.email_prompt', {name: invitingMember.fullName})"
                     validation="email"
                     clear
                     @ok="$event.promise = sendInvite(invitingMember, $event.newValue)"
    />

  </div>
</template>

<style lang="scss">
</style>

<script>
import * as communityService from "@/services/communityService";
import * as Bar from "@/utils/bar";
import TextInputDialog from "@/components/dashboardV2/TextInputDialog";

export default {
    name: "MembersList",
    components: {TextInputDialog},
    props: {
        members: Array,
        activeMemberId: String,
        /** @type {Array<BarDetails>} */
        bars: Array,
        activeBarId: String,
        /** @type {Community} */
        community: Object
    },
    computed: {
        /**
         * Gets the ordered list of members.
         * @return {Array<CommunityMember>} The members.
         */
        orderedMembers: function () {
            if (this.members.length) {
                // first member is community manager
                const alphabetical = this.members.slice(1);
                alphabetical.sort((a, b) => (a.first_name < b.first_name) ? 1 : ((a.first_name > b.first_name) ? -1 : 0));
                alphabetical.reverse();
                return [this.members[0]].concat(alphabetical);
            } else {
                return [];
            }
        }
    },
    data() {
        return {
            /** @type {CommunityMember} */
            invitingMember: null,
            activeMember: {}
        };
    },
    methods: {
        /**
         * Invites a member to enjoy fruits of morphic.
         * @param {CommunityMember} member The chosen member.
         * @param {String} invitationEmail The email address.
         * @return {Promise} Resolves when complete.
         */
        sendInvite(member, invitationEmail) {
            return communityService.inviteCommunityMember(this.communityId, this.activeMemberId, invitationEmail).then(() => {
                this.activeMember.state = "invited";
            });
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
         * Get the bar editor route for a member's bar.
         * @param {CommunityMember} member The member.
         * @return {Object} The location.
         */
        getBarEditRoute(member) {
            return Bar.getUserBarEditRoute(member, this.community.default_bar_id);
        },

        /**
         * Get the name of the bar used by a member.
         * @param {CommunityMember} member The member.
         * @return {String} The bar name.
         */
        getMemberBarName(member) {
            const barId = member.bar_id || this.community.default_bar_id;
            const bar = this.bars.find(bar => bar.id === barId);
            return bar && Bar.getBarName(bar);
        }

    }
};
</script>
