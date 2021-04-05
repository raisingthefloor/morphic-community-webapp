import { HTTP } from "@/services/index";
import * as Bar from "@/utils/bar";

/**
 * @typedef {String} GUID
 */

/**
 * Get a list of communities the user belongs to.
 * @see https://github.com/raisingthefloor/morphic-api-server/blob/master/Documentation/API.md#v1usersidcommunities
 * @param {GUID} userId The user ID.
 * @return {Promise<AxiosResponse<Any>>} Response
 */
export function getUserCommunities(userId) {
    return HTTP.get(`/v1/users/${userId}/communities`, {action: "get user communities"});
}

/**
 * Creates a new community.
 * @see https://github.com/raisingthefloor/morphic-api-server/blob/master/Documentation/API.md#v1communities
 * @param {String} name Community name.
 * @return {Promise<AxiosResponse<Any>>} Response.
 */
export function createNewCommunity(name) {
    const data = {
        name: name
    };
    return HTTP.post("/v1/communities", data, {action: "create new community"});
}

/**
 * Gets a community details.
 * @see https://github.com/raisingthefloor/morphic-api-server/blob/master/Documentation/API.md#v1communitiesid
 * @param {GUID} communityId The community ID.
 * @return {Promise<AxiosResponse<Community>>} Response
 */
export function getCommunity(communityId) {
    return HTTP.get(`/v1/communities/${communityId}`, {action: "get community"});
}

/**
 * Update a community (only the name and default bar).
 * @see https://github.com/raisingthefloor/morphic-api-server/blob/master/Documentation/API.md#v1communitiesid
 * @param {Community} communityId The community.
 * @param {Community} name The new community name.
 * @param {Community} defaultBarId The new default bar for the community.
 * @return {Promise<AxiosResponse<Community>>} Response
 */
export function updateCommunity(communityId, name, defaultBarId) {
    return HTTP.put(`/v1/communities/${communityId}`, {
        name: name,
        default_bar_id: defaultBarId
    }, {action: "update community"});
}

/**
 * Delete a community.
 * @see https://github.com/raisingthefloor/morphic-api-server/blob/master/Documentation/API.md#delete
 * @param {GUID} communityId The community ID.
 * @return {Promise<AxiosResponse<Any>>} Response
 */
export function deleteUserCommunity(communityId) {
    return HTTP.delete(`/v1/communities/${communityId}`, {action: "delete user community"});
}

/**
 * Gets the bars in a community.
 * @see https://github.com/raisingthefloor/morphic-api-server/blob/master/Documentation/API.md#v1communitiesidbars
 * @param {GUID} communityId The community ID.
 * @return {Promise<AxiosResponse<Any>>} Response
 */
export function getCommunityBars(communityId) {
    return HTTP.get(`/v1/communities/${communityId}/bars`, {action: "get bars"});
}

/**
 * Creates a community bar.
 * @see https://github.com/raisingthefloor/morphic-api-server/blob/master/Documentation/API.md#post-13
 * @param {GUID} communityId The community ID.
 * @param {BarDetails} data The bar.
 * @return {Promise<AxiosResponse<Any>>} Response
 */
export function createCommunityBar(communityId, data) {
    return HTTP.post(`/v1/communities/${communityId}/bars`, storeBar(data), {action: "create bar"});
}

/**
 * Gets a community bar.
 * @see https://github.com/raisingthefloor/morphic-api-server/blob/master/Documentation/API.md#v1communitiescidbarsid
 * @param {GUID} communityId The community ID.
 * @param {GUID} barId The bar ID.
 * @return {Promise<AxiosResponse<BarDetails>>} Response
 */
export function getCommunityBar(communityId, barId) {
    return HTTP.get(`/v1/communities/${communityId}/bars/${barId}`).then(resp => {
        /** @type {BarDetails} */
        const bar = resp && resp.data;
        if (bar) {
            const items = bar.items || [];
            bar.items = [];

            items.forEach(item => {
                item.data = item.configuration._webapp || {};
                delete item.configuration._webapp;

                // Migrate some old data
                ["catalog", "catalogItem", "catalogLabel", "parameters", "paramFields", "visual", "buttonKey"].forEach((key) => {
                    if (item.configuration[key] !== undefined) {
                        if (!item.data[key]) {
                            item.data[key] = item.configuration[key];
                        }
                        delete item.configuration[key];
                    }
                });

                // Initialise it
                Bar.addItem(bar, item);
            });
        }
        return resp;
    }, {action: "get bar"});
}

/**
 * Saves a community bar.
 * @see https://github.com/raisingthefloor/morphic-api-server/blob/master/Documentation/API.md#put-4
 * @param {GUID} communityId The community ID.
 * @param {GUID} barId The bar ID.
 * @param {BarDetails} barDetails The bar.
 * @return {Promise<AxiosResponse<Any>>} Response
 */
export function saveCommunityBar(communityId, barId, barDetails) {
    return HTTP.put(`/v1/communities/${communityId}/bars/${barId}`, storeBar(barDetails), {action: "save bar"});
}

/**
 * Updates a community bar.
 * (appears to be a duplicate of saveCommunityBar)
 * @see https://github.com/raisingthefloor/morphic-api-server/blob/master/Documentation/API.md#put-4
 * @param {GUID} communityId The community ID.
 * @param {GUID} barId The bar ID.
 * @param {BarDetails} bar The bar.
 * @return {Promise<AxiosResponse<Any>>} Response
 */
export function updateCommunityBar(communityId, barId, bar) {
    bar.name = null;
    return HTTP.put(`/v1/communities/${communityId}/bars/${barId}`, storeBar(bar), {action: "update bar"});
}

/**
 * Deletes a community bar.
 * @see https://github.com/raisingthefloor/morphic-api-server/blob/master/Documentation/API.md#delete-2
 * @param {GUID} communityId The community ID.
 * @param {GUID} barId The bar ID.
 * @return {Promise<AxiosResponse<Any>>} Response
 */
export function deleteCommunityBar(communityId, barId) {
    return HTTP.delete(`/v1/communities/${communityId}/bars/${barId}`, {action: "delete bar"});
}

/**
 * @typedef {Object} CommunityMembersResult
 * @property {Array<CommunityMember>} members The members.
 */

/**
 * Gets the list of community members.
 * @see https://github.com/raisingthefloor/morphic-api-server/blob/master/Documentation/API.md#endpoint-community-member
 * @param {GUID} communityId The community ID.
 * @return {Promise<AxiosResponse<{CommunityMembersResult}>>} Response.
 */
export function getCommunityMembers(communityId) {
    return HTTP.get(`/v1/communities/${communityId}/members`, {action: "get members"});
}

/**
 * Add a new community member.
 * @see https://github.com/raisingthefloor/morphic-api-server/blob/master/Documentation/API.md#endpoint-community-member
 * @param {GUID} communityId The community ID.
 * @param {CommunityMember} member The new member.
 * @return {Promise<AxiosResponse<CommunityMember>>} Result
 */
export function addCommunityMember(communityId, member) {
    return HTTP.post(`/v1/communities/${communityId}/members`, member, {action: "add member"});
}

/**
 * Gets a community member's details.
 * @see https://github.com/raisingthefloor/morphic-api-server/blob/master/Documentation/API.md#endpoint-community-member
 * @param {GUID} communityId The community ID.
 * @param {GUID} memberId The member ID.
 * @return {Promise<AxiosResponse<CommunityMember>>} Response.
 */
export function getCommunityMember(communityId, memberId) {
    return HTTP.get(`/v1/communities/${communityId}/members/${memberId}`, {action: "get member"});
}

/**
 * Updates a community member's details.
 * @see https://github.com/raisingthefloor/morphic-api-server/blob/master/Documentation/API.md#endpoint-community-member
 * @param {GUID} communityId The community ID.
 * @param {GUID} memberId The member ID.
 * @param {CommunityMember} member The member details.
 * @return {Promise<AxiosResponse<Any>>} Response.
 */
export function updateCommunityMember(communityId, memberId, member) {
    return HTTP.put(`/v1/communities/${communityId}/members/${memberId}`, member, {action: "update member"});
}

/**
 * Removes a member from a community.
 * @see https://github.com/raisingthefloor/morphic-api-server/blob/master/Documentation/API.md#v1communitiescidmembersid
 * @param {GUID} communityId The community ID.
 * @param {GUID} memberId The member ID.
 * @return {Promise<AxiosResponse<Any>>} Response.
 */
export function deleteCommunityMember(communityId, memberId) {
    return HTTP.delete(`/v1/communities/${communityId}/members/${memberId}`, {action: "delete member"});
}

/**
 * Send a new invitation for a community member.
 * @see https://github.com/raisingthefloor/morphic-api-server/blob/master/Documentation/API.md#v1communitiesidinvitations
 * @param {GUID} communityId The community ID.
 * @param {GUID} memberId The member ID.
 * @param {String} email The member's email address, if not already added.
 * @return {Promise<AxiosResponse<Any>>} Response.
 */
export function inviteCommunityMember(communityId, memberId, email) {
    return HTTP.post(`/v1/communities/${communityId}/invitations`, { member_id: memberId, email: email }, {action: "invite member"});
}

/**
 * Performs some tweaks to the bar before it gets stored.
 * @param {BarDetails} bar The bar.
 * @return {BarDetails} The bar.
 */
function storeBar(bar) {
    const togo = JSON.parse(JSON.stringify(bar));
    togo.items.forEach(item => {
        item.is_primary = !!item.is_primary;
        if (item.kind === "application") {
            // For application items, remove the exe or default - only 1 is needed.
            if (item.configuration.default) {
                delete item.configuration.exe;
            } else {
                delete item.configuration.default;
            }
        }

        item.configuration._webapp = item.data;
        delete item.data;
    });

    return togo;
}
