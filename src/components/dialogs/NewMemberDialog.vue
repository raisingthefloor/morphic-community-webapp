<!-- A dialog to add a new member -->
<template>
  <b-modal
          :id="dialogId"
          modal-class="newMemberDialog"
          size="xl"
          :title="$t('NewMember.title')"
          v-bind="dialogAttrs"
          hide-footer
          @ok="onOK($event).catch(handleServerError)"
          @show="onShow"
  >
    <b-container class="p-0">

      <b-row>

        <b-col v-if="!isMobile" lg="6" cols="12" order="2" class="bg-silver rounded-lg pt-3 pl-3 pr-3 mb-3 mr-3">
          <h6 class="logoHeading"><img src="/img/logo-color.svg" class="logo" alt="" aria-hidden="true"/>{{ $t('NewMemberDialog.steps_heading') }}</h6>

          <p id="ManagerSteps" v-t="'NewMemberDialog.manager-steps'" />

          <ol aria-labelledby="ManagerSteps">
            <li v-for="(item, index) in $t('NewMemberDialog.manager-steps_list')"
                :key="index"
            >{{ item }}</li>
          </ol>

          <p v-t="'NewMemberDialog.steps-info'" />

          <p id="MemberSteps" v-t="'NewMemberDialog.member-steps'" />
          <ol aria-labelledby="MemberSteps">
            <li v-for="(item, index) in $t('NewMemberDialog.member-steps_list')"
                :key="index"
            >{{ item }}</li>
          </ol>

          <p v-t="'NewMemberDialog.member-steps_info'" />
        </b-col>

        <b-col class="pt-2 mb-3 mr-4 d-flex flex-column">
          <p v-t="'NewMemberDialog.lead'" />
          <p v-if="billingPlan && community">
            <span v-if="community.member_limit && community.member_limit > 0 && community.member_limit < 0xffff"
              >{{ $t('NewMemberDialog.member-plan-limit', {limit: community.member_limit, plan:billingPlan.sizeName}) }}</span>
          </p>

          <ValidatedInput id="name"
                          class="pt-4"
                          :label="$t('NewMemberDialog.name_label')"
                          :validation="$v.newMember.name"
                          :errors="{ unique: $t('NewMemberDialog.name-duplicate_error') }"
          />

          <b-alert v-if="errorAlert && errorMessage" variant="danger" show>
            <p v-if="errorMessageTitle" class="font-weight-bold">{{errorMessageTitle}}</p>
            {{errorMessage}}
          </b-alert>

          <div class="flex-grow-1" />

          <div class="buttons d-flex justify-content-around">
            <b-button class="pl-5 pr-5 pt-2 pb-2" variant="invert-dark" @click="hideDialog" v-t="'NewMemberDialog.cancel_button'" />
            <b-button class="pl-5 pr-5 pt-2 pb-2" variant="morphic-green" @click="onOK($event, newMember)" v-t="'NewMemberDialog.add_button'" />
          </div>

        </b-col>

      </b-row>

    </b-container>
  </b-modal>

</template>

<style lang="scss">
@import "~@/styles/_variables.scss";

.newMemberDialog {
  .modal-header {
    border-bottom: none;
    padding-bottom: 0;
  }

  h5, h6 {
    color: $morphic-blue-color;
    font-size: 1.5em;
  }

  .logoHeading {
    img {
      width: 1.75em;
      height: 1.75em;
      margin-right: 0.2em;
    }
  }
  .rounded-lg {
    border-radius: 1em !important;
  }

}

</style>

<script>

import {dialogMixin} from "@/mixins/dialog.js";
import ValidatedInput from "@/components/ValidatedInput";
import { required } from "vuelidate/lib/validators";
import { membersMixin } from "@/mixins/members";
import { getCurrentPlan } from "@/utils/billing";

export default {
    name: "NewMemberDialog",
    components: {ValidatedInput},
    mixins: [dialogMixin, membersMixin],
    props: {
        /** @type {Array<BarDetails>} */
        bars: Array,
        /** @type {Array<CommunityMember>} */
        members: Array,
        /** @type {Community} */
        community: null,
        id: String
    },
    data: function () {
        return {
            loaded: false,
            dialogId: this.id || "NewMemberDialog",
            newMember: {
                name: ""
            },
            /** @type {BillingPlan} */
            billingPlan: null,
            errorAlert: false,
            errorMessage: null,
            errorMessageTitle: null
        };
    },
    validations: {
        newMember: {
            name: {
                required: required,
                unique: function (value) {
                    return !this.memberCheckDuplicate(value);
                }
            }
        }
    },
    computed: {},
    mounted() {
    },

    methods: {
        onShow: function () {

            this.errorAlert = false;
            this.newMember = { name: "" };

            getCurrentPlan(this.communityId).then(async plan => {
                await this.asyncTimer(1000);
                this.billingPlan = plan;
            });

            this.$v.$reset();
        }
    }
};
</script>
