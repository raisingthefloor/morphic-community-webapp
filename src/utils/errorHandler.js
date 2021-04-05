import { HTTP } from "@/services";
import i18n from "@/i18n/i18n";

/**
 * @callback ShowErrorFunc
 * @param {String} message The message.
 * @param {String} title The message title.
 */

/**
 * @typedef {Object} ErrorMessage
 * @property {String} message The main message.
 * @property {String} title A title for the message.
 */

/**
 * Hook into the HTTP class to display generic error messages on failures.
 * @param {ShowErrorFunc} showError The callback to present an error message.
 */
export function useErrorHandler(showError) {
    HTTP.errorHandlerId = HTTP.interceptors.response.use(undefined, (err) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!err.handled) {
                    const errorMessage = getErrorMessage(err, true);
                    showError(errorMessage.message, errorMessage.title);
                }
            }, 100);
            throw err;
        });
    });
};



/**
 * Gets a message for the user from an Error object.
 *
 * The message is based from one of the following fields in the Error object, in priority:
 * - err.userMessage
 * - err.response.data.error: an error code form the service, which is localised.
 * - err.response.statusCode: localised generic message based on the HTTP status code
 * - err.response.status
 * - err.message
 * - A generic message.
 *
 * @param {Error} err The error.
 * @param {Boolean} includeTitle Also include the title (returns an {ErrorMessage} object).
 * @return {String|ErrorMessage} The error message.
 */
export function getErrorMessage(err, includeTitle) {
    /** @type {ErrorMessage} */
    const togo = {};

    if (includeTitle) {
        const action = err.config?.action || i18n.t("Errors.generic-action");
        togo.title = i18n.t("Errors.generic-title", {action: action});
    }

    const errorCode = err.response?.status || err.code;

    if (err.userMessage) {
        // A message has been explicitly defined.
        togo.message = err.userMessage;
    } else if (err.response) {
        // Use the error code from the response
        const responseError = err.response?.data?.error;
        if (responseError) {
            togo.message = i18n.t(`Errors.${responseError}`, {errorCode: responseError});
        } else {
            // Use the http status code to create an error message.
            const statusMessageKey = `Errors.http.${err.response.status}`;
            togo.message = i18n.t(statusMessageKey, {errorCode: errorCode});
            if (!togo.message || togo.message === statusMessageKey) {
                // No message - just quote the server status.
                togo.message = i18n.t("Errors.generic-server-error", {message: `${err.response.statusText} (${err.response.status})`});
            }
        }
    } else {
        togo.message = err.message || i18n.t("Errors.generic-server-error", {message: err.code || err.name});
    }

    return includeTitle ? togo : togo.message;
}
