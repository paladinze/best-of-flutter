import { FIREBASE_ACCOUNT, OFFICIAL_ACCOUNTS, STATE_MANAGE_LIST } from './constants';
import fs from 'fs';
import { ClassifiedResults } from './types';

function genDateStr() {
  const today = new Date()
  const year = today.getFullYear()
  const month = `${today.getMonth() + 1}`.padStart(2, "0")
  const day = `${today.getDate()}`.padStart(2, "0")
  return [year, month, day].join("-")
}

function classifyResults(allResults: any[]) {
  const all = allResults.map((item, index) => ({ rank: index + 1, ...item, }))
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

export {
  classifyResults,
  saveResultsToFile,
  printResults,
  printDivider
}