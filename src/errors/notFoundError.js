const BaseError = require("./baseError");
const { StatusCodes } = require("http-status-codes");

class NotFound extends BaseError {
    constructor(resourceName, resourceValue) {
        super(
            "Not Found",
            StatusCodes.NOT_FOUND,
            `The requested resource: ${resourceName} with value ${resourceValue} not found`,
            {
                resourceName,
                resourceValue,
            }
        );
    }
}

module.exports = NotFound;
