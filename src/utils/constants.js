import { CONFIG } from "@/config/config";
import { allButtons as allButtonsSrc } from "./allButtons.js";
import { allIcons as allIconsSrc } from "./allIcons.js";
import * as params from "./params.js";
import * as Bar from "./bar.js";

export const API_URL = CONFIG.API_URL;
export const ERROR_MAP = {
    1: "Incorrect username or password!",
    2: "That email address already exists!",
    3: "Username already exists!",
    404: "Cannot connect to the server right now! Please try again in couple of minutes.",
    500: "Network error, cannot connect to the server! Please check your internet connection."
};
export const MESSAGES = {
    successfulRegistration: "Registration completed successfully",
    successfulReset: "Reset password successful",
    emailValidationError: "This is a required field and must be a valid email address.",
    successfulSave: "Successfully saved",
    barUpdated: "Bar successfully saved.",
    barAdded: "Bar successfully added.",
    sessionTimedOut: "Your session was expired. Please login again.",
    leavePageAlert: "Do you really want to leave? You have unsaved changes!",
    logoutAlert: "Please save, or discard your chances before logging out!",
    successfulRoleChange: "Member role changed successfully",
    successfulMemberDelete: "Member deleted successfully.",
    successfulBarDelete: "Bar successfully deleted."
};

export const colors = {
    teal: "#006770",
    blue: "#002957",
    purple: "#662261",
    red: "#8c191b",
    green: "#46622d",
    orange: "#a33e1f",
    default_button: "rgb(0, 47, 87)"
};


export const defaultApps = {
    calendar: {
        title: "Default Calendar App",
        configuration: {
            label: "Calendar",
            default: "calendar"
        }
    },
    email: {
        title: "Default Email Client",
        configuration: {
            label: "Email",
            default: "email"
        }
    },
    browser: {
        title: "Default Browser",
        configuration: {
            image_url: "globe",
            label: "Web Browser",
            default: "browser",
            exe$win: "http:"
        }
    }
};

for (const [key, app] of Object.entries(defaultApps)) {
    params.allParameters.defaultApp.selectOptions.push({
        value: key,
        text: app.title
    });
};

/**
 * All icons. Map of iconKey => file
 * @type {Object<String,String>}
 */
export const icons = {};

/**
 * Icons which apply to specific sub-kinds.
 * Map of subkind => array of iconKeys.
 * @type {Object<String,Array<String>>}
 */
export const groupedIcons = {};
groupedIcons.make = [];
Object.keys(allIconsSrc).forEach(iconId => {
    var filename = allIconsSrc[iconId];
    icons[iconId] = filename;

    const isSubKind = iconId.includes("$");
    const isGeneric = !isSubKind && !filename.startsWith("logo_");

    const group = isGeneric
        ? "generic"
        : (isSubKind && iconId.split("$", 2)[0]);

    if (group) {
        if (groupedIcons[group]) {
            groupedIcons[group].push(iconId);
        } else {
            groupedIcons[group] = [iconId];
        }

        // Add all icons to the generic buttons
        groupedIcons.make.push(iconId);
    }
});


/**
 * All defined buttons.
 * @type {Object<String,BarItem>}
 */
export const allButtons = allButtonsSrc;

/**
 * The default icon for each button.
 * @type {Object<String,String>}
 */
export const defaultIcons = {

};

/**
 * Buttons grouped by their subkind.
 * @type {Object<String,Array<BarItem>>}
 */
export const groupedButtons = {};

/**
 * @type {ButtonCatalog} The button catalog.
 */
export const buttonCatalog = {
    make: {
        title: "Make a button",
        editTitle: "Custom Button",
        defaultIcon: undefined,
        related: false
    },
    call: {
        title: "Call a Person",
        editTitle: undefined,
        editGroupTab: "Call Apps",
        editItemField: "Call via",
        defaultIcon: undefined,
        items: ["skype_app"]
    },
    meeting: {
        title: "Meeting Room",
        editTitle: "Meeting App",
        defaultIcon: "comments"
    },
    action: {
        title: "Action Buttons",
        editTitle: "Action Button",
        defaultIcon: undefined
    },
    "local-calendar": {
        title: "Calendar - App on Computer",
        editTitle: "Calendar App",
        defaultIcon: "calendar$calendar"
    },
    calendar: {
        title: "Calendar - Website",
        editTitle: "Calendar Website",
        defaultIcon: "calendar$calendar",
        more: {
            description: "Create a button to open a calendar site"
        }
    },
    socialMedia: {
        title: "Social Media Sites",
        editTitle: "Social Media Site",
        defaultIcon: undefined,
        more: {
            description: "Create a button to open a social media site"
        }
    },
    "local-email": {
        title: "Email - App on Computer",
        editTitle: "Email App",
        defaultIcon: undefined
    },
    email: {
        title: "Email - Websites",
        editTitle: "Email Website",
        defaultIcon: "email$envelope",
        more: {
            description: "Create a button to open an email site"
        }
    },
    photo: {
        title: "Photo Sharing",
        editTitle: "Photo Sharing Site",
        defaultIcon: undefined,
        more: {
            description: "Create a button to open a photo sharing site"
        }
    },
    news: {
        title: "News",
        editTitle: "News Site",
        defaultIcon: "newspaper",
        more: {
            description: "Create a button to open a news web-site"
        }
    },
    shopping: {
        title: "Shopping",
        editTitle: "Shopping Site",
        defaultIcon: undefined,
        more: {
            description: "Create a button to open a shopping site"
        }
    },
    multimedia: {
        title: "Media",
        editTitle: "Media Site",
        defaultIcon: undefined,
        more: {
            description: "Create a button to open a media site"
        }
    },
    onlineFileDrives: {
        title: "Online Drives",
        editTitle: "Online Drive",
        defaultIcon: undefined,
        more: {
            description: "Create a button to open an online drive site"
        }
    },
    app: {
        title: "Local Apps",
        hidden: true,
        editTitle: "Start an Application",
        editItemField: "App",
        editGroupTab: "Apps"
    }
};

// Create some buttons for the default apps.
Object.keys(defaultApps).forEach((appKey) => {
    const app = defaultApps[appKey];

    /** @type {BarItem} */
    const button = {
        kind: "application",
        configuration: {
            subkind: "app",
            label: app.title,
            description: `Starts the ${app.title}`
        },
        data: {
            catalogLabel: app.title
        }
    };

    Object.assign(button.configuration, app.configuration);

    if (!button.configuration.image_url) {
        const group = button.data.group || appKey || button.configuration.subkind;
        button.configuration.image_url = buttonCatalog[group] && buttonCatalog[group].defaultIcon;
    }

    allButtons[`default-${appKey}`] = button;
});

/** Gets the host part of a URL */
const getHost = /.*:\/\/([^/:]+)/;

Object.keys(allButtons).forEach((buttonKey) => {
    const button = allButtons[buttonKey];

    if (!button.data) {
        button.data = {};
    }
    button.data.buttonKey = buttonKey;
    button.id = "catalog_" + Bar.generateId(button);

    // Fix the color
    if (!button.configuration.color || typeof(button.configuration.color) === "string") {
        button.configuration.color = colors[button.configuration.color || "blue"];
    }

    // Use the site's favicon if there's no local image.
    if (!button.configuration.image_url && button.configuration.url) {
        var m = getHost.exec(button.configuration.url);
        if (m) {
            button.configuration.image_url = `https://icons.duckduckgo.com/ip2/${m[1]}.ico`;
        }
    }

    if (!button.configuration.image_url) {
        button.configuration.image_url = buttonCatalog[button.configuration.subkind] && buttonCatalog[button.configuration.subkind].defaultIcon;
    }

    function toGroup(groupId) {
        if (groupedButtons[groupId]) {
            groupedButtons[groupId].push(button);
        } else {
            groupedButtons[groupId] = [button];
        }
    }

    toGroup(button.configuration.subkind);

    if (button.configuration.groups) {
        button.configuration.groups.forEach(toGroup);
        delete button.configuration.groups;
    }

    defaultIcons[buttonKey] = button.configuration.image_url;
    params.prepareBarItem(button);
});


/**
 * Gets the items for the given subkind
 * @param {String} subkind The subkind id (button.configuration.subkind).
 * @return {Object<String,BarItem>} The items for the subkind.
 */
function getGroupItems(subkind) {
    var result = {};

    // Get the items with the given subkind.
    /** @type {Array<BarItem>} */
    const values = groupedButtons[subkind] || [];

    // Also add the buttons that state this catalog.
    const catalogItems = Object.values(allButtons).filter(b => b.data.catalog === subkind);

    values.push(...catalogItems);


    values.forEach(b => {
        b.data.catalogItem = true;
        result[b.data.buttonKey] = b;
    });

    // If there aren't any primary buttons, make them all primary.
    const noPrimary = values.every(button => !button.is_primary);
    if (noPrimary) {
        values.forEach(button => { button.is_primary = true; });
    }

    // If there are some non-primary buttons, add a place-holder that expands the extra items.
    const hasSecondary = !noPrimary && values.some(button => !button.is_primary);
    if (hasSecondary) {
        /** @type {BarItem} */
        const placeHolder = {
            is_primary: true,
            configuration: {
                subkind: subkind,
                label: buttonCatalog[subkind].editTitle || buttonCatalog[subkind].title,
                image_url: buttonCatalog[subkind].defaultIcon
            },
            data: {
                isPlaceholder: true,
                isExpander: true
            }
        };
        buttonCatalog[subkind].more = Object.assign(placeHolder.configuration, buttonCatalog[subkind].more);
        placeHolder.id = Bar.generateId(placeHolder);
        result[`more-${subkind}`] = placeHolder;
    }

    return result;
}

Object.keys(buttonCatalog).forEach(key => {
    const group = buttonCatalog[key];
    group.items = getGroupItems(group.subkind || key);
    const expander = group.items[`more-${key}`];
    group.hasSecondary = !!expander;

    if (!group.editTitle) {
        group.editTitle = group.title;
    }
    if (!group.editItemField) {
        group.editItemField = group.editTitle;
    }
    if (!group.editGroupTab) {
        group.editGroupTab = (group.editItemField || group.editTitle) + "s";
    }

    if (expander) {
        expander.data.catalogLabel = group.expanderTitle || `Other ${group.editTitle}s...`;
    }

    // Get the kind of all items, if they're the same
    const values = Object.values(group.items);
    if (values.length > 0) {
        const kind = values[0].kind;
        if (values.every(button => button.kind === kind || button.data.isPlaceholder)) {
            group.kind = kind;
        }
    }

    if (!group.related && group.related !== false) {
        group.related = values.length > 1;
    }
});

// Distinguish buttons for an app and site of the same name.
/** @type {Array<BarItem>} */
const buttons = Object.values(allButtons);
const linkButtons = {};

buttons.filter(b => b.kind === "link")
    .forEach(button => {
        linkButtons[button.data.catalogLabel || button.configuration.label] = true;
    });

buttons.filter(b => b.kind === "application").forEach(button => {
    const label = button.data.catalogLabel || button.configuration.label;
    if (linkButtons[label]) {
        button.data.catalogLabel = label + " App";
    }
});
