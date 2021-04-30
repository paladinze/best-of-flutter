import axios from 'axios'
import cheerio = require('cheerio')
import { titleSelector, likesSelector, healthSelector, popularitySelector, badgeSelector, BADGE_NULL_SAFE, BADGE_FLUTTER_FAV, metadataSelector, pubDevUrl, packageItemSelector, OFFICIAL_ACCOUNTS, FIREBASE_ACCOUNT, STATE_MANAGE_LIST } from './constants'

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
    const totalPages = 25
    const pageSize = 10
    const totalPackages = totalPages * pageSize

    // general summary
    let allResults: any[] = []
    for (let i = 1; i <= totalPages; i++) {
        console.log(`Fetching data for ${pageSize * i}/${totalPackages} packages ...`)
        const pageData = await getPageData(i)
        allResults = [...allResults, ...pageData]
    }
    console.table(allResults)

    // Offical packages
    const officialPackages = allResults.filter(result => OFFICIAL_ACCOUNTS.includes(result.developer))
    console.log(`A total of ${officialPackages.length}/${totalPackages} top packages come from Google`)
    console.table(officialPackages)

    // firebase packages
    const firebasePackages = allResults.filter(result => result.developer === FIREBASE_ACCOUNT)
    console.log(`Firebase Packages`)
    console.table(firebasePackages)

    // State management packages
    const stateManagePackages = allResults.filter(result => STATE_MANAGE_LIST.includes(result.name))
    console.log(`State Management Packages`)
    console.table(stateManagePackages)
}

main()