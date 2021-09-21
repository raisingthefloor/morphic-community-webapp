<template>
  <TwoColumnDialog
          id="ChangePasswordDialog"
          dialog-class="changePasswordDialog"
          ref="ChangePasswordDialog"

          title="Change Password"
          size="md"

          ok-title="Change Password"
          cancel-title="Cancel"

          @ok="$event.promise = $refs.ChangePassword.onSubmit(true)"

          v-bind="$attrs"

          :v="$v"
  >
    <template #form>
      <ChangePassword ref="ChangePassword" stay-on-page no-buttons/>
    </template>

  </TwoColumnDialog>
</template>

<style lang="scss">

#ChangePasswordDialog {
  .dialog-info {
    display: none;
  }
}

</style>

<script>

import TwoColumnDialog from "@/components/dialogs/TwoColumnDialog";
import ChangePassword from "@/components/ChangePassword";


export default {
    name: "ChangePasswordDialog",
    components: {ChangePassword, TwoColumnDialog},
    mixins: [],
    data() {
        return {
        };
    },
    mounted() {
    },
    beforeDestroy() {
    },
    methods: {

    }
};
</script>
