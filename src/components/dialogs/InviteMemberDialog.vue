<!-- A dialog used to invite a member -->
<template>
  <TextInputDialog v-if="member"
                   v-bind="$attrs"
                   :title="$t('InviteMemberDialog.invite-member_title', {name: member.displayName})"
                   :prompt="$t('InviteMemberDialog.email_prompt', {name: member.fullName})"
                   validation="email"
                   clear
                   @ok="$event.promise = memberInvite(member, $event.newValue)"
  />

</template>

<script>

import TextInputDialog from "@/components/dialogs/TextInputDialog";
import { membersMixin } from "@/mixins/members";

export default {
    name: "InviteMemberDialog",
    components: {TextInputDialog},
    mixins: [membersMixin],
    props: {
        /** @type {CommunityMember} The member to invite */
        member: Object
    },
    data: function () {
        return {
        };
    },
    methods: {
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
