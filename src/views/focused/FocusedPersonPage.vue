<template>
  <div v-if="isGetEmailView">
    <h1>Invite {{ memberDetails.first_name }} {{ memberDetails.last_name }}</h1>
    <b-form>
      <b-form-group label="Email to send invitation to" label-for="email_input">
        <b-form-input v-model="emailInput" id="email" class="mb-2"></b-form-input>
      </b-form-group>
      <p />

      <b-button type="reset" @click="isGetEmailView = false" variant="warning">Cancel</b-button>
      <b-button type="submit" @click="sendInvite" :disabled="!checkEmail" variant="primary">Send Invite</b-button>
    </b-form>
  </div>

  <div v-else-if="isAddMemberView">
    <h1>Add a new member to the group</h1>
    <b-form>
      <b-form-group label="First name" label-for="firstName_input">
        <b-form-input v-model="firstNameInput" id="firstName_input" class="mb-2"></b-form-input>
      </b-form-group>
      <b-form-group label="Last name" label-for="lastName_input">
        <b-form-input v-model="lastNameInput" id="lastName_input" class="mb-2"></b-form-input>
      </b-form-group>
      <p />

      <b-button type="reset" @click="navigateBack" variant="warning">Cancel</b-button>
      <b-button type="submit" @click="addMember" :disabled="!lastNameInput && !firstNameInput" variant="primary">Add member</b-button>
    </b-form>
  </div>

  <div v-else>
    <h1>Member: {{ memberDetails.first_name }} {{ memberDetails.last_name }}</h1>
    <ul>
      <li>{{memberDetails.role == "member" ? "Is a regular member" : "Is a group manager"}}</li>
      <li>Joined: 2020-10-10</li>
      <li>Invited by: Group Manager Handle</li>
      <li>Last used Morphic 3 days ago</li>
    </ul>

    <b-button variant="warning" @click="changeUserRole">{{memberDetails.role == "member" ? "Make member a Group Manager" : "Remove group manager role"}}</b-button>
    <b-button variant="danger" @click="deleteMemberClicked">Delete member</b-button>
    <b-button @click="sendInviteClicked">
      <span v-if="memberDetails.state == 'uninvited'">Invite member</span>
      <span v-else>Resend invitation</span>
    </b-button>

    <hr />

    <b-link @click="navigateBack">
        Go back
    </b-link>
  </div>

</template>

<style lang="scss">
</style>

<script>

import { addCommunityMember, inviteCommunityMember, getCommunity, getCommunityMember, updateCommunityMember, deleteCommunityMember } from "@/services/communityService";
import { MESSAGES } from "@/utils/constants";

export default {
    name: "FocusedPersonPage",
    components: {
    },
    methods: {
        deleteMemberClicked: function () {
            if (confirm("Are you sure you want to delete member? This cannot be undone")) {
                deleteCommunityMember(this.communityId, this.memberDetails.id)
                    .then((resp) => {
                        delete this.memberDetails.id;
                        this.navigateBack();
                    })
                    .catch(err => {
                        console.error(err);
                    });
            }
        },
        changeUserRole: function () {
            if (this.memberDetails.role === "member") {
                this.memberDetails.role = "manager";
            } else {
                this.memberDetails.role = "member";
            }
            updateCommunityMember(this.communityId, this.memberDetails.id, this.memberDetails)
                .then((resp) => {
                    if (resp.status === 200) {
                        this.showMessage(MESSAGES.successfulRoleChange);
                    }
                })
                .catch(err => {
                    console.error(err);
                });
        },
        loadMemberData: function () {
            getCommunityMember(this.communityId, this.$route.query.memberId)
                .then((resp) => {
                    this.memberDetails = resp.data;
                })
                .catch(err => {
                    console.error(err);
                });
        },
        getCommunityData: function () {
            getCommunity(this.communityId)
                .then((community) => {
                    this.community = community.data;
                })
                .catch(err => {
                    console.error(err);
                });
        },

        addMember: function () {
            let member = {
                first_name: this.firstNameInput,
                last_name: this.lastNameInput
            };
            addCommunityMember(this.communityId, member)
                .then(resp => {
                    // save bar_id as default community bar:
                    member = resp.data.member;
                    member.bar_id = this.community.default_bar_id;
                    updateCommunityMember(this.communityId, member.id, member).then(resp2 => {
                        this.memberDetails = member;
                        this.navigateBack();
                    });
                }).catch(e => { console.error(e); });
        },
        navigateBack: function () {
            if (this.isAddMemberView && !this.memberDetails.id) {
                this.$router.push("/focused/home");
            } else if (this.memberDetails.id) {
                this.$router.push({ path: "/focused/bar-editor", query: { barId: this.memberDetails.bar_id, memberId: this.memberDetails.id } });
            } else {
                this.$router.push("/focused/home");
            }
        },
        sendInviteClicked() {
            this.isGetEmailView = true;
        },
        sendInvite() {
            if (this.emailInput) {
                const communityId = this.$store.getters.communityId;
                inviteCommunityMember(communityId, this.memberDetails.id, this.emailInput);
                this.memberDetails.state = "invited";
                this.isGetEmailView = false;
            }
        },
        checkEmail() {
            return this.emailInput.match("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
        }
    },
    computed: {
        communityId: function () { return this.$store.getters.communityId; }
    },
    mounted() {
        this.getCommunityData();
        if (this.$route.query.memberId) {
            this.isAddMemberView = false;
            this.loadMemberData();
        }
    // if (this.$route.query.memberId) {
    //   this.loadMemberData()
    // }
    // this.getCommunityData()
    },
    watch: {
        "$route.query": function () {
            if (this.$route.query.memberId) {
                this.isAddMemberView = false;
                this.loadMemberData();
            }
        }
    },
    data() {
        return {
            // sgithens focused
            member: {},
            isAddMemberView: true,
            isGetEmailView: false,
            community: {},
            barsList: [],
            barDetails: {},
            memberDetails: {},

            // new member stuff:
            firstNameInput: "",
            lastNameInput: "",

            // send invite stuff
            emailInput: ""
        };
    }
};
</script>
