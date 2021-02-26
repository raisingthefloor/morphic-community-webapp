<template>
  <div>
    <h1>Edit Button: {{ button.configuration && button.configuration.label}} </h1>
    <button @click="deleteButton" class="text-danger">Remove Button</button>
    <b-col lg="5">
     <b-form>

       <BarItemFields v-if="!!button" :bar-item="button"/>

       <!--
       <div v-for="(value, paramKey, index) in button.data.parameters"
            :key="paramKey"
            role="group" class="mb-3">
         <b-form-group :label="allParameters[paramKey].label"
                       :label-for="'barItem_' + paramKey"
                       :invalid-feedback="editValidation(paramKey)">
           <b-form-input :id="'barItem_' + paramKey"
                         :name="paramKey"
                         v-model="button.data.parameters[paramKey]"
                         :state="!editValidation(paramKey)"
                         :autofocus="!index"
                         v-bind="allParameters[paramKey].attrs"
           />
         </b-form-group>
       </div>
-->
        <!-- TODO CHANGE ICONS -->

        <b-form-group id="color" label="Color for button" label-for="button-color-input">
          <b-form-select id="button-color-input" v-model="button.configuration.color">
            <b-form-select-option v-for="(hex, name) in userFriendlyColors" :key="hex" :value="hex">{{name}}</b-form-select-option>
          </b-form-select>
        </b-form-group>

        <b-form-group id="position" label="Change position" label-for="button-position-input">
          <b-form-select id="button-position-input" v-model="newButtonIndex">
            <b-form-select-option v-for="(text, index) in availablePositions" :key="index" :value="index">{{text}}</b-form-select-option>
          </b-form-select>
        </b-form-group>

     </b-form>
    </b-col>

    <b-link :to="{ path: '/focused/bar-editor', query: { barId: barId } }">
      Cancel
    </b-link>
    <button @click="save">Save</button>
  </div>
</template>

<style lang="scss">
</style>

<script>

import { getCommunityBar, saveCommunityBar, getCommunityMember, createCommunityBar, updateCommunityMember } from "@/services/communityService";
import { colors } from "@/utils/constants";
import * as params from "@/utils/params";
import BarItemFields from "@/components/dashboardV2/BarItemFields";

export default {
    name: "MemberInvite",
    components: {
        BarItemFields
    },
    methods: {
        setAvailablePositions: function () {
            this.availablePositions = {};
            for (let i = 0; i < this.barDetails.items.length; i++) {
                this.availablePositions[i] = `Button position ${i + 1} of ${this.barDetails.items.length}`;
            }
        },
        save: function () {
            // udpate position if it has changed:
            if (this.buttonIndex !== this.newButtonIndex) {
                // delete old
                this.barDetails.items.splice(this.buttonIndex, 1);
                // insert new
                this.barDetails.items.splice(this.newButtonIndex, 0, this.button);
            }
            this.checkBarTypeAndSave();
        },
        deleteButton: function () {
            this.barDetails.items.splice(this.buttonIndex, 1);
            this.checkBarTypeAndSave();
        },
        checkBarTypeAndSave() {
            // if we're editing a member's bar and it was previously a community bar:
            if (this.memberId && this.barDetails.is_shared) {
                this.saveAsNewPersonalBar();
            } else {
                this.saveBar();
            }
        },
        saveAsNewPersonalBar: function () {
            this.barDetails.name = `${this.memberDetails.first_name} ${this.memberDetails.last_name}`.trim();
            this.barDetails.is_shared = false;
            delete this.barDetails.id;
            createCommunityBar(this.communityId, this.barDetails).then((resp) => {
                if (resp.status === 200) {
                    this.memberDetails.bar_id = resp.data.bar.id;
                    updateCommunityMember(this.communityId, this.memberDetails.id, this.memberDetails)
                        .then((resp) => {
                            if (resp.status === 200) {
                                this.navigateBack();
                            }
                        })
                        .catch(err => { // failed to update member
                            console.error(err);
                        });
                }
            }).catch(err => { // failed to create a community
                console.error(err);
            });
        },
        saveBar: function () {
            saveCommunityBar(this.communityId, this.barId, this.barDetails)
                .then(() => {
                    this.navigateBack();
                })
                .catch(err => {
                    console.error(err);
                });
        },
        navigateBack: function () {
            this.$router.push({ path: "/focused/bar-editor", query: { barId: this.barId, memberId: this.memberId } });
        },
        /**
         * Validate a parameter field in the button edit dialog.
         * @param {String} paramKey The parameter key.
         * @return {String} The validation error message (or null if valid)
         */
        editValidation: function (paramKey) {
            return params.getValidationError(this.button, paramKey);
        }
    },
    computed: {
        userFriendlyColors: function () {
            const newMap = {};
            for (const name in this.colors) {
                if (name === "default_button") {
                    newMap.Default = this.colors[name];
                } else { // uppercase first letter
                    const newKey = name.charAt(0).toUpperCase() + name.slice(1);
                    newMap[newKey] = this.colors[name];
                }
            }
            return newMap;
        }
    },
    mounted() {
        this.barId = this.$route.query.barId;
        this.buttonIndex = this.$route.query.buttonIndex;
        this.buttonId = this.$route.query.buttonId;
        this.newButtonIndex = this.buttonIndex;
        this.communityId = this.$route.query.communityId;
        this.memberId = this.$route.query.memberId;

        const unsavedBar = this.$store.getters.unsavedBar;
        const loaded = (barDetails) => {
            this.barDetails = barDetails;
            // find button:
            if (this.buttonId) {
                this.buttonIndex = this.barDetails.items.findIndex(item => item.id === this.buttonId);
            }
            this.button = this.barDetails.items[this.buttonIndex];
            this.buttonId = this.button.id;
            this.setAvailablePositions();
        };

        if (unsavedBar && unsavedBar.id === this.barId) {
            loaded(unsavedBar);
        } else {
            // load bar and content (incl. button)
            getCommunityBar(this.communityId, this.barId).then(b => {
                loaded(b.data);
            });
        }
        // load member if set:
        if (this.memberId) {
            getCommunityMember(this.communityId, this.memberId)
                .then((resp) => {
                    this.memberDetails = resp.data;
                })
                .catch(err => {
                    console.error(err);
                });
        }
    },
    watch: {
        button: {
            handler: function (newValue, oldValue) {
                params.applyParameters(this.button);
            },
            deep: true
        }
    },
    data() {
        return {
            /** @type {BarDetails} */
            barDetails: {},
            barId: undefined,
            buttonIndex: undefined,
            buttonId: undefined,
            communityId: undefined,
            memberId: undefined,
            memberDetails: undefined,
            originalButton: undefined,
            newButtonIndex: undefined,
            /** @type {BarItem} */
            button: {
                /** @type {BarItemConfiguration} */
                configuration: {},
                /** @type {BarItemData} */
                data: {}
            },
            colors: colors,
            availablePositions: {},
            allParameters: params.allParameters
        };
    }
};
</script>
