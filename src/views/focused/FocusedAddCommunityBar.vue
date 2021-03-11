<template>
  <div class="FocuedAddCommunityBar">
    <h1>Select starting point for new group bar</h1>

    <ul class="barsList">
        <li class="barEntry" >
            <div class="barDescription">
                <h3>Start with empty bar</h3>
                <span>If you want to start with an empty morphic bar, choose this option</span><br />
                <b-button variant="success" @click="selectedBar()">Start customizing an empty bar</b-button>
            </div>
            <div class="buttonsListing"></div>
        </li>
        <li class="barEntry" v-for="(bar, index) in predefinedBarsList" :key="index">
            <div class="barDescription">
                <h3>{{bar.name}}</h3>
                <span>{{bar.desc}}</span><br />
                <b-button variant="success" @click="selectedBar(bar)">Start customizing this bar</b-button>
            </div>
            <ul class="buttonsListing">
                <h4>Buttons on bar</h4>
                <li v-for="(button, bIndex) in bar.items" :key="bIndex">
                    <span :style="'color: ' + (button.configuration.color || colors.blue)">
                        <span class="icon">
                            <b-img v-if="button.configuration.image_url" :src="getIconUrl(button.configuration.image_url)" />
                            <b-icon v-else icon="bootstrap"></b-icon>
                        </span>
                        {{ button.configuration.label }}
                    </span>
                </li>
            </ul>
        </li>
    </ul>

    <b-button variant="warning" @click="cancelClicked">cancel</b-button>

  </div>
</template>

<style lang="scss">
.barsList {
    li.barEntry {
        display: flex;
        border: 1px solid lightgray;
        border-radius: 10px;
        padding: 18px;
        margin-bottom: 20px;
        background-color: rgba(0,0,0,0.03);

        button {
            margin-top: 12px;
        }

        .buttonsListing {
            .icon, .icon img {
                height: 20px;
                width: 20px;
                display: inline-block;
            }
        }
    }
}
</style>
<script>

import { createCommunityBar } from "@/services/communityService";
import { colors, icons } from "@/utils/constants";
import { predefinedBars } from "@/utils/predefined";

export default {
    name: "FocusedAddCommunityBar",
    components: {
    },
    methods: {
        selectedBar: function (bar) {
            const barToSave = {
                is_shared: true,
                name: "My Group Bar"
            };
            barToSave.items = bar ? bar.items : [];

            createCommunityBar(this.communityId, barToSave).then(() => {
                this.$router.push("/focused/home");
            });
        },
        cancelClicked: function () {
            this.$router.push("/focused/home");
        }

    },
    computed: {
        communityId: function () { return this.$store.getters.communityId; }
    },
    data() {
        return {
            predefinedBarsList: predefinedBars,
            icons: icons,
            colors: colors
        };
    }
};
</script>
