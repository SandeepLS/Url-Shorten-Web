const validUrl = require("valid-url");
const shortid = require("shortid");


exports.validateUrl = (url) => validUrl.isUri(url);
exports.generateShortCode = () => shortid.generate();
