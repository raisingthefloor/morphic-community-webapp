<template>
  <div id="SidePanel" class="bar-people-controls fill-height bg-green">
    <h2>{{ community.name }}</h2>
    <div class="accountInfo">
      <b-link :to="{ name: 'MyCommunity'}" ><b-icon icon="gear-fill" />{{ $t('SidePanel.account-settings_link') }}</b-link>
    </div>

    <!-- member's bars -->
    <h3 ref="MorphicBars" @click="expandClick($refs.MorphicBars)" class="expandable expanded">
      {{ $t('SidePanel.own-bars_heading') }}
      <span class="expander">
        <b-icon class="expandIcon" icon="plus" />
      </span>
    </h3>
    <BarsList ref="BarsList"
              :bars="bars"
              :activeBarId="activeBarId"
              :member="currentMember"
    />

    <!-- managed members -->
    <h3 ref="MembersMorphicBars" @click="expandClick($refs.MembersMorphicBars)" class="expandable expanded">{{ $t('SidePanel.other-bars_heading') }}
      <span class="expander">
        <b-icon class="expandIcon" icon="plus" />
      </span>
    </h3>
    <MembersList ref="MembersList"
                 :members="members"
                 :community="community"
                 :activeBarId="activeBarId"
                 :bars="bars"
                 :activeMemberId="activeMemberId"
                 @expandClick="expandClick"
                 @newbar="newBar"

    />

    <!-- group bars -->
    <h3 ref="GroupBars" @click="expandClick($refs.GroupBars)" class="expandable expanded">
      Group Bars
      <span class="expander">
        <b-icon class="expandIcon" icon="plus" />
      </span>
    </h3>
    <BarsList ref="BarsList"
              :bars="bars"
              :activeBarId="activeBarId"
    />
  </div>
</template>

<style lang="scss">
  $primary-color: #002957;
  $secondary-color: #84c661;

  .bg-green {
    //noinspection CssUnknownTarget
    background: #a5d58a url(/img/bg-green.png) repeat-x bottom;
  }

  #SidePanel {
    h2, h3, h4, h5 {
      font-weight: bold;
      font-size: 1rem;
      margin: 1rem 0 0.5rem 0;
    }
    h2 {
      font-size: 2rem;
    }
    h4, h5 {
      margin: 4px 2px;
    }

    .btn-link {
      color: $primary-color;
    }

    .expandable {
      cursor: pointer;
    }

    .expander {
      position: absolute;
      right: 0.5em;
    }
    .expandIcon, .collapseIcon {
      transition: all 500ms ease;
      opacity: 1;
    }
    :not(.expandable) > .expander {
      display: none;
    }

    .expandable.expanded .expandIcon,
    .expandable:not(.expanded) .collapseIcon,
    {
      opacity: 0;
    }

    .expandable.expanded {
      font-weight: bold;
    }

    .expandable + .expandableContent,
    .expandable + :not(.expandableContent) > :not(.active) {
      transition: all 500ms ease, max-height 300ms ease-out,
        font-weight 0s, background-color 0s, color 0s;
      opacity: 1;
      max-height: 500px;
    }

    .expandable:not(.expanded) + .expandableContent,
    .expandable:not(.expanded) + :not(.expandableContent) > :not(.active),
    {
      overflow: hidden;
      max-height: 0;
      opacity: 0;
      padding-top: 0;
      padding-bottom: 0;
      margin-top: 0;
      margin-bottom: 0;
    }

    .expandable.collapsed + .expandableContent,
    .expandable.collapsed + :not(.expandableContent) > :not(.active) {
      display: none;
    }


    button:not(.btn-link) {
      margin: 1px;
      min-width: 70%;
    }
    .buttonRow {
      button:first-child {
        margin-right: 0.5em;
      }
      button {
        font-size: 80%;
      }
    }

    a {
      color: black;
      &.barLink {
        padding: 0.1rem 0.4rem;
        font-size: 1rem;
        color: black;
        display: block;
      }
    }
    // Indentation
    $indent: 0.3em;
    padding-left: $indent;
    .accountInfo {
      padding-left: $indent * 2;
    }
    .panelBox {
      padding-left: $indent * 2;
      button {
        margin-left: $indent * 2;
      }
    }

    // Make the list items full width of the panel
    li {
      margin-left: $indent * -3;
      padding-left: $indent * 3;
    }

    ul {
      margin: 0.5em 0;
      li {
        &.active {
          background-color: $primary-color;
          .barLink {
            color: white !important;
          }
        }
        // Custom bullet to reduce the space after the bullet.
        a::before {
          content: "\2022";
          text-decoration: none !important;
          display: inline-block;
          font-size: 1em;
          transform: scale(1.3);
          margin-right: $indent * 1.5;
        }
      }
    }


    $panelBox-color: #85C399;
    .panelBox {
      overflow: hidden;
      .expandable {
        color: black;
      }
      .memberName {
        margin: 0;
        padding: 0.2em 0;
      }

      font-size: 0.95em;
      border-radius: 8px;
      margin-top: 0.25em;
      margin-right: $indent;
      background-color: $panelBox-color;

      &.active {
        background-color: lighten($panelBox-color, 7%);
      }

      & > .expandable {
        font-weight: bold;
      }

    }

  }

  .bar-people-controls {
    a {
      color: $primary-color;
    }
    .icon-add {
      float: right;
      background: white;
      border-radius: 100%;
      font-size: 2rem;
      line-height: 100%;
    }
  }
</style>

<script>

import MembersList from "@/components/dashboardV2/MembersList";
import BarsList from "@/components/dashboardV2/BarsList";
import * as Bar from "@/utils/bar";
import * as communityService from "@/services/communityService";

export default {
    name: "SidePanel",
    components: {
        MembersList,
        BarsList
    },
    props: {
        /** @type {Community} */
        community: Object,
        /**
         * All bars in the community
         * @type {Array<BarDetails>}
         */
        bars: Array,
        /** @type {Array<CommunityMember>} */
        members: Array,
        activeBarId: String,
        activeMemberId: String
    },
    mounted() {
        this.$el.querySelectorAll("button.collapseAll").forEach(b => {
            b.disabled = true;
        });
    },
    data() {
        return {
        };
    },
    computed: {
        /**
         * Get the bars owned by the current user.
         * @return {Array<BarDetails>} The bars owned by the member.
         */
        memberBars() {
            return this.bars.filter(b => b.id === this.currentMember.bar_id && !b.is_shared);
        },
        /**
         * @return {CommunityMember} The current member
         */
        currentMember() {
            return this.members.find(m => m.isCurrent) || {};
        }
    },
    methods: {
        /**
         * Toggles a collapsable element (or all collapsable child elements).
         * @param {Element|String} el The element, or the expand-group to toggle all.
         * @param {Boolean?} toggle true/false to expand/collapse, omit to toggle.
         */
        expandClick(el, toggle) {
            const all = typeof(el) === "string";
            const expandGroup = all ? el : el.getAttribute("expand-group");

            const e = all
                ? this.$el.querySelectorAll(`.expandable[expand-group=${expandGroup}]`)
                : [el];

            e.forEach(e => e.classList.toggle("expanded", toggle));

            // Disable the expand/collapse all buttons, if required
            if (expandGroup) {
                const expandAllButton = this.$el.querySelector(`button[expand-group=${expandGroup}].expandAll`);
                const collapseAllButton = this.$el.querySelector(`button[expand-group=${expandGroup}].collapseAll`);

                if (expandAllButton || collapseAllButton) {
                    const someExpanded = this.$el.querySelectorAll(`.expandable.expanded[expand-group=${expandGroup}]`).length;
                    const someCollapsed = this.$el.querySelectorAll(`.expandable:not(.expanded)[expand-group=${expandGroup}]`).length;

                    expandAllButton.disabled = !someCollapsed;
                    collapseAllButton.disabled = !someExpanded;
                }
            }
        },

        /**
         * Creates a new bar.
         * @param {CommunityMember} [member] The member this bar belongs to (omit for a shared bar).
         * @return {Promise<BarDetails>} Resolves when the new bar has been created.
         */
        async newBar(member) {
            const barName = member ? member.fullName : undefined;
            const bar = Bar.newBar(!member, barName);

            const createResponse = await communityService.createCommunityBar(this.communityId, bar);
            if (member) {
                const updatedMember = { ...member, bar_id: createResponse.data.bar.id };
                await communityService.updateCommunityMember(this.communityId, member.id, updatedMember);
                member.bar_id = createResponse.data.bar.id;
            }

            // Go to the bar editor
            const goto = member
                ? Bar.getUserBarEditRoute(member, undefined, this.focusMode)
                : Bar.getBarEditRoute(bar, this.focusMode);
            this.$router.push(goto);
        }
    }
};
</script>
