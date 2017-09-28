'use strict';

const encodeData = data =>
    Object.keys(data)
        .map(key => [key, data[key]].map(encodeURIComponent).join('='))
        .join('&');

module.exports = encodeData;
