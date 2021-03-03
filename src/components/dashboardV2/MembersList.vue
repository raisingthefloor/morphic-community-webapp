<template>
  <div id="MembersList">
    <b-modal id="sendEmailInvitationFromMembersListModal" :ok-disabled="!invitationEmail.match('^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$')" @ok="sendInvite" title="Enter email address for invitation" footer-bg-variant="light" ok-title="Send Invitation">
      <p class="my-4"></p>
      <b-form-group :label="'Please enter email address for '+activeMember.first_name+' '+activeMember.last_name" label-for="email">
        <b-form-input v-model="invitationEmail" id="email" placeholder="myemail@mail.com" class="mb-2"></b-form-input>
      </b-form-group>
    </b-modal>

    <!-- The CM counts as a member of the Community, so by default there's always one member -->
    <ul class="list-unstyled">
      <li v-for="(member, index) in orderedMembers" :key="member.id" :class="{ active: member.id === activeMemberId }">
        <b-link :to="getBarEditRoute(member)" :ref="'member' + index" class="stretched-link">
          <b v-if="member.bar_id === activeBarId">{{ member.first_name }} {{ member.last_name }}</b>
          <span v-else>{{ member.first_name }} {{ member.last_name }}</span>
          <span v-if="isCommunityBar(member.bar_id)" v-b-tooltip.hover title="Using a community bar">*&nbsp;</span>
          <b-icon v-if="member.role === 'manager'" icon="people-fill" variant="dark" v-b-tooltip.hover title="Member is a community manager"></b-icon>
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
  </div>
</template>

<style lang="scss">
  #MembersList {
    ul {
      margin: 0 -1rem 1rem -1rem;
      li {
        position: relative;
        padding: 0 1rem;
        &.active {
          padding: .25rem 1rem;
          background: green;
          color: white;
          a {
            color: white;
          }
        }
        a {
          display: inline;
          padding: 0 0.75rem 0 0;
        }
      }
    }
  }
</style>

<script>
import { inviteCommunityMember } from "@/services/communityService";
import * as Bar from "@/utils/bar";

export default {
    name: "MembersList",
    props: {
        members: Array,
        activeMemberId: String,
        bars: Array,
        activeBarId: String,
        community: Object
    },
    computed: {
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
            invitationEmail: "",
            activeMember: {}
        };
    },
    methods: {
        getEmailAndSendInvite() {
            this.activeMember = this.members.find(x => x.id === this.activeMemberId);
            this.invitationEmail = "";
            this.$bvModal.show("sendEmailInvitationFromMembersListModal");
        },
        sendInvite() {
            if (this.invitationEmail) {
                const communityId = this.$store.getters.communityId;
                inviteCommunityMember(communityId, this.activeMemberId, this.invitationEmail);
                this.activeMember.state = "invited";
            }
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
        }

    }
};
</script>
