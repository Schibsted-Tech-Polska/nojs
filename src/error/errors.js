'use strict';

const util = require('util');

const ExternalServiceError = function(message, extra) {
    this.name = this.constructor.name;
    this.message = message;
    this.extra = extra;
    Error.captureStackTrace(this, this.constructor);
};

util.inherits(ExternalServiceError, Error);

const NotFoundError = function(message, extra) {
    this.name = this.constructor.name;
    this.message = message;
    this.extra = extra;
    Error.captureStackTrace(this, this.constructor);
};

util.inherits(NotFoundError, Error);

module.exports = {
    ExternalServiceError: ExternalServiceError,
    NotFoundError: NotFoundError,
};
