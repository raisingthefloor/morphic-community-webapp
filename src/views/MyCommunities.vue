<template>
  <b-jumbotron class="bg-light">
    <b-modal id="deleteConfirm" @ok="deleteCommunity" title="Delete a community" footer-bg-variant="light" ok-title="Delete community">
      <p class="my-4">Please confirm the deletion of that group?</p>
    </b-modal>
    <h3>My Groups</h3>
    <p>Sed bibendum neque vel lorem maximus, ut euismod dui ultricies. Vestibulum sed ipsum in arcu facilisis posuere id sit amet risus. In sed cursus turpis. Duis ligula magna, tempor id mattis non, sollicitudin vel nisl. </p>
    <b-button variant="primary" disabled>
      Create New Group
    </b-button>
    <hr class="mt-5 mb-5" />
    <b-card-group columns>
      <b-card
      v-for="community in communities"
      :key="community.id"
      :title="community.name"
      tag="article"
      style="width: 20rem;"
      class="mb-5"
      >
        <b-card-text>
          Group Page:
          <br/>
          <a :href="'https://' + community.name + '.' + host" class="card-link">{{ community.name + '.' + host }}</a>
        </b-card-text>
        <!-- <b-card-text>
          Subscription Plan:
          <br/>
          <b :class="'text-' + community.subscriptionIdent">{{ community.subscriptionPlan }}</b>
        </b-card-text> -->
        <!-- <b-card-text>
          Next Payment:
          <br>
          <b>
            {{ community.paymentNext }}
            <span v-if="community.paymentOk == false">
              (<i class="text-danger">Overdue</i>)
            </span>
          </b>
        </b-card-text> -->
        <!-- <b-card-text>
          Members:
          <br>
          <b>{{ community.memberCurrent }}</b> / {{ community.memberLimit }}
        </b-card-text> -->
        <b-card-text>
          <!-- <b-button :href="'https://' + community.name + '.' + host" variant="success"> -->
          <b-button :to="{ name: 'Dashboard', params: { community: community }}"   variant="success">
            <b-icon-arrow-bar-right></b-icon-arrow-bar-right> Visit Group
          </b-button>
          <b-button variant="danger" class="ml-1" v-b-modal.deleteConfirm @click="setCommunityId(community.id)">Delete</b-button>
        </b-card-text>
      </b-card>
    </b-card-group>
  </b-jumbotron>
</template>

<script>

import { getUserCommunities, deleteUserCommunity } from "@/services/communityService";

export default {
    data() {
        return {
            communities: [],
            communityId: "",
            host: `${window.location.hostname}.com`
        };
    },
    computed: {
        userId: function () { return this.$store.getters.userId; }
    },
    mounted() {
        getUserCommunities(this.userId)
            .then(resp => {
                this.communities = resp.data.communities;
            })
            .catch(err => {
                console.error(err);
            });
    },
    methods: {
        setCommunityId: function (communityId) {
            this.communityId = communityId;
        },
        deleteCommunity: function () {
            deleteUserCommunity(this.communityId)
                .then(resp => {
                    if (resp.status) {
                        const index = this.communities.map(item => item.id).indexOf(this.communityId);
                        this.communities.splice(index, 1);
                    }
                })
                .catch(err => {
                    console.error(err);
                });
        }
    }
};
</script>
