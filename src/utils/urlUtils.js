const validUrl = require("valid-url");
const shortid = require("shortid");

/**
 * Validate if the provided URL is a valid URI.
 * @param {string} url - The URL to validate.
 * @returns {boolean} - Returns true if the URL is valid, otherwise false.
 */
exports.validateUrl = (url) => validUrl.isUri(url);

/**
 * Generate a unique short code for shortened URLs.
 * @returns {string} - Returns a randomly generated short ID.
 */
exports.generateShortCode = () => shortid.generate();
