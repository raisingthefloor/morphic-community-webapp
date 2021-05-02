<!-- Small horizontal icon-only representation of a bar. -->
<template>
  <span class="smallBarPreview">
    {{bar.name}}

    <span class="barIcons">
      <template v-for="(item) in bar.items">
        <b-img v-if="item.configuration.image_url"
               :key="item.id"
               :src="getIconUrl(item.configuration.image_url)"
               :alt="item.configuration.label || ''"/>
      </template>
      <!--- hidden, here to make an empty list the same height as one with items  -->
      <b-img src="/img/logo-color.svg" alt="" class="placeholder" aria-hidden="true"/>
    </span>
  </span>
</template>

<style lang="scss">

.smallBarPreview {
  .barIcons {
    display: inline-block;
    margin-left: 1em;
    min-height: 2em;

    .placeholder {
      visibility: hidden;
    }

    & > * {
      margin-left: 0.2em;
      width: 32px;
      height: 32px;
    }
  }
}
</style>

<script>
export default {
    name: "BarSummary",
    props: {
        bar: {}
    }
};
</script>
