<!-- An item in the account settings page -->
<template>
  <div class="accountItem" :id="componentId" :aria-labelledby="headingId">

    <div v-if="icon" class="itemIcon">
      <slot name="icon">
        <b-icon :icon="icon"/>
      </slot>
    </div>

    <div class="itemMain">

    <h2 class="itemHeading" :id="headingId">{{title}}</h2>

      <div class="itemLead"><slot name="lead" /></div>

      <div class="itemContent">
        <slot />
      </div>

    </div>

  </div>

</template>

<style lang="scss">
@import "~@/styles/bootstrap-util";

.accountItem {

  display: flex;
  flex-direction: row;

  $image-size: 3;

  .itemMain {
    flex-grow: 1;
  }

  .itemIcon {
    margin: 0 5px;
    width: #{$image-size * 16}px;
    height: #{$image-size * 16}px;

    .b-icon {
      font-size: #{$image-size}em;
    }
  }

  .itemHeading {
    position: relative;
    line-height: #{$image-size * 16}px;
    margin: 0;
  }

  .itemLead:not(:empty) {
    margin-bottom: 1em;
  }

  .itemContent > :not(ul), .itemContent > ul > li {
    &:not(:last-child) {
      margin-bottom: 0.5em;
    }

    &, .box {
      border-radius: 0.75em !important;
      padding: 0.5em;
    }

    &:not(.no-shade) {
      background-color: $gray-200;
    }

    .box {
      background-color: white;
    }

    .if-error {
      display: none;
    }

    &.error {
      background-color: #efc7cc;

      .if-error {
        display: unset;
      }
    }
  }
}
</style>

<script>

export default {
    name: "AccountSettingItem",
    props: {
        title: String,
        icon: String,
        id: String
    },
    data() {
        return {
            componentId: this.id || this.generateId("AccountSettingItem")
        };
    },
    computed: {
        headingId: function () {
            return `${this.componentId}_heading`;
        }
    },
    methods: {
    }
};
</script>

