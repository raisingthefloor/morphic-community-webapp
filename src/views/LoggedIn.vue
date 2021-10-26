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
        const timeout = setTimeout(this.proceed, 3000);
        try {
            if (this.isLoggedIn) {
                // pre-load the billing details, so the router knows about the account status.
                await this.loadBilling(true);
                sessionStorage.setItem("init", this.userId);
            }
        } finally {
            clearTimeout(timeout);
            await this.proceed();
        }
    },

    methods: {
        proceed: function () {
            return this.$router.replace("/").catch(() => {});
        }
    }

};
</script>
