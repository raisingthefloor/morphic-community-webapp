<template>
  <div>Loading...</div>
</template>

<script>
import { accountMixin } from "@/mixins/account";

export default {
    name: "LoggedIn",
    mixins: [accountMixin],
    components: {},
    data() {
        return {};
    },
    props: {
        messageId: String
    },
    async mounted() {

        if (this.isLoggedIn) {
            await this.loadBilling();
            sessionStorage.setItem("init", this.userId);
        }

        await this.$router.replace("/").catch(() => { });
    }
};
</script>
