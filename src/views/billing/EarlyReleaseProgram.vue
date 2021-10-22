<template>
  <b-container>

    <div id="message">
      <p class="lead" v-t="'EarlyReleaseProgram.heading'" />
      <p v-t="'EarlyReleaseProgram.intro'" />


      <ul class="list-unstyled">
        <li>
          <b-link v-if="isLoggedIn" to="/" v-t="'EarlyReleaseProgram.sign-in_link'" />
          <b-link v-else to="/" v-t="'EarlyReleaseProgram.dashboard_link'" />
        </li>
        <li>
          <b-link :href="externalLinks.morphicHome" v-t="'EarlyReleaseProgram.home_link'" />
        </li>
      </ul>
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
    name: "EarlyReleaseProgram",
    components: {},
    data() {
        return {
        };
    },
    mounted() {
    },
    methods: {
    }
};
</script>
