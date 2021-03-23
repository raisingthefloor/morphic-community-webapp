<template>
  <div id="SidePanel" class="bar-people-controls fill-height bg-green">
    <h4>{{ community.name }}</h4>
    <p class="text-right small">
      (<b-link :to="{ name: 'MyCommunity'}">Group Settings</b-link>)
    </p>
    <h5>
      <b>Group Bars</b>
      <b-link to="/dashboard/morphicbar-preconfigured" class="icon-add"><b-icon-plus-circle-fill variant="success"></b-icon-plus-circle-fill></b-link>
    </h5>
    <BarsList :bars="bars" :activeBarId="activeBarId" ref="BarsList"/>

    <h5>
      <div>
        <b>Members ({{community.member_count}} of {{community.member_limit}})</b>
        <b-link to="/dashboard/member-invite" class="icon-add" id="AddNewMember"><b-icon-plus-circle-fill variant="success" id="AddPeopleIcon" ref="AddPeopleIcon" ></b-icon-plus-circle-fill></b-link>
      </div>
    </h5>
    <MembersList :members="members" :community="community" :activeBarId="activeBarId" :bars="bars" :activeMemberId="activeMemberId" ref="MembersList"/>
  </div>
</template>

<style lang="scss">
  $primary-color: #002957;
  $secondary-color: #84c661;

  .bg-green {
    background: #a5d58a url(/img/bg-green.png) repeat-x bottom;
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
