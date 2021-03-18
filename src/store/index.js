import Vue from "vue";
import Vuex from "vuex";
import { HTTP } from "@/services/index";
import { login, register, resetPassword } from "@/services/userService";
import { createNewCommunity, getUserCommunities } from "@/services/communityService";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        status: "",
        token: localStorage.getItem("token") || "",
        userId: localStorage.getItem("userId") || "",
        communityId: localStorage.getItem("communityId") || "",
        user: {},
        community: {},
        errorMessage: {},
        unsavedChanges: false,
        unsavedBar: JSON.parse(localStorage.getItem("unsavedBar") || "null"),
        resetPasswordEmail: "",
        // The url the visitor used, before authenticating - redirect to this after login completes.
        beforeLoginPage: undefined,
        // The page which "/" redirects authenticated users to (when not the default)
        homePage: undefined
    },
    mutations: {
        auth_request(state) {
            state.status = "pending";
        },
        auth_success(state, data) {
            state.status = "success";
            state.token = data.token;
            state.user = data.user;
            state.userId = data.user.id;
        },
        auth_error(state, error) {
            state.status = "authentication failed";
            state.status = error;
        },
        logout(state) {
            state.status = "";
            state.token = "";
            state.userId = "";
            state.communityId = "";
        },
        reset_password_email(state, email) {
            state.resetPasswordEmail = email;
        },
        reset_password(state) {
            state.status = "reset_password";
        },
        reset_password_error(state) {
            state.status = "reset_password_failed";
        },
        new_community(state, community) {
            state.status = "created_new_community";
            state.community = community;
        },
        community_error(state) {
            state.status = "create_new_community_failed";
        },
        community(state, communityId) {
            state.communityId = communityId;
        },
        unsavedChanges(state, isChanged) {
            state.unsavedChanges = isChanged;
        },
        unsavedBar(state, barDetails) {
            state.unsavedBar = barDetails;
        },
        beforeLoginPage(state, url) {
            state.beforeLoginPage = url;
        },
        homePage(state, url) {
            state.homePage = url;
        }
    },
    actions: {
        register({ commit }, user) {
            return new Promise((resolve, reject) => {
                commit("auth_request");
                register(user)
                    .then(resp => {
                        const data = {
                            user: resp.data.user
                        };
                        commit("auth_success", data);
                        resolve(resp);
                    })
                    .catch(err => {
                        commit("auth_error", err);
                        reject(err);
                    });
            });
        },
        login({ commit }, user) {
            return new Promise((resolve, reject) => {
                login(user)
                    .then(resp => {
                        const data = {
                            user: resp.data.user,
                            token: resp.data.token
                        };
                        localStorage.setItem("token", data.token);
                        localStorage.setItem("userId", data.user.id);
                        HTTP.defaults.headers.common.Authorization = `Bearer ${data.token}`;
                        commit("auth_success", data);
                        resolve("/");
                    })
                    .catch(err => {
                        commit("auth_error", err);
                        localStorage.removeItem("token");
                        reject(err);
                    });
            });
        },
        logout({ commit }) {
            return new Promise((resolve, reject) => {
                commit("logout");
                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                localStorage.removeItem("communityId");
                delete HTTP.defaults.headers.common.Authorization;
                window.location.href = "/#/session-timed-out/";
                resolve();
            });
        },
        resetPassword({ commit }, email) {
            return new Promise((resolve, reject) => {
                resetPassword(email)
                    .then(resp => {
                        commit("reset_password");
                        resolve();
                    })
                    .catch(err => {
                        commit("reset_password_error");
                        reject(err);
                    });
            });
        },
        newCommunity({ commit }, name) {
            return new Promise((resolve, reject) => {
                createNewCommunity(name)
                    .then(resp => {
                        const community = resp.data.community;
                        commit("new_community", community);
                        resolve();
                    })
                    .catch(err => {
                        commit("community_error");
                        reject(err);
                    });
            });
        },
        userCommunities({ commit }, userId) {
            return new Promise((resolve, reject) => {
                getUserCommunities(userId)
                    .then(resp => {
                        const communities = resp.data.communities;
                        if (communities.length !== 0) {
                            localStorage.setItem("communityId", communities[0].id);
                            commit("community", communities[0].id);
                            resolve(communities);
                        } else {
                            reject(new Error("User doesn't have communities."));
                        }
                    })
                    .catch(err => {
                        reject(err);
                    });
            });
        },
        activeCommunity({ commit }, communityId) {
            return new Promise((resolve, reject) => {
                localStorage.setItem("communityId", communityId);
                commit("community", communityId);
                resolve();
            });
        },
        unsavedChanges({ commit }, isChanged) {
            commit("unsavedChanges", isChanged);
        },
        unsavedBar({ commit }, barDetails) {
            if (barDetails) {
                localStorage.setItem("unsavedBar", JSON.stringify(barDetails));
            } else {
                localStorage.removeItem("unsavedBar");
            }
            commit("unsavedBar", barDetails);
        }
    },
    getters: {
        isLoggedIn: state => !!state.token,
        authStatus: state => state.status,
        userId: state => state.userId,
        communityId: state => state.communityId,
        unsavedChanges: state => state.unsavedChanges,
        /** @type {BarDetails} */
        unsavedBar: state => state.unsavedBar,
        resetPasswordEmail: state => state.resetPasswordEmail,
        beforeLoginPage: state => state.beforeLoginPage,
        homePage: state => state.homePage
    }
});
