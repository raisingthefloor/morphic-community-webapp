
import * as communityService from "@/services/communityService";
import { MESSAGES } from "@/utils/constants";

/**
 * Mix-in for member management related things.
 * @type {Component}
 */
export const membersMixin = {
    methods: {
        /**
         * Deletes a member (from the community).
         * @param {CommunityMember} member The member to delete.
         * @param {Boolean} force Force the operation, without confirming with the user.
         * @return {Promise<Boolean>} Resolves with true if the member was deleted.
         */
        memberDelete: async function (member, force) {
            const confirmed = force ||
                await this.showConfirm(
                    this.$t("members.delete.confirm", {member: member.displayName}),
                    [
                        this.$t("members.delete.apply_button", {member: member.displayName}),
                        this.$t("members.delete.cancel_button")
                    ],
                    this.$t("members.delete.title"));

            const req = confirmed && communityService.deleteCommunityMember(this.communityId, member.id);
            return req && this.requestToBool(req, MESSAGES.successfulMemberDelete);
        },

        /**
         * Changes a member's role.
         * @param {CommunityMember} member The member.
         * @param {"member"|"manager"} newRole The member's new role.
         * @param {Boolean} force Force the operation, without confirming with the user.
         * @return {Promise<Boolean>} Resolves with true if the member's role was changed.
         */
        memberChangeRole: async function (member, newRole, force) {
            const origRole = member.role;

            const confirmed = force ||
                await this.showConfirm(
                    this.$t("members.changeRole.confirm", {member: member.displayName, role: newRole}),
                    [
                        this.$t("members.changeRole.apply_button", {role: newRole}),
                        this.$t("members.changeRole.cancel_button")
                    ],
                    this.$t("members.changeRole.title"));

            if (confirmed) {
                member.role = newRole;
            }

            const req = confirmed && communityService.updateCommunityMember(this.communityId, member.id, member);
            return req && this.requestToBool(req, MESSAGES.successfulRoleChange).then(success => {
                if (!success) {
                    member.role = origRole;
                }
            });
        }
    }
};
