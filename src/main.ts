import * as cheerio from 'cheerio';
const axios = require('axios');

const pubDevUrl = 'https://pub.dev/flutter/packages'
const packageItemSelector = '.packages-item'
const titleSelector = 'h3.packages-title > a'
const likesSelector = '.packages-score-like .packages-score-value-number'
const healthSelector = '.packages-score .packages-score-health'
const popularitySelector = '.packages-score .packages-score-popularity'
const badgeSelector = '.package-badge'


function fetchHtmlFromUrl(url: string, page = 1) {
    return axios
        .get(url, {
            params: {
                page: page,
                sort: 'like',
            }
        })
        .then((response: { data: any; }) => cheerio.load(response.data))
}

function getPackageData(packageElement: { find: (arg0: string) => { (): any; new(): any; text: { (): string; new(): any; }; }; }) {
    const name = packageElement.find(titleSelector).text()
    const likes = parseInt(packageElement.find(likesSelector).text())
    return { name, likes }
}

async function getPageData(pageNum: number | undefined) {
    const $ = await fetchHtmlFromUrl(pubDevUrl, pageNum)
    const packages = $(packageItemSelector);
    const pageData: { name: string; likes: number; }[] = []
    packages.each((index: any, element: any) => {
        pageData.push(getPackageData($(element)))
    }).get()
    return pageData
}

async function main() {
    console.log('starts fetching pub dev stats...')

    const pageSize = 10;
    const totalPages = 10;

    let results: any[] = []
    for (let i=1; i<=totalPages; i++) {
        console.log(`Fetching ${pageSize * i}/${totalPages * pageSize}`)
        const pageData = await getPageData(i)
        results = [...results, ...pageData]
    }
    console.table(results)
}

main()