<template>
  <b-container>

    <div id="message" >
      <p class="lead" v-t="'NoSubscription.no-subscription-message'" />

      <p class="lead">
        <b-link :href="externalLinks.getMorphic" v-t="'NoSubscription.go-to-signup_link'" />
      </p>

      <p>
        (<span v-t="'NoSubscription.morphic-plus-is-free'" />&nbsp;
        <b-link :to="{name: 'EarlyReleaseProgram'}" v-t="'NoSubscription.morphic-early-release-program'" />)
      </p>

    </div>
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

export default {
    name: "NoSubscription",

    data() {
        return {
        };
    },
    mounted() {
        if (this.hasAccount) {
            this.$router.push("/");
        }
    },
    methods: {
    }
};
</script>
