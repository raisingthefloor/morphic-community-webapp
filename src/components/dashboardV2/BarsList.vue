<template>
  <div id="BarsList" class="itemList">
    <b-link :to="{ name: 'MorphicBar Editor', query: { barId: 'new' } }"
            class="addNewLink"
    >Add a new bar</b-link>
    <b-link v-for="(bar, index) in orderedBars" :key="bar.id"
            :to="getBarEditRoute(bar)"
            :ref="'bar' + index"
            :class="{
                  active: bar.id === activeBarId
              }"
    >
      {{ bar.name === "Default" ? "Default Bar" : bar.name }}
    </b-link>
  </div>
</template>

<style lang="scss" scoped>
</style>

<script>
import * as Bar from "@/utils/bar";

export default {
    name: "BarsList",
    props: {
        bars: Array,
        activeBarId: String,
        heading: String
    },
    methods: {
        getBarEditRoute: Bar.getBarEditRoute
    },
    computed: {
        orderedBars: function () {
            const alphabetical = this.bars.filter(b => b.is_shared);
            alphabetical.sort((a, b) => (a.name < b.name) ? 1 : ((a.name > b.name) ? -1 : 0));
            alphabetical.reverse();
            alphabetical.sort((a, b) => a.name === "Default" ? -1 : b.name === "Default" ? 1 : 0);
            return alphabetical;
        }
    }
};
</script>
