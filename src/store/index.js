import Vue from "vue";
import Vuex from "vuex";
import { HTTP } from "@/services/index";
import { login, register, resetPassword, logout } from "@/services/userService";
import { createNewCommunity, getUserCommunities } from "@/services/communityService";
import { CONFIG } from "@/config/config";
import Cookies from "js-cookie";

Vue.use(Vuex);

/**
 * Implementation of a Storage, to store session data in sessionStorage and backed by session cookies so it can be
 * shared with other instances.
 *
 * This combination is used instead of localStorage, so data can be shared between other tabs and also get cleared when
 * the user leaves the site.
 *
 * @type {Storage}
 */
const sharedStorage = {
    values: {},

    getItem: function (key) {
        let value = sessionStorage.getItem(key);
        if (value === null) {
            value = Cookies.get(`session-${key}`);
            if (value !== null && value !== undefined) {
                sessionStorage.setItem(key, value);
            }
        }
        return value;
    },

    setItem: function (key, value) {
        const changed = sessionStorage.getItem(key) !== value;
        Cookies.set(`session-${key}`, value, {expires: 1 / (24 * 60) * CONFIG.SESSION_DATA_EXPIRY});
        if (changed) {
            this.values[key] = value;
            sessionStorage.setItem(key, value);
            this.changed(key);
        }
    },

    removeItem: function (key) {
        const changed = !!sessionStorage.getItem(key);
        sessionStorage.removeItem(key);
        Cookies.remove(`session-${key}`);
        if (changed) {
            this.changed(key);
        }
    },

    clear() {
        Object.keys(this.values).forEach(key => Cookies.remove(`session-${key}`));
        sessionStorage.clear();
    },

    key(index) {
        return sessionStorage.key(index);
    },

    get length() {
        return sessionStorage.length;
    },

    /**
     * Called when a value has been changed. For interesting keys (like the token), an entry in localStorage is set to
     * other tabs can act upon the `storage` event.
     * @param {String} key The name of the key that was updated.
     */
    changed: function (key) {
        // For important fields, which can affect what the user can access, let the other tabs know about the change.
        if (["token", "userId", "role", "communityId"].includes(key)) {
            localStorage.setItem("reload", key);
            localStorage.removeItem("reload");
        }
    },

    /**
     * Continuously increase the expiry of the session cookies while the page is still open.
     */
    keepAlive: function () {
        Object.entries(this.values).forEach(([key, value]) => this.setItem(key, value));
        setTimeout(() => this.keepAlive(), 200000);
    }
};

sharedStorage.keepAlive();

// Refresh when some things have changed in another tab.
let updateRequired;
window.addEventListener("storage", (e) => {
    if (e.key === "reload" && e.newValue) {
        sessionStorage.removeItem(e.newValue);
        // Reload hidden tabs when they are visible again.
        if (document.visibilityState === "hidden") {
            updateRequired = true;
        } else {
            location.reload();
        }
    }
});

// When the tab becomes visible, reload the page if it's required.
window.addEventListener("visibilitychange", (e) => {
    if (updateRequired && document.visibilityState !== "hidden") {
        updateRequired = false;
        location.reload();
    }
});


export default new Vuex.Store({
    state: {
        status: "",
        token: sharedStorage.getItem("token") || "",
        userId: sharedStorage.getItem("userId") || "",
        communityId: sharedStorage.getItem("communityId") || "",
        role: sharedStorage.getItem("role") || "",
        email: sharedStorage.getItem("email") || "",
        user: {},
        community: {},
        errorMessage: {},
        unsavedChanges: false,
        unsavedBar: JSON.parse(sharedStorage.getItem("unsavedBar") || "null"),
        resetPasswordEmail: "",
        // The url the visitor used, before authenticating - redirect to this after login completes.
        beforeLoginPage: undefined,
        // The page which "/" redirects authenticated users to (when not the default)
        homePage: undefined,
        isMobile: false,
        forceFocusMode: false
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
            state.email = data.email;
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
        role(state, role) {
            state.role = role;
            sharedStorage.setItem("role", role);
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
        },
        isMobile(state, flag) {
            state.isMobile = flag;
        },
        forceFocusMode(state, flag) {
            state.forceFocusMode = flag;
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
        async login({ commit, dispatch, state }, user) {
            let userData;
            try {
                const resp = await login(user);
                userData = {
                    user: resp.data.user,
                    token: resp.data.token,
                    email: user.email
                };
            } catch (err) {
                commit("auth_error", err);
                sharedStorage.removeItem("token");
                throw err;
            }

            sharedStorage.setItem("token", userData.token);
            sharedStorage.setItem("userId", userData.user.id);
            sharedStorage.setItem("email", user.email);
            HTTP.defaults.headers.common.Authorization = `Bearer ${userData.token}`;

            commit("auth_success", userData);

            // Get the communities the user is part of (ignore the rejection, it's ok if not).
            await dispatch("userCommunities", state.userId).catch(e => undefined);

            return "/";
        },
        logout({ commit, state }) {
            return logout(state.userId).finally(() => {
                commit("logout");
                sharedStorage.removeItem("token");
                sharedStorage.removeItem("userId");
                sharedStorage.removeItem("communityId");
                sharedStorage.removeItem("role");
                sharedStorage.removeItem("email");
                delete HTTP.defaults.headers.common.Authorization;
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
        newCommunity({ commit, dispatch, state }, name) {
            return new Promise((resolve, reject) => {
                createNewCommunity(name)
                    .then(resp => {
                        const community = resp.data.community;
                        commit("new_community", community);
                        dispatch("userCommunities", state.userId).catch(e => undefined).then(resolve);
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
                            sharedStorage.setItem("communityId", communities[0].id);
                            commit("community", communities[0].id);
                            commit("role", communities[0].role);
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
                sharedStorage.setItem("communityId", communityId);
                commit("community", communityId);
                resolve();
            });
        },
        unsavedChanges({ commit }, isChanged) {
            commit("unsavedChanges", isChanged);
        },
        unsavedBar({ commit }, barDetails) {
            if (barDetails) {
                sharedStorage.setItem("unsavedBar", JSON.stringify(barDetails));
            } else {
                sharedStorage.removeItem("unsavedBar");
            }
            commit("unsavedBar", barDetails);
        },
        forceFocusMode({ commit }, flag) {
            if (flag) {
                sharedStorage.setItem("focusMode", true);
            } else {
                sharedStorage.removeItem("focusMode");
            }
            commit("forceFocusMode", !!flag);
        }
    },
    getters: {
        isLoggedIn: state => !!state.token,
        authStatus: state => state.status,
        userId: state => state.userId,
        email: state => state.email,
        communityId: state => state.communityId,
        role: state => state.role,
        isManager: state => state.role === "manager",
        hasAccount: state => !!state.communityId,
        unsavedChanges: state => state.unsavedChanges,
        /** @type {BarDetails} */
        unsavedBar: state => state.unsavedBar,
        resetPasswordEmail: state => state.resetPasswordEmail,
        beforeLoginPage: state => state.beforeLoginPage,
        homePage: state => state.homePage,
        isMobile: state => state.isMobile,
        forceFocusMode: state => state.forceFocusMode
    }
});
