<!-- A dialog used to invite a member -->
<template>
  <TextInputDialog v-if="member"
                   v-bind="$attrs"
                   :title="$t('InviteMemberDialog.invite-member_title', {name: member.displayName})"
                   :prompt="$t('InviteMemberDialog.email_prompt', {name: member.fullName})"
                   validation="email"
                   clear
                   @ok="$event.promise = sendInvite(member, $event.newValue)"
  />

</template>

<script>

import TextInputDialog from "@/components/dashboardV2/TextInputDialog";
import * as communityService from "@/services/communityService";

export default {
    name: "InviteMemberDialog",
    components: {TextInputDialog},
    props: {
        /** @type {CommunityMember} The member to invite */
        member: Object
    },
    data: function () {
        return {
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
            return communityService.inviteCommunityMember(this.communityId, member.id, invitationEmail).then(() => {
                member.state = "invited";
                return true;
            });
        }
    }
};
</script>

<style lang="scss">
.textInputDialog {
  .textInputDialogField .requiredText {
    display: none;
  }

  footer.modal-footer {
    flex-wrap: nowrap;

    .alert {
      margin-right: auto;
      width: fit-content;
    }
  }
}
</style>
