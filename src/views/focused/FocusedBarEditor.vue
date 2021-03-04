<template>

  <div class="focusBarEditor">
    <h1>{{memberDetails.id ? "Bar for " + memberName : "Community bar: " + barDetails.name}}</h1>
    <b-link to="/focused/home" >Go back to community home</b-link>
    <br />
      <b-link v-if="$route.query.memberId" :to="{ path: '/focused/person', query: { memberId: memberId } }">
        <b-icon-person-circle></b-icon-person-circle>
        <span>
          Member Details
        </span>
      </b-link>
      <div v-else-if="getMembersCount() === 0">
        <b-icon-person-circle></b-icon-person-circle>
        <span>
          Unused Bar
        </span>
      </div>
      <b-link v-else :to="{ path: '/focused/people-using-bar', query: { barId: barDetails.id } }">>
        <b-icon-person-circle></b-icon-person-circle>
        <span>
          Members using this bar ({{ getMembersCount() }})
        </span>
      </b-link>
      <br/>
      <br/>

    <h2>Buttons on the Bar</h2>
    <ol class="barList">
      <li v-for="(item, index) in barDetails.items" :key="index">
        <bar-item-link show-button :bar-item="item" :ref="`button_${index}`"  />
        <!--
        <b-link :to="{ path: '/focused/button-edit', query: { barId: barDetails.id, buttonIndex: index, communityId: communityId, memberId: memberId } }">
          {{item.configuration.label}}
        </b-link>
        -->
      </li>
    </ol>

    <b-link :to="{ name: 'Focused: Button Catalog', query: { barId: barDetails.id, communityId: communityId, memberId: memberId } }" target="_self">
      Add a Button
    </b-link>
    <br>
    <!-- <b-link :to="{ name: 'Focused: Button Catalog' }">
      View the catalog of buttons available for the Morphic Bar
    </b-link> -->

    <div v-if="barDetails.errors && barDetails.errors.length > 0">
      <br/>
      <strong>This bar has the following issues:</strong>
      <ul>
        <li v-for="(error, id) in barDetails.errors" :key="id">
          <bar-item-link :bar-item="error.item"/>:
          {{ error.message }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss">
.focusBarEditor {
    a {
        color: #005BDF;
    }
}
.barList {
  li {
    vertical-align: middle;
    margin: 1em 0;
      a {
          color: #dddddd;
      }
  }
}

.focusMode .previewItem:focus {
  outline: black dotted 2px;
  box-shadow: 0 0 0 5px lawngreen;
}


</style>

<script>

import BarItemLink from "@/components/dashboardV2/BarItemLink";
import { getCommunityBars, deleteCommunityBar, getCommunity, getCommunityBar, updateCommunityBar, createCommunityBar, getCommunityMembers, getCommunityMember, updateCommunityMember } from "@/services/communityService";
import { colors, icons, MESSAGES } from "@/utils/constants";
import { predefinedBars } from "@/utils/predefined";
import * as Bar from "@/utils/bar";

export default {
    name: "FocusedBarEditor",
    components: {
        BarItemLink
    },
    methods: {
        getDrawerItems: function (items) {
            const data = [];
            if (items && items.length > 0) {
                for (let i = 0; i < items.length; i++) {
                    if (items[i].is_primary === false) {
                        const newItem = items[i];
                        newItem.id = this.generateId(newItem);
                        if (data.length >= this.preview.drawer.h) {
                            this.drawerItemsSecond.push(newItem);
                        } else {
                            data.push(newItem);
                        }
                    }
                }
            }
            this.drawerItems = data;
        },
        getPrimaryItems: function (items) {
            const data = [];
            if (items && items.length > 0) {
                for (let i = 0; i < items.length; i++) {
                    if (items[i].is_primary === true) {
                        const newItem = items[i];
                        newItem.id = this.generateId(newItem);
                        data.push(newItem);
                    }
                }
            }
            this.primaryItems = data;
        },
        addPersonalBar: function () {
            if (this.barDetails.is_shared) {
                this.onSave = true;

                this.barDetails.name = this.memberDetails.first_name;
                this.barDetails.is_shared = false;

                const data = this.barDetails;
                const drawerItems = this.drawerItems.concat(this.drawerItemsSecond);
                data.items = this.primaryItems.concat(drawerItems);

                createCommunityBar(this.communityId, data)
                    .then((resp) => {
                        if (resp.status === 200) {
                            this.memberDetails.bar_id = resp.data.bar.id;
                            updateCommunityMember(this.communityId, this.memberDetails.id, this.memberDetails)
                                .then((resp) => {
                                    if (resp.status === 200) {
                                        this.showMessage(MESSAGES.barAdded);
                                        this.isChanged = false;
                                        this.$router.push("/dashboard");
                                    }
                                })
                                .catch(err => {
                                    console.error(err);
                                });
                        }
                    })
                    .catch(err => {
                        console.error(err);
                    });
            } else {
                this.saveBar();
            }
        },
        addBar: function () {
            this.onSave = true;
            const data = this.barDetails;
            const drawerItems = this.drawerItems.concat(this.drawerItemsSecond);
            data.items = this.primaryItems.concat(drawerItems);

            createCommunityBar(this.communityId, data)
                .then((resp) => {
                    if (resp.status === 200) {
                        this.showMessage(MESSAGES.barAdded);
                        this.isChanged = false;
                        this.$router.push("/dashboard");
                    }
                })
                .catch(err => {
                    console.error(err);
                });
        },
        saveBar: function () {
            this.onSave = true;
            const data = this.barDetails;
            const drawerItems = this.drawerItems.concat(this.drawerItemsSecond);
            data.items = this.primaryItems.concat(drawerItems);

            // Set the image_path for the items, for images which the client does not have locally.
            data.items.forEach(item => {
                item.configuration.image_path = this.getIconUrl(item.configuration.image_url);
            });

            updateCommunityBar(this.communityId, this.$route.query.barId, data)
                .then((resp) => {
                    if (resp.status === 200) {
                        this.showMessage(MESSAGES.barUpdated);
                        this.isChanged = false;
                        this.$router.push("/dashboard");
                    }
                })
                .catch(err => {
                    console.error(err);
                });
        },
        deleteBar: function () {
            deleteCommunityBar(this.communityId, this.$route.query.barId)
                .then((resp) => {
                    if (resp.status === 200) {
                        this.showMessage(MESSAGES.successfulBarDelete);
                        this.$router.push("/dashboard");
                    }
                })
                .catch(err => {
                    console.error(err);
                });
        },
        addToBarOrDrawer: function (isPrimary) {
            this.clearPredefinedActive();
            if (this.buttonStorage) {
                // setting the primary attribute based on which bar it's added to
                this.buttonStorage.is_primary = isPrimary;
                // checking if this button already exists
                if (this.barDetails.items.length > 0) {
                    let existingIndex = -1;
                    for (let i = 0; i < this.barDetails.items.length; i++) {
                        if (this.barDetails.items[i].configuration.label === this.buttonStorage.configuration.label) {
                            existingIndex = i;
                        }
                    }
                    if (existingIndex !== -1) {
                        // removing the old version
                        this.barDetails.items.splice(existingIndex, 1);
                    }
                }
                // adding the item
                this.barDetails.items.push(this.buttonStorage);
                // cleaning up the storage
                this.buttonStorage = {};
            }
            this.isChanged = true;
            this.addToBar = false;
            this.addToDrawer = false;
        },
        getButtonIndex: function (item) {
            return this.barDetails.items.findIndex(i => i.id === item.id);
        },
        findButtonByLabel: function (item) {
            const data = {
                index: -1,
                drawerSecond: false
            };
            if (item.is_primary) {
                for (let i = 0; i < this.primaryItems.length; i++) {
                    if (this.primaryItems[i].configuration.label === item.configuration.label) {
                        data.index = i;
                    }
                }
            } else {
                if (this.drawerSecondColumn) {
                    for (let i = 0; i < this.drawerItemsSecond.length; i++) {
                        if (this.drawerItemsSecond[i].configuration.label === item.configuration.label) {
                            data.index = i;
                            data.drawerSecond = true;
                        }
                    }
                }
                for (let i = 0; i < this.drawerItems.length; i++) {
                    if (this.drawerItems[i].configuration.label === item.configuration.label) {
                        data.index = i;
                    }
                }
            }
            return data;
        },
        buttonToRemove: function (item) {
            const foundItem = this.findButtonByLabel(item);
            if (foundItem.index !== -1) {
                if (item.is_primary) {
                    this.primaryItems.splice(foundItem.index, 1);
                } else {
                    if (foundItem.drawerSecond) {
                        this.drawerItemsSecond.splice(foundItem.index, 1);
                    } else {
                        this.drawerItems.splice(foundItem.index, 1);
                    }
                }
                this.$bvModal.hide("modalEditGeneric");
                this.isChanged = true;
            }
        },
        buttonToEdit: function (item) {
            const foundItem = this.findButtonByLabel(item);
            if (foundItem.index !== -1) {
                if (item.is_primary) {
                    this.buttonEditStorage = this.primaryItems[foundItem.index];
                } else {
                    if (foundItem.drawerSecond) {
                        this.buttonEditStorage = this.drawerItemsSecond[foundItem.index];
                    } else {
                        this.buttonEditStorage = this.drawerItems[foundItem.index];
                    }
                }
                this.$bvModal.show("modalEditGeneric");
            }
        },
        refreshButton: function (updated) {
            // updating the data in a button (on edit)
            this.editDialogDetails = false;
            if (updated) {
                this.isChanged = true;
            }
        },
        editChangeColor: function (hex) {
            this.buttonEditStorage.configuration.color = hex;
        },
        editChangeIcon: function (icon) {
            this.buttonEditStorage.configuration.image_url = icon;
        },
        getMembersCount: function () {
            if (this.members && this.members.length > 0) {
                return this.members.length;
            }
            return 0;
        },
        getPrimaryButtonsCount: function () {
            return this.primaryItems.length;
        },
        getDrawerButtonsCount: function () {
            return this.drawerItems.length;
        },
        loadBarMembers: function () {
            getCommunityBars(this.communityId)
                .then(resp => {
                    const barsData = resp.data.bars;
                    getCommunityMembers(this.communityId)
                        .then((resp) => {
                            this.barsList = barsData;
                            this.membersList = resp.data.members;
                            if (resp.data.members.length > 0) {
                                for (let i = 0; i < resp.data.members.length; i++) {
                                    if (this.$route.query.barId === resp.data.members[i].bar_id) {
                                        this.members.push(resp.data.members[i]);
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
        getBarRemoveValidity: function () {
            if (this.barDetails.name !== "Default" && this.getMembersCount() === 0) {
                return true;
            }
            return false;
        },
        loadMemberData: function () {
            getCommunityMember(this.communityId, this.memberId)
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
        }
    },
    computed: {
        memberName: function () {
            // concat first/lastname and trim
            const name = this.memberDetails ? `${this.memberDetails.first_name} ${this.memberDetails.last_name}`.trim() : "";
            // uppercase first letter and return
            return name.charAt(0).toUpperCase() + name.slice(1);
        },
        activeButtons: function () {
            let activeButtons = [];
            activeButtons = this.primaryItems.concat(this.drawerItems, this.drawerItemsSecond);
            return activeButtons;
        },
        drawerSecondColumn: function () {
            if (this.drawerItems.length >= this.preview.drawer.h || this.drawerItemsSecond.length > 0) {
                return true;
            } else {
                return false;
            }
        }
    },
    mounted() {
        if (this.$route.query.barId === "new") {
            this.newBar = true;
            this.barDetails = this.newBarDetails;
        } else if (this.$route.query.barId.indexOf("predefined") !== -1) {
            for (let i = 0; i < this.predefinedBars.length; i++) {
                if (this.predefinedBars[i].id === this.$route.query.barId) {
                    this.newBar = true;
                    this.barDetails = this.newBarDetails;
                    this.barDetails.items = this.predefinedBars[i].items;
                }
            }
        } else {
            const barId = this.$route.query.barId;
            const unsavedBar = this.$store.getters.unsavedBar;
            if (unsavedBar && unsavedBar.id === barId) {
                this.barDetails = unsavedBar;
            } else {
                getCommunityBar(this.communityId, barId)
                    .then(resp => {
                        this.barDetails = resp.data;
                    })
                    .catch(err => {
                        console.error(err);
                    });
            }
        }
        if (this.$route.query.memberId) {
            this.memberId = this.$route.query.memberId;
            this.loadMemberData();
        }
        this.loadBarMembers();
        this.getCommunityData();
    },
    watch: {
        "barDetails.items": function (newValue, oldValue) {
            if (!this.onSave) {
                this.getDrawerItems(newValue);
                this.getPrimaryItems(newValue);
            }
            Bar.checkBar(this.barDetails);

            // Focus the first button when it's rendered.
            setTimeout(() => {
                var firstButton = this.$refs.button_0;
                if (firstButton && firstButton.length) {
                    firstButton[0].$el.focus();
                }
            }, 500);
        },
        primaryItems: function (newValue, oldValue) {
            if (oldValue.length === 0 && !this.initialChangesPrimaryItems) {
                this.initialChangesPrimaryItems = true;
            } else if (this.initialChangesPrimaryItems && oldValue.length !== newValue.length) {
                this.isChanged = true;
            }
            let item = {};
            if (newValue && newValue.length > 0) {
                for (let i = 0; i < newValue.length; i++) {
                    if (newValue[i].is_primary === false) {
                        item = newValue[i];
                        item.is_primary = true;
                    }
                    if (i >= this.preview.bar.h) {
                        this.drawerItems.push(this.primaryItems[i]);
                        this.primaryItems.splice(i, 1);
                        this.openDrawer = true;
                    }
                }
            }
        },
        drawerItems: function (newValue, oldValue) {
            if (oldValue.length === 0 && !this.initialChangesDrawerItems) {
                this.initialChangesDrawerItems = true;
            } else if (this.initialChangesDrawerItems && oldValue.length !== newValue.length) {
                this.isChanged = true;
            }
            let item = {};
            if (newValue && newValue.length > 0) {
                for (let i = 0; i < newValue.length; i++) {
                    if (newValue[i].is_primary === true) {
                        item = newValue[i];
                        item.is_primary = false;
                    }
                    if (i >= this.preview.drawer.h) {
                        this.drawerItemsSecond.push(this.drawerItems[i]);
                        this.drawerItems.splice(i, 1);
                    }
                }
            }
        },
        drawerItemsSecond: function (newValue, oldValue) {
            if (oldValue.length !== newValue.length) {
                this.isChanged = true;
            }
            let item = {};
            if (newValue && newValue.length > 0) {
                for (let i = 0; i < newValue.length; i++) {
                    if (newValue[i].is_primary === true) {
                        item = newValue[i];
                        item.is_primary = false;
                    }
                }
            }
        },
        isChanged: function () {
            this.$store.dispatch("unsavedChanges", this.isChanged);
            this.$store.dispatch("unsavedBar", this.isChanged && this.barDetails);
        },
        "$route.query": function () {
            this.initialChangesPrimaryItems = false;
            this.initialChangesDrawerItems = false;
            if (this.$route.query.memberId) {
                this.memberId = this.$route.query.memberId;
                this.loadMemberData();
            }
            getCommunityBar(this.communityId, this.$route.query.barId)
                .then(resp => {
                    this.barDetails = resp.data;
                    this.members = [];
                    this.loadBarMembers();
                    this.getCommunityData();
                })
                .catch(err => {
                    console.error(err);
                });
        }
    },
    beforeRouteUpdate(to, from, next) {
        if (this.isChanged) {
            const confirm = window.confirm(this.leavePageMessage);
            if (confirm) {
                this.isChanged = false;
                next();
            } else {
                next(false);
            }
        } else {
            next();
        }
    },
    beforeRouteLeave(to, from, next) {
        if (this.isChanged) {
            const confirm = window.confirm(this.leavePageMessage);
            if (confirm) {
                next();
            } else {
                next(false);
            }
        } else {
            next();
        }
    },
    data() {
        return {
            // messages
            leavePageMessage: MESSAGES.leavePageAlert,

            memberId: undefined,
            // flags
            addToBar: false,
            addToDrawer: false,
            newBar: false,
            openDrawer: false,
            editDialogDetails: false,
            tab: 0,
            dragFromEditor: false,
            isChanged: false,
            editBarName: false,
            onSave: false,
            initialChangesPrimaryItems: false,
            initialChangesDrawerItems: false,
            // data for the community manager
            community: {},
            barsList: [],
            membersList: [],

            // storage
            buttonStorage: {},
            buttonEditStorage: {
                configuration: {
                    label: "",
                    color: "",
                    image_url: ""
                },
                data: {}
            },
            /** @type {BarDetails} */
            barDetails: {},
            members: [],
            memberDetails: {},
            drawerItems: [],
            drawerItemsSecond: [],
            primaryItems: [],

            // configurations
            preview: {
                drawer: {
                    w: 2,
                    h: 6
                },
                bar: {
                    h: 6
                }
            },
            newBarDetails: {
                name: "New Bar",
                is_shared: false,
                items: []
            },
            bar: {
                settings: {
                    barOnRight: true,
                    cannotClose: false,
                    startsOpen: false
                }
            },
            predefinedBars: predefinedBars,
            colors: colors,
            icons: icons
        };
    }
};
</script>
