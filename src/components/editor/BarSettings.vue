<template>
  <b-card :no-body="isDialog" class="dialogCard barSettings">
    <b-card-title>
      <b-icon-gear-fill/>
      {{ barDetails.name }}
    </b-card-title>

    <b-button variant="link" @click="$emit('rename')" v-t="'BarSettings.rename_button'" />

    <div class="actions">
      <b-button variant="invert-danger" @click="deleteBar()" v-t="'BarSettings.delete_button'" />
    </div>


  </b-card>
</template>

<style lang="scss">
.barSettings .actions {
  margin-top: 1em;
}
</style>

<script>

import { membersMixin } from "@/mixins/members.js";

export default {

    name: "BarSettings",
    mixins: [membersMixin],
    props: {
        /** @type {BarDetails} */
        barDetails: Object,
        /** @type {CommunityMember} A member that owns this bar */
        member: Object,
        // true if this component is the body of a dialog
        isDialog: Boolean
    },
    computed: {
    },
    methods: {
        deleteBar: async function () {
            await this.memberRemoveBar(this.barDetails, this.member, true);
            this.$router.push("/");
        }
    }
};
</script>
