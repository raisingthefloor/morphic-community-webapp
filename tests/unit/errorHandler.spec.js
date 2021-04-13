/**
 * Tests for /src/utils/errorHandler.js
 */
import { HTTP } from "@/services";
import * as errorHandler from "@/utils/errorHandler";
import i18n from "@/i18n/i18n";
import messages from "@/locales/en.json";


function wait(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

// Load the localisation
i18n.locale = "en";
i18n.setLocaleMessage(i18n.locale, messages);

describe("useErrorHandler tests", () => {

    if (HTTP.errorHandlerId !== undefined) {
        HTTP.interceptors.response.eject(HTTP.errorHandlerId);
        delete HTTP.errorHandlerId;
    }

    let errorMessage;
    let errorTitle;

    // The showError callback
    function showError(message, title) {
        console.log("got error", message, title);
        errorMessage = message;
        errorTitle = title;
    }

    test.each([false, true])("error handler (handleError=%p)", async (handleError) => {

        errorHandler.useErrorHandler(showError);

        expect(HTTP.errorHandlerId).not.toBeUndefined();

        errorMessage = "not called";
        errorTitle = "not called";

        // Make a bad request
        let responseError;
        await HTTP.get("fail://", {action: "bad request"}).catch(err => {
            responseError = err;
            err.handled = handleError;
        });

        // The error handler has a delay before it gets invoked - give it time.
        await wait(500);

        // Check that the error would have been shown.
        const expectedMessage = handleError ? "not called" : responseError.message;
        const expectedTitle = handleError ? "not called" : i18n.t("Errors.generic-title", {action: "bad request"});
        expect(errorMessage).toEqual(expectedMessage);
        expect(errorTitle).toEqual(expectedTitle);

    });
});

// Tests for getErrorMessage.
describe("getErrorMessage tests", () => {

    // name, input, expect
    const testCases = [
        ["userMessage field", {userMessage: "user message"}, "user message"],
        [
            "response.data.error field",
            {
                response: {
                    data: {
                        error: "invalid_credentials"
                    }
                }
            },
            i18n.t("Errors.invalid_credentials")
        ],
        [
            "response.statusCode field",
            {
                response: {
                    status: 404
                }
            },
            i18n.t("Errors.http.404")
        ],
        [
            "response.statusText field",
            {
                response: {
                    status: 9,
                    statusText: "status text error"
                }
            },
            i18n.t("Errors.generic-server-error", {message: "status text error (9)"})
        ],
        [
            "message field",
            {
                message: "message field error"
            },
            "message field error"
        ],
        [
            "nothing",
            {
            },
            "test error"
        ]
    ];

    test.each(testCases)("getErrorMessage (%p)", async (name, input, expected) => {

        // Create the error object
        const error = Object.assign(new Error("test error"), input);

        const message = errorHandler.getErrorMessage(error);

        expect(message).toEqual(expected);
    });
});
