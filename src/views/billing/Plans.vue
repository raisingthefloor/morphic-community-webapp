<template>
  <div>

    <b-container>
      <ul v-if="billingInfo && community" class="list-unstyled">
        <li>Group: {{community.name}}</li>
        <li>Current members: {{community.member_count}}</li>
        <li v-if="billingInfo.trial_end_days < 0"
            class="text-danger">
          <strong>Your trial ended {{ -billingInfo.trial_end_days }} days ago.</strong>
        </li>
        <li v-else-if="billingInfo.trial_end_days > 0"
            class="text-danger">
          Your trial ends in {{ billingInfo.trial_end_days }} days.
        </li>
        <li v-else-if="billingInfo.trial_end_days === 0"
            class="text-danger">
          <strong>Your trial will end today.</strong>
        </li>
      </ul>

    <h1>Pick a subscription</h1>

      <PlanPicker v-if="billingInfo && community" :billing-info="billingInfo" :community="community" />

      <div>
        <p class="lead">Not sure you want to stay with Morphic?</p>
        <p>
          If you no longer want to manage your group, you can close it. Once the group is closed, all of
          your group members will lose there personalizations. Each person will see the basic Morphic Bar.
        </p>
          <b-button variant="danger">Close your group</b-button>
      </div>
    </b-container>

  </div>
</template>

<script>

import * as communityService from "@/services/communityService";
import * as billingService from "@/services/billingService";
import PlanPicker from "@/components/PlanPicker";

export default {
    components: {PlanPicker},
    data() {
        return {
            /** @type {Community} */
            community: null,
            /** @type {BillingInfo} */
            billingInfo: null
        };
    },
    mounted() {
        this.loadCommunity();
        this.loadBilling();
    },
    methods: {
        /**
         * Loads the community details.
         * @return {Promise} Resolves when complete.
         */
        loadCommunity: function () {
            return communityService.getCommunity(this.communityId).then((community) => {
                this.community = community.data;
            });
        },

        /**
         * Loads the community plan and billing details.
         * @return {Promise} Resolves when complete.
         */
        loadBilling: function () {
            return billingService.getBillingInfo(this.communityId).then((r) => {
                this.billingInfo = r.data;
            });
        }
    }
};
</script>
