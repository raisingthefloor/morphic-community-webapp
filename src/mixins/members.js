
import * as communityService from "@/services/communityService";
import { MESSAGES } from "@/utils/constants";
import { deleteCommunityBar } from "@/services/communityService";

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
         * @param {Boolean} keepRoute Keep the current route, and don't redirect to the home page.
         * @return {Promise<Boolean>} Resolves with true if the member was deleted.
         */
        memberDelete: async function (member, force, keepRoute) {
            const confirmed = force ||
                await this.showConfirm(
                    this.$t("members.delete.confirm", {member: member.displayName}),
                    [
                        this.$t("members.delete.apply_button", {member: member.displayName}),
                        this.$t("members.delete.cancel_button")
                    ],
                    this.$t("members.delete.title"),
                    {
                        dangerous: true
                    });

            const req = confirmed && communityService.deleteCommunityMember(this.communityId, member.id);
            return req && this.requestToBool(req, MESSAGES.successfulMemberDelete).then(success => {
                if (!keepRoute) {
                    this.$router.push("/");
                }
            });
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
        },

        /**
         * Adds a bar to a member
         * @param {BarDetails} bar The bar to add.
         * @param {CommunityMember} member The member to own the bar.
         * @return {Promise} Resolves when complete.
         */
        memberAddBar: function (bar, member) {
            return this.memberUpdateBar(bar, member, true);
        },

        /**
         * Removes a bar from a member
         * @param {BarDetails} bar The bar to add.
         * @param {CommunityMember} member The member to own the bar.
         * @param {Boolean} deleteBar Delete the bar (will fail if other members still own the bar).
         * @param {Boolean} force Force the operation, without confirming with the user.
         * @return {Promise} Resolves when complete.
         */
        memberRemoveBar: async function (bar, member, deleteBar, force) {
            const confirmed = force ||
                await this.showConfirm(
                    this.$t("members.removeBar.confirm"),
                    [this.$t("members.removeBar.apply_button"), this.$t("members.removeBar.cancel_button")],
                    bar.name,
                    {
                        dangerous: true
                    });

            var togo;
            if (confirmed) {
                const updateResult = this.memberUpdateBar(bar, member, false);
                if (deleteBar) {
                    await updateResult;
                    togo = deleteCommunityBar(this.communityId, this.$route.query.barId).then((resp) => {
                        this.showMessage(MESSAGES.successfulBarDelete);
                    });

                } else {
                    togo = updateResult;
                }
            }
            return togo;
        },

        /**
         * Associate or disassociate a bar with a member.
         * @param {BarDetails} bar The bar.
         * @param {CommunityMember} member The member to own the bar.
         * @param {Boolean} add true to associate the bar with the member, false to remove.
         * @return {Promise} Resolves when complete.
         */
        memberUpdateBar: async function (bar, member, add) {
            // Reload the member data
            const memberResponse = communityService.getCommunityMember(this.communityId, member.id);
            Object.assign(member, memberResponse.data);

            if (add) {
                if (!member.bar_ids.includes(bar.id)) {
                    member.bar_ids.push(bar.id);
                }
            } else {
                const index = member.bar_ids.indexOf(bar.id);
                member.bar_ids.splice(index, 1);
            }

            return await communityService.updateCommunityMember(this.communityId, member.id, member);
        }

    }
};
