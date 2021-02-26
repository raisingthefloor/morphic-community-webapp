
import { allButtons, buttonCatalog } from "@/utils/constants";

/**
 * @typedef {Object} SearchIndexEntry
 * @property {String} buttonKey Button identifier.
 * @property {Array<String>} text Search text, in order of priority.
 */

/**
 * @typedef {Object} SearchResult
 * @property {String} buttonKey Button identifier.
 * @property {Number} priority Lower for good matches.
 * @property {Number} order Lower for good matches.
 * @property {Array<String>} words The words in the query that match.
 */

/** @type {Array<SearchIndexEntry>} */
var searchIndex;

const commonText = /\b(the[ym]?|a|to|that|in|if|for)\b|^(opens the|allows you to)|(home page)$/gi;

/**
 * Creates the search index for the button catalog.
 * The index, `searchIndex`, is an array of objects containing the button's key, and some text to match against.
 *
 */
function createSearchIndex() {
    /** @type {SearchIndexEntry} */
    let entry;

    /**
     * Add some text to the search index.
     * @param {String} text The text.
     * @param {Number} level The priority level, for queries that match this (lower is better).
     * @param {Boolean} removeCommon Remove common words.
     * @param {Boolean} keepPunctuation Keep punctuation.
     */
    function addText(text, level = 0, removeCommon, keepPunctuation) {
        if (text) {
            let t = text.toLowerCase();

            if (!keepPunctuation) {
                t = t.replace(/[^a-z0-9\s]/g, " ");
            }

            if (removeCommon) {
                t = t.replace(commonText, "");
            }

            if (level === 0) {
                if (t.includes(" ")) {
                    t += t + " " + t.replace(/ /g, "");
                }
            }

            t = t.replace(/\s+/, " ");

            let all = entry.text[level];
            if (all) {
                all += " " + t;
            } else {
                all = t;
            }
            entry.text[level] = all;
        }
    }

    /** @type {Array<BarItem>} */
    const all = Object.values(allButtons);

    // Add buttons
    searchIndex = all.map(button => {
        entry = {
            buttonKey: button.data.buttonKey,
            text: []
        };

        // Button label
        addText(button.data.catalogLabel || button.configuration.label);
        // Description
        addText(button.configuration.description, 1, true);
        // URL
        if (button.configuration.url) {
            const url = button.configuration.url.replace(/^https?:\/\/|www\.|\b...?\b/g, " ", false);
            addText(url, 2);
        }
        // The button and subkind keys
        addText(button.data.buttonKey, 3);
        addText(button.configuration.subkind, 3);
        // The catalog
        const group = buttonCatalog[button.configuration.subkind];
        if (group) {
            addText(group.title, 4);

        }

        return entry;
    });

    // This didn't look good, when it was implemented.
    // // Add catalog groups
    // Object.entries(buttonCatalog).forEach(([key, group]) => {
    //     entry = {
    //         groupKey: key,
    //         text: []
    //     };
    //     addText(group.title);
    //     searchIndex.push(entry);
    // });
}

/**
 * Searches the button catalog.
 *
 * @param {Array<String>} query The search query - an array of words to search for.
 * @return {Array<SearchResult>} The results.
 */
export function catalogSearch(query) {
    if (!searchIndex) {
        createSearchIndex();
    }

    /** @type {Object<String,SearchResult>} */
    const results = {};
    query.filter(w => w.length > 0).forEach(queryWord => {
        const wordStart = new RegExp(`\\b${queryWord}`);
        const wordFull = new RegExp(`\\b${queryWord}\\b`);

        // Look in each index entry.
        searchIndex.forEach(entry => {
            // Look at the text in the index entry.
            entry.text.some((text, priority) => {
                const found = text.includes(queryWord);
                if (found) {
                    const key = entry.buttonKey || entry.groupKey;
                    let result = results[key];

                    // Results are better, if they match higher priority text.
                    let score = result ? result.score : (10 - priority) * 100;

                    // Extra points if the label starts with the word
                    if (priority === 0 && text.startsWith(queryWord)) {
                        score += 50;
                    }

                    // Bonus for matching the full word
                    if (wordFull.test(text)) {
                        score += 10;
                    }

                    // Points for matching the start of a word.
                    if (wordStart.test(text)) {
                        score += 5;
                    }

                    if (result) {
                        result.words.push(queryWord);
                        if (priority < result.priority) {
                            result.priority = priority;
                        }
                    } else {
                        result = (results[key] = {
                            buttonKey: entry.buttonKey,
                            groupKey: entry.groupKey,
                            priority: priority,
                            words: [queryWord]
                        });
                    }

                    result.score = score;
                    result.order = -result.score;
                }

                return found;
            });
        });
    });

    return Object.values(results);
}

