<template>
  <b-row class="pt-5 pb-5">
    <b-col md="3">
    </b-col>
    <b-col md="6">
      <div>
        <b-modal id="memberConfirm" @ok="addMember(false)" title="Adding the Member" footer-bg-variant="light" ok-title="Add Member">
          <p class="my-4">Please confirm adding this member?</p>
        </b-modal>

        <div class="bg-silver rounded p-3" v-if="!chooseBar">
          <h4 class="mb-3">Add Member</h4>
          <b-card no-body>
            <b-tabs v-model="tabIndex" card>
              <b-tab title="Fill the member information">
                <b-card-text>
                  <h4 class="mb-3">Who do you want to add?</h4>
                  <b-form @submit.stop.prevent="onSubmit">
                    <b-form-group
                      id="first-name"
                      label="Name or Nickname (only seen by the Community Manager)"
                      label-for="firstName"
                    >
                      <b-form-input
                        v-model="$v.firstName.$model"
                        :state="validateState('firstName')"
                        id="firstName"
                        placeholder="Name"
                      >
                      </b-form-input>
                      <b-form-invalid-feedback>This is a required field.</b-form-invalid-feedback>
                    </b-form-group>
                    <hr>
                    <b-row>
                      <b-col md="6">
                        <b-button v-b-modal.memberConfirm variant="primary">Next</b-button>
                      </b-col>
                      <b-col md="6">
                        <div class="small text-right">
                          <b-button to="/dashboard" size="sm" variant="outline-secondary" class="ml-2">Cancel</b-button>
                        </div>
                      </b-col>
                    </b-row>
                  </b-form>
                </b-card-text>
              </b-tab>
            </b-tabs>
          </b-card>
        </div>
      </div>
    </b-col>
    <b-col md="3">
    </b-col>
  </b-row>
</template>

<style>
  .morphicBarPreview {
    border: 1px solid silver;
  }

  .barPicker.active {
    background: #eee;
    border: 1px solid navy;
  }
</style>

<script>

import { addCommunityMember, getCommunityBars, inviteCommunityMember, updateCommunityMember } from "@/services/communityService";
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";

export default {
    name: "MemberInvite",
    mixins: [validationMixin],
    components: {
    },
    data() {
        return {
            bars: {},
            tabIndex: 0,
            firstName: "",
            lastName: "",
            memberEmail: "",
            selectedBar: null,
            sendEmailCopy: 0,
            chooseBar: false,
            previewBar: ""
        };
    },
    validations: {
        firstName: {
            required
        }
    },
    methods: {
        validateState(name) {
            const { $dirty, $error } = this.$v[name];
            return $dirty ? !$error : null;
        },
        onSubmit() {
            this.$v.$touch();
        },
        addMember(invite) {
            let member = {
                first_name: this.firstName,
                last_name: this.lastName
            };
            addCommunityMember(this.communityId, member)
                .then(resp => {
                    member = {
                        member_id: resp.data.member.id
                    };
                    if (resp.status === 200) {
                        if (invite) {
                            inviteCommunityMember(this.communityId, member.member_id);
                        }
                        setTimeout(() => {
                            this.attachBar(resp.data.member);
                        }, 500);
                    }
                })
                .catch(err => {
                    console.error(err);
                });
        },
        attachBar(resp) {
            const member = {
                id: resp.id,
                first_name: resp.first_name,
                last_name: resp.last_name,
                bar_id: this.selectedBar,
                role: resp.role
            };
            updateCommunityMember(this.communityId, resp.id, member)
                .then(resp => {
                    this.$router.push("/dashboard/morphicbar-editor?barId=" + member.bar_id + "&memberId=" + member.id);
                })
                .catch(err => {
                    console.error(err);
                });
        }
    },
    computed: {
        communityId: function () { return this.$store.getters.communityId; }
    },
    mounted() {
        getCommunityBars(this.communityId)
            .then(resp => {
                this.bars = resp.data.bars;
                // default selected bar
                this.selectedBar = this.bars[0].id;
            })
            .catch(err => {
                console.error(err);
            });
    }
};
</script>
