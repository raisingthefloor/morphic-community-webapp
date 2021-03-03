<template>
<html>
  <h1>Your Morphic Community: {{ community.name }} </h1>
  <ul>
    <!-- <li><a >Community Settings</a></li>
    <li><a >Add a community</a></li>
    <li><a >Switch to a different community</a></li> -->
  </ul>

  <h2>Community Bars</h2>
    <!-- <p><b-link disabled>Community settings</b-link></p> -->
    <ul v-if="communityBars.length > 0" class="list-unstyled">
      <li v-for="bar in communityBars" :key="bar.id" >
        <b-link :to="getBarEditRoute(bar)">
         {{ bar.name === "Default" ? "Default Bar" : bar.name }}
        </b-link>
      </li>
    </ul>
    <p v-else>
      <i>No bars in the community</i><br>
      Click on the button to add your first one<br><br>
    </p>
    <p>
      <b-form action="#/focused/add-community-bar">
        <b-button type="submit" variant="primary">Add a community bar</b-button>
      </b-form>
    </p>

  <h2>Members in your community</h2>
  <ul v-if="members.length > 0" class="list-unstyled">
      <li v-for="member in members" :key="member.id" >
        <b-link v-if="member.bar_id" :to="getUserBarEditRoute(member)">
          {{ member.first_name }} {{ member.last_name }}
          <b-icon v-if="member.state === 'uninvited'" icon="exclamation-circle-fill" variant="dark" v-b-tooltip.hover title="Has not accepted invitation"></b-icon>
          <b-icon v-if="isCommunityBar(member.bar_id)" class="communityBarSymbol" icon="globe" variant="dark" v-b-tooltip.hover title="Using a community bar"></b-icon>
          <b-icon v-if="member.role === 'manager'" icon="people-fill" variant="dark" v-b-tooltip.hover title="Member is a community manager"></b-icon>
          <br>
        </b-link>
      </li>
    </ul>
    <p v-else>
      <i>Nobody in the community</i><br>
      Click on the button to add somebody to your community<br><br>
    </p>
    <p>
      <b-form>
        <b-button type="submit" @click="addPersonClicked" variant="primary">Add a Person</b-button>
      </b-form>
    </p>
</html>
</template>

<style lang="scss">
.communityBarSymbol {
  margin-left: 5px;
  margin-right: 5px;
  }
 li {
     a {
         color: #005BDF;
     }
 }
</style>

<script>
import { MESSAGES } from "@/utils/constants";
import { getCommunityBars, getCommunity, getCommunityMembers } from "@/services/communityService";
import * as Bar from "@/utils/bar";

export default {
    name: "FocusedHome",
    components: {
    },
    data() {
        return {
            list: [],
            bars: [],
            community: {},
            members: [],
            barPreviewData: {},
            communityBars: []
        };
    },
    computed: {
        userId: function () { return this.$store.getters.userId; },
        membersNotInvited: function () {
            const list = [];
            for (let i = 0; i < this.members.length; i++) {
                if (this.members[i].state === "uninvited") {
                    list.push(this.members[i]);
                }
            }
            return list;
        },
        membersNotAccepted: function () {
            const list = [];
            for (let i = 0; i < this.members.length; i++) {
                if (this.members[i].state === "invited") {
                    list.push(this.members[i]);
                }
            }
            return list;
        }
    },
    mounted() {
        this.loadData();
    },
    methods: {
        logout: function () {
            if (this.disableLogout) {
                window.confirm(MESSAGES.logoutAlert);
            } else {
                this.$store.dispatch("logout")
                    .then(() => {
                        this.$router.push("/");
                    });
            }
        },
        loadData: function () {
            return new Promise((resolve, reject) => {
                if (!this.$route.params.community && !this.communityId) {
                    this.$store.dispatch("userCommunities", this.userId)
                        .then((communities) => {
                            this.community = communities[0];
                            this.loadBars();
                            resolve();
                        })
                        .catch(err => {
                            reject(err);
                        });
                } else if (this.$route.params.community) {
                    this.community = this.$route.params.community;
                    this.$store.dispatch("activeCommunity", this.community.id)
                        .then(() => {
                            this.loadBars();
                            resolve();
                        })
                        .catch(err => {
                            reject(err);
                        });
                } else {
                    getCommunity(this.communityId)
                        .then((community) => {
                            this.community = community.data;
                            this.loadBars();
                            resolve();
                        })
                        .catch(err => {
                            reject(err);
                        });
                }
            });
        },
        loadBars: function () {
            getCommunityBars(this.community.id)
                .then(resp => {
                    const bars = resp.data.bars;
                    this.communityBars = bars.filter(bar => bar.is_shared === true);
                    getCommunityMembers(this.communityId)
                        .then((resp) => {
                            this.list = this.autoHideDetails(bars, true);
                            this.members = resp.data.members.map(m => { return m.bar_id ? m : Object.assign(m, { bar_id: this.community.default_bar_id }); });
                            if (this.members.length > 0 && this.list.length > 0) {
                                for (let i = 0; i < this.list.length; i++) {
                                    this.list[i].members = [];
                                    for (let j = 0; j < this.members.length; j++) {
                                        if (this.list[i].id === this.members[j].bar_id) {
                                            this.list[i].members.push(this.members[j]);
                                        }
                                    }
                                }
                            }
                        })
                        .catch(err => {
                            console.error(err);
                        });
                })
                .catch(err => {
                    console.error(err);
                });
        },
        autoHideDetails: function (data, showFirstOne) {
            if (data && data.length > 0) {
                for (var i = data.length - 1; i >= 0; i--) {
                    if (showFirstOne && i === 0) {
                        data[i].showDetails = true;
                    } else {
                        data[i].showDetails = false;
                    }
                }
            }
            return data;
        },
        orderedMembers: function () {
            const alphabetical = this.members;
            alphabetical.sort((a, b) => (a.first_name < b.first_name) ? 1 : ((a.first_name > b.first_name) ? -1 : 0));
            alphabetical.reverse();
            return alphabetical;
        },
        isCommunityBar: function (barId) {
            for (let i = 0; i < this.communityBars.length; i++) {
                if (this.communityBars[i].id === barId) {
                    return this.communityBars[i].is_shared;
                }
            }
            return false;
        },
        addPersonClicked: function () {
            this.$router.push({ path: "/focused/person", query: { } });
        },
        getBarEditRoute: function (bar) {
            return Bar.getBarEditRoute(bar, true);
        },
        getUserBarEditRoute: function (member) {
            return Bar.getUserBarEditRoute(member, this.community && this.community.default_bar_id, true);
        }
    }
};
</script>
