import axios from 'axios'
import cheerio = require('cheerio')
import { titleSelector, likesSelector, healthSelector, popularitySelector, badgeSelector, badgeSubSelector, BADGE_NULL_SAFE, BADGE_FLUTTER_FAV, PLATFORM_ANDROID, PLATFORM_IOS, PLATFORM_LINUX, PLATFORM_MACOS, PLATFORM_WEB, PLATFORM_WINDOWS, metadataSelector, pubDevUrl, packageItemSelector, OFFICIAL_ACCOUNTS, FIREBASE_ACCOUNT, STATE_MANAGE_LIST } from './constants'

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

function printDivider() {
    console.log('\n');
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
    const badgesSub = packageItem.find(badgeSubSelector).map((index: number, el: cheerio.Element) => {
        return $(el).text().trim().toLowerCase()
    }).get();

    // badges
    const nullSafe = badges.includes(BADGE_NULL_SAFE)
    const endorsed = badges.includes(BADGE_FLUTTER_FAV)

    // platforms
    const android = badgesSub.includes(PLATFORM_ANDROID)
    const ios = badgesSub.includes(PLATFORM_IOS)
    const linux = badgesSub.includes(PLATFORM_LINUX)
    const macos = badgesSub.includes(PLATFORM_MACOS)
    const web = badgesSub.includes(PLATFORM_WEB)
    const windows = badgesSub.includes(PLATFORM_WINDOWS)

    // developer
    const [version, developer] = packageItem.find(metadataSelector).map((index: number, el: cheerio.Element) => {
        return $(el).find('a').text().trim();
    }).get();

    return { name, likes, health, popularity, nullSafe, endorsed, version, developer, android, ios, linux, macos, web, windows }
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
    const totalPages = 25
    const pageSize = 10
    const totalPackages = totalPages * pageSize

    let allResults: any[] = []
    for (let i = 1; i <= totalPages; i++) {
        console.log(`Fetching data for ${pageSize * i}/${totalPackages} packages ...`)
        const pageData = await getPageData(i)
        allResults = [...allResults, ...pageData]
    }
    printDivider();

    // Official packages
    const officialPackages = allResults.filter(result => OFFICIAL_ACCOUNTS.includes(result.developer))
    console.log(`Google own a total of ${officialPackages.length}/${totalPackages} top packages`)
    console.table(officialPackages)
    printDivider()

    // firebase packages
    const firebasePackages = allResults.filter(result => result.developer === FIREBASE_ACCOUNT)
    console.log(`Firebase Packages`)
    console.table(firebasePackages)
    printDivider()

    // State management packages
    const stateManagePackages = allResults.filter(result => STATE_MANAGE_LIST.includes(result.name))
    console.log(`State Management Packages`)
    console.table(stateManagePackages)
    printDivider()

    // general summary
    console.log(`Top ${totalPackages} Flutter Packages`)
    console.table(allResults)
}

main()