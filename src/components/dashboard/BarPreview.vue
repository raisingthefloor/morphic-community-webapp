<template>
  <div class="barPreview">
    <div v-if="primaryItems && primaryItems.length > 0">
      <div v-for="item in primaryItems" :key="item.configuration.label" class="previewHolder">
        <PreviewItem v-if="item.is_primary" :item="item" />
      </div>
    </div>
    <div v-else>
      <p class="text-center mt-5 mb-5">
        This bar has no buttons at the moment, click on the <b-link :to="{ name: 'MorphicBar Editor', query: { barId: bar.id } }"><b>Customize</b></b-link> button to add some.
      </p>
    </div>
    <div class="logoHolder text-center">
      <b-img src="/img/logo-color.svg" alt="Logo" />
    </div>
  </div>
</template>

<style lang="scss">
  .barPreview {
    margin-left: auto;
    margin-right: auto;
    width: 120px;
    display: flex;
    flex-direction: column;
    // flex-grow: 1;

    .previewHolder {
      width: 120px;
      padding: 10px;
      padding-top: 5px;
      padding-bottom: 5px;
      position: relative;
    }
  }
</style>

<script>
import PreviewItem from "@/components/dashboard/PreviewItem";
import { getCommunityBar } from "@/services/communityService";

export default {
    name: "BarPreview",
    data() {
        return {
            bar: {}
        };
    },
    props: {
        barData: Object,
        barId: String
    },
    components: {
        PreviewItem
    },
    computed: {
        primaryItems: function () {
            const data = [];
            if (this.bar && this.bar.items && this.bar.items.length > 0) {
                for (let i = 0; i < this.bar.items.length; i++) {
                    if (this.bar.items[i].is_primary === true) {
                        data.push(this.bar.items[i]);
                    }
                }
            }
            return data;
        }
    },
    mounted() {
        if (this.barId) {
            getCommunityBar(this.communityId, this.barId)
                .then(resp => {
                    this.bar = resp.data;
                })
                .catch(err => {
                    console.error(err);
                });
        } else {
            // the data comes in the bar prop
            this.bar = this.barData;
        }
    }
};
</script>
