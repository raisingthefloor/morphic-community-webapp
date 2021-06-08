<template>
<!--  <div style="height: 80vh; display: flex; justify-content: center; align-content: center">-->
<!--    <BlockLoginRegister />-->
      <b-container>
          <b-row>
              <b-col>
                  <b-alert variant="success" :show="displayMessage">
                      <span> {{ messageData }}</span>
                  </b-alert>
              </b-col>
          </b-row>
          <b-row>
              <b-col md="6" offset-md="3" align-v="center" style="margin-top: 50px">
                  <UserLogin />
              </b-col>
          </b-row>
      </b-container>
<!--  </div>-->
</template>

<script>
// import BlockLoginRegister from "@/components/BlockLoginRegister";
import { MESSAGES } from "@/utils/constants";
import UserLogin from "@/components/UserLogin";

export default {
    name: "Home",
    components: {
        // BlockLoginRegister
        UserLogin
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
