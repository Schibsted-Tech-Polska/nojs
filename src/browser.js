'use strict';

const config = require('ez-config').values;
const puppeteer = require('puppeteer');
const logger = require('app/logger');

let browser = null;
let openedUrlsCounter = 0;

const init = async () => {
    if (browser !== null && openedUrlsCounter < config.puppeteer.maxUrlsOpened) {
        return;
    }

    if (openedUrlsCounter >= config.puppeteer.maxUrlsOpened) {
        logger.debug(`Limit of ${config.puppeteer.maxUrlsOpened} URLs opened reached - restarting Chromium...`);
        await browser.close();
        browser = null;
        openedUrlsCounter = 0;
    }

    browser = await puppeteer.launch(config.puppeteer.chromeOptions);
};

const goTo = async (
    page,
    url,
    options = {
        waitUntil: 'networkidle',
        networkIdleInflight: 0,
        networkIdleTimeout: 3000,
    }
) => {
    openedUrlsCounter++;
    url = decodeURIComponent(url);

    logger.debug(`Opening URL (${openedUrlsCounter}/${config.puppeteer.maxUrlsOpened}): ${url}`);

    if (options.width && options.height) {
        page.setViewport({ width: parseInt(options.width, 10), height: parseInt(options.height, 10) });
    }

    if (options['user-agent']) {
        page.setUserAgent(options['user-agent']);
    }

    await page.goto(url, options);
    await page.waitForFunction('document && document.documentElement && document.doctype');
    await page.evaluate(baseUrl => {
        const base = document.createElement('base');
        base.setAttribute('href', baseUrl);
        document.head.appendChild(base);
    }, url);

    return page;
};

const render = async (url, options) => {
    await init();
    const page = await browser.newPage();
    await goTo(page, url, options);
    const result = await page.content();
    await page.close();

    return result;
};

const screenshot = async (url, options) => {
    await init();
    const page = await browser.newPage();
    await goTo(page, url, options);
    const result = await page.screenshot({ fullPage: true });
    await page.close();

    return result;
};

module.exports = { render, screenshot };
