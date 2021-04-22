<template>
  <div>
      <b-alert :show="billingInfo && billingInfo.trial_end_days > 0" variant="warning" dismissible style="margin: auto">You have {{ billingInfo && billingInfo.trial_end_days }} days left of your free trial. <b-link to="/billing/plans">Click here to purchase</b-link></b-alert>
      <b-alert :show="billingInfo && billingInfo.trial_end_days < 0" variant="danger"  style="margin: auto">Your free trial has expired <b-link to="/billing/plans">Click here to purchase</b-link></b-alert>
    <b-row no-gutters>
      <b-col md="2">
        <SidePanel :community="community" :bars="list" :members="members" ref="SidePanel" @reload="loadData()" />
      </b-col>
      <b-col md="4" fluid>
        <div v-if="members.length > 0" class="info-box pt-3 pb-3 pl-5">
          <h1 class="h3">Welcome to Morphic</h1>
          <!-- hints -->
          <div>
            <p class="text-left small">
              (<b-link @click="hintsSwitch" v-text="showHideHintsText"></b-link>)
            </p>
          </div>
          <br/>
          <div>
            <b-link :href="externalLinks.gettingStarted" class="gettingStarted"><b-icon icon="star"/>Getting Started with the Customization Tool</b-link>
          </div>
          <div id="hints" v-if="showHints">
            <div pointTo="#MyMorphicBars .addNew">
              Want to make a MorphicBar for yourself? Start with "Add a new bar"
            </div>
            <div pointTo="#MembersList .addNew">
              Do you want to make and manage MorphicBars for other people?
              <p class="mt-2">
                Start by adding a person.<br/>
                Next you can create bars.<br/>
                Finally, you can invite the person to download and use Morphic.
              </p>
            </div>
          </div>
          <div v-else>
            <p class="text-left small">Get started by clicking an item in the green menu to the left</p>
          </div>
        </div>
        <div v-else id="welcome">
          <div class="text-center pt-5 pb-5 bg-silver rounded">
            <b-spinner variant="success" label="..."></b-spinner><br><br>
            Loading data, please wait...
          </div>
        </div>
      </b-col>
      <b-col md="5" class="videos">

        <div v-for="(video) in [{id:'7bhdSFOiJjk',caption:'Making a custom MorphicBar - Basics',length:'4:24'}]"
             :key="video.id"
             @click="playVideo(video)"
             class="videoLink">

          <b-aspect aspect="854:480" class="videoPreview">
            <img :src="`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`"
                 class=""
                 alt=""
            />

            <b-iconstack class="playOverlay">
              <b-icon icon="circle-fill" class="playOutline mouseOver" scale="1.1" />
              <b-icon icon="play-circle-fill" class="mouseOut"/>
              <b-icon icon="play-circle-fill" class="mouseOver"/>

            </b-iconstack>
          </b-aspect>

          <b-button :id="`PlayVideo-${video.id}`"
                    class="videoCaption"
                    variant="link"
                    v-b-modal="`PlayerDialog-${video.id}`"
          >
            {{ video.caption }} ({{video.length}})
          </b-button>

        </div>

        <b-modal :id="'VideoDialog'"
                 dialog-class="videoDialog"
                 :title="playingVideo && playingVideo.caption"
                 ok-only
                 button-size="sm"
                 ok-title="Close"
        >

          <div style="min-width: 854px !important;">
          <b-aspect type="iframe"

                   aspect="854:480"
                    class="videoWrapper"
          >
            <iframe v-if="playingVideo"
                    id="ytplayer" class="player" type="text/html"
                    :src="`https://www.youtube.com/embed/${playingVideo.id}?modestbranding=1&autoplay=1`"
                    frameborder="0"></iframe>
          </b-aspect>
          </div>
        </b-modal>


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

  .videos {
    padding-top: 3em;

    .videoLink {
      margin: 5em;
      font-size: 0.9rem;
      position: relative;
      cursor: pointer;

      .videoPreview img {
        width: 100%;
        position: absolute;
      }

      .playOverlay {
        position: absolute;

        height: 40%;
        width: 40%;

        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);

      }

      .mouseOver, &:hover .mouseOut {
        display: none;
      }

      &:hover {
        .btn-link {
          text-decoration: underline;
        }
        .mouseOver {
          display: unset;
        }

        .playOverlay {
          color: midnightblue;
        }
      }

      .playOverlay {
        color: #666;
        .playOutline {
          color: white;
        }
      }
    }
  }

  .videoDialog {
    max-width: unset !important;
    width: max-content !important;
    .videoWrapper {
      .player {
        width: 100%;
        height: 100%;
      }
    }
  }

  h1 {
    font-weight: bold !important;
  }
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

  .gettingStarted {
    position: relative;
    text-decoration: underline;
    font-size: 1.1em;
    .b-icon {
      position: absolute;
      right: 100%;
      height: 100%;
    }
  }

  #hints {
    position: relative;
    font-family: 'Coming Soon', sans-serif;
    font-weight: 600;
    width: 20em;

    & > * {
      padding-left: 0.3em;
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
            billingInfo: null,
            sidePanel: null,
            hintTimer: null,

            playingVideo: null
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
        if (this.showHints) {
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
            this.sidePanel = document.querySelector("#SidePanel");

            const hintElems = this.$el.querySelectorAll("#hints > *");

            const pairs = [];
            hintElems.forEach(e => {
                const pointTo = document.querySelector(e.getAttribute("pointTo"));
                pairs.push([e, pointTo]);
            });

            pairs.forEach(pair => {
                const hint = pair[0];
                const target = pair[1];
                const arrowFrom = pair[2] || hint;

                if (!hint || !target) {
                    if (hint) {
                        hint.style.display = "none";
                    }
                } else {
                    hint.style.visibility = "visible";
                    const virtualElement = {
                        getBoundingClientRect: () => {
                            const rect = target.getBoundingClientRect();
                            rect.width = this.sidePanel.getBoundingClientRect().right - rect.left + 40;
                            return rect;
                        }
                    };

                    const arrow = {
                        target: virtualElement,
                        hint: hint
                    };

                    arrow.popper = createPopper(virtualElement, hint, {
                        placement: "right-start",
                        onFirstUpdate: (state) => {
                            const targetRect = target.getBoundingClientRect();
                            const sourceRect = arrowFrom.getBoundingClientRect();

                            const sourcePoint = {
                                x: sourceRect.x - 1,
                                y: sourceRect.y + 10// sourceRect.height / 2
                            };
                            const targetPoint = {
                                x: targetRect.x + targetRect.width + 5,
                                y: targetRect.y + targetRect.height / 2 + 2
                            };

                            sourcePoint.y += window.scrollY;
                            targetPoint.y += window.scrollY;

                            arrow.arrowLine = new ArrowLine(sourcePoint, targetPoint, {
                                curvature: 0.5,
                                forceDirection: "horizontal"
                            });

                            arrow.target = target;
                            arrow.targetRect = targetRect;

                            this.arrows.push(arrow);
                        }
                    });
                }
            });
            this.hintTimer = setInterval(this.checkHints, 500);
        },
        checkHints: function () {
            const changed = this.arrows.some(arrow => {
                const newRect = arrow.target.getBoundingClientRect();
                return newRect.y !== arrow.targetRect.y;
            });

            if (changed) {
                this.cleanUpArrows();
                this.createArrows();
            }
        },
        cleanUpArrows: function () {
            this.arrows.forEach(arrow => {
                arrow.hint.style.visibility = "hidden";
                arrow.arrowLine.remove();
                arrow.popper.destroy();
            });
            this.arrows = [];
            if (this.hintTimer) {
                clearTimeout(this.hintTimer);
                this.hintTimer = null;
            }
        },
        loadBilling: function () {
            return billingService.getBillingInfo(this.communityId).then((info) => {
                this.billingInfo = info.data;
            });
        },
        playVideo: function (video) {
            this.playingVideo = video;
            this.$bvModal.show("VideoDialog");

        }
    }
};
</script>
