<template>
  <div>
    <b-alert variant="success" :show="displayMessage">
        <h4>You have 6 days left of your free trial</h4>
      <span> {{ messageData }}</span>
    </b-alert>
    <BlockLoginRegister />
  </div>
</template>

<script>
import BlockLoginRegister from "@/components/BlockLoginRegister";
import { MESSAGES } from "@/utils/constants";

export default {
    name: "Home",
    components: {
        BlockLoginRegister
    },
    data() {
        return {
            displayMessage: false,
            messageData: MESSAGES.sessionTimedOut
        };
    },
    props: {
        messageId: String
    },
    mounted() {
        if (this.messageId) {
            this.displayMessage = true;
        }
    }
};
</script>
