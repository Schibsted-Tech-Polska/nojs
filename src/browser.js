'use strict';

const config = require('ez-config').values;
const puppeteer = require('puppeteer');
const logger = require('app/logger');

let browser = null;
let openedUrlsCounter = 0;

const init = async () => {
    const blockedRequests = new RegExp('(' + config.puppeteer.blockedRequests.join('|') + ')', 'i');

    if (openedUrlsCounter >= config.puppeteer.maxUrlsOpened) {
        logger.debug(`Limit of ${config.puppeteer.maxUrlsOpened} URLs opened reached - restarting Chromium...`);
        await browser.close();
        browser = null;
        openedUrlsCounter = 0;
    }

    if (browser === null) {
        browser = await puppeteer.launch(config.puppeteer.chromeOptions);
    }

    const page = await browser.newPage();
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
    } catch (error) {
        if (error.message.includes('Navigation Timeout Exceeded')) {
            logger.debug(`Request for ${url} timed out after ${options.timeout}ms`);
        } else {
            throw error;
        }
    }

    await page.waitForFunction('document && document.documentElement && document.doctype');
    await page.evaluate(baseUrl => {
        const base = document.createElement('base');
        base.setAttribute('href', baseUrl);
        document.head.appendChild(base);
    }, url);

    return page;
};

const render = async (url, options) => {
    const page = await init();
    await goTo(page, url, options);
    const result = await page.content();
    await page.close();

    return result;
};

const screenshot = async (url, options) => {
    const page = await init();
    await goTo(page, url, options);
    const result = await page.screenshot({ fullPage: true });
    await page.close();

    return result;
};

module.exports = { render, screenshot };
