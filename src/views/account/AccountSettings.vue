<template>
  <div class="accountSettings">

    <div class="m-3">
      <b-link v-if="$store.getters.hasAccount && $store.getters.role === 'manager'" :to="{name:'Dashboard'}" >
      <b-icon icon="arrow-return-right" rotate="180"/>{{ $t('AccountSettings.back_link') }}</b-link>
    </div>

    <AccountSettingItem icon="person-circle" :title="$t('AccountSettings.sign-in.title')">
      <template #lead>{{ $t('AccountSettings.sign-in.lead') }}</template>

      <ul class="signInMethods list-unstyled">

        <li v-if="userDetails && userDetails.email"
            :class="{error:!userDetails.email_verified}"
            aria-labelledby="SignIn-email">

          <div class="d-flex">
            <div class="if-error" style="font-size: 1.5em; width: 1.8em">
              <b-iconstack style="vertical-align: top">
                <b-icon icon="circle-fill" variant="white" />
                <b-icon icon="exclamation-circle-fill" variant="danger" />
              </b-iconstack>
            </div>
            <dl role="presentation" class="mb-0">
              <dt id="SignIn-email" v-t="'AccountSettings.sign-in.email+password'" />
              <dd>
                {{ userDetails.email }}
                <span v-if="userDetails.email_verified" v-t="'AccountSettings.sign-in.email-confirmed'" />
              </dd>
            </dl>
          </div>

          <div v-if="!userDetails.email_verified" class="mb-3" v-t="'AccountSettings.sign-in.email-not-confirmed'" />

          <b-button v-if="!userDetails.email_verified"
                    variant="invert-dark"
                    @click="resendEmailConfirmation()"
                    class="mr-3" v-t="'AccountSettings.sign-in.resend-confirmation_button'" />

          <b-button variant="invert-dark" v-b-modal="'ChangePasswordDialog'" v-t="'AccountSettings.sign-in.change-password_button'" />

          <ChangePasswordDialog />

        </li>
      </ul>
    </AccountSettingItem>


    <AccountSettingItem v-if="isManager || !hasAccount" icon="people-fill" :title="$t('AccountSettings.account.title')">
      <div v-if="hasAccount">
        <div class="lead font-weight-bold">{{ community.name }}</div>

        <b-button variant="invert-dark" v-b-modal="'AccountNameDialog'" v-t="'AccountSettings.account.rename_button'" />

        <div class="mt-3 mb-2">{{ $t('AccountSettings.account.subscription-type', {plan_name:plan.name}) }}</div>
        <div class="d-flex flex-wrap">
          <span class="pr-1" v-t="'AccountSettings.account.number-of-people_label'" />
          <b>{{ $t('AccountSettings.account.number-of-people', community) }}</b>
        </div>


        <b-button variant="invert-dark" :to="{name:'BillingDetails'}" v-t="'AccountSettings.account.billing_button'" />

        <TextInputDialog id="AccountNameDialog"
                         :title="$t('AccountSettings.account.rename-dialog_title')"
                         :prompt="$t('AccountSettings.account.rename-dialog_prompt')"
                         :value="community.name"
                         @ok="$event.promise = renameAccount($event.newValue)"
        />
      </div>
      <div v-else>
        <p class="lead" v-t="'AccountSettings.account.basic_lead'" />

        <div id="basic-features" v-t="'AccountSettings.account.basic_list-label'" />
        <ul aria-labelledby="basic-features">
          <li v-for="(item, index) in $t('AccountSettings.account.basic_list')" :key="index">{{item}}</li>
        </ul>

        <div class="box">
          <b-container fluid>
            <b-row>
              <b-col cols="*">
                <img src="/img/logo-color.svg" width="70" class="m-2" alt=""/>
              </b-col>
              <b-col>
                <p class="lead" v-t="'AccountSettings.account.upgrade_lead'" />
                <div id="plus-features" v-t="'AccountSettings.account.upgrade-list'" />
                <ul aria-labelledby="plus-features">
                  <li v-for="(item, index) in $t('AccountSettings.account.update-list_items')" :key="index">{{item}}</li>
                </ul>

                <b-button v-b-modal="'AccountNameDialog'" variant="morphic-green" v-t="'AccountSettings.account.signup_button'" />

                <div v-if="specialCoupon" class="font-weight-bold text-morphic-green m-2">
                  {{specialCoupon.notice}}
                </div>

                <TextInputDialog v-if="isLoggedIn"
                                 id="AccountNameDialog"
                                 :title="$t('EarlyReleaseProgram.create-dialog-title')"
                                 :prompt="$t('EarlyReleaseProgram.create-dialog-prompt')"
                                 :description="$t('EarlyReleaseProgram.create-dialog-text-hint')"
                                 :ok-title="$t('EarlyReleaseProgram.create-dialog-ok_button')"
                                 centered
                                 @ok="$event.promise = createAccount($event.newValue)"
                />

              </b-col>
            </b-row>
          </b-container>

        </div>

      </div>

    </AccountSettingItem>

    <AccountSettingItem v-if="hasAccount" icon="envelope-open" :title="$t('AccountSettings.bars.title')">
      <template #lead>
        {{ $t('AccountSettings.bars.lead') }}
<!--        {{ $t('AccountSettings.bars.lead_remove') }}-->
      </template>

      <ul class="list-unstyled">
        <!-- TODO: unable to get invitation details from the API server -->
        <li v-for="(memberCommunity) in memberCommunities" :key="memberCommunity.id" :aria-label="memberCommunity.name">
          <span :id="`${memberCommunity.id}_label`" v-html="$t('AccountSettings.bars.list-item', {name:memberCommunity.name})"/>

          <ul :aria-labelledby="`${memberCommunity.id}_label`" class="mb-3">
            <li v-for="bar in (memberBars[memberCommunity.id])" :key="bar.id">
              {{bar.name}}
            </li>
          </ul>
<!--          <b-button variant="invert-dark">Remove</b-button>-->
        </li>
      </ul>
    </AccountSettingItem>

  <!-- TODO: Account deletion on the API server
    <AccountSettingItem icon="gear-fill" title="Other actions for my personal account">
      <h3><b-icon icon="trash-fill" scale="1.2"/> Deleting my personal Morphic account</h3>
      <p>
        If you no longer want to use Morphic to personalize computers you use, you can delete your account. Deleting
        your account will erase all data and information associated with your account.
      </p>
      <p v-if="isManager">
        Since you have a Morphic Plus subscription, deleting your personal account will also delete all the MorphicBars
        that you manage for yourself and others.
      </p>
      <p v-else>
        Because you have accepted one or more invitations for MorphicBars, all MorphicBars and buttons that others have
        created specifically for you will also be deleted. This will remove all of the bars other people have created
        for you from their accounts. They will not be able to undo this.
      </p>

      <b-button variant="invert-danger" @click="deleteAccount()">Delete my account</b-button>
    </AccountSettingItem>
  -->
  </div>
</template>

<style lang="scss">
@import "~@/styles/bootstrap-util";

.accountSettings {
  width: 40em;

  .accountItem:not(:last-child) {
    margin-bottom: 1em;
  }

  h2 {
    font-size: 1.4em;
  }
  h3 {
    font-size: 1.2em;
  }

  .lead {
    font-weight: bold;
  }

  .btn {
    margin-top: 0.5em;
  }
  .hasCoupon {
    //color:  $morphic-green-color;
  }
}


</style>

<script>

import * as communityService from "@/services/communityService";
import * as userService from "@/services/userService";
import AccountSettingItem from "@/components/AccountSettingItem";
import ChangePasswordDialog from "@/components/dialogs/ChangePasswordDialog";
import TextInputDialog from "@/components/dialogs/TextInputDialog";
import { accountMixin } from "@/mixins/account";

export default {
    name: "AccountSettings",
    components: {TextInputDialog, ChangePasswordDialog, AccountSettingItem},
    mixins: [accountMixin],
    data() {
        return {
            /** @type {Boolean} */
            loaded: false
        };
    },
    props: {
    },
    async mounted() {
        this.loaded = false;
        await this.accountLoadAll();
        this.loaded = true;
        this.$nextTick(() => this.$forceUpdate());
    },
    computed: {
        /**
         * Communities the user is a manager of.
         * @return {Array<Community>} The communities.
         */
        managerCommunities: function () {
            return this.allCommunities.filter(c => c.role === "manager");
        },

        /**
         * Communities the user is a non-manager of.
         * @return {Array<Community>} The communities.
         */
        memberCommunities: function () {
            return this.allCommunities.filter(c => c.role === "member");
        },
        specialCoupon: function () {
            return Object.values(this.allPlans).find(plan => plan.specialCoupon)?.specialCoupon;
        }
    },
    methods: {
        /**
         * Renames the account, and refreshes the community data.
         * @param {String} newName The new name of the account.
         * @return {Promise} Resolves when complete.
         */
        async renameAccount(newName) {
            await communityService.updateCommunity(this.communityId, newName, this.community.default_bar_id);
            this.showMessage("Account name updated");
            await this.loadCommunity();
            return true;
        },
        async deleteAccount() {
            const confirmed = await this.showConfirm("Are you sure you want to delete your account?",
                ["Delete my account", "No"],
                "Delete Account",
                {dangerous: true});

            if (confirmed) {
                this.$bvModal.msgBoxOk("Not implemented", {title: "Delete Account"});
            }
        },

        resendEmailConfirmation: async function () {
            await userService.resendEmailConfirmation(this.userId);
            this.showMessage("Confirmation email sent");
        },

        /**
         * Create the account
         * @param {String} accountName Name of the new account.
         * @return {Promise} Resolves when complete.
         */
        async createAccount(accountName) {
            await this.$store.dispatch("userCommunities", this.userId).catch(() => undefined);

            if (this.hasAccount) {
                this.showMessage(this.$t("EarlyReleaseProgram.already-joined"));
            } else {
                await this.$store.dispatch("newCommunity", accountName);
                this.showMessage(this.$t("EarlyReleaseProgram.account-created"));
            }

            this.$router.push({name: "BillingDetails"});

        }

    }
};
</script>
