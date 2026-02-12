<template>
  <div></div>
</template>

<script>
import store from "@/store";

export default {
    name: "Auth",
    data() {
        return {
        };
    },
    props: {
        authUserId: String,
        token: String
    },
    mounted() {

        store.dispatch("login", {
            userId: this.authUserId,
            token: this.token
        }).then(url => {
            location.href = url;
        });

    }
};
</script>
