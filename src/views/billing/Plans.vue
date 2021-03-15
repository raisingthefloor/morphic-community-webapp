<template>
  <div>

    <b-container>
      <ul v-if="billingInfo && community" class="list-unstyled">
        <li v-t>{{ $t('Plans.group_bullet', community) }}</li>
        <li v-t>{{ $t('Plans.member-count_bullet', community) }}</li>
        <li v-if="billingInfo.trial_end_days <= 0"
            class="text-danger">
          <strong>{{ $tc('Plans.trial-ended', -billingInfo.trial_end_days) }}</strong>
        </li>
        <li v-else-if="billingInfo.trial_end_days >= 0"
            class="text-danger">
          {{ $tc('Plans.trial-ending', billingInfo.trial_end_days) }}

        </li>
      </ul>

    <h1 v-t="'Plans.pick-subscription_heading'" />

      <PlanPicker v-if="billingInfo && community" :billing-info="billingInfo" :community="community" />

      <div>
        <p class="lead" v-t="'Plans.leave_heading'" />
        <p v-t="'Plans.leave_text'" />
          <b-button variant="danger" v-t="'Plans.close_button'" />
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
                this.billingInfo.trial_end_days = 0;
            });
        }
    }
};
</script>
