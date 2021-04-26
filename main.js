
const cheerio = require('cheerio');
const axios = require('axios');
const puppeteer = require('puppeteer');

const pubDevUrl = 'https://pub.dev/flutter/packages'
const packageItemSelector = '.packages-item'
const titleSelector = 'h3.packages-title > a'
const likesSelector = '.packages-score-like .packages-score-value-number'

let scrape = async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(pubDevUrl);

    var results = []; // variable to hold collection of all book titles and prices
    var lastPageNumber = 50; // this is hardcoded last catalogue page, you can set it dunamically if you wish
    // defined simple loop to iterate over number of catalogue pages
    for (let index = 0; index < lastPageNumber; index++) {
        // wait 1 sec for page load
        await page.waitFor(1000);
        // results = results.concat(await extractedEvaluateCall(page));
        if (index != lastPageNumber - 1) {
            await page.click('#default > div > div > div > div > section > div:nth-child(2) > div > ul > li.next > a');
        }
    }

    // browser.close();
    // return results;
};


function fetchHtmlFromUrl(url, page = 1) {
    return axios
        .get(url, {
            params: {
                page: page,
                sort: 'like',
            }
        })
        .then(response => cheerio.load(response.data))
}

function getPackageData(packageElement) {
    const name = packageElement.find(titleSelector).text()
    const likes = parseInt(packageElement.find(likesSelector).text())
    return { name, likes }
}

async function getPageData(pageNum) {
    const $ = await fetchHtmlFromUrl(pubDevUrl, pageNum)
    const packages = $(packageItemSelector);
    const results = packages.map((index, element) => {
        return getPackageData($(element))
    }).get()
    console.table(results)
}

async function main() {
    console.log('starts fetching pub dev stats...')


    for (let i=1; i<=10; i++) {
        await getPageData(i)
    }
}

main()