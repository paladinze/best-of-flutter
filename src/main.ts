import fs from 'fs'
import util from 'util'
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
  OFFICIAL_ACCOUNTS,
  FIREBASE_ACCOUNT,
  STATE_MANAGE_LIST
} from './constants'

interface ClassifiedResults {
  official: any[];
  firebase: any[];
  stateManagement: any[];
  all: any[]
}

function genDateStr() {
  const today = new Date()
  const year = today.getFullYear()
  const month = `${today.getMonth() + 1}`.padStart(2, "0")
  const day = `${today.getDate()}`.padStart(2, "0")
  return [year, month, day].join("_")
}

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

function classifyResults(allResults: any[]) {
  const all = allResults.map((item, index) => ({ ...item, rank: index + 1}))
  return {
    official: all.filter(result => OFFICIAL_ACCOUNTS.includes(result.developer)),
    firebase: all.filter(result => result.developer === FIREBASE_ACCOUNT),
    stateManagement: all.filter(result => STATE_MANAGE_LIST.includes(result.name)),
    all: all,
  }
}

function saveResultsToFile(classifiedResults: ClassifiedResults) {
  const serializedData = JSON.stringify(classifiedResults, null, 4)
  const dataPath = `data/json/top_packages_${genDateStr()}.json`
  fs.writeFileSync(dataPath, serializedData, 'utf8')
}

function printResults(classifiedResults: ClassifiedResults) {
  const dataPath = `data/log/top_packages_${genDateStr()}.log`
  const log_file = fs.createWriteStream(dataPath, {flags: 'w'});
  const log_stdout = process.stdout;

  console.log = function (d: any) {
    log_file.write(util.format(d));
    log_stdout.write(util.format(d) + '\n');
  };

  const {all, official, firebase, stateManagement} = classifiedResults;
  const totalPackages = all.length;

  // Official packages
  console.log(`Google own a total of ${official.length}/${totalPackages} top packages`)
  console.table(official)
  printDivider()

  // firebase packages
  console.log(`Firebase Packages`)
  console.table(firebase)
  printDivider()

  // State management packages
  console.log(`State Management Packages`)
  console.table(stateManagement)
  printDivider()

  // general summary
  console.log(`Top ${totalPackages} Flutter Packages`)
  console.table(all)
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