<template>
  <PreviewItem v-if="showButton"
               :item="barItem"
               @click="$emit('click', {data: barItem})"
               @mouseover="$emit('mouseover', {data: barItem})"
               @mouseleave="$emit('mouseleave', {data: barItem})"
  />
  <b-button v-else
          variant="link"
          class="barItemLink"
          :style="{ color: barItem.configuration.color }"
          @click="$emit('click', {data: barItem})"
          @mouseover="$emit('mouseover', {data: barItem})"
          @mouseleave="$emit('mouseleave', {data: barItem})"
    >{{
    barItem.configuration.label
  }}</b-button>


</template>

<style lang="scss">
a.barItemLink, button.barItemLink {
  font-weight: bold;
}

</style>

<script>

import PreviewItem from "@/components/dashboard/PreviewItem";
import { colors, icons } from "@/utils/constants";
import * as Bar from "@/utils/bar";

export default {
    name: "BarItemLink",
    components: {PreviewItem},
    props: {
        /** @type {BarItem} */
        barItem: Object,
        noImage: Boolean,
        showButton: Boolean
    },
    data() {
        return {
            colors: colors,
            icons: icons
        };
    },
    computed: {
        /** @return {BarDetails} The bar that the item belongs to. */
        barDetails: function () {
            return Bar.getItemBar(this.barItem);
        }
    }
};
</script>
