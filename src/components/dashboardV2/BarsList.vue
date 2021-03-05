<template>
  <Div id="BarsList">
    <ul v-if="orderedBars.length > 0" class="list-unstyled">
      <li v-for="(bar, index) in orderedBars" :key="bar.id" :class="{ active: bar.id === activeBarId }">
        <b-link v-if="bar.is_shared" :to="getBarEditRoute(bar)" :ref="'bar' + index" class="stretched-link">
          {{ bar.name === "Default" ? "Default Bar" : bar.name }}
        </b-link>
      </li>
    </ul>
    <p v-else>
      <i>No bars in the community</i><br>
      Click on the plus button just above to add your first one
    </p>
  </div>
</template>

<style lang="scss">
  #BarsList {
    ul {
      margin: 0 -1rem 1rem -1rem;
      li {
        position: relative;
        padding: 0 1rem;
        &.active {
          padding: .25rem 1rem;
          background: green;
          a {
            color: white;
          }
        }
        a {
          display: inline;
          padding: 0 0.75rem 0 0;
        }
      }
    }
  }
</style>

<script>
import * as Bar from "@/utils/bar";

export default {
    name: "BarsList",
    props: {
        bars: Array,
        activeBarId: String
    },
    methods: {
        getBarEditRoute: Bar.getBarEditRoute
    },
    computed: {
        orderedBars: function () {
            const alphabetical = this.bars;
            alphabetical.sort((a, b) => (a.name < b.name) ? 1 : ((a.name > b.name) ? -1 : 0));
            alphabetical.reverse();
            alphabetical.sort((a, b) => a.name === "Default" ? -1 : b.name === "Default" ? 1 : 0);
            return alphabetical;
        }
    }
};
</script>
