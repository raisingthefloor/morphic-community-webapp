<template>
  <b-container>

    <div id="message">
      <p class="lead" v-t="'FreeMorphicPlus.heading'" />
      <p v-t="'FreeMorphicPlus.intro'" />


      <b-link @click="start" v-t="'FreeMorphicPlus.join_link'" />
    </div>
    <TextInputDialog v-if="isLoggedIn"
                     id="accountNameDialog"
                     :title="$t('FreeMorphicPlus.create-dialog-title')"
                     :prompt="$t('FreeMorphicPlus.create-dialog-prompt')"
                     :description="$t('FreeMorphicPlus.create-dialog-text-hint')"
                     :ok-title="$t('FreeMorphicPlus.create-dialog-ok_button')"
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


import TextInputDialog from "@/components/dialogs/TextInputDialog";
export default {
    name: "FreeMorphicPlus",
    components: {TextInputDialog},
    data() {
        return {
            accountName: ""
        };
    },
    mounted() {
        if (this.$route.name === "FreeMorphicPlus.Join") {
            this.start();
        }
    },
    methods: {
        start() {
            if (this.isLoggedIn) {
                if (this.hasAccount) {
                    this.showMessage(this.$t("FreeMorphicPlus.already-joined"));
                    this.$router.push("/");
                } else {
                    this.$bvModal.show("accountNameDialog");
                }
            } else {
                // Route points to this page, but enforces login.
                this.$router.push({name: "FreeMorphicPlus.Join"});
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
                this.showMessage(this.$t("FreeMorphicPlus.already-joined"));
            } else {
                await this.$store.dispatch("newCommunity", accountName);
                this.showMessage(this.$t("FreeMorphicPlus.account-created"));
            }

            this.$router.push("/#/register");

        }
    }
};
</script>
