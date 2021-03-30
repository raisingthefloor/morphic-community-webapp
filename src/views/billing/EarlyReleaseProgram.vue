<template>
  <b-container>

    <div id="message">
      <p class="lead" v-t="'EarlyReleaseProgram.heading'" />
      <p v-t="'EarlyReleaseProgram.intro'" />


      <b-link @click="start" v-t="'EarlyReleaseProgram.join_link'" />
    </div>
    <TextInputDialog v-if="isLoggedIn"
                     id="accountNameDialog"
                     :title="$t('EarlyReleaseProgram.create-dialog-title')"
                     :prompt="$t('EarlyReleaseProgram.create-dialog-prompt')"
                     :lower-text="$t('EarlyReleaseProgram.create-dialog-text-hint')"
                     :ok-title="$t('EarlyReleaseProgram.create-dialog-ok_button')"
                     v-model="accountName"
                     centered
                     @ok="accountNameDialogOK"
    />

  </b-container>
</template>

<style lang="scss" scoped>
#message {
  border: 2px solid #999;
  margin: 10em auto;
  text-align: center;
  width: fit-content;
  padding: 3em;
}
</style>

<script>


import TextInputDialog from "@/components/dashboardV2/TextInputDialog";
export default {
    name: "EarlyReleaseProgram",
    components: {TextInputDialog},
    data() {
        return {
            accountName: ""
        };
    },
    mounted() {
        if (this.$route.name === "EarlyReleaseProgram.Join") {
            this.start();
        }
    },
    methods: {
        start() {
            if (this.isLoggedIn) {
                if (this.hasAccount) {
                    this.showMessage(this.$t("EarlyReleaseProgram.already-joined"));
                    this.$router.push("/");
                } else {
                    this.$bvModal.show("accountNameDialog");
                }
            } else {
                // Route points to this page, but enforces login.
                this.$router.push({name: "EarlyReleaseProgram.Join"});
            }
        },

        /**
         * Dialog submitted.
         * @param {TextInputOKEvent} e Event
         */
        accountNameDialogOK(e) {
            e.promise = this.createAccount(e.newValue);
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

            this.$router.push("/");

        }
    }
};
</script>
