<!-- A list of bars, either for a single member or all shared bars -->
<template>
  <div class="barsList">
    <div>
      <b-button variant="success"
                @click="$emit('newbar', member)"
                class="addNewLink"
                size="sm"
                v-if="showAddButton"
                :disabled="orderedBars.length > 0"
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
        >{{ bar.name === "Default" ? $t('BarsList.default-bar') : bar.name }}
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
        /** @type {Array<BarDetails>} */
        bars: Array,
        activeBarId: String,
        /** @type {CommunityMember} */
        member: Object
    },
    methods: {
        getBarEditRoute: Bar.getBarEditRoute,
        getBars: function () {
            const filter = this.member
                ? b => b.id === this.member.bar_id && !b.is_shared
                : b => b.is_shared;

            return this.bars.filter(filter).sort((a, b) => {
                return a.name.localeCompare(b.name);
            });
        }
    },
    computed: {
        /** @return {Array<BarDetails>} The bars to list */
        orderedBars() {
            if (this.member.isCurrent) {
                const bars = this.getBars();
                if (bars.length === 1) {
                    bars[0].name = "My MorphicBar";
                }
                return bars;
            }
            return this.getBars();
        },
        showAddButton() {
            return this.member && this.orderedBars.length === 0;
        }
    },
    data() {
        return {
        };
    }
};
</script>
