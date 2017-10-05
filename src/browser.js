'use strict';

const config = require('ez-config').values;
const puppeteer = require('puppeteer');
const logger = require('app/logger');
const RenderFailedError = require('app/error/errors').RenderFailedError;

let browser = null;
let openedUrlsCounter = 0;

const init = async (restartBrowser = false) => {
    if (restartBrowser || openedUrlsCounter >= config.puppeteer.maxUrlsOpened) {
        logger.debug(`Restarting Chromium...`);
        await browser.close();
        browser = null;
        openedUrlsCounter = 0;
    }

    if (browser === null) {
        browser = await puppeteer.launch(config.puppeteer.chromeOptions);
    }

    const page = await browser.newPage();

    if (config.puppeteer.blockRequests.enabled) {
        const blockedRequests = new RegExp('(' + config.puppeteer.blockRequests.urls.join('|') + ')', 'i');

        await page.setRequestInterceptionEnabled(true);
        page.on('request', interceptedRequest => {
            const { url, method } = interceptedRequest;

            if (blockedRequests.test(url)) {
                logger.debug(`Blocked ${method} request for: ${url}`);
                interceptedRequest.abort();
            } else {
                interceptedRequest.continue();
            }
        });
    }

    return page;
};

const goTo = async (page, url, options) => {
    options = { ...config.puppeteer.pageOptions, ...options };
    openedUrlsCounter++;
    url = decodeURIComponent(url);

    logger.debug(`Opening URL (${openedUrlsCounter}/${config.puppeteer.maxUrlsOpened}): ${url}`);
    if (options.width && options.height) {
        page.setViewport({ width: parseInt(options.width, 10), height: parseInt(options.height, 10) });
    }

    if (options['user-agent']) {
        page.setUserAgent(options['user-agent']);
    }

    try {
        await page.goto(url, options);
        await page.evaluate(baseUrl => {
            const base = document.createElement('base');
            base.setAttribute('href', baseUrl);
            document.head.appendChild(base);
        }, url);
    } catch (error) {
        if (error.message.includes('Navigation Timeout Exceeded')) {
            logger.debug(`Request for ${url} timed out after ${options.timeout}ms`);
        } else {
            logger.warn(`Exception thrown by puppeteer: ${error.message}`, error);
        }
    }

    return page;
};

const render = async (url, options) => {
    let page;
    let result;

    try {
        page = await init();
    } catch (error) {
        page = await init(true);
    }

    await goTo(page, url, options);

    try {
        result = await page.content();
    } catch (error) {
        throw new RenderFailedError(error.message, error.stack);
    }

    await page.close();

    return result;
};

const screenshot = async (url, options) => {
    let page;
    let result;

    try {
        page = await init();
    } catch (error) {
        page = await init(true);
    }

    await goTo(page, url, options);

    try {
        result = await page.screenshot({ fullPage: true });
    } catch (error) {
        throw new RenderFailedError(error.message, error.stack);
    }

    await page.close();

    return result;
};

module.exports = { render, screenshot };
