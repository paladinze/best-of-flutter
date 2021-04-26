import axios from 'axios'
import cheerio = require('cheerio')

const pubDevUrl = 'https://pub.dev/flutter/packages'
const packageItemSelector = '.packages-item'
const titleSelector = 'h3.packages-title > a'
const likesSelector = '.packages-score-like .packages-score-value-number'
const healthSelector = '.packages-score-health .packages-score-value-number'
const popularitySelector = '.packages-score-popularity .packages-score-value-number'
const badgeSelector = '.package-badge'
const metadataSelector = '.packages-metadata-block'

const BADGE_FLUTTER_FAV = 'flutter favorite'
const BADGE_NULL_SAFE = 'null safety'

const GOOGLE_ID = 'flutter.dev'


function fetchHtmlFromUrl(url: string, page = 1): Promise<cheerio.Root> {
    return axios
        .get(url, {
            params: {
                page: page,
                sort: 'like',
            }
        })
        .then((response: { data: any; }) => cheerio.load(response.data))
}

function getPackageData($: cheerio.Root, packageEl: cheerio.Element) {
    const packageItem = $(packageEl)

    const name = packageItem.find(titleSelector).text()

    // main stats
    const likes = parseInt(packageItem.find(likesSelector).text())
    const health = parseInt(packageItem.find(healthSelector).text())
    const popularity = parseInt(packageItem.find(popularitySelector).text())
    const badges = packageItem.find(badgeSelector).map((index: number, el: cheerio.Element) => {
        return $(el).text().trim().toLowerCase()
    }).get();

    // badges
    const isNullSafe = badges.includes(BADGE_NULL_SAFE)
    const isFlutterFav = badges.includes(BADGE_FLUTTER_FAV)

    // developer
    const [version, developer] = packageItem.find(metadataSelector).map((index: number, el: cheerio.Element) => {
        return $(el).find('a').text().trim();
    }).get();

    return { name, likes, health, popularity, isNullSafe, isFlutterFav, version, developer }
}

async function getPageData(pageNum: number | undefined) {
    const $ = await fetchHtmlFromUrl(pubDevUrl, pageNum)
    const packages = $(packageItemSelector);
    const pageData: { name: string; likes: number; }[] = []
    packages.each((index: number, el: cheerio.Element) => {
        pageData.push(getPackageData($, el))
    }).get()
    return pageData
}

async function main() {
    console.log('starts fetching pub dev stats...')
    const totalPages = 10
    const pageSize = 10
    const totalPackages = totalPages * pageSize

    // general summary
    let allResults: any[] = []
    for (let i = 1; i <= totalPages; i++) {
        console.log(`Fetching ${pageSize * i}/${totalPackages}`)
        const pageData = await getPageData(i)
        allResults = [...allResults, ...pageData]
    }
    console.table(allResults)

    // Offical packages
    const officialPackages = allResults.filter(result => result.developer === GOOGLE_ID)
    console.log(`A total of ${officialPackages.length}/${totalPackages} top packages come from Google`)
    console.table(officialPackages)

}

main()