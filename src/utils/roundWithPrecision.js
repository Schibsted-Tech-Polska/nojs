'use strict';

const roundWithPrecision = (value, precision = 0) =>
    Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);

module.exports = roundWithPrecision;
