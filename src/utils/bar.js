import * as params from "./params.js";

/** @type {Object<GUID, BarDetails>} */
const bars = {};

/**
 * Gets the bar that a given item belongs to.
 * @param {BarItem} barItem The bar item.
 * @return {BarDetails} The bar which the item belongs to.
 */
export function getItemBar(barItem) {
    return bars[barItem.barId];
}

/**
 * Gets the index of a bar item in a bar.
 * @param {BarItem} barItem The item to add (either from the catalog, or the service.
 * @param {BarDetails} [bar] The bar.
 * @return {Number} The index of the bar item.
 */
export function getItemIndex(barItem, bar) {
    return (bar || getItemBar(barItem)).items.findIndex(item => item.id === barItem.id);
}

/**
 * Generates an ID for a button.
 * @param {BarItem} item The button.
 * @return {String} The ID.
 */
export function generateId(item) {
    let id = "";
    if (item) {
        id += item.barId ? item.barId.substr(0, 8) : "";
        id += "-" + item.data.buttonKey;
        id += "-" + item.configuration.label;
        id += "-" + Math.floor(Math.random() * 10e10);
    }
    return id.toLowerCase().replace(/[^a-z0-9_-]/gi, "");
};

/**
 * Add an item to a bar.
 *
 * @param {BarDetails} bar The bar.
 * @param {BarItem} sourceItem The item to add (either from the catalog, or the service.
 * @param {Number} [index] The position to insert the item. [default: at the end]
 * @return {BarItem} The new item added (a modified copy of `barItem`).
 */
export function addItem(bar, sourceItem, index) {
    /** @type {BarItem} */
    const barItem = JSON.parse(JSON.stringify(sourceItem));

    // The item refers to the bar by id, to avoid circular references in the object.
    bars[bar.id] = bar;
    barItem.barId = bar.id;

    if (!barItem.id || barItem.id.startsWith("catalog_")) {
        barItem.id = generateId(barItem);
    }
    delete barItem.data.catalogItem;
    delete barItem.data.catalogLabel;


    if (index === undefined) {
        bar.items.push(barItem);
    } else if (index >= 0) {
        bar.items.splice(index, 0, barItem);
    }

    if (!barItem.data.parameters) {
        params.prepareBarItem(barItem);
        params.setInitial(barItem);
    }

    return barItem;
}

/**
 * Removes an item from its bar.
 * @param {BarItem} barItem The bar item to remove.
 * @param {BarDetails} [bar] The bar.
 */
export function removeItem(barItem, bar = getItemBar(barItem)) {
    bar.items = bar.items.filter(x => x.id !== barItem.id);
}

/**
 * Checks a bar for problems.
 * @param {BarDetails} bar The bar.
 * @return {Boolean} true if the bar has no problems.
 */
export function checkBar(bar) {

    if (!bar || !bar.items) {
        return;
    }

    /** @type {BarError[]} */
    const errors = [];

    // Check for duplicate items.
    errors.push.apply(errors, checkDuplicates(bar));

    bar.items.forEach((item) => {
        errors.push.apply(errors, getItemErrors(item));
    });

    errors.forEach(err => {
        err.key = `${err.item.id}-${err.type}-${err.message}`;
    });

    bar.errors = errors;
    return errors.length === 0;
}

/**
 * Gets the errors of a bar item.
 * @param {BarItem} item The item.
 * @return {BarError[]} The errors.
 */
export function getItemErrors(item) {
    /** @type {BarError[]} */
    const errors = [];

    // Validation
    const errorMessage = params.getValidationError(item);
    if (errorMessage) {
        errors.push({
            item: item,
            type: "validation",
            message: errorMessage
        });
    }

    // Problems
    /** @type {ItemProblem[]} */
    const problems = item.data.problems && Object.values(item.data.problems);
    if (problems) {
        problems.forEach(problem => {
            if (problem.isProblem) {
                errors.push({
                    item: item,
                    type: problem.checkKey,
                    message: problem.alert || problem.message,
                    details: problem.alert && problem.message
                });
            }
        });
    }

    return errors;
}

/**
 * Checks a bar for duplicate items.
 * @param {BarDetails} bar The bar.
 * @return {Array<BarError>} The list of errors.
 */
function checkDuplicates(bar) {

    /** @type {Array<BarError>} */
    const errors = [];

    bar.items.forEach(item => delete item.configuration.duplicates);

    const max = bar.items.length - 1;
    for (let outerIndex = 0; outerIndex <= max; outerIndex++) {
        const a = bar.items[outerIndex];
        const dups = [];

        for (let innerIndex = outerIndex + 1; innerIndex <= max; innerIndex++) {
            const b = bar.items[innerIndex];
            if (itemSimilar(a, b)) {
                dups.push(b);
            }
        }

        if (dups.length > 0) {
            errors.push({
                item: a,
                duplicates: dups,
                type: "duplicate",
                level: "warn",
                message: "Duplicated action."
            });
        }

    }

    return errors;
};

/**
 * Checks if two items are similar.
 * @param {BarItem} a A bar item.
 * @param {BarItem} b Another bar item.
 * @return {Boolean} true if both bars have the same action.
 */
function itemSimilar(a, b) {
    var similar = false;
    if (a.kind === b.kind) {
        switch (a.kind) {
        case "link":
            similar = a.configuration.url === b.configuration.url;
            break;
        case "application":
            similar = a.configuration.exe && a.configuration.exe === b.configuration.exe;
            similar = similar || (a.configuration.default && a.configuration.default === b.configuration.default);
            break;
        case "action":
            similar = a.configuration.identifier === b.configuration.identifier;
            break;
        }
    }

    return similar;
};

/**
 * Gets the route to edit a community bar.
 * @param {BarDetails} bar The bar.
 * @param {Boolean} [focused] If true, link to the focused editor.
 * @return {Object} A location descriptor object to the bar editor.
 */
export function getBarEditRoute(bar, focused) {
    return {
        name: focused ? "Focused: Bar Editor" : "MorphicBar Editor",
        query: {
            barId: bar.id
        }
    };
}

/**
 * Gets the route to edit a user's bar.
 * @param {CommunityMember} member The member who the bar belongs to, if editing a user-specific bar.
 * @param {GUID} defaultBarId The default community bar if the member does not have their own bar.
 * @param {Boolean} [focused] If true, link to the focused editor.
 * @return {Object} A location descriptor object to the bar editor.
 */
export function getUserBarEditRoute(member, defaultBarId, focused) {
    return {
        name: focused ? "Focused: Bar Editor" : "MorphicBar Editor",
        query: {
            barId: member.bar_id || defaultBarId,
            memberId: member.id
        }
    };
}
