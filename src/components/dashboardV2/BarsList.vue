<template>
  <div id="BarsList" class="panelSection">
    <div>
      <b-button o="{ name: 'MorphicBar Editor', query: { barId: 'new' } }"
                variant="success"
                class="addNewLink"
                size="sm"
                v-t="'BarsList.new-bar_button'" />
    </div>
    <ul class="list-unstyled">
      <li v-for="(bar, index) in orderedBars" :key="bar.id"
          :class="{ active: bar.id === activeBarId }"
      >
        <b-link
                :to="getBarEditRoute(bar)"
                :ref="'bar' + index"
                class="barLink"
        >{{ bar.name === "Default" ? i18n.t('BarsList.default-bar') : bar.name }}
        </b-link>
      </li>
    </ul>
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
