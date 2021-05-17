<template>
  <b-card :no-body="isDialog" class="dialogCard memberDetails">
    <InviteMemberDialog id="inviteMemberDialog" :member="memberDetails" />

    <b-card-title>
      <span v-if="memberDetails"><b-icon-person-circle /> {{ memberDetails.displayName }}</span>
      <span v-else-if="memberCount > 0">
        <b-icon-person-circle v-if="memberCount === 1" />
        <b-icon-people-fill v-else-if="memberCount > 1" />
        {{ $tc('MemberDetails.member-count', memberCount) }}
      </span>
      <span v-else>This Morphic Bar is NOT used</span>
    </b-card-title>

    <!-- member's own bar -->
    <ul v-if="memberDetails" class="list-unstyled">
      <li v-if="memberDetails.role === 'member'">
        <b-button variant="link" @click="memberChangeRole(memberDetails, 'manager')">{{ $t('MemberDetails.make-manager') }}</b-button>
      </li>
      <li v-else>
        <b-button variant="link" @click="memberChangeRole(memberDetails, 'member')">{{ $t('MemberDetails.make-non-manager') }}</b-button>
      </li>
      <li>
        <b-button variant="link" @click="memberDelete(memberDetails)" class="text-danger">{{ $t('MemberDetails.delete-member') }}</b-button>
      </li>

      <li v-if="!memberDetails.isCurrent">
        <b-button variant="link" v-b-modal="'inviteMemberDialog'">{{ memberDetails.state === 'uninvited' ?
          $t('MemberDetails.send-invite') : $t('MemberDetails.resend-invite') }}
        </b-button>
      </li>
    </ul>

    <!-- community bar -->
    <ul v-else-if="memberCount > 0">
      <li v-for="member in members" v-bind:key="member.id">
        {{ member.displayName }}
      </li>
    </ul>

    <!-- unused community bar -->
    <b-card-sub-title v-else>{{ $t('MemberDetails.bar-unused') }}</b-card-sub-title>
  </b-card>
</template>

<style lang="scss">
.card.memberDetails {
  li {
    margin-top: 0.5em;
  }
}
</style>

<script>
import InviteMemberDialog from "@/components/dialogs/InviteMemberDialog";
import { membersMixin } from "@/mixins/members.js";

export default {

    name: "MemberDetails",
    components: {InviteMemberDialog},
    mixins: [membersMixin],
    props: {
        /** @type {CommunityMember} */
        memberDetails: Object,
        /** @type {Array<CommunityMember>} */
        members: Object,
        // true if this component is the body of a dialog
        isDialog: Boolean
    },
    computed: {
        memberCount: function () {
            return this.members?.length;
        }
    },
    methods: {
    }

};
</script>
