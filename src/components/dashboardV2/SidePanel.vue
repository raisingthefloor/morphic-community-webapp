<template>
  <div id="SidePanel" class="bar-people-controls fill-height bg-green">
    <h4>{{ community.name }}</h4>
    <div class="itemList">
      <b-link :to="{ name: 'MyCommunity'}">Account Settings</b-link>
    </div>

    <h5>My Morphic Bars</h5>
    <BarsList ref="BarsList"
              :bars="bars"
              :activeBarId="activeBarId"
    />

    <h5>Members ({{community.member_count}} of {{community.member_limit}})</h5>
    <MembersList ref="MembersList"
                 :members="members"
                 :community="community"
                 :activeBarId="activeBarId"
                 :bars="bars"
                 :activeMemberId="activeMemberId"
    />

  </div>
</template>

<style lang="scss">
  $primary-color: #002957;
  $secondary-color: #84c661;

  .bg-green {
    background: #a5d58a url(/img/bg-green.png) repeat-x bottom;
  }


  #SidePanel {
    h4, h5 {
      font-weight: bold;
    }

    & > :not(.itemList) {
      padding-left: 0.4rem;
      padding-right: 0.4rem;
    }

    .itemList {
      display: flex;
      flex-direction: column;
      margin-bottom: 1em;

      a {
        padding: 0.1rem 0.4rem;
        color: black;
        &.active {
          background-color: green;
          color: white;
        }

        &.addNewLink {
          &:before {
            content: '[';
          }

          &:after {
            content: ']';
          }
        }
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

export default {
    name: "SidePanel",
    components: {
        MembersList,
        BarsList
    },
    props: {
        community: Object,
        bars: Array,
        members: Array,
        activeBarId: String,
        activeMemberId: String
    }
};
</script>
