<template>
  <div>
      <b-alert :show="billingInfo && billingInfo.trial_end_days > 0" variant="warning" dismissible style="margin: auto">You have {{ billingInfo && billingInfo.trial_end_days }} days left of your free trial. <b-link to="/billing/plans">Click here to purchase</b-link></b-alert>
      <b-alert :show="billingInfo && billingInfo.trial_end_days < 0" variant="danger"  style="margin: auto">Your free trial has expired <b-link to="/billing/plans">Click here to purchase</b-link></b-alert>
    <b-row no-gutters>
      <b-col md="2">
        <SidePanel :community="community" :bars="list" :members="members" ref="SidePanel" />
      </b-col>
      <b-col md="5" fluid>
        <div v-if="members.length > 0" class="info-box pt-3 pb-3 p-2">
          <h4><b>Welcome to Morphic</b></h4>
          <b-row style="min-height: 500px">
            <b-col md="5" class="flex-column">
              <!-- hints -->
              <div v-if="members.length > 1">
                <p class="text-left small">
                  (<b-link @click="hintsSwitch" v-text="showHideHintsText"></b-link>)
                </p>
              </div>
              <div id="hints" v-if="showHints">
                <div id="BarsHint" ref="BarsHint">
                  View or make changes to a bar by clicking on its name
                </div>
                <div id="MembersHint" ref="MembersHint">
                  <div v-if="members.length > 1">
                    Add a new member
                  </div>
                  <div v-else>
                    Add a new member to your group by clicking the Plus button
                  </div>
                </div>
                <div v-if="members.length > 1" ref="EditMemberHint">
                  <p>See a member's bar and other detail by clicking them</p>
                  <p>If you see an exclamation <b-icon icon="exclamation-circle-fill" variant="dark"></b-icon> the member has not yet accepted your invitation</p>
                </div>
              </div>
              <div v-else>
                <p class="text-left small">Get started by clicking an item in the green menu to the left</p>
              </div>
            </b-col>
            <b-col md="7">
            </b-col>
          </b-row>
        </div>
        <div v-else id="welcome">
          <div class="text-center pt-5 pb-5 bg-silver rounded">
            <b-spinner variant="success" label="..."></b-spinner><br><br>
            Loading data, please wait...
          </div>
        </div>
      </b-col>
      <b-col md="3">
      </b-col>
      <b-col md="1">
        <div class="fill-height bg-silver"></div>
      </b-col>
    </b-row>
  </div>
</template>

<style lang="scss">
  $primary-color: #002957;
  $secondary-color: #84c661;

  .desktopDashboard {
    .barPreview {
      min-height: 500px;
    }
    .logoHolder {
      margin: 0 -2rem !important;
    }
  }
  .info-box {
    h5 {
      color: $primary-color;
    }
  }

  #hints {
    font-family: 'Coming Soon', sans-serif;
    font-weight: 600;
    & > div:last-child {
      padding-top: 20px;
    }
  }
</style>

<script>
import * as ArrowLine from "arrow-line";
import { createPopper } from "@popperjs/core";
import SidePanel from "@/components/dashboardV2/SidePanel";
import {
    getCommunity,
    getCommunityBars,
    getCommunityMembers,
    updateCommunityMember
} from "@/services/communityService";
import * as billingService from "@/services/billingService";

export default {
    name: "Dashboard",
    components: {
        SidePanel
    },
    data() {
        return {
            // data
            list: [],
            community: {},
            members: [],
            barPreviewData: {},
            showHints: true,
            showHideHintsText: "Hide hints",
            arrows: [],
            barsHintCss: {},
            billingInfo: null
        };
    },
    computed: {
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
    mounted: function () {
        this.loadData();
        // This is required to re-draw the arrows, sorry :P
        const that = this;
        this.$nextTick(function () {
            window.addEventListener("resize", function () { that.$forceUpdate(); });
        });
        this.loadBilling();
    },
    beforeDestroy: function () {
        this.cleanUpArrows();
    },
    updated() {
        this.cleanUpArrows();
        // TODO: Find a better way to detect whether the hints are displayed
        if (this.$refs.BarsHint && this.showHints) {
            this.createArrows();
        }
    },
    methods: {
        loadData: function () {
            return new Promise((resolve, reject) => {
                if (!this.$route.params.community && !this.communityId) {
                    this.$store.dispatch("userCommunities", this.userId)
                        .then((communities) => {
                            // We ensure this.community has all the required fields - not only the id
                            getCommunity(communities[0].id).then((community) => {
                                this.community = community.data;
                                this.loadBars();
                                resolve();
                            });
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
                    getCommunityMembers(this.communityId)
                        .then((resp) => {
                            this.list = this.autoHideDetails(bars, true);
                            // ensure all members have a bar_id associated, else set default
                            // on a brand new community the community doesn't have a default bar, so we use the first (and only) bar id
                            const defaultBarId = this.community.default_bar_id ? this.community.default_bar_id : bars[0].id;
                            // Let's ensure that all the community members have a bar assigned.
                            // If not, add the the default one - usually required for the CM
                            this.members = resp.data.members.map(m => {
                                if (!m.bar_id) {
                                    Object.assign(m, { bar_id: defaultBarId });
                                    updateCommunityMember(this.communityId, m.id, m);
                                }
                                return m;
                            });

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
        hintsSwitch: function () {
            this.showHints = !this.showHints;
            this.showHideHintsText = this.showHints ? "Hide hints" : "Show hints";
        },
        createArrows: function () {

            var pairs = [
                // hint, point to, [point from]
                [this.$refs.BarsHint, "#SidePanel #BarsList > ul > li:first-child > :first-child"],
                [this.$refs.MembersHint, "#SidePanel #AddNewMember"],
                [
                    this.$refs.EditMemberHint,
                    "#SidePanel #MembersList ul > li:first-child > :first-child",
                    this.$refs.EditMemberHint && this.$refs.EditMemberHint.querySelector(":first-child")
                ]
            ];

            const sidePanel = document.querySelector("#SidePanel");

            // Resolve the selectors
            pairs = pairs.map(p => p.map(ref => (typeof(ref) === "string") ? document.querySelector(ref) : ref));

            pairs.forEach(pair => {
                const hint = pair[0];
                const target = pair[1];
                const arrowFrom = pair[2] || hint;

                const virtualElement = {
                    getBoundingClientRect() {
                        const rect = target.getBoundingClientRect();
                        rect.width = sidePanel.getBoundingClientRect().right - rect.left + 30;
                        return rect;
                    }
                };

                if (!hint || !target) {
                    if (hint) {
                        hint.style.display = "none";
                    }
                } else {
                    createPopper(virtualElement, hint, {
                        placement: "right-start",
                        onFirstUpdate: (state) => {
                            const targetRect = target.getBoundingClientRect();
                            const sourceRect = arrowFrom.getBoundingClientRect();

                            const sourcePoint = {
                                x: sourceRect.x - 1,
                                y: sourceRect.y + sourceRect.height / 2
                            };
                            const targetPoint = {
                                x: targetRect.x + targetRect.width,
                                y: targetRect.y + targetRect.height / 2 + 2
                            };

                            const arrow = new ArrowLine(sourcePoint, targetPoint, {
                                curvature: 0.5,
                                forceDirection: "horizontal"
                            });
                            this.arrows.push(arrow);
                        }
                    });
                }

            });
        },
        cleanUpArrows: function () {
            this.arrows.forEach(arrow => arrow.remove());
            this.arrows = [];
        },
        loadBilling: function () {
            return billingService.getBillingInfo(this.communityId).then((info) => {
                this.billingInfo = info.data;
            });
        }
    }
};
</script>
