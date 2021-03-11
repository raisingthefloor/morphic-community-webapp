import { HTTP } from "@/services/index";
import { CONFIG } from "@/config/config";

/**
 * @typedef {String} GUID
 */

/**
 * Get the list of active billing plans for Morphic
 * @see https://github.com/raisingthefloor/morphic-api-server/blob/master/Documentation/API.md#v1planscommunity
 * @return {Promise<AxiosResponse<BillingPlans>>} Response
 */
export function getCommunityPlans() {
    return HTTP.get("/v1/plans/community");
}

/**
 * Get the billing information for a community.
 * @see https://github.com/raisingthefloor/morphic-api-server/blob/master/Documentation/API.md#v1communitiesidbilling
 * @param {GUID} communityId The community ID.
 * @return {Promise<AxiosResponse<BillingInfo>>} Response
 */
export function getBillingInfo(communityId) {
    return HTTP.get(`/v1/communities/${communityId}/billing`).then(res => {
        if (CONFIG.DISABLE_TRIAL) {
            delete res.data.trial_end_days;
        }
    });
}

/**
 * Update the billing information for a community.
 * @see https://github.com/raisingthefloor/morphic-api-server/blob/master/Documentation/API.md#v1communitiesidbilling
 * @param {GUID} communityId The community ID.
 * @param {GUID} planId The community plan.
 * @param {GUID} contactMemberId The member ID who is the billing contact.
 * @return {Promise<AxiosResponse<Any>>} Response
 */
export function updateBillingInfo(communityId, planId, contactMemberId) {
    return HTTP.put(`/v1/communities/${communityId}/billing`, {
        plan_id: planId,
        contact_member_id: contactMemberId
    });
}

/**
 * Update the billing card for a community.
 * @see https://github.com/raisingthefloor/morphic-api-server/blob/master/Documentation/API.md#v1communitiesidbilling
 * @param {GUID} communityId The community ID.
 * @param {String} token The stripe card token id.
 * @return {Promise<AxiosResponse<BillingCard>>} Response
 */
export function updateBillingCard(communityId, token) {
    return HTTP.post(`/v1/communities/${communityId}/billing/card`, {
        token: token
    });
}

/**
 * Cancel the account at the end of the billing period
 * @see https://github.com/raisingthefloor/morphic-api-server/blob/master/Documentation/API.md#v1communitiesidbilling
 * @param {GUID} communityId The community ID.
 * @return {Promise<AxiosResponse<BillingInfo>>} Response
 */
export function cancelBillingCard(communityId) {
    return HTTP.post(`/v1/communities/${communityId}/billing/cancel`, {});
}
