const BaseError = require("./baseError");
const { StatusCodes } = require("http-status-codes");

class BadRequest extends BaseError {
    constructor(propertyName) {
        super(
            "BadRequest",
            StatusCodes.BAD_REQUEST,
            `Invalid structure for ${propertyName} provided`
        );
    }
}

module.exports = BadRequest;
