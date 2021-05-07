<!-- A dialog that accepts a single text field -->
<template>

  <b-modal
          :id="dialogId"
          @show="dialogShown"
          size="lg"
          ok-only
          :title="$t('CopyBarDialog.title')"
          ok-title="Cancel"
          v-bind="dialogAttrs"
  >
    <p v-t="'CopyBarDialog.intro'"/>

    <p v-if="loaded && memberCount === 0" class="lead">
      <b-icon icon="exclamation-circle"/>
      {{ $t('CopyBarDialog.no-bars') }}
    </p>
    <template v-else-if="loaded">
      <p class="lead" v-t="'CopyBarDialog.select-instruction'"/>

      <!-- list of members -->
      <ul class="list-unstyled memberBarList">
        <li v-for="(memberBar) in membersBars" :key="memberBar.member.id">

          <span class="memberName" v-b-toggle="`collapse-${memberBar.member.id}`">
            <b-icon icon="person-fill"/>
            {{ memberBar.member.displayName }}
          </span>

          <b-collapse :id="`collapse-${memberBar.member.id}`"
                      :visible="memberCount === 1"
                      @show="loadBar(memberBar.member)">

            <!-- list of bars belonging to the member -->
            <ul v-if="memberBar.bars">
              <li v-for="(bar) in memberBar.bars" :key="bar.id">
                <b-button variant="link"
                          @click="barToCopy = bar"
                          v-b-modal="'copyBarConfirm'"
                >
                  <BarSummary :bar="bar"/>
                </b-button>
              </li>
            </ul>

          </b-collapse>
        </li>
      </ul>

    </template>

    <b-modal id="copyBarConfirm"
             :title="$t('CopyBarDialog.confirm-dialog.title')"
             :ok-title="$t('CopyBarDialog.confirm-dialog.yes_button')"
             :cancel-title="$t('CopyBarDialog.confirm-dialog.no_button')"
             @ok="copyBar(barToCopy)"
    >
      <p v-if="barToCopy"
         v-t="{path:'CopyBarDialog.confirm-dialog.summary', args: {barToCopy:barToCopy.name, currentBar:currentBar.name}}"/>

      <p class="lead" v-t="'CopyBarDialog.confirm-dialog.question'"/>

    </b-modal>

  </b-modal>

</template>

<style lang="scss">

ul.memberBarList {

  li ul li {
    display: flex;
    align-items: center;
  }

  .memberName {
    font-weight: bold;
  }

  & > li {
    //color: red;
  }

}

</style>

<script>

import * as communityService from "@/services/communityService";
import * as Bar from "@/utils/bar.js";
import BarSummary from "@/components/dialogs/BarSummary";
import {dialogMixin} from "@/mixins/dialog.js";

export default {
    name: "CopyBarDialog",
    components: {BarSummary},
    mixins: [dialogMixin],
    props: {
        /** @type {Array<BarDetails>} */
        bars: Array,
        /** @type {Array<CommunityMember>} */
        members: Array,
        /** @type {BarDetails} */
        currentBar: Object,
        id: String
    },
    data: function () {
        return {
            /** @type {Object<GUID,{member: CommunityMember, bars: Array<BarDetails>}>} */
            membersBars: {},
            memberCount: 0,
            loaded: false,
            /** @type {BarDetails} */
            barToCopy: null,
            dialogId: this.id || this.generateId("copyBarDialog")
        };
    },
    computed: {},
    mounted() {
    },

    methods: {
        dialogShown() {
            this.membersBars = {};
            this.loaded = false;
            this.loadBars();
        },
        loadBars() {
            this.memberCount = 0;
            this.members.forEach(member => {

                const bars = Bar.getMemberBars(this.bars, member).filter(b => b.id !== this.currentBar.id);
                if (bars.length > 0) {
                    this.memberCount++;
                    this.membersBars[member.id] = {
                        member,
                        bars
                    };
                }
            });
            this.loaded = true;

            if (this.memberCount === 1) {
                this.loadBar(Object.values(this.membersBars)[0].member);
            }
        },

        /**
         * Loads the bar details for a member
         * @param {CommunityMember} member The member
         * @return {Promise<Array<Bars>>} Resolves when complete.
         */
        async loadBar(member) {

            if (!member) {
                return;
            }

            const memberBars = this.membersBars[member.id];
            const bars = memberBars?.bars;

            if (bars && bars.length > 0 && !memberBars.loaded) {

                for (let i = 0; i < bars.length; i++) {
                    const bar = await communityService.getCommunityBar(this.communityId, bars[i].id).then(r => {
                        return r.data;
                    });
                    memberBars.bars[i] = bar;
                    this.$forceUpdate();
                }
            }
        },

        /**
         * Copy the items of a bar onto the selected bar.
         * @param {BarDetails} bar The bar to copy from.
         */
        copyBar(bar) {

            this.currentBar.items = [];
            bar.items.forEach(sourceItem => {
                Bar.addItem(this.currentBar, sourceItem);
            });

            this.$bvModal.hide(this.dialogId);
            this.$emit("change");
        }
    }
};
</script>
