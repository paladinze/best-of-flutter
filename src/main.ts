import axios from 'axios'
import cheerio = require('cheerio')
import {
  titleSelector,
  likesSelector,
  healthSelector,
  popularitySelector,
  badgeSelector,
  badgeSubSelector,
  BADGE_NULL_SAFE,
  BADGE_FLUTTER_FAV,
  PLATFORM_ANDROID,
  PLATFORM_IOS,
  PLATFORM_LINUX,
  PLATFORM_MACOS,
  PLATFORM_WEB,
  PLATFORM_WINDOWS,
  metadataSelector,
  pubDevUrl,
  packageItemSelector,
} from './constants'
import { classifyResults, printDivider, printResults, saveResultsToFile } from './utils';

function fetchHtmlFromUrl(url: string, page = 1): Promise<cheerio.Root> {
  return axios
    .get(url, {
      params: {
        page: page,
        q: ':flutter',
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
    return $(el).find('a').map((index2: number, el2: cheerio.Element) => {
      return $(el2).text();
    }).get().join(',');
  }).get();

  return {
    name,
    likes,
    health,
    popularity,
    nullSafe,
    endorsed,
    version,
    developer,
    android,
    ios,
    linux,
    macos,
    web,
    windows
  }
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

  const classifiedResults = classifyResults(allResults);

  // print results to console
  printResults(classifiedResults);

  // save all results to file
  saveResultsToFile(classifiedResults)
}

main()